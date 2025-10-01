const { TextDocument } = require('vscode-languageserver-textdocument');
const { EdgeHoverProvider } = require('../src/hovers/hover');
const { EdgeParser } = require('../src/server/parser');

// Mock EdgeParser
const mockParser = {
  parse: jest.fn().mockReturnValue({
    rootNode: {
      type: 'document',
      childCount: 1,
      descendantForPosition: jest.fn().mockReturnValue({
        type: 'if_directive',
        text: '@if(condition)',
        startIndex: 0,
        endIndex: 15
      })
    }
  }),
  getNodeAtPosition: jest.fn().mockReturnValue({
    type: 'if_directive',
    text: '@if(condition)',
    startIndex: 0,
    endIndex: 15
  })
};

describe('EdgeHoverProvider', () => {
  let provider: any;
  
  beforeAll(() => {
    provider = new EdgeHoverProvider(mockParser);
  });

  it('should provide hover information for @if directive', () => {
    const document = TextDocument.create('test.edge', 'edge', 1, '@if(condition)');
    const position = { line: 0, character: 2 };
    const hover = provider.provideHover(document, position);
    
    expect(hover).toBeDefined();
    expect(hover.contents).toBeDefined();
    // Check that the hover contains documentation for @if
    expect(hover.contents.value).toContain('@if Directive');
    expect(hover.contents.value).toContain('conditional block');
  });

  it('should provide hover information for @each directive', () => {
    // Update mock for @each directive
    mockParser.getNodeAtPosition.mockReturnValue({
      type: 'each_directive',
      text: '@each(item in items)',
      startIndex: 0,
      endIndex: 20
    });
    
    const document = TextDocument.create('test.edge', 'edge', 1, '@each(item in items)');
    const position = { line: 0, character: 2 };
    const hover = provider.provideHover(document, position);
    
    expect(hover).toBeDefined();
    expect(hover.contents).toBeDefined();
    // Check that the hover contains documentation for @each
    expect(hover.contents.value).toContain('@each Directive');
    expect(hover.contents.value).toContain('Loops over iterable data');
  });

  it('should provide hover information for interpolations', () => {
    // Update mock for interpolation
    mockParser.getNodeAtPosition.mockReturnValue({
      type: 'interpolation',
      text: '{{ variable }}',
      startIndex: 0,
      endIndex: 13
    });
    
    const document = TextDocument.create('test.edge', 'edge', 1, '{{ variable }}');
    const position = { line: 0, character: 3 };
    const hover = provider.provideHover(document, position);
    
    expect(hover).toBeDefined();
    expect(hover.contents).toBeDefined();
    // Check that the hover contains documentation for interpolation
    expect(hover.contents.value).toContain('Interpolation');
    expect(hover.contents.value).toContain('Outputs the value of an expression');
  });
});