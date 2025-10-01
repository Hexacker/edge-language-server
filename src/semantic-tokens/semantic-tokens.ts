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
      // Conditional directives
      case 'if_directive':
      case 'elseif_directive':
      case 'else_directive':
      case 'unless_directive':
      case 'endif_directive':
      case 'endunless_directive':
        return TOKEN_TYPES.indexOf('directive');
        
      // Loop directives
      case 'each_directive':
      case 'forelse_directive':
      case 'endforeach_directive':
      case 'empty_directive':
      case 'endforelse_directive':
      case 'for_directive':
      case 'endfor_directive':
      case 'while_directive':
      case 'endwhile_directive':
        return TOKEN_TYPES.indexOf('directive');
        
      // Component and template directives
      case 'component_directive':
      case 'inline_component_directive':
      case 'endcomponent_directive':
      case 'slot_directive':
      case 'endslot_directive':
      case 'inject_directive':
      case 'include_directive':
      case 'include_if_directive':
        return TOKEN_TYPES.indexOf('directive');
        
      // Utility directives
      case 'eval_directive':
      case 'new_error_directive':
      case 'svg_directive':
      case 'debugger_directive':
      case 'let_directive':
      case 'assign_directive':
      case 'vite_directive':
        return TOKEN_TYPES.indexOf('directive');
        
      // Other directives
      case 'section_directive':
      case 'endsection_directive':
      case 'yield_directive':
      case 'extends_directive':
      case 'block_directive':
      case 'endblock_directive':
      case 'has_block_directive':
      case 'break_directive':
      case 'continue_directive':
      case 'super_directive':
      case 'debug_directive':
      case 'endphp_directive':
      case 'endphpp_directive':
      case 'verbatim_directive':
      case 'endverbatim_directive':
        return TOKEN_TYPES.indexOf('directive');
        
      // Interpolations
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