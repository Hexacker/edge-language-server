import { TextDocument } from "vscode-languageserver-textdocument";
import {
  Position,
  CompletionItem,
  CompletionItemKind,
  InsertTextFormat,
  Range,
  TextEdit,
} from "vscode-languageserver";
import { EdgeParser } from "../server/parser";

export class EdgeCompletionProvider {
  private edgeParser: EdgeParser;

  constructor(edgeParser: EdgeParser) {
    this.edgeParser = edgeParser;
  }

  private edgeDirectives: CompletionItem[] = [
    // Conditional directives
    {
      label: "@if",
      kind: CompletionItemKind.Keyword,
      detail: "Conditional directive",
      insertText: "@if(${1:condition})\n  ${2:content}\n@end", // ← Simple version
      insertTextFormat: InsertTextFormat.Snippet,
      filterText: "@if",
      documentation:
        "Creates a conditional block that renders content based on a condition.",
    },
    {
      label: "@elseif",
      kind: CompletionItemKind.Keyword,
      detail: "Else-if directive",
      insertText: "elseif(${1:condition})\n${2:content}",
      insertTextFormat: InsertTextFormat.Snippet,
      filterText: "elseif",
      documentation: "Adds an else-if condition to an if block.",
    },
    {
      label: "@else",
      kind: CompletionItemKind.Keyword,
      detail: "Else directive",
      insertText: "@else\n${1:content}",
      insertTextFormat: InsertTextFormat.Snippet,
      filterText: "else",
      documentation: "Adds an else clause to an if block.",
    },
    {
      label: "@unless",
      kind: CompletionItemKind.Keyword,
      detail: "Unless directive",
      insertText: "@unless(${1:condition})\n${2:content}\n@end",
      insertTextFormat: InsertTextFormat.Snippet,
      filterText: "unless",
      documentation:
        "Creates a conditional block that renders content unless a condition is true.",
    },

    // Loop directives
    {
      label: "@each",
      kind: CompletionItemKind.Keyword,
      detail: "Loop directive",
      insertText: "@each(${1:item} in ${2:items})\n  ${3:content}\n@end", // ← Simple version
      insertTextFormat: InsertTextFormat.Snippet,
      filterText: "@each",
      documentation:
        "Loops over iterable data and renders content for each item.",
    },

    {
      label: "@each (with index)",
      kind: CompletionItemKind.Keyword,
      detail: "Loop with index directive",
      insertText:
        "@each((${1:item}, ${2:index}) in ${3:items})\n${4:content}\n@end",
      insertTextFormat: InsertTextFormat.Snippet,
      filterText: "each",
      documentation:
        "Loops over iterable data with index and renders content for each item.",
    },

    // Component and template directives
    {
      label: "@component",
      kind: CompletionItemKind.Function,
      detail: "Include component",
      insertText: "@component('${1:name}')\n  ${2:content}\n@end", // ← Simple version
      insertTextFormat: InsertTextFormat.Snippet,
      filterText: "@component",
      documentation: "Include a reusable component.",
    },
    {
      label: "@!component",
      kind: CompletionItemKind.Function,
      detail: "Inline component rendering",
      insertText: "!component('${1:name}')",
      insertTextFormat: InsertTextFormat.Snippet,
      filterText: "!component",
      documentation: "Include a component inline without a block.",
    },
    {
      label: "@!component (with props)",
      kind: CompletionItemKind.Function,
      detail: "Inline component with props",
      insertText: "!component('${1:name}', { ${2:prop}: ${3:value} })",
      insertTextFormat: InsertTextFormat.Snippet,
      filterText: "!component",
      documentation: "Include a component inline with props.",
    },
    {
      label: "@slot",
      kind: CompletionItemKind.Function,
      detail: "Define named slot",
      insertText: "slot('${1:name}')\n  ${2:content}\n@end",
      insertTextFormat: InsertTextFormat.Snippet,
      filterText: "slot",
      documentation: "Define a named slot in a component.",
    },
    {
      label: "@slot (main)",
      kind: CompletionItemKind.Function,
      detail: "Define main slot",
      insertText: "slot\n  ${1:content}\n@end",
      insertTextFormat: InsertTextFormat.Snippet,
      filterText: "slot",
      documentation: "Define the main slot in a component.",
    },
    {
      label: "@!slot",
      kind: CompletionItemKind.Function,
      detail: "Auto-closed slot",
      insertText: "!slot('${1:name}', '${2:default_content}')",
      insertTextFormat: InsertTextFormat.Snippet,
      filterText: "!slot",
      documentation: "Define a named slot with default content.",
    },
    {
      label: "@inject",
      kind: CompletionItemKind.Variable,
      detail: "Inject variable",
      insertText: "inject(${1:variable})",
      insertTextFormat: InsertTextFormat.Snippet,
      filterText: "inject",
      documentation: "Inject a variable into the template context.",
    },
    {
      label: "@include",
      kind: CompletionItemKind.Function,
      detail: "Include template",
      insertText: "include('${1:template}')",
      insertTextFormat: InsertTextFormat.Snippet,
      filterText: "include",
      documentation: "Include another template file.",
    },
    {
      label: "@includeIf",
      kind: CompletionItemKind.Function,
      detail: "Conditional include",
      insertText: "includeIf(${1:condition}, '${2:template}')",
      insertTextFormat: InsertTextFormat.Snippet,
      filterText: "includeIf",
      documentation: "Include a template file only if a condition is true.",
    },

    // Utility directives
    {
      label: "@eval",
      kind: CompletionItemKind.Function,
      detail: "Evaluate expression",
      insertText: "eval(${1:expression})",
      insertTextFormat: InsertTextFormat.Snippet,
      filterText: "eval",
      documentation: "Evaluate a JavaScript expression.",
    },
    {
      label: "@let",
      kind: CompletionItemKind.Variable,
      detail: "Declare variable",
      insertText: "let(${1:name} = ${2:value})",
      insertTextFormat: InsertTextFormat.Snippet,
      filterText: "let",
      documentation: "Declare a template variable.",
    },
    {
      label: "@assign",
      kind: CompletionItemKind.Variable,
      detail: "Assign value",
      insertText: "assign(${1:name} = ${2:value})",
      insertTextFormat: InsertTextFormat.Snippet,
      filterText: "assign",
      documentation: "Assign a value to a variable.",
    },
    {
      label: "@debugger",
      kind: CompletionItemKind.Keyword,
      detail: "Debug breakpoint",
      insertText: "debugger",
      filterText: "debugger",
      documentation: "Set a debug breakpoint.",
    },
    {
      label: "@newError",
      kind: CompletionItemKind.Function,
      detail: "Create new error",
      insertText:
        "newError(${1:message}, ${2:filename}, ${3:line}, ${4:column})",
      insertTextFormat: InsertTextFormat.Snippet,
      filterText: "newError",
      documentation:
        "Create a new error with message, filename, line, and column.",
    },

    // AdonisJS specific directives
    {
      label: "@vite",
      kind: CompletionItemKind.Function,
      detail: "Vite asset",
      insertText: "vite('${1:path}')",
      insertTextFormat: InsertTextFormat.Snippet,
      filterText: "vite",
      documentation: "Handle Vite assets.",
    },
    {
      label: "@viteReactRefresh",
      kind: CompletionItemKind.Function,
      detail: "Vite React refresh",
      insertText: "viteReactRefresh",
      filterText: "viteReactRefresh",
      documentation: "Enable React HMR in development.",
    },
    {
      label: "@svg",
      kind: CompletionItemKind.Function,
      detail: "Include SVG",
      insertText: "svg('${1:path}')",
      insertTextFormat: InsertTextFormat.Snippet,
      filterText: "svg",
      documentation: "Include an SVG file.",
    },
    {
      label: "@flashMessage",
      kind: CompletionItemKind.Function,
      detail: "Flash message helper",
      insertText: "flashMessage('${1:key}')\n${2:content}\n@end",
      insertTextFormat: InsertTextFormat.Snippet,
      filterText: "flashMessage",
      documentation: "Read flash messages conditionally.",
    },
    {
      label: "@error",
      kind: CompletionItemKind.Function,
      detail: "Error helper",
      insertText: "error('${1:field}')\n${2:content}\n@end",
      insertTextFormat: InsertTextFormat.Snippet,
      filterText: "error",
      documentation: "Read error messages from errorsBag.",
    },
    {
      label: "@inputError",
      kind: CompletionItemKind.Function,
      detail: "Input error helper",
      insertText: "inputError('${1:field}')\n${2:content}\n@end",
      insertTextFormat: InsertTextFormat.Snippet,
      filterText: "inputError",
      documentation: "Read validation error messages from inputErrorsBag.",
    },
    {
      label: "@can",
      kind: CompletionItemKind.Function,
      detail: "Authorization check",
      insertText: "can('${1:permission}')\n${2:content}\n@end",
      insertTextFormat: InsertTextFormat.Snippet,
      filterText: "can",
      documentation: "Authorization check in templates.",
    },
    {
      label: "@cannot",
      kind: CompletionItemKind.Function,
      detail: "Authorization negation",
      insertText: "cannot('${1:permission}')\n${2:content}\n@end",
      insertTextFormat: InsertTextFormat.Snippet,
      filterText: "cannot",
      documentation: "Negated authorization check in templates.",
    },

    // Auto-closing pairs for mustache syntax
    {
      label: "{{-- Comment --}}",
      kind: CompletionItemKind.Snippet,
      detail: "EdgeJS Comment",
      insertText: "{{-- ${1:comment} --}}",
      insertTextFormat: InsertTextFormat.Snippet,
      filterText: "comment",
      documentation: "Insert an EdgeJS comment block.",
    },
    {
      label: "{{{ Raw Output }}}",
      kind: CompletionItemKind.Snippet,
      detail: "EdgeJS Raw Output (unescaped)",
      insertText: "{{{ ${1:expression} }}}",
      insertTextFormat: InsertTextFormat.Snippet,
      filterText: "raw",
      documentation: "Output raw, unescaped HTML content.",
    },
    {
      label: "{{ Escaped Output }}",
      kind: CompletionItemKind.Snippet,
      detail: "EdgeJS Escaped Output",
      insertText: "{{ ${1:expression} }}",
      insertTextFormat: InsertTextFormat.Snippet,
      filterText: "output",
      documentation: "Output escaped content (safe for HTML).",
    },
  ];

