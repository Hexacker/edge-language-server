import { TextDocument } from "vscode-languageserver-textdocument";
import {
  CompletionItem,
  CompletionItemKind,
  InsertTextFormat,
  Position,
} from "vscode-languageserver/node";
import { EdgeParser } from "../server/parser";

export class EdgeCompletionProvider {
  constructor(private edgeParser: EdgeParser) {}

  private edgeDirectives: CompletionItem[] = [
    // Conditional directives
    {
      label: "@if",
      kind: CompletionItemKind.Keyword,
      detail: "Conditional directive",
      insertText: "@if(${1:condition})\n\t${2:content}\n@end",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation:
        "Creates a conditional block that renders content based on a condition.",
    },
    {
      label: "@elseif",
      kind: CompletionItemKind.Keyword,
      detail: "Else-if directive",
      insertText:
        "@if(${1:condition})\n\t${2:content}\n@elseif(${1:condition})\n\t${2:content}\n@end",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Adds an else-if condition to an if block.",
    },
    {
      label: "@else",
      kind: CompletionItemKind.Keyword,
      detail: "Else directive",
      insertText: "@else\n\t${1:content}",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Adds an else clause to an if block.",
    },
    {
      label: "@unless",
      kind: CompletionItemKind.Keyword,
      detail: "Unless directive",
      insertText: "@unless(${1:condition})\n\t${2:content}\n@end",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation:
        "Creates a conditional block that renders content unless a condition is true.",
    },

    // Loop directives
    {
      label: "@each",
      kind: CompletionItemKind.Keyword,
      detail: "Loop directive",
      insertText: "@each(${1:item} in ${2:items})\n\t${3:content}\n@end",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation:
        "Loops over iterable data and renders content for each item.",
    },

    // Component and template directives
    {
      label: "@component",
      kind: CompletionItemKind.Function,
      detail: "Include component",
      insertText: "@component('${1:name}')\n\t${2:content}\n@endcomponent",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Include a reusable component.",
    },
    {
      label: "@!component",
      kind: CompletionItemKind.Function,
      detail: "Inline component rendering",
      insertText: "@!component('${1:name}')",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Include a component inline without a block.",
    },
    {
      label: "@slot",
      kind: CompletionItemKind.Function,
      detail: "Define slot",
      insertText: "@slot('${1:name}')\n\t${2:content}\n@end",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Define a named slot in a component.",
    },
    {
      label: "@inject",
      kind: CompletionItemKind.Variable,
      detail: "Inject variable",
      insertText: "@inject(${1:variable})",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Inject a variable into the template context.",
    },
    {
      label: "@include",
      kind: CompletionItemKind.Function,
      detail: "Include template",
      insertText: "@include('${1:template}')",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Include another template file.",
    },
    {
      label: "@includeIf",
      kind: CompletionItemKind.Function,
      detail: "Conditional include",
      insertText: "@includeIf(${1:condition}, '${2:template}')",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Include a template file only if a condition is true.",
    },

    // Utility directives
    {
      label: "@eval",
      kind: CompletionItemKind.Function,
      detail: "Evaluate expression",
      insertText: "@eval(${1:expression})",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Evaluate a JavaScript expression.",
    },

    {
      label: "@svg",
      kind: CompletionItemKind.Function,
      detail: "Include SVG",
      insertText: "@svg('${1:path}')",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Include an SVG file.",
    },
    {
      label: "@debugger",
      kind: CompletionItemKind.Keyword,
      detail: "Debug breakpoint",
      insertText: "@debugger",
      documentation: "Set a debug breakpoint.",
    },
    {
      label: "@let",
      kind: CompletionItemKind.Variable,
      detail: "Declare variable",
      insertText: "@let(${1:name} = ${2:value})",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Declare a template variable.",
    },
    {
      label: "@assign",
      kind: CompletionItemKind.Variable,
      detail: "Assign value",
      insertText: "@assign(${1:name} = ${2:value})",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Assign a value to a variable.",
    },
    {
      label: "@set",
      kind: CompletionItemKind.Variable,
      detail: "Set variable",
      insertText: "@set(${1:name} = ${2:value})",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Set a variable value.",
    },
    {
      label: "@vite",
      kind: CompletionItemKind.Function,
      detail: "Vite asset",
      insertText: "@vite('${1:path}')",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Handle Vite assets.",
    },

    // Auto-closing pairs
    {
      label: "{{-- Comment --}}",
      kind: CompletionItemKind.Snippet,
      detail: "EdgeJS Comment",
      insertText: "{{-- ${1:comment} --}}",
      insertTextFormat: InsertTextFormat.Snippet,
      filterText: "{{--",
      documentation: "Insert an EdgeJS comment block.",
    },
    {
      label: "{{{ Raw Output }}}",
      kind: CompletionItemKind.Snippet,
      detail: "EdgeJS Raw Output (unescaped)",
      insertText: "{{{ ${1:expression} }}}",
      insertTextFormat: InsertTextFormat.Snippet,
      filterText: "{{{",
      documentation: "Output raw, unescaped HTML content.",
    },
    {
      label: "{{ Escaped Output }}",
      kind: CompletionItemKind.Snippet,
      detail: "EdgeJS Escaped Output",
      insertText: "{{ ${1:expression} }}",
      insertTextFormat: InsertTextFormat.Snippet,
      filterText: "{{",
      documentation: "Output escaped content (safe for HTML).",
    },
  ];

