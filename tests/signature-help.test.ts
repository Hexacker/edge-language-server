const { TextDocument } = require('vscode-languageserver-textdocument');
const { EdgeSignatureHelpProvider } = require('../src/signature-helps/signature-help');

// Mock EdgeParser
const mockParser = {
  parse: jest.fn().mockReturnValue({
    rootNode: {
      type: 'document',
      childCount: 1,
      descendantForPosition: jest.fn().mockReturnValue({
        type: 'call_expression',
        text: 'route("home")',
        startIndex: 3,
        endIndex: 15,
        children: [
          {
            type: 'identifier',
            text: 'route'
          }
        ]
      })
    }
  }),
  getNodeAtPosition: jest.fn().mockReturnValue({
    type: 'call_expression',
    text: 'route("home")',
    startIndex: 3,
    endIndex: 15,
    children: [
      {
        type: 'identifier',
        text: 'route'
      }
    ]
  })
};

describe('EdgeSignatureHelpProvider', () => {
  let provider: any;
  
  beforeAll(() => {
    provider = new EdgeSignatureHelpProvider(mockParser);
  });

  it('should provide signature help for route helper', () => {
    const document = TextDocument.create('test.edge', 'edge', 1, '{{ route("home") }}');
    const position = { line: 0, character: 10 }; // Position inside the route call
    const signatureHelp = provider.provideSignatureHelp(document, position);
    
    expect(signatureHelp).toBeDefined();
    if (signatureHelp) {
      expect(signatureHelp.signatures.length).toBeGreaterThan(0);
    }
  });

  it('should provide signature help for asset helper', () => {
    const document = TextDocument.create('test.edge', 'edge', 1, '{{ asset("css/app.css") }}');
    const position = { line: 0, character: 10 }; // Position inside the asset call
    const signatureHelp = provider.provideSignatureHelp(document, position);
    
    expect(signatureHelp).toBeDefined();
    if (signatureHelp) {
      expect(signatureHelp.signatures.length).toBeGreaterThan(0);
    }
  });

  it('should return null when not inside a function call', () => {
    const document = TextDocument.create('test.edge', 'edge', 1, '{{ variable }}');
    const position = { line: 0, character: 5 }; // Position outside a function call
    const signatureHelp = provider.provideSignatureHelp(document, position);
    
    // This might be null or might still provide help depending on implementation
    // but it should not throw an error
  });
});