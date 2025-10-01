const { TextDocument } = require('vscode-languageserver-textdocument');
const { EdgeCompletionProvider } = require('../src/completions/completion');
const { EdgeParser } = require('../src/server/parser');

// Mock EdgeParser
const mockParser = {
  parse: jest.fn().mockReturnValue({
    rootNode: {
      type: 'document',
      childCount: 1,
      descendantForPosition: jest.fn().mockReturnValue({
        type: 'if_directive',
        text: '@if'
      })
    }
  }),
  getNodeAtPosition: jest.fn().mockReturnValue({
    type: 'if_directive',
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
    // Check that we have all the new directives
    const ifDirective = completions.find((c: any) => c.label === '@if');
    const unlessDirective = completions.find((c: any) => c.label === '@unless');
    const eachDirective = completions.find((c: any) => c.label === '@each');
    const componentDirective = completions.find((c: any) => c.label === '@component');
    expect(ifDirective).toBeDefined();
    expect(unlessDirective).toBeDefined();
    expect(eachDirective).toBeDefined();
    expect(componentDirective).toBeDefined();
  });

  it('should provide helper completions in interpolations', () => {
    const document = TextDocument.create('test.edge', 'edge', 1, '{{');
    // Mock the node type to be inside an interpolation
    mockParser.getNodeAtPosition.mockReturnValue({
      type: 'mustache',
      text: '{{'
    });
    const completions = provider.provideCompletions(document, { line: 0, character: 2 });
    expect(completions.length).toBeGreaterThan(0);
    // Check that we have helper functions
    const routeHelper = completions.find((c: any) => c.label === 'route');
    const assetHelper = completions.find((c: any) => c.label === 'asset');
    expect(routeHelper).toBeDefined();
    expect(assetHelper).toBeDefined();
  });
});
