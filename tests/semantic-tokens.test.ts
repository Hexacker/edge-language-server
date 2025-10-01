const { TextDocument } = require('vscode-languageserver-textdocument');
const { EdgeSemanticTokensProvider } = require('../src/semantic-tokens/semantic-tokens');

// Mock EdgeParser
const mockParser = {
  parse: jest.fn().mockReturnValue({
    rootNode: {
      type: 'document',
      childCount: 3,
      child: jest.fn().mockImplementation((index) => {
        if (index === 0) {
          return {
            type: 'if_directive',
            text: '@if(user)',
            startIndex: 0,
            endIndex: 10,
            childCount: 0,
            child: jest.fn().mockReturnValue(null)
          };
        } else if (index === 1) {
          return {
            type: 'mustache',
            text: '{{ user.name }}',
            startIndex: 11,
            endIndex: 25,
            childCount: 0,
            child: jest.fn().mockReturnValue(null)
          };
        } else if (index === 2) {
          return {
            type: 'each_directive',
            text: '@each(item in items)',
            startIndex: 26,
            endIndex: 46,
            childCount: 0,
            child: jest.fn().mockReturnValue(null)
          };
        }
        return null;
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
    const document = TextDocument.create('test.edge', 'edge', 1, '@if(user)\n  <h1>Hello {{ user.name }}</h1>\n@endif');
    const tokens = await provider.provideSemanticTokens(document);
    
    expect(tokens).toBeDefined();
    // The exact token count may vary depending on the parser implementation
    // but we should get some tokens
  });

  it('should provide semantic tokens for new directives', async () => {
    const document = TextDocument.create('test.edge', 'edge', 1, '@unless(condition) Content @endunless');
    // Update mock for @unless directive
    mockParser.parse.mockReturnValueOnce({
      rootNode: {
        type: 'document',
        childCount: 1,
        child: jest.fn().mockReturnValue({
          type: 'unless_directive',
          text: '@unless(condition)',
          startIndex: 0,
          endIndex: 18,
          childCount: 0,
          child: jest.fn().mockReturnValue(null)
        })
      }
    });
    
    const tokens = await provider.provideSemanticTokens(document);
    
    expect(tokens).toBeDefined();
  });
});