  private edgeSpecialVariables: CompletionItem[] = [
    {
      label: "$props",
      kind: CompletionItemKind.Variable,
      detail: "Component props object",
      documentation:
        "Access component props. Methods: merge(), toAttrs(), only(), except()",
    },
    {
      label: "$slots",
      kind: CompletionItemKind.Variable,
      detail: "Component slots object",
      documentation: "Access component slots (e.g., $slots.main())",
    },
    {
      label: "$context",
      kind: CompletionItemKind.Variable,
      detail: "Template context",
      documentation: "Access injected template context data",
    },
    {
      label: "$filename",
      kind: CompletionItemKind.Variable,
      detail: "Current template filename",
      documentation: "Get the current template file path",
    },
    {
      label: "$caller",
      kind: CompletionItemKind.Variable,
      detail: "Caller information",
      documentation: "Get information about the template caller",
    },
  ];

  private commonHelpers: CompletionItem[] = [
    {
      label: "user",
      kind: CompletionItemKind.Variable,
      detail: "Current user object",
    },
    {
      label: "request",
      kind: CompletionItemKind.Variable,
      detail: "HTTP request object",
    },
    {
      label: "auth",
      kind: CompletionItemKind.Variable,
      detail: "Authentication helper",
    },
    {
      label: "route",
      kind: CompletionItemKind.Function,
      detail: "Route helper function",
    },
    {
      label: "asset",
      kind: CompletionItemKind.Function,
      detail: "Asset URL helper",
    },
    {
      label: "config",
      kind: CompletionItemKind.Variable,
      detail: "Configuration object",
    },
    {
      label: "i18n",
      kind: CompletionItemKind.Function,
      detail: "Internationalization helper",
    },
  ];

