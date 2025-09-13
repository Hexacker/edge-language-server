import Parser from 'tree-sitter';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { Diagnostic, DiagnosticSeverity } from 'vscode-languageserver/node';

export class EdgeValidator {
  validate(tree: Parser.Tree, document: TextDocument): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    const blockStack: Array<{ type: string; node: Parser.SyntaxNode }> = [];

    this.walkTree(tree.rootNode, (node) => {
      // Check for syntax errors
      if (node.hasError()) {
        diagnostics.push({
          severity: DiagnosticSeverity.Error,
          range: {
            start: document.positionAt(node.startIndex),
            end: document.positionAt(node.endIndex),
          },
          message: 'Syntax error',
          source: 'edge',
        });
      }

      // Validate block directives matching
      if (node.type === 'if_directive') {
        blockStack.push({ type: 'if', node });
        this.validateIfDirective(node, document, diagnostics);
      } else if (node.type === 'each_directive') {
        blockStack.push({ type: 'each', node });
        this.validateEachDirective(node, document, diagnostics);
      } else if (node.type === 'component_directive') {
        blockStack.push({ type: 'component', node });
        this.validateComponentDirective(node, document, diagnostics);
      }

      // Check for @end without matching block
      if (node.type === 'simple_directive' && node.text === '@end') {
        if (blockStack.length === 0) {
          diagnostics.push({
            severity: DiagnosticSeverity.Error,
            range: {
              start: document.positionAt(node.startIndex),
              end: document.positionAt(node.endIndex),
            },
            message: '@end without matching block directive',
            source: 'edge',
          });
        } else {
          blockStack.pop(); // Match found
        }
      }

      // Validate interpolations
      if (node.type === 'interpolation') {
        this.validateInterpolation(node, document, diagnostics);
      }

      // Validate includes
      if (node.type === 'include_directive') {
        this.validateInclude(node, document, diagnostics);
      }
    });

    // Check for unmatched block directives
    blockStack.forEach((block) => {
      diagnostics.push({
        severity: DiagnosticSeverity.Error,
        range: {
          start: document.positionAt(block.node.startIndex),
          end: document.positionAt(block.node.endIndex),
        },
        message: `@${block.type} directive missing @end`,
        source: 'edge',
      });
    });

    return diagnostics;
  }

  private walkTree(node: Parser.SyntaxNode, callback: (node: Parser.SyntaxNode) => void) {
    callback(node);
    for (let i = 0; i < node.childCount; i++) {
      this.walkTree(node.child(i)!, callback);
    }
  }

  private validateIfDirective(node: Parser.SyntaxNode, document: TextDocument, diagnostics: Diagnostic[]) {
    // Additional validation for @if directives
    const expressionNode = node.childForFieldName('condition');
    if (!expressionNode) {
      diagnostics.push({
        severity: DiagnosticSeverity.Error,
        range: {
          start: document.positionAt(node.startIndex),
          end: document.positionAt(node.endIndex),
        },
        message: '@if directive missing condition',
        source: 'edge',
      });
    }
  }

  private validateEachDirective(node: Parser.SyntaxNode, document: TextDocument, diagnostics: Diagnostic[]) {
    // Validate @each syntax
    const text = node.text;
    if (!text.includes(' in ')) {
      diagnostics.push({
        severity: DiagnosticSeverity.Error,
        range: {
          start: document.positionAt(node.startIndex),
          end: document.positionAt(node.endIndex),
        },
        message: '@each directive missing "in" keyword',
        source: 'edge',
      });
    }
  }

  private validateComponentDirective(node: Parser.SyntaxNode, document: TextDocument, diagnostics: Diagnostic[]) {
    // Validate component name format
    const componentName = this.extractStringFromNode(node);
    if (componentName && !componentName.match(/^[a-zA-Z][a-zA-Z0-9._-]*$/)) {
      diagnostics.push({
        severity: DiagnosticSeverity.Warning,
        range: {
          start: document.positionAt(node.startIndex),
          end: document.positionAt(node.endIndex),
        },
        message: 'Component name should follow naming conventions',
        source: 'edge',
      });
    }
  }

  private validateInterpolation(node: Parser.SyntaxNode, document: TextDocument, diagnostics: Diagnostic[]) {
    // Check for empty interpolations
    const expression = node.childForFieldName('expression');
    if (!expression || expression.text.trim().length === 0) {
      diagnostics.push({
        severity: DiagnosticSeverity.Warning,
        range: {
          start: document.positionAt(node.startIndex),
          end: document.positionAt(node.endIndex),
        },
        message: 'Empty interpolation',
        source: 'edge',
      });
    }
  }

  private validateInclude(node: Parser.SyntaxNode, document: TextDocument, diagnostics: Diagnostic[]) {
    // Validate include path format
    const includePath = this.extractStringFromNode(node);
    if (includePath && includePath.includes('..')) {
      diagnostics.push({
        severity: DiagnosticSeverity.Warning,
        range: {
          start: document.positionAt(node.startIndex),
          end: document.positionAt(node.endIndex),
        },
        message: 'Avoid using relative paths in includes',
        source: 'edge',
      });
    }
  }

  private extractStringFromNode(node: Parser.SyntaxNode): string | null {
    const stringNode = node.descendantsOfType('string_literal')[0];
    if (stringNode) {
      return stringNode.text.slice(1, -1); // Remove quotes
    }
    return null;
  }
}
