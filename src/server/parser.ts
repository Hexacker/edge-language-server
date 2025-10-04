import { Parser, Language } from 'web-tree-sitter';
import path from 'path';

export class EdgeParser {
  private parser: Parser;

  private constructor(parser: Parser) {
    this.parser = parser;
  }

  public static async create(): Promise<EdgeParser> {
    // Initialize the WebAssembly runtime
    await Parser.init();
    
    // Load the language from the bundled WASM file
    const wasmPath = path.join(__dirname, '..', '..', 'wasm', 'tree-sitter-edge.wasm');
    const language = await Language.load(wasmPath);
    
    // Create parser and set language
    const parser = new Parser();
    parser.setLanguage(language);
    
    return new EdgeParser(parser);
  }

  parse(text: string): any {
    return this.parser.parse(text);
  }

  parseWithPrevious(text: string, previousTree?: any): any {
    return this.parser.parse(text, previousTree);
  }

  // Helper method to find node at position
  getNodeAtPosition(tree: any, line: number, character: number): any {
    const point = { row: line, column: character };
    return tree.rootNode.descendantForPosition(point);
  }

  // Get all nodes of a specific type
  getNodesOfType(tree: any, nodeType: string): any[] {
    const nodes: any[] = [];

    function traverse(node: any) {
      if (node.type === nodeType) {
        nodes.push(node);
      }
      for (let i = 0; i < node.childCount; i++) {
        const child = node.child(i);
        if (child) {
          traverse(child);
        }
      }
    }

    traverse(tree.rootNode);
    return nodes;
  }
}
