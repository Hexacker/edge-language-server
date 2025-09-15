import { TextDocument } from 'vscode-languageserver-textdocument';
import { SemanticTokens, SemanticTokensBuilder, SemanticTokensLegend } from 'vscode-languageserver/node';
import { EdgeParser } from '../server/parser';

// Semantic token types
export const TOKEN_TYPES = [
  'directive',      // Edge directives like @if, @each
  'interpolation',  // {{ variable }} interpolations
  'comment',        // Comments
  'keyword',        // Keywords like 'in' in @each loops
  'variable',       // Variable names
  'string',         // String literals
  'number',         // Number literals
  'operator',       // Operators like =, ==, !=
  'function',       // Function calls
  'parameter',      // Function parameters
  'property',       // Object properties
  'type',           // Types (if applicable)
  'class',          // Class names (if applicable)
  'interface',      // Interface names (if applicable)
  'enum',           // Enum names (if applicable)
  'decorator',      // Decorators (if applicable)
];

// Semantic token modifiers
export const TOKEN_MODIFIERS = [
  'declaration',    // Declaration of a symbol
  'definition',     // Definition of a symbol
  'readonly',       // Readonly symbols
  'static',         // Static symbols
  'deprecated',     // Deprecated symbols
  'abstract',       // Abstract symbols
  'async',          // Async functions
  'modification',   // Modified symbols
  'documentation',  // Documentation strings
  'defaultLibrary', // Default library symbols
];

export const legend: SemanticTokensLegend = {
  tokenTypes: TOKEN_TYPES,
  tokenModifiers: TOKEN_MODIFIERS
};

export class EdgeSemanticTokensProvider {
  constructor(private edgeParser: EdgeParser) {}

  async provideSemanticTokens(document: TextDocument): Promise<SemanticTokens> {
    const text = document.getText();
    const tree: any = this.edgeParser.parse(text);
    
    const builder = new SemanticTokensBuilder();
    
    this.walkTree(tree.rootNode, document, builder);
    
    return builder.build();
  }

  private walkTree(node: any, document: TextDocument, builder: SemanticTokensBuilder): void {
    // Process current node
    this.processNode(node, document, builder);
    
    // Process children
    for (let i = 0; i < node.childCount; i++) {
      const child = node.child(i);
      if (child) {
        this.walkTree(child, document, builder);
      }
    }
  }

  private processNode(node: any, document: TextDocument, builder: SemanticTokensBuilder): void {
    const tokenType = this.getTokenType(node);
    if (tokenType !== undefined) {
      const tokenModifiers = this.getTokenModifiers(node);
      
      const startPos = document.positionAt(node.startIndex);
      const endPos = document.positionAt(node.endIndex);
      const length = node.endIndex - node.startIndex;
      
      builder.push(
        startPos.line,
        startPos.character,
        length,
        tokenType,
        tokenModifiers
      );
    }
  }

  private getTokenType(node: any): number | undefined {
    switch (node.type) {
      case 'if_directive':
      case 'each_directive':
      case 'include_directive':
      case 'component_directive':
      case 'simple_directive':
        return TOKEN_TYPES.indexOf('directive');
        
      case 'mustache':
      case 'safe_mustache':
        return TOKEN_TYPES.indexOf('interpolation');
        
      case 'comment':
        return TOKEN_TYPES.indexOf('comment');
        
      case 'keyword':
        return TOKEN_TYPES.indexOf('keyword');
        
      case 'identifier':
        return TOKEN_TYPES.indexOf('variable');
        
      case 'string':
        return TOKEN_TYPES.indexOf('string');
        
      case 'number':
        return TOKEN_TYPES.indexOf('number');
        
      case 'operator':
        return TOKEN_TYPES.indexOf('operator');
        
      case 'call_expression':
        return TOKEN_TYPES.indexOf('function');
        
      case 'property_identifier':
        return TOKEN_TYPES.indexOf('property');
        
      default:
        return undefined;
    }
  }

  private getTokenModifiers(node: any): number {
    // For now, we don't have specific modifiers
    // In the future, we could add modifiers for declarations, etc.
    return 0;
  }
}