  private adonisJsHelpers: CompletionItem[] = [
    // Route helpers
    {
      label: "route",
      kind: CompletionItemKind.Function,
      detail: "Generate URL for named route",
      insertText: "route('${1:routeName}')",
      insertTextFormat: InsertTextFormat.Snippet,
    },
    {
      label: "signedRoute",
      kind: CompletionItemKind.Function,
      detail: "Generate signed URL for named route",
      insertText: "signedRoute('${1:routeName}')",
      insertTextFormat: InsertTextFormat.Snippet,
    },
    // Internationalization helper
    {
      label: "t",
      kind: CompletionItemKind.Function,
      detail: "Translate string",
      insertText: "t('${1:key}')",
      insertTextFormat: InsertTextFormat.Snippet,
    },
    // Flash messages
    {
      label: "flash",
      kind: CompletionItemKind.Variable,
      detail: "Flash messages object",
    },
    // Asset handling
    {
      label: "asset",
      kind: CompletionItemKind.Function,
      detail: "Generate asset URL",
      insertText: "asset('${1:path}')",
      insertTextFormat: InsertTextFormat.Snippet,
    },
    // Authentication
    {
      label: "auth",
      kind: CompletionItemKind.Variable,
      detail: "Authentication object",
    },
    // Configuration
    {
      label: "config",
      kind: CompletionItemKind.Variable,
      detail: "Configuration object",
    },
    // Session
    {
      label: "session",
      kind: CompletionItemKind.Variable,
      detail: "Session object",
      insertText: "session('${1:key}')",
      insertTextFormat: InsertTextFormat.Snippet,
    },
    // Request
    {
      label: "request",
      kind: CompletionItemKind.Variable,
      detail: "HTTP request object",
    },
    // Response
    {
      label: "response",
      kind: CompletionItemKind.Variable,
      detail: "HTTP response object",
    },
    // Redirect
    {
      label: "redirect",
      kind: CompletionItemKind.Function,
      detail: "Redirect helper",
      insertText: "redirect('${1:path}')",
      insertTextFormat: InsertTextFormat.Snippet,
    },
    // Cache
    {
      label: "cache",
      kind: CompletionItemKind.Variable,
      detail: "Cache object",
    },
    // Date
    {
      label: "date",
      kind: CompletionItemKind.Variable,
      detail: "Date helper",
    },
    // Paginator
    {
      label: "paginator",
      kind: CompletionItemKind.Variable,
      detail: "Paginator object",
    },
    // CSP Nonce
    {
      label: "cspNonce",
      kind: CompletionItemKind.Variable,
      detail: "CSP nonce for inline scripts",
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
  ];

  private textProcessingHelpers: CompletionItem[] = [
    {
      label: "nl2br",
      kind: CompletionItemKind.Function,
      detail: "Convert newlines to <br> tags",
      insertText: "nl2br(${1:text})",
      insertTextFormat: InsertTextFormat.Snippet,
    },
    {
      label: "truncate",
      kind: CompletionItemKind.Function,
      detail: "Truncate text",
      insertText: "truncate(${1:text}, ${2:length})",
      insertTextFormat: InsertTextFormat.Snippet,
    },
    {
      label: "excerpt",
      kind: CompletionItemKind.Function,
      detail: "Create excerpt from text",
      insertText: "excerpt(${1:text}, ${2:length})",
      insertTextFormat: InsertTextFormat.Snippet,
    },
  ];

  private htmlHelpers: CompletionItem[] = [
    {
      label: "escape",
      kind: CompletionItemKind.Function,
      detail: "Escape HTML",
      insertText: "escape(${1:html})",
      insertTextFormat: InsertTextFormat.Snippet,
    },
    {
      label: "safe",
      kind: CompletionItemKind.Function,
      detail: "Mark as safe HTML",
      insertText: "safe(${1:html})",
      insertTextFormat: InsertTextFormat.Snippet,
    },
    {
      label: "classNames",
      kind: CompletionItemKind.Function,
      detail: "Generate CSS class names",
      insertText: "classNames(${1:classes})",
      insertTextFormat: InsertTextFormat.Snippet,
    },
    {
      label: "attrs",
      kind: CompletionItemKind.Function,
      detail: "Generate HTML attributes",
      insertText: "attrs(${1:attributes})",
      insertTextFormat: InsertTextFormat.Snippet,
    },
  ];

  private stringHelpers: CompletionItem[] = [
    {
      label: "camelCase",
      kind: CompletionItemKind.Function,
      detail: "Convert to camelCase",
      insertText: "camelCase(${1:text})",
      insertTextFormat: InsertTextFormat.Snippet,
    },
    {
      label: "snakeCase",
      kind: CompletionItemKind.Function,
      detail: "Convert to snake_case",
      insertText: "snakeCase(${1:text})",
      insertTextFormat: InsertTextFormat.Snippet,
    },
    {
      label: "dashCase",
      kind: CompletionItemKind.Function,
      detail: "Convert to dash-case",
      insertText: "dashCase(${1:text})",
      insertTextFormat: InsertTextFormat.Snippet,
    },
    {
      label: "pascalCase",
      kind: CompletionItemKind.Function,
      detail: "Convert to PascalCase",
      insertText: "pascalCase(${1:text})",
      insertTextFormat: InsertTextFormat.Snippet,
    },
    {
      label: "titleCase",
      kind: CompletionItemKind.Function,
      detail: "Convert to Title Case",
      insertText: "titleCase(${1:text})",
      insertTextFormat: InsertTextFormat.Snippet,
    },
    {
      label: "capitalCase",
      kind: CompletionItemKind.Function,
      detail: "Convert to Capital Case",
      insertText: "capitalCase(${1:text})",
      insertTextFormat: InsertTextFormat.Snippet,
    },
    {
      label: "sentenceCase",
      kind: CompletionItemKind.Function,
      detail: "Convert to Sentence case",
      insertText: "sentenceCase(${1:text})",
      insertTextFormat: InsertTextFormat.Snippet,
    },
    {
      label: "dotCase",
      kind: CompletionItemKind.Function,
      detail: "Convert to dot.case",
      insertText: "dotCase(${1:text})",
      insertTextFormat: InsertTextFormat.Snippet,
    },
    {
      label: "noCase",
      kind: CompletionItemKind.Function,
      detail: "Convert to no case",
      insertText: "noCase(${1:text})",
      insertTextFormat: InsertTextFormat.Snippet,
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

  provideCompletions(
    document: TextDocument,
    position: Position,
  ): CompletionItem[] {
    const tree: any = this.edgeParser.parse(document.getText());
    const node: any = this.edgeParser.getNodeAtPosition(
      tree,
      position.line,
      position.character,
    );

    if (!node) {
      return this.edgeDirectives;
    }

    if (this.isInsideInterpolation(node)) {
      return this.getInterpolationCompletions(node);
    }

    if (this.isInsideDirective(node)) {
      return this.edgeDirectives;
    }

    if (this.isInsideString(node)) {
      return this.getPathCompletions();
    }

    return this.edgeDirectives;
  }

  private isInsideInterpolation(node: any): boolean {
    let currentNode: any = node;
    while (currentNode) {
      if (
        currentNode.type === "mustache" ||
        currentNode.type === "safe_mustache"
      ) {
        return true;
      }
      currentNode = currentNode.parent;
    }
    return false;
  }

  private isInsideDirective(node: any): boolean {
    let currentNode: any = node;
    while (currentNode) {
      if (
        currentNode.type === "tag" ||
        currentNode.type.endsWith("_directive")
      ) {
        return true;
      }
      currentNode = currentNode.parent;
    }
    return false;
  }

  private isInsideString(node: any): boolean {
    return node.type === "string";
  }

  private getInterpolationCompletions(node: any): CompletionItem[] {
    // For now, return common helpers.
    // In the future, we can analyze the expression to provide more specific completions.
    return [
      ...this.edgeSpecialVariables,
      ...this.commonHelpers,
      ...this.adonisJsHelpers,
      ...this.propsHelpers,
      ...this.textProcessingHelpers,
      ...this.htmlHelpers,
      ...this.stringHelpers,
      ...this.debugHelpers,
    ];
  }

  private getPathCompletions(): CompletionItem[] {
    // In a real implementation, you'd scan the file system
    // For now, return common template paths
    return [
      {
        label: "layouts/",
        kind: CompletionItemKind.Folder,
        detail: "Layout templates",
      },
      {
        label: "components/",
        kind: CompletionItemKind.Folder,
        detail: "Component templates",
      },
      {
        label: "partials/",
        kind: CompletionItemKind.Folder,
        detail: "Partial templates",
      },
    ];
  }
}
