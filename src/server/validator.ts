import { TextDocument } from "vscode-languageserver-textdocument";
import { Diagnostic, DiagnosticSeverity } from "vscode-languageserver/node";

export class EdgeValidator {
  validate(tree: any, document: TextDocument): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    const blockStack: Array<{ type: string; node: any }> = [];

    this.walkTree(tree.rootNode, (node) => {
      // Check for syntax errors
      if (node.hasError) {
        diagnostics.push({
          severity: DiagnosticSeverity.Error,
          range: {
            start: document.positionAt(node.startIndex),
            end: document.positionAt(node.endIndex),
          },
          message: "Syntax error",
          source: "edge",
        });
      }

      // Validate block directives matching
      switch (node.type) {
        case "if_directive":
          blockStack.push({ type: "if", node });
          this.validateIfDirective(node, document, diagnostics);
          break;
        case "unless_directive":
          blockStack.push({ type: "unless", node });
          this.validateUnlessDirective(node, document, diagnostics);
          break;
        case "each_directive":
          blockStack.push({ type: "each", node });
          this.validateEachDirective(node, document, diagnostics);
          break;
        case "component_directive":
          blockStack.push({ type: "component", node });
          this.validateComponentDirective(node, document, diagnostics);
          break;
        case "slot_directive":
          blockStack.push({ type: "slot", node });
          this.validateSlotDirective(node, document, diagnostics);
          break;
        case "section_directive":
          blockStack.push({ type: "section", node });
          this.validateSectionDirective(node, document, diagnostics);
          break;
        case "block_directive":
          blockStack.push({ type: "block", node });
          this.validateBlockDirective(node, document, diagnostics);
          break;
      }

      // Check for @end* directives without matching block
      if (node.type.startsWith("end") && node.type !== "end_directive") {
        const directiveType = node.type
          .replace("end", "")
          .replace("_directive", "");
        let found = false;

        // Look for matching open directive in stack
        for (let i = blockStack.length - 1; i >= 0; i--) {
          if (blockStack[i].type === directiveType) {
            blockStack.splice(i, 1);
            found = true;
            break;
          }
        }

        if (!found) {
          diagnostics.push({
            severity: DiagnosticSeverity.Error,
            range: {
              start: document.positionAt(node.startIndex),
              end: document.positionAt(node.endIndex),
            },
            message: `@end${directiveType} without matching @${directiveType} directive`,
            source: "edge",
          });
        }
      }

      // Special case for @end directive (generic end)
      if (node.type === "end_directive") {
        if (blockStack.length === 0) {
          diagnostics.push({
            severity: DiagnosticSeverity.Error,
            range: {
              start: document.positionAt(node.startIndex),
              end: document.positionAt(node.endIndex),
            },
            message: "@end without matching block directive",
            source: "edge",
          });
        } else {
          blockStack.pop(); // Match found
        }
      }

      // Validate interpolations
      if (node.type === "interpolation" || node.type === "safe_interpolation") {
        this.validateInterpolation(node, document, diagnostics);
      }

      // Validate includes
      if (
        node.type === "include_directive" ||
        node.type === "include_if_directive"
      ) {
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
        message: `@${block.type} directive missing @end${block.type}`,
        source: "edge",
      });
    });

    return diagnostics;
  }

  private walkTree(node: any, callback: (node: any) => void) {
    callback(node);
    for (let i = 0; i < node.childCount; i++) {
      const child = node.child(i);
      if (child) {
        this.walkTree(child, callback);
      }
    }
  }

  private validateIfDirective(
    node: any,
    document: TextDocument,
    diagnostics: Diagnostic[],
  ) {
    // Additional validation for @if directives
    const conditionNode = node.children.find(
      (child: any) => child.type === "condition",
    );
    if (!conditionNode) {
      diagnostics.push({
        severity: DiagnosticSeverity.Error,
        range: {
          start: document.positionAt(node.startIndex),
          end: document.positionAt(node.endIndex),
        },
        message: "@if directive missing condition",
        source: "edge",
      });
    }
  }

  private validateUnlessDirective(
    node: any,
    document: TextDocument,
    diagnostics: Diagnostic[],
  ) {
    // Additional validation for @unless directives
    const conditionNode = node.children.find(
      (child: any) => child.type === "condition",
    );
    if (!conditionNode) {
      diagnostics.push({
        severity: DiagnosticSeverity.Error,
        range: {
          start: document.positionAt(node.startIndex),
          end: document.positionAt(node.endIndex),
        },
        message: "@unless directive missing condition",
        source: "edge",
      });
    }
  }

  private validateEachDirective(
    node: any,
    document: TextDocument,
    diagnostics: Diagnostic[],
  ) {
    // Validate @each syntax
    const text = node.text;
    if (!text.includes(" in ")) {
      diagnostics.push({
        severity: DiagnosticSeverity.Error,
        range: {
          start: document.positionAt(node.startIndex),
          end: document.positionAt(node.endIndex),
        },
        message: '@each directive missing "in" keyword',
        source: "edge",
      });
    }
  }

  private validateForelseDirective(
    node: any,
    document: TextDocument,
    diagnostics: Diagnostic[],
  ) {
    // Validate @forelse syntax
    const text = node.text;
    if (!text.includes(" in ")) {
      diagnostics.push({
        severity: DiagnosticSeverity.Error,
        range: {
          start: document.positionAt(node.startIndex),
          end: document.positionAt(node.endIndex),
        },
        message: '@forelse directive missing "in" keyword',
        source: "edge",
      });
    }
  }

  private validateComponentDirective(
    node: any,
    document: TextDocument,
    diagnostics: Diagnostic[],
  ) {
    // Validate component name format
    const componentName = this.extractStringFromNode(node);
    if (componentName && !componentName.match(/^[a-zA-Z][a-zA-Z0-9._-]*$/)) {
      diagnostics.push({
        severity: DiagnosticSeverity.Warning,
        range: {
          start: document.positionAt(node.startIndex),
          end: document.positionAt(node.endIndex),
        },
        message: "Component name should follow naming conventions",
        source: "edge",
      });
    }
  }

  private validateSlotDirective(
    node: any,
    document: TextDocument,
    diagnostics: Diagnostic[],
  ) {
    // Validate slot name format
    const slotName = this.extractStringFromNode(node);
    if (slotName && !slotName.match(/^[a-zA-Z][a-zA-Z0-9_-]*$/)) {
      diagnostics.push({
        severity: DiagnosticSeverity.Warning,
        range: {
          start: document.positionAt(node.startIndex),
          end: document.positionAt(node.endIndex),
        },
        message: "Slot name should follow naming conventions",
        source: "edge",
      });
    }
  }

  private validateSectionDirective(
    node: any,
    document: TextDocument,
    diagnostics: Diagnostic[],
  ) {
    // Validate section name format
    const sectionName = this.extractStringFromNode(node);
    if (sectionName && !sectionName.match(/^[a-zA-Z][a-zA-Z0-9_-]*$/)) {
      diagnostics.push({
        severity: DiagnosticSeverity.Warning,
        range: {
          start: document.positionAt(node.startIndex),
          end: document.positionAt(node.endIndex),
        },
        message: "Section name should follow naming conventions",
        source: "edge",
      });
    }
  }

  private validateBlockDirective(
    node: any,
    document: TextDocument,
    diagnostics: Diagnostic[],
  ) {
    // Validate block name format
    const blockName = this.extractStringFromNode(node);
    if (blockName && !blockName.match(/^[a-zA-Z][a-zA-Z0-9_-]*$/)) {
      diagnostics.push({
        severity: DiagnosticSeverity.Warning,
        range: {
          start: document.positionAt(node.startIndex),
          end: document.positionAt(node.endIndex),
        },
        message: "Block name should follow naming conventions",
        source: "edge",
      });
    }
  }

  private validateForDirective(
    node: any,
    document: TextDocument,
    diagnostics: Diagnostic[],
  ) {
    // Validate @for syntax
    const text = node.text;
    if (!text.includes(";") || (!text.includes("<") && !text.includes(">"))) {
      diagnostics.push({
        severity: DiagnosticSeverity.Warning,
        range: {
          start: document.positionAt(node.startIndex),
          end: document.positionAt(node.endIndex),
        },
        message: "@for directive should follow standard for loop syntax",
        source: "edge",
      });
    }
  }

  private validateWhileDirective(
    node: any,
    document: TextDocument,
    diagnostics: Diagnostic[],
  ) {
    // Validate @while syntax
    const conditionNode = node.children.find(
      (child: any) => child.type === "condition",
    );
    if (!conditionNode) {
      diagnostics.push({
        severity: DiagnosticSeverity.Error,
        range: {
          start: document.positionAt(node.startIndex),
          end: document.positionAt(node.endIndex),
        },
        message: "@while directive missing condition",
        source: "edge",
      });
    }
  }

  private validateVerbatimDirective(
    node: any,
    document: TextDocument,
    diagnostics: Diagnostic[],
  ) {
    // @verbatim doesn't need special validation
  }

  private validateEndPhpDirective(
    node: any,
    document: TextDocument,
    diagnostics: Diagnostic[],
  ) {
    // @endphp doesn't need special validation
  }

  private validateInterpolation(
    node: any,
    document: TextDocument,
    diagnostics: Diagnostic[],
  ) {
    // Check for empty interpolations
    const expressionNode = node.children.find(
      (child: any) => child.type === "expression",
    );
    if (!expressionNode || expressionNode.text.trim().length === 0) {
      diagnostics.push({
        severity: DiagnosticSeverity.Warning,
        range: {
          start: document.positionAt(node.startIndex),
          end: document.positionAt(node.endIndex),
        },
        message: "Empty interpolation",
        source: "edge",
      });
    }
  }

  private validateInclude(
    node: any,
    document: TextDocument,
    diagnostics: Diagnostic[],
  ) {
    // Validate include path format
    const includePath = this.extractStringFromNode(node);
    if (includePath && includePath.includes("..")) {
      diagnostics.push({
        severity: DiagnosticSeverity.Warning,
        range: {
          start: document.positionAt(node.startIndex),
          end: document.positionAt(node.endIndex),
        },
        message: "Avoid using relative paths in includes",
        source: "edge",
      });
    }
  }

  private extractStringFromNode(node: any): string | null {
    // Find string nodes in the children
    const stringNodes = node.children.filter(
      (child: any) => child.type === "string",
    );
    if (stringNodes.length > 0) {
      return stringNodes[0].text.slice(1, -1); // Remove quotes
    }
    return null;
  }
}
