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
} from 'vscode-languageserver/node';

import { TextDocument } from 'vscode-languageserver-textdocument';
import { EdgeCompletionProvider } from './completion';
import { EdgeDefinitionProvider } from './definition';
import { EdgeHoverProvider } from './hover';
import { EdgeParser } from './parser';
import { EdgeValidator } from './validator';

const connection = createConnection(ProposedFeatures.all);
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

let hasConfigurationCapability = false;
let hasWorkspaceFolderCapability = false;

// Initialize providers
const edgeParser = new EdgeParser();
const edgeValidator = new EdgeValidator();
const completionProvider = new EdgeCompletionProvider();
const hoverProvider = new EdgeHoverProvider();
const definitionProvider = new EdgeDefinitionProvider();

connection.onInitialize((params: InitializeParams) => {
  const capabilities = params.capabilities;

  hasConfigurationCapability = !!(capabilities.workspace && !!capabilities.workspace.configuration);
  hasWorkspaceFolderCapability = !!(capabilities.workspace && !!capabilities.workspace.workspaceFolders);

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

  if (hasWorkspaceFolderCapability) {
    result.capabilities.workspace = {
      workspaceFolders: {
        supported: true,
      },
    };
  }

  return result;
});

connection.onInitialized(() => {
  if (hasConfigurationCapability) {
    connection.client.register('workspace/didChangeConfiguration', undefined);
  }
  if (hasWorkspaceFolderCapability) {
    connection.workspace.onDidChangeWorkspaceFolders(() => {
      connection.console.log('Workspace folder change event received.');
    });
  }
});

// Document validation
documents.onDidChangeContent((change) => {
  validateEdgeDocument(change.document);
});

async function validateEdgeDocument(textDocument: TextDocument): Promise<void> {
  const text = textDocument.getText();
  const diagnostics: Diagnostic[] = [];

  try {
    const ast = edgeParser.parse(text);
    const validationErrors = edgeValidator.validate(ast, textDocument);
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

  connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
}

// Completion provider
connection.onCompletion((textDocumentPosition: TextDocumentPositionParams): CompletionItem[] => {
  const document = documents.get(textDocumentPosition.textDocument.uri);
  if (!document) return [];

  try {
    return completionProvider.provideCompletions(document, textDocumentPosition.position);
  } catch (error) {
    connection.console.error(`Completion error: ${error}`);
    return [];
  }
});

// Hover provider
connection.onHover((params: TextDocumentPositionParams): Hover | null => {
  const document = documents.get(params.textDocument.uri);
  if (!document) return null;

  try {
    return hoverProvider.provideHover(document, params.position);
  } catch (error) {
    connection.console.error(`Hover error: ${error}`);
    return null;
  }
});

// Definition provider
connection.onDefinition((params: TextDocumentPositionParams): Definition | null => {
  const document = documents.get(params.textDocument.uri);
  if (!document) return null;

  try {
    return definitionProvider.provideDefinition(document, params.position);
  } catch (error) {
    connection.console.error(`Definition error: ${error}`);
    return null;
  }
});

documents.listen(connection);
connection.listen();
