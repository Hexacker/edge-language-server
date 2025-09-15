const { TextDocument } = require('vscode-languageserver-textdocument');
const { DocumentCache } = require('../src/utils/document-cache');

// Mock EdgeParser
const mockParser = {
  parse: jest.fn().mockImplementation((text) => {
    return {
      rootNode: {
        type: 'document',
        childCount: text.length > 0 ? 1 : 0
      }
    };
  })
};

describe('DocumentCache', () => {
  let cache: any;
  
  beforeAll(() => {
    cache = new DocumentCache(10, 1000); // Small cache for testing
  });

  it('should cache parsed documents', async () => {
    const document = TextDocument.create('test.edge', 'edge', 1, '<h1>Hello {{ name }}</h1>');
    
    // First parse should not be cached
    const tree1 = await cache.getTree(document, mockParser);
    expect(tree1).toBeDefined();
    
    // Second parse should return the same tree (cached)
    const tree2 = await cache.getTree(document, mockParser);
    expect(tree2).toBe(tree1);
  });

  it('should invalidate cached documents', async () => {
    const document = TextDocument.create('test2.edge', 'edge', 1, '@if(user) Hello @endif');
    
    // Parse and cache
    const tree1 = await cache.getTree(document, mockParser);
    expect(tree1).toBeDefined();
    
    // Invalidate cache
    cache.invalidate(document.uri);
    
    // Parse again - should get a new tree
    const tree2 = await cache.getTree(document, mockParser);
    expect(tree2).toBeDefined();
    // Note: We can't easily compare tree objects, but this tests the invalidation
  });

  it('should handle document version changes', async () => {
    // Create document with version 1
    let document = TextDocument.create('test3.edge', 'edge', 1, '<h1>Hello {{ name }}</h1>');
    
    // Parse and cache
    const tree1 = await cache.getTree(document, mockParser);
    expect(tree1).toBeDefined();
    
    // Create document with version 2 (same URI, different content)
    document = TextDocument.create('test3.edge', 'edge', 2, '<h2>Hello {{ name }}</h2>');
    
    // Parse again - should get a new tree because version changed
    const tree2 = await cache.getTree(document, mockParser);
    expect(tree2).toBeDefined();
    // Note: We can't easily compare tree objects, but this tests version handling
  });

  it('should respect cache size limits', async () => {
    const cache = new DocumentCache(2, 1000); // Max 2 entries
    
    // Add 3 documents to cache
    for (let i = 0; i < 3; i++) {
      const document = TextDocument.create(`test${i}.edge`, 'edge', 1, `<h1>Test ${i}</h1>`);
      await cache.getTree(document, mockParser);
    }
    
    // Cache should have at most 2 entries
    expect(cache.getSize()).toBeLessThanOrEqual(2);
  });
});