import { TextDocument } from "vscode-languageserver-textdocument";
import { Hover, MarkupKind, Position } from "vscode-languageserver/node";
import { EdgeParser } from "../server/parser";

export class EdgeHoverProvider {
  constructor(private edgeParser: EdgeParser) {}

  provideHover(document: TextDocument, position: Position): Hover | null {
    const text = document.getText();
    const tree: any = this.edgeParser.parse(text);
    const node: any = this.edgeParser.getNodeAtPosition(
      tree,
      position.line,
      position.character,
    );

    if (!node) return null;

    return this.getHoverForNode(node, document);
  }

  private getHoverForNode(node: any, document: TextDocument): Hover | null {
    const range = {
      start: document.positionAt(node.startIndex),
      end: document.positionAt(node.endIndex),
    };

    switch (node.type) {
      // Conditional directives
      case "if_directive":
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
@endif
\`\`\`
`,
          },
          range,
        };

      case "elseif_directive":
        return {
          contents: {
            kind: MarkupKind.Markdown,
            value: `
**@elseif Directive**

Adds an else-if condition to an if block.

\`\`\`edge
@if(condition1)
  Content for condition 1
@elseif(condition2)
  Content for condition 2
@else
  Content for neither condition
@end
\`\`\`
`,
          },
          range,
        };

      case "else_directive":
        return {
          contents: {
            kind: MarkupKind.Markdown,
            value: `
**@else Directive**

Adds an else clause to an if block.

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

      case "unless_directive":
        return {
          contents: {
            kind: MarkupKind.Markdown,
            value: `
**@unless Directive**

Creates a conditional block that renders content unless a condition is true.

\`\`\`edge
@unless(condition)
  Content to render if false
@end
\`\`\`
`,
          },
          range,
        };

      // Loop directives
      case "each_directive":
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

With index:
\`\`\`edge
@each((item, index) in items)
  {{ index }}: {{ item.name }}
@end
\`\`\`
`,
          },
          range,
        };

      // Component and template directives
      case "component_directive":
        return {
          contents: {
            kind: MarkupKind.Markdown,
            value: `
**@component Directive**

Includes a reusable component.

\`\`\`edge
@component('components/button')
  @slot('text')
    Click me
  @end
@endcomponent
\`\`\`
`,
          },
          range,
        };

      case "inline_component_directive":
        return {
          contents: {
            kind: MarkupKind.Markdown,
            value: `
**@!component Directive**

Includes a component inline without a block.

\`\`\`edge
@!component('components/icon', { name: 'check' })
\`\`\`
`,
          },
          range,
        };

      case "slot_directive":
        return {
          contents: {
            kind: MarkupKind.Markdown,
            value: `
**@slot Directive**

Defines a named slot in a component.

\`\`\`edge
@slot('header')
  <h1>Welcome</h1>
@endslot
\`\`\`
`,
          },
          range,
        };

      case "inject_directive":
        return {
          contents: {
            kind: MarkupKind.Markdown,
            value: `
**@inject Directive**

Injects a variable into the template context.

\`\`\`edge
@inject(user)
\`\`\`
`,
          },
          range,
        };

      case "include_directive":
        return {
          contents: {
            kind: MarkupKind.Markdown,
            value: `
**@include Directive**

Includes another template file.

\`\`\`edge
@include('partials.header')
@include('components.button', { text: 'Click me' })
\`\`\`
`,
          },
          range,
        };

      case "include_if_directive":
        return {
          contents: {
            kind: MarkupKind.Markdown,
            value: `
**@includeIf Directive**

Includes a template file only if a condition is true.

\`\`\`edge
@includeIf(user.isAdmin, 'admin.panel')
\`\`\`
`,
          },
          range,
        };

      case "svg_directive":
        return {
          contents: {
            kind: MarkupKind.Markdown,
            value: `
**@svg Directive**

Includes an SVG file.

\`\`\`edge
@svg('icons/check.svg')
\`\`\`
`,
          },
          range,
        };

      case "debugger_directive":
        return {
          contents: {
            kind: MarkupKind.Markdown,
            value: `
**@debugger Directive**

Sets a debug breakpoint.

\`\`\`edge
@debugger
\`\`\`
`,
          },
          range,
        };

      case "let_directive":
        return {
          contents: {
            kind: MarkupKind.Markdown,
            value: `
**@let Directive**

Declares a template variable.

\`\`\`edge
@let(title = 'Welcome')
@let(user = { name: 'John', age: 30 })
\`\`\`
`,
          },
          range,
        };

      case "assign_directive":
        return {
          contents: {
            kind: MarkupKind.Markdown,
            value: `
**@assign Directive**

Assigns a value to a variable.

\`\`\`edge
@assign(count = count + 1)
\`\`\`
`,
          },
          range,
        };

      case "vite_directive":
        return {
          contents: {
            kind: MarkupKind.Markdown,
            value: `
**@vite Directive**

Handles Vite assets.

\`\`\`edge
@vite('resources/css/app.css')
\`\`\`
`,
          },
          range,
        };

      // Other directives
      case "section_directive":
        return {
          contents: {
            kind: MarkupKind.Markdown,
            value: `
**@section Directive**

Defines a named section.

\`\`\`edge
@section('content')
  <h1>Page Content</h1>
@end
\`\`\`
`,
          },
          range,
        };

      case "extends_directive":
        return {
          contents: {
            kind: MarkupKind.Markdown,
            value: `
**@extends Directive**

Extends a layout template.

\`\`\`edge
@extends('layouts.app')
\`\`\`
`,
          },
          range,
        };

      case "debug_directive":
        return {
          contents: {
            kind: MarkupKind.Markdown,
            value: `
**@debug Directive**

Outputs debug information.

\`\`\`edge
@debug(variable)
\`\`\`
`,
          },
          range,
        };

      // Interpolations
      case "interpolation":
        return {
          contents: {
            kind: MarkupKind.Markdown,
            value: `
**Interpolation**

Outputs the value of an expression. HTML is escaped by default.

Use {{{{ }}}} for unescaped output.

\`\`\`edge
{{ variable }}
{{ user.name }}
{{ items.length }}
\`\`\`
`,
          },
          range,
        };

      case "safe_interpolation":
        return {
          contents: {
            kind: MarkupKind.Markdown,
            value: `
**Safe Interpolation**

Outputs the value of an expression without HTML escaping.

\`\`\`edge
{{{ variable }}}
{{{ htmlContent }}}
\`\`\`
`,
          },
          range,
        };

      default:
        return null;
    }
  }
}
