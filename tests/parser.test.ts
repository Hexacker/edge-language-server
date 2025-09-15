import { EdgeParser } from '../src/parser';

describe('EdgeParser', () => {
  let parser: EdgeParser;

  beforeAll(async () => {
    parser = await EdgeParser.create();
  });

  test('should parse a simple edge template', async () => {
    const template = '<h1>Hello {{ name }}</h1>';
    const tree = parser.parse(template);
    
    expect(tree.rootNode.type).toBe('document');
    expect(tree.rootNode.childCount).toBeGreaterThan(0);
  });

  test('should parse edge directives', async () => {
    const template = '@if(user) Hello @endif';
    const tree = parser.parse(template);
    
    expect(tree.rootNode.type).toBe('document');
    expect(tree.rootNode.childCount).toBeGreaterThan(0);
  });
});