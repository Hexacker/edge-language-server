import { TextDocument } from 'vscode-languageserver-textdocument';
import { Hover, MarkupKind, Position } from 'vscode-languageserver/node';
import { EdgeParser } from './parser';

export class EdgeHoverProvider {
  constructor(private edgeParser: EdgeParser) {}

  provideHover(document: TextDocument, position: Position): Hover | null {
    const text = document.getText();
    const tree: any = this.edgeParser.parse(text);
    const node: any = this.edgeParser.getNodeAtPosition(tree, position.line, position.character);

    if (!node) return null;

    return this.getHoverForNode(node, document);
  }

  private getHoverForNode(node: any, document: TextDocument): Hover | null {
    const range = {
      start: document.positionAt(node.startIndex),
      end: document.positionAt(node.endIndex),
    };

    switch (node.type) {
      case 'if_directive':
        return {
          contents: {
            kind: MarkupKind.Markdown,
            value: `
**@if Directive**

Creates a conditional block that renders content based on a condition.

\`\`\`edge
@if(condition)
  Content to render if true
@else
  Content to render if false
@end
\`\`\`
`,
          },
          range,
        };

      case 'each_directive':
        return {
          contents: {
            kind: MarkupKind.Markdown,
            value: `
**@each Directive**

Loops over iterable data and renders content for each item.

\`\`\`edge
@each(item in items)
  {{ item.name }}
@end
\`\`\`
`,
          },
          range,
        };

      case 'include_directive':
        return {
          contents: {
            kind: MarkupKind.Markdown,
            value: `
**@include Directive**

Includes content from another template file.

\`\`\`edge
@include('partials.header')
@include('components.button', { text: 'Click me' })
\`\`\`
`,
          },
          range,
        };

      case 'interpolation':
        return {
          contents: {
            kind: MarkupKind.Markdown,
            value: `
**Interpolation**

Outputs the value of an expression. HTML is escaped by default.

Use {{{{ }}}} for unescaped output.
`,
          },
          range,
        };

      default:
        return null;
    }
  }
}