  private edgeSpecialVariables: CompletionItem[] = [
    {
      label: "$loop",
      kind: CompletionItemKind.Variable,
      detail: "Loop context object",
      documentation: {
        kind: "markdown",
        value:
          "Provides access to loop context:\n" +
          "- index: Current iteration (0-based)\n" +
          "- iteration: Current iteration (1-based)\n" +
          "- length: Total length of the iterable\n" +
          "- first: True if first iteration\n" +
          "- last: True if last iteration\n" +
          "- remaining: Number of iterations remaining\n" +
          "- depth: Nesting level of the loop",
      },
    },
    {
      label: "$slot",
      kind: CompletionItemKind.Variable,
      detail: "Slot context object",
      documentation: "Access named slots and their content within components.",
    },
  ];

  private commonSlots: CompletionItem[] = [
    {
      label: "main",
      kind: CompletionItemKind.Value,
      detail: "Main content slot",
      documentation: "The default slot for component content.",
    },
    {
      label: "header",
      kind: CompletionItemKind.Value,
      detail: "Header slot",
      documentation: "Commonly used for header content in layouts/components.",
    },
    {
      label: "footer",
      kind: CompletionItemKind.Value,
      detail: "Footer slot",
      documentation: "Commonly used for footer content in layouts/components.",
    },
  ];

