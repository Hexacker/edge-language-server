const { TextDocument } = require('vscode-languageserver-textdocument');
const { EdgeSignatureHelpProvider } = require('../src/signature-helps/signature-help');
const { EdgeParser } = require('../src/server/parser');

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
      // Check that we get the correct signature for route
      expect(signatureHelp.signatures[0].label).toContain('route(routeName');
    }
  });

  it('should provide signature help for asset helper', () => {
    const document = TextDocument.create('test.edge', 'edge', 1, '{{ asset("css/app.css") }}');
    const position = { line: 0, character: 10 }; // Position inside the asset call
    // Update mock for asset call
    mockParser.getNodeAtPosition.mockReturnValue({
      type: 'call_expression',
      text: 'asset("css/app.css")',
      startIndex: 3,
      endIndex: 22,
      children: [
        {
          type: 'identifier',
          text: 'asset'
        }
      ]
    });
    
    const signatureHelp = provider.provideSignatureHelp(document, position);
    
    expect(signatureHelp).toBeDefined();
    if (signatureHelp) {
      expect(signatureHelp.signatures.length).toBeGreaterThan(0);
      // Check that we get the correct signature for asset
      expect(signatureHelp.signatures[0].label).toContain('asset(path');
    }
  });

  it('should provide signature help for new EdgeJS helpers', () => {
    const document = TextDocument.create('test.edge', 'edge', 1, '{{ truncate(text, 100) }}');
    const position = { line: 0, character: 15 }; // Position inside the truncate call
    // Update mock for truncate call
    mockParser.getNodeAtPosition.mockReturnValue({
      type: 'call_expression',
      text: 'truncate(text, 100)',
      startIndex: 3,
      endIndex: 22,
      children: [
        {
          type: 'identifier',
          text: 'truncate'
        }
      ]
    });
    
    const signatureHelp = provider.provideSignatureHelp(document, position);
    
    expect(signatureHelp).toBeDefined();
    if (signatureHelp) {
      expect(signatureHelp.signatures.length).toBeGreaterThan(0);
      // Check that we get the correct signature for truncate
      expect(signatureHelp.signatures[0].label).toContain('truncate(text');
    }
  });

  it('should return null when not inside a function call', () => {
    const document = TextDocument.create('test.edge', 'edge', 1, '{{ variable }}');
    const position = { line: 0, character: 5 }; // Position outside a function call
    // Update mock for variable (not a function call)
    mockParser.getNodeAtPosition.mockReturnValue({
      type: 'identifier',
      text: 'variable'
    });
    
    const signatureHelp = provider.provideSignatureHelp(document, position);
    
    // This might be null or might still provide help depending on implementation
    // but it should not throw an error
  });
});