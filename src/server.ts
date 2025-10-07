import {
  createConnection,
  TextDocuments,
  ProposedFeatures,
  InitializeParams,
  InitializeResult,
  TextDocumentSyncKind,
  CompletionItem,
  Hover,
  Definition,
  Position,
  DocumentOnTypeFormattingParams,
  TextEdit,
} from "vscode-languageserver/node";

import { TextDocument } from "vscode-languageserver-textdocument";
import { EdgeParser } from "./server/parser";
import { EdgeCompletionProvider } from "./completions/completion";
import { EdgeHoverProvider } from "./hovers/hover";
import { EdgeDefinitionProvider } from "./definitions/definition";
import { EdgeFormattingProvider } from "./formatting/formatter";
import { AutoClosingPairs } from "./utils/auto-closing";

// Create a connection for the server
const connection = createConnection(ProposedFeatures.all);

// Create a simple text document manager
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

let hasConfigurationCapability = false;
let hasWorkspaceFolderCapability = false;
let hasDiagnosticRelatedInformationCapability = false;

// Initialize the Edge parser
let edgeParser: EdgeParser;
let completionProvider: EdgeCompletionProvider;
let hoverProvider: EdgeHoverProvider;
let definitionProvider: EdgeDefinitionProvider;
let formattingProvider: EdgeFormattingProvider;

connection.onInitialize(async (params: InitializeParams) => {
  // Initialize the parser
  edgeParser = await EdgeParser.create();
  completionProvider = new EdgeCompletionProvider(edgeParser);
  hoverProvider = new EdgeHoverProvider(edgeParser);
  definitionProvider = new EdgeDefinitionProvider(edgeParser);
  formattingProvider = new EdgeFormattingProvider();

  const capabilities = params.capabilities;

  // Does the client support the `workspace/configuration` request?
  hasConfigurationCapability = !!(
    capabilities.workspace && !!capabilities.workspace.configuration
  );
  hasWorkspaceFolderCapability = !!(
    capabilities.workspace && !!capabilities.workspace.workspaceFolders
  );
  hasDiagnosticRelatedInformationCapability = !!(
    capabilities.textDocument &&
    capabilities.textDocument.publishDiagnostics &&
    capabilities.textDocument.publishDiagnostics.relatedInformation
  );

  const result: InitializeResult = {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Incremental,
      // Tell the client that this server supports code completion.
      completionProvider: {
        resolveProvider: true,
        triggerCharacters: ["{", ".", "("],
      },
      hoverProvider: true,
      definitionProvider: true,
      documentOnTypeFormattingProvider: {
        firstTriggerCharacter: "{",
        moreTriggerCharacter: ["(", "[", "}", ")", "]"],
      },
      documentFormattingProvider: true,
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
    // Register for all configuration changes.
    // For now, we'll use a simpler approach
  }
  if (hasWorkspaceFolderCapability) {
    connection.workspace.onDidChangeWorkspaceFolders((_event) => {
      connection.console.log("Workspace folder change event received.");
    });
  }
});

// The content of a text document has changed. This event is emitted
// when the text document first opened or when its content has changed.
documents.onDidChangeContent((change) => {
  // In a real implementation, you would validate the document here
  // and send diagnostics to the client
  connection.console.log(`Document changed: ${change.document.uri}`);
});

connection.onCompletion((textDocumentPosition) => {
  const document = documents.get(textDocumentPosition.textDocument.uri);
  if (document && edgeParser) {
    const position: Position = textDocumentPosition.position;
    return completionProvider.provideCompletions(document, position);
  }
  return [];
});

connection.onCompletionResolve((item: CompletionItem): CompletionItem => {
  // Here you would resolve more detailed information for a completion item
  return item;
});

connection.onHover((params) => {
  const document = documents.get(params.textDocument.uri);
  if (document && edgeParser) {
    return hoverProvider.provideHover(document, params.position);
  }
  return null;
});

connection.onDefinition((params) => {
  const document = documents.get(params.textDocument.uri);
  if (document && edgeParser) {
    return definitionProvider.provideDefinition(document, params.position);
  }
  return null;
});

connection.onDocumentFormatting(async (params) => {
  const document = documents.get(params.textDocument.uri);
  if (document && formattingProvider) {
    return await formattingProvider.formatDocument(document, params.options);
  }
  return [];
});

connection.onDocumentOnTypeFormatting(
  (params: DocumentOnTypeFormattingParams) => {
    const document = documents.get(params.textDocument.uri);
    if (document) {
      return AutoClosingPairs.handleAutoClosing(
        document,
        params.position,
        params.ch,
      );
    }
    return null;
  },
);

connection.onDidChangeConfiguration((change) => {
  connection.console.log("Configuration changed");
  // Revalidate all open text documents
  documents.all().forEach(validateTextDocument);
});

function validateTextDocument(textDocument: TextDocument): void {
  // In a real implementation, you would validate the document here
  // and send diagnostics to the client
  connection.console.log(`Validating document: ${textDocument.uri}`);
}

// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);

// Listen on the connection
connection.listen();