  provideCompletions(
    document: TextDocument,
    position: Position,
  ): CompletionItem[] {
    const text = document.getText();
    const offset = document.offsetAt(position);

    // Check if we're inside interpolation context first
    if (this.isInsideInterpolation(document, position)) {
      return this.getInterpolationCompletions();
    }

    const lineText = document.getText({
      start: { line: position.line, character: 0 },
      end: { line: position.line, character: position.character },
    });

    // Check for @ character - FIX FOR DUPLICATION ISSUE
    const atIndex = lineText.lastIndexOf("@");
    if (atIndex !== -1 && atIndex < position.character) {
      // Create range that includes the @ character to replace it entirely
      const replaceRange = Range.create(
        { line: position.line, character: atIndex },
        position,
      );

      // Return directives with proper text replacement
      return this.edgeDirectives
        .filter((item) => item.label.startsWith("@"))
        .map((item) => {
          // Use the full insertText (with snippet) instead of just the label
          const fullText = item.insertText || item.label;
          return {
            ...item,
            textEdit: TextEdit.replace(replaceRange, fullText),
            insertText: undefined,
            // IMPORTANT: Keep insertTextFormat to process snippets correctly
            insertTextFormat: item.insertTextFormat || InsertTextFormat.Snippet,
          };
        });
    }

    // Parse document for more context-aware completions
    try {
      const tree = this.edgeParser.parse(text);
      const node = this.edgeParser.getNodeAtPosition(
        tree,
        position.line,
        position.character,
      );

      if (node && this.isInsideString(node)) {
        return this.getPathCompletions();
      }
    } catch (error) {
      // If parsing fails, fall back to basic completions
    }

    // Default: return all directives
    return this.edgeDirectives;
  }

