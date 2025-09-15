import {
  CompletionItem,
  createConnection,
  Definition,
  Diagnostic,
  DiagnosticSeverity,
  Hover,
  InitializeParams,
  InitializeResult,
  ProposedFeatures,
  TextDocumentPositionParams,
  TextDocuments,
  TextDocumentSyncKind,
  WorkspaceFolder,
  SemanticTokensParams,
  SemanticTokens,
  SignatureHelpParams,
  SignatureHelp,
  ClientCapabilities,
} from 'vscode-languageserver/node';

import { TextDocument } from 'vscode-languageserver-textdocument';
import { EdgeCompletionProvider } from '../completions/completion';
import { EdgeDefinitionProvider } from '../definitions/definition';
import { EdgeHoverProvider } from '../hovers/hover';
import { EdgeParser } from './parser';
import { EdgeValidator } from './validator';
import { Logger } from '../utils/logger';
import { ConfigurationService, EdgeLanguageServerConfiguration } from '../configuration/configuration';
import { EdgeSemanticTokensProvider, legend } from '../semantic-tokens/semantic-tokens';
import { EdgeSignatureHelpProvider } from '../signature-helps/signature-help';
import { DocumentCache } from '../utils/document-cache';

export class EdgeLanguageServer {
  private connection = createConnection(ProposedFeatures.all);
  private documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);
  
  private hasConfigurationCapability = false;
  private hasWorkspaceFolderCapability = false;
  private hasDiagnosticRelatedInformationCapability = false;
  private hasSemanticTokensCapability = false;
  private hasSignatureHelpCapability = false;
  
  // Services
  private logger!: Logger;
  private configurationService!: ConfigurationService;
  private documentCache!: DocumentCache;
  
  // Providers
  private edgeParser!: EdgeParser;
  private edgeValidator!: EdgeValidator;
  private completionProvider!: EdgeCompletionProvider;
  private hoverProvider!: EdgeHoverProvider;
  private definitionProvider!: EdgeDefinitionProvider;
  private semanticTokensProvider!: EdgeSemanticTokensProvider;
  private signatureHelpProvider!: EdgeSignatureHelpProvider;

  constructor() {
    this.logger = new Logger(this.connection);
    this.configurationService = new ConfigurationService(this.connection);
    this.documentCache = new DocumentCache();
    this.initializeConnection();
    this.registerProviders();
    this.registerDocumentHandlers();
  }

  private async initializeConnection(): Promise<void> {
    this.connection.onInitialize((params: InitializeParams) => {
      const capabilities = params.capabilities;

      this.hasConfigurationCapability = !!(capabilities.workspace && !!capabilities.workspace.configuration);
      this.hasWorkspaceFolderCapability = !!(capabilities.workspace && !!capabilities.workspace.workspaceFolders);
      this.hasDiagnosticRelatedInformationCapability = !!(
        capabilities.textDocument &&
        capabilities.textDocument.publishDiagnostics &&
        capabilities.textDocument.publishDiagnostics.relatedInformation
      );
      this.hasSemanticTokensCapability = !!(
        capabilities.textDocument &&
        capabilities.textDocument.semanticTokens
      );
      this.hasSignatureHelpCapability = !!(
        capabilities.textDocument &&
        capabilities.textDocument.signatureHelp
      );

      const result: InitializeResult = {
        capabilities: {
          textDocumentSync: TextDocumentSyncKind.Incremental,
          completionProvider: {
            resolveProvider: true,
            triggerCharacters: ['@', '{', '.', '('],
          },
          hoverProvider: true,
          definitionProvider: true,
          documentFormattingProvider: false, // We'll add this later
        },
      };

      // Add semantic tokens capability if supported
      if (this.hasSemanticTokensCapability) {
        result.capabilities.semanticTokensProvider = {
          full: true,
          legend: legend
        };
      }

      // Add signature help capability if supported
      if (this.hasSignatureHelpCapability) {
        result.capabilities.signatureHelpProvider = {
          triggerCharacters: ['(', ','],
          retriggerCharacters: [')']
        };
      }

      if (this.hasWorkspaceFolderCapability) {
        result.capabilities.workspace = {
          workspaceFolders: {
            supported: true,
          },
        };
      }

      return result;
    });

    this.connection.onInitialized(() => {
      if (this.hasWorkspaceFolderCapability) {
        this.connection.workspace.onDidChangeWorkspaceFolders((_event) => {
          this.logger.info('Workspace folder change event received.');
        });
      }
    });
  }

  private async registerProviders(): Promise<void> {
    try {
      // Initialize providers
      this.edgeParser = await EdgeParser.create();
      this.edgeValidator = new EdgeValidator();
      this.completionProvider = new EdgeCompletionProvider(this.edgeParser);
      this.hoverProvider = new EdgeHoverProvider(this.edgeParser);
      this.definitionProvider = new EdgeDefinitionProvider(this.edgeParser);
      this.semanticTokensProvider = new EdgeSemanticTokensProvider(this.edgeParser);
      this.signatureHelpProvider = new EdgeSignatureHelpProvider(this.edgeParser);
      
      this.logger.info('Edge language server providers initialized successfully');
    } catch (error) {
      this.logger.error(`Failed to initialize Edge language server providers: ${error}`);
      throw error;
    }
  }

  private registerDocumentHandlers(): void {
    // Document validation
    this.documents.onDidChangeContent((change) => {
      // Invalidate cache when document changes
      this.documentCache.invalidate(change.document.uri);
      this.validateEdgeDocument(change.document);
    });

    // Document close handler
    this.documents.onDidClose((closeEvent) => {
      // Clean up cache when document is closed
      this.documentCache.invalidate(closeEvent.document.uri);
    });

    // Completion provider
    this.connection.onCompletion(async (textDocumentPosition: TextDocumentPositionParams): Promise<CompletionItem[]> => {
      const document = this.documents.get(textDocumentPosition.textDocument.uri);
      if (!document) return [];

      try {
        return this.completionProvider.provideCompletions(document, textDocumentPosition.position);
      } catch (error) {
        this.logger.error(`Completion error: ${error}`);
        return [];
      }
    });

    // Hover provider
    this.connection.onHover(async (params: TextDocumentPositionParams): Promise<Hover | null> => {
      const document = this.documents.get(params.textDocument.uri);
      if (!document) return null;

      try {
        return this.hoverProvider.provideHover(document, params.position);
      } catch (error) {
        this.logger.error(`Hover error: ${error}`);
        return null;
      }
    });

    // Definition provider
    this.connection.onDefinition(async (params: TextDocumentPositionParams): Promise<Definition | null> => {
      const document = this.documents.get(params.textDocument.uri);
      if (!document) return null;

      try {
        return this.definitionProvider.provideDefinition(document, params.position);
      } catch (error) {
        this.logger.error(`Definition error: ${error}`);
        return null;
      }
    });

    // Semantic tokens provider
    if (this.hasSemanticTokensCapability) {
      this.connection.onRequest(
        'textDocument/semanticTokens/full',
        async (params: SemanticTokensParams): Promise<SemanticTokens | null> => {
          const document = this.documents.get(params.textDocument.uri);
          if (!document) return null;

          try {
            return await this.semanticTokensProvider.provideSemanticTokens(document);
          } catch (error) {
            this.logger.error(`Semantic tokens error: ${error}`);
            return null;
          }
        }
      );
    }

    // Signature help provider
    if (this.hasSignatureHelpCapability) {
      this.connection.onSignatureHelp((params: SignatureHelpParams): SignatureHelp | null => {
        const document = this.documents.get(params.textDocument.uri);
        if (!document) return null;

        try {
          return this.signatureHelpProvider.provideSignatureHelp(document, params.position);
        } catch (error) {
          this.logger.error(`Signature help error: ${error}`);
          return null;
        }
      });
    }

    // Configuration change handler
    this.connection.onDidChangeConfiguration((change) => {
      this.logger.info('Configuration changed');
      // Revalidate all open text documents
      this.documents.all().forEach(this.validateEdgeDocument.bind(this));
    });
  }

  private async validateEdgeDocument(textDocument: TextDocument): Promise<void> {
    const text = textDocument.getText();
    const diagnostics: Diagnostic[] = [];

    try {
      const ast: any = await this.documentCache.getTree(textDocument, this.edgeParser);
      const validationErrors = this.edgeValidator.validate(ast, textDocument);
      diagnostics.push(...validationErrors);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown parse error';
      diagnostics.push({
        severity: DiagnosticSeverity.Error,
        range: {
          start: { line: 0, character: 0 },
          end: { line: 0, character: Number.MAX_VALUE },
        },
        message: `Parse error: ${errorMessage}`,
        source: 'edge',
      });
    }

    this.connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
  }

  public listen(): void {
    this.documents.listen(this.connection);
    this.connection.listen();
  }
}