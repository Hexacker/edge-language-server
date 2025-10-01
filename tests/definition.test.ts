const { TextDocument } = require('vscode-languageserver-textdocument');
const { EdgeDefinitionProvider } = require('../src/definitions/definition');
const { EdgeParser } = require('../src/server/parser');

// Mock EdgeParser
const mockParser = {
  parse: jest.fn().mockReturnValue({
    rootNode: {
      type: 'document',
      childCount: 1,
      descendantForPosition: jest.fn().mockReturnValue({
        type: 'include_directive',
        text: "@include('partials.header')",
        startIndex: 0,
        endIndex: 27,
        children: [
          {
            type: 'string',
            text: "'partials.header'"
          }
        ]
      })
    }
  }),
  getNodeAtPosition: jest.fn().mockReturnValue({
    type: 'include_directive',
    text: "@include('partials.header')",
    startIndex: 0,
    endIndex: 27,
    children: [
      {
        type: 'string',
        text: "'partials.header'"
      }
    ]
  })
};

describe('EdgeDefinitionProvider', () => {
  let provider: any;
  
  beforeAll(() => {
    provider = new EdgeDefinitionProvider(mockParser);
  });

  it('should provide definition for @include directive', () => {
    const document = TextDocument.create('file:///Users/test/project/resources/views/test.edge', 'edge', 1, "@include('partials.header')");
    const position = { line: 0, character: 10 };
    const definition = provider.provideDefinition(document, position);
    
    expect(definition).toBeDefined();
    // Check that we get a location
    expect(definition.uri).toBeDefined();
    expect(definition.range).toBeDefined();
  });

  it('should provide definition for @component directive', () => {
    // Update mock for @component directive
    mockParser.getNodeAtPosition.mockReturnValue({
      type: 'component_directive',
      text: "@component('components.button')",
      startIndex: 0,
      endIndex: 30,
      children: [
        {
          type: 'string',
          text: "'components.button'"
        }
      ]
    });
    
    const document = TextDocument.create('file:///Users/test/project/resources/views/test.edge', 'edge', 1, "@component('components.button')");
    const position = { line: 0, character: 12 };
    const definition = provider.provideDefinition(document, position);
    
    expect(definition).toBeDefined();
    // Check that we get a location
    expect(definition.uri).toBeDefined();
    expect(definition.range).toBeDefined();
  });

  it('should provide definition for @includeIf directive', () => {
    // Update mock for @includeIf directive
    mockParser.getNodeAtPosition.mockReturnValue({
      type: 'include_if_directive',
      text: "@includeIf(condition, 'partials.sidebar')",
      startIndex: 0,
      endIndex: 39,
      children: [
        {
          type: 'identifier',
          text: 'condition'
        },
        {
          type: 'string',
          text: "'partials.sidebar'"
        }
      ]
    });
    
    const document = TextDocument.create('file:///Users/test/project/resources/views/test.edge', 'edge', 1, "@includeIf(condition, 'partials.sidebar')");
    const position = { line: 0, character: 12 };
    const definition = provider.provideDefinition(document, position);
    
    expect(definition).toBeDefined();
    // Check that we get a location
    expect(definition.uri).toBeDefined();
    expect(definition.range).toBeDefined();
  });
});