  private createCompletionItem(
    item: CompletionItem,
    indentation: string,
  ): CompletionItem {
    let insertText = item.insertText || item.label;

    // Ensure it starts with @
    if (!insertText.startsWith("@")) {
      insertText = "@" + insertText;
    }

    // Add indentation to multiline content
    insertText = insertText
      .split("\n")
      .map((line, index) => {
        if (index === 0) return line;
        return indentation + line;
      })
      .join("\n");

    return {
      ...item,
      insertText,
    };
  }

  private isInsideInterpolation(
    document: TextDocument,
    position: Position,
  ): boolean {
    const text = document.getText();
    const offset = document.offsetAt(position);
    let inInterpolation = false;
    let i = 0;

    while (i < offset) {
      if (i < text.length - 1) {
        if (text[i] === "{" && text[i + 1] === "{") {
          inInterpolation = true;
          i += 2;
          continue;
        }
        if (text[i] === "}" && text[i + 1] === "}") {
          inInterpolation = false;
          i += 2;
          continue;
        }
      }
      i++;
    }

    return inInterpolation;
  }

  private isInsideString(node: any): boolean {
    return node.type === "string";
  }

  private adonisJsHelpers: CompletionItem[] = [
    {
      label: "route",
      kind: CompletionItemKind.Function,
      detail: "Generate URL for named route",
      insertText: "route('${1:routeName}')",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Generate URL for a named route",
    },
    {
      label: "signedRoute",
      kind: CompletionItemKind.Function,
      detail: "Generate signed URL for named route",
      insertText: "signedRoute('${1:routeName}')",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Generate signed URL for a named route",
    },
    {
      label: "request",
      kind: CompletionItemKind.Variable,
      detail: "HTTP request object",
      documentation: "Reference to the ongoing HTTP request instance",
    },
    {
      label: "auth",
      kind: CompletionItemKind.Variable,
      detail: "Authentication object",
      documentation:
        "Reference to ctx.auth property for accessing logged-in user information",
    },
    {
      label: "config",
      kind: CompletionItemKind.Function,
      detail: "Get configuration value",
      insertText: "config('${1:key}')",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Helper function to reference configuration values",
    },
    {
      label: "session",
      kind: CompletionItemKind.Function,
      detail: "Get session value",
      insertText: "session('${1:key}')",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Read-only copy of the session object",
    },
    {
      label: "flashMessages",
      kind: CompletionItemKind.Variable,
      detail: "Session flash messages",
      documentation: "Read-only copy of session flash messages",
    },
  ];

