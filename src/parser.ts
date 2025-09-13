import Parser from 'tree-sitter';

export class EdgeParser {
  private parser: Parser;
  private language: any;

  constructor() {
    this.parser = new Parser();
    this.initializeLanguage();
  }

  private async initializeLanguage() {
    try {
      // Import your local tree-sitter-edge grammar
      this.language = require('tree-sitter-edge');
      this.parser.setLanguage(this.language);
    } catch (error) {
      console.error('Failed to load EdgeJS grammar:', error);
      // Fallback: continue without specific language
    }
  }

  parse(text: string): Parser.Tree {
    return this.parser.parse(text);
  }

  parseWithPrevious(text: string, previousTree?: Parser.Tree): Parser.Tree {
    return this.parser.parse(text, previousTree);
  }

  // Helper method to find node at position
  getNodeAtPosition(tree: Parser.Tree, line: number, character: number): Parser.SyntaxNode | null {
    const point = { row: line, column: character };
    return tree.rootNode.descendantForPosition(point);
  }

  // Get all nodes of a specific type
  getNodesOfType(tree: Parser.Tree, nodeType: string): Parser.SyntaxNode[] {
    const nodes: Parser.SyntaxNode[] = [];

    function traverse(node: Parser.SyntaxNode) {
      if (node.type === nodeType) {
        nodes.push(node);
      }
      for (let i = 0; i < node.childCount; i++) {
        traverse(node.child(i)!);
      }
    }

    traverse(tree.rootNode);
    return nodes;
  }
}
