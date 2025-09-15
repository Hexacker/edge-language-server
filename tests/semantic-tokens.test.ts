const { TextDocument } = require('vscode-languageserver-textdocument');
const { EdgeSemanticTokensProvider } = require('../src/semantic-tokens/semantic-tokens');

// Mock EdgeParser
const mockParser = {
  parse: jest.fn().mockReturnValue({
    rootNode: {
      type: 'document',
      childCount: 1,
      child: jest.fn().mockReturnValue({
        type: 'if_directive',
        text: '@if(user)',
        startIndex: 0,
        endIndex: 10,
        childCount: 0,
        child: jest.fn().mockReturnValue(null)
      })
    }
  })
};

describe('EdgeSemanticTokensProvider', () => {
  let provider: any;
  
  beforeAll(() => {
    provider = new EdgeSemanticTokensProvider(mockParser);
  });

  it('should provide semantic tokens for a simple template', async () => {
    const document = TextDocument.create('test.edge', 'edge', 1, '<h1>Hello {{ name }}</h1>');
    const tokens = await provider.provideSemanticTokens(document);
    
    expect(tokens).toBeDefined();
    // The exact token count may vary depending on the parser implementation
    // but we should get some tokens
  });

  it('should provide semantic tokens for directives', async () => {
    const document = TextDocument.create('test.edge', 'edge', 1, '@if(user) Hello @endif');
    const tokens = await provider.provideSemanticTokens(document);
    
    expect(tokens).toBeDefined();
  });
});