  private propsHelpers: CompletionItem[] = [
    {
      label: "$props.toAttrs",
      kind: CompletionItemKind.Method,
      detail: "Convert props to HTML attributes",
      insertText: "$props.toAttrs()",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Convert props object to HTML attributes string",
    },
    {
      label: "$props.merge",
      kind: CompletionItemKind.Method,
      detail: "Merge props with defaults",
      insertText: "$props.merge(${1:defaults})",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Merge props object with default values",
    },
    {
      label: "$props.only",
      kind: CompletionItemKind.Method,
      detail: "Extract specific props",
      insertText: "$props.only([${1:keys}])",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Extract only specified props from props object",
    },
    {
      label: "$props.except",
      kind: CompletionItemKind.Method,
      detail: "Exclude specific props",
      insertText: "$props.except([${1:keys}])",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Exclude specified props from props object",
    },
    {
      label: "$props.get",
      kind: CompletionItemKind.Method,
      detail: "Get property value",
      insertText: "$props.get('${1:key}')",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Get a property value from props",
    },
  ];

  private htmlHelpers: CompletionItem[] = [
    {
      label: "html.escape",
      kind: CompletionItemKind.Function,
      detail: "Escape HTML",
      insertText: "html.escape(${1:html})",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Escape HTML characters in string",
    },
    {
      label: "html.safe",
      kind: CompletionItemKind.Function,
      detail: "Mark as safe HTML",
      insertText: "html.safe(${1:html})",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Mark string as safe HTML (unescaped)",
    },
    {
      label: "html.classNames",
      kind: CompletionItemKind.Function,
      detail: "Generate CSS class names",
      insertText: "html.classNames(${1:classes})",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Generate CSS class names from object or array",
    },
    {
      label: "html.attrs",
      kind: CompletionItemKind.Function,
      detail: "Generate HTML attributes",
      insertText: "html.attrs(${1:attributes})",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Generate HTML attributes from object",
    },
  ];

  private stringHelpers: CompletionItem[] = [
    {
      label: "camelCase",
      kind: CompletionItemKind.Function,
      detail: "Convert to camelCase",
      insertText: "camelCase(${1:text})",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Convert string to camelCase",
    },
    {
      label: "snakeCase",
      kind: CompletionItemKind.Function,
      detail: "Convert to snake_case",
      insertText: "snakeCase(${1:text})",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Convert string to snake_case",
    },
    {
      label: "dashCase",
      kind: CompletionItemKind.Function,
      detail: "Convert to dash-case",
      insertText: "dashCase(${1:text})",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Convert string to dash-case",
    },
    {
      label: "pascalCase",
      kind: CompletionItemKind.Function,
      detail: "Convert to PascalCase",
      insertText: "pascalCase(${1:text})",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Convert string to PascalCase",
    },
  ];

  private textHelpers: CompletionItem[] = [
    {
      label: "nl2br",
      kind: CompletionItemKind.Function,
      detail: "Convert newlines to <br> tags",
      insertText: "nl2br(${1:text})",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Convert newlines to HTML <br> tags",
    },
    {
      label: "truncate",
      kind: CompletionItemKind.Function,
      detail: "Truncate text",
      insertText: "truncate(${1:text}, ${2:length})",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Truncate text to specified length",
    },
    {
      label: "excerpt",
      kind: CompletionItemKind.Function,
      detail: "Create excerpt from text",
      insertText: "excerpt(${1:text}, ${2:length})",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Create excerpt from text",
    },
  ];

  private debugHelpers: CompletionItem[] = [
    {
      label: "inspect",
      kind: CompletionItemKind.Function,
      detail: "Inspect and debug values",
      insertText: "inspect(${1:value})",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Inspect and output a value for debugging purposes",
    },
  ];

  private getInterpolationCompletions(): CompletionItem[] {
    return [
      ...this.edgeSpecialVariables,
      ...this.adonisJsHelpers,
      ...this.propsHelpers,
      ...this.htmlHelpers,
      ...this.stringHelpers,
      ...this.textHelpers,
      ...this.debugHelpers,
    ];
  }

  private getPathCompletions(): CompletionItem[] {
    return this.commonSlots;
  }
}
