const { TextDocument } = require('vscode-languageserver-textdocument');
const { EdgeCompletionProvider } = require('../src/completions/completion');

// Mock EdgeParser
const mockParser = {
  parse: jest.fn().mockReturnValue({
    rootNode: {
      type: 'document',
      childCount: 1,
      descendantForPosition: jest.fn().mockReturnValue({
        type: 'simple_directive',
        text: '@if'
      })
    }
  }),
  getNodeAtPosition: jest.fn().mockReturnValue({
    type: 'simple_directive',
    text: '@if'
  })
};

describe('EdgeCompletionProvider', () => {
  let provider: any;
  
  beforeAll(() => {
    provider = new EdgeCompletionProvider(mockParser);
  });

  it('should provide directive completions', () => {
    const document = TextDocument.create('test.edge', 'edge', 1, '@');
    const completions = provider.provideCompletions(document, { line: 0, character: 1 });
    expect(completions.length).toBeGreaterThan(0);
    expect(completions[0].label).toBe('@if');
  });
});
