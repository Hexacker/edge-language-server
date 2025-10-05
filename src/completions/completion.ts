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
    {
      label: "@each",
      kind: CompletionItemKind.Keyword,
      detail: "Loop with index directive",
      insertText: "@each((${1:item}, ${2:index}) in ${3:items})\n\t${4:content}\n@end",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation:
        "Loops over iterable data with index and renders content for each item.",
    },

    // Loop fallback directive
    {
      label: "@else",
      kind: CompletionItemKind.Keyword,
      detail: "Loop fallback directive",
      insertText: "@else\n\t${1:content}",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Provides fallback content when the collection is empty.",
    },

    // Component and template directives
    {
      label: "@component",
      kind: CompletionItemKind.Function,
      detail: "Include component",
      insertText: "@component('${1:name}')\n\t${2:content}\n@end",
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
      label: "@!component",
      kind: CompletionItemKind.Function,
      detail: "Inline component with props",
      insertText: "@!component('${1:name}', { ${2:prop}: ${3:value} })",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Include a component inline with props.",
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
      label: "@slot",
      kind: CompletionItemKind.Function,
      detail: "Main slot",
      insertText: "@slot\n\t${1:content}\n@end",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Define the main slot in a component.",
    },
    {
      label: "@!slot",
      kind: CompletionItemKind.Function,
      detail: "Auto-closed slot",
      insertText: "@!slot('${1:name}', '${2:default_content}')",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Define a named slot with default content.",
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
    {
      label: "@extends",
      kind: CompletionItemKind.Function,
      detail: "Extend layout template",
      insertText: "@extends('${1:layout}')",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Extend a layout template.",
    },
    {
      label: "@section",
      kind: CompletionItemKind.Function,
      detail: "Define template section",
      insertText: "@section('${1:name}')\n\t${2:content}\n@end",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Define a named section in a template.",
    },
    {
      label: "@yield",
      kind: CompletionItemKind.Function,
      detail: "Yield section content",
      insertText: "@yield('${1:name}')",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Yield content from a named section.",
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
      label: "@viteReactRefresh",
      kind: CompletionItemKind.Function,
      detail: "Vite React refresh",
      insertText: "@viteReactRefresh",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Enable React HMR in development.",
    },
    {
      label: "@flashMessage",
      kind: CompletionItemKind.Function,
      detail: "Flash message helper",
      insertText: "@flashMessage('${1:key}')",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Read flash messages conditionally.",
    },
    {
      label: "@error",
      kind: CompletionItemKind.Function,
      detail: "Error helper",
      insertText: "@error('${1:field}')",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Read error messages from errorsBag.",
    },
    {
      label: "@inputError",
      kind: CompletionItemKind.Function,
      detail: "Input error helper",
      insertText: "@inputError('${1:field}')",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Read validation error messages from inputErrorsBag.",
    },
    {
      label: "@can",
      kind: CompletionItemKind.Function,
      detail: "Authorization check",
      insertText: "@can('${1:permission}')\n\t${2:content}\n@end",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Authorization check in templates.",
    },
    {
      label: "@cannot",
      kind: CompletionItemKind.Function,
      detail: "Authorization negation",
      insertText: "@cannot('${1:permission}')\n\t${2:content}\n@end",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Negated authorization check in templates.",
    },
    {
      label: "@embedImage",
      kind: CompletionItemKind.Function,
      detail: "Embed image in email",
      insertText: "@embedImage('${1:path}')",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Embed images in emails.",
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
        "Access component props. Methods: merge(), toAttrs(), only(), except(), get()",
    },
    {
      label: "$slots",
      kind: CompletionItemKind.Variable,
      detail: "Component slots object",
      documentation: "Access component slots (e.g., $slots.main())",
    },
    {
      label: "$slots.main",
      kind: CompletionItemKind.Method,
      detail: "Main slot content",
      insertText: "$slots.main()",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Render the main slot content",
    },
    {
      label: "$slots.header",
      kind: CompletionItemKind.Method,
      detail: "Header slot content",
      insertText: "$slots.header()",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Render the header slot content",
    },
    {
      label: "$slots.content",
      kind: CompletionItemKind.Method,
      detail: "Content slot content",
      insertText: "$slots.content()",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Render the content slot",
    },
    {
      label: "$slots.footer",
      kind: CompletionItemKind.Method,
      detail: "Footer slot content",
      insertText: "$slots.footer()",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Render the footer slot",
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
    // Request helper
    {
      label: "request",
      kind: CompletionItemKind.Variable,
      detail: "HTTP request object",
      documentation: "Reference to the ongoing HTTP request instance when template is rendered using ctx.view.render method",
    },
    {
      label: "request.url()",
      kind: CompletionItemKind.Method,
      detail: "Get request URL",
      insertText: "request.url()",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Get the request URL",
    },
    {
      label: "request.input",
      kind: CompletionItemKind.Method,
      detail: "Get input value from request",
      insertText: "request.input('${1:key}', ${2:defaultValue})",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Get input value from request",
    },
    // Authentication helper
    {
      label: "auth",
      kind: CompletionItemKind.Variable,
      detail: "Authentication object",
      documentation: "Reference to ctx.auth property for accessing logged-in user information",
    },
    // Configuration
    {
      label: "config",
      kind: CompletionItemKind.Variable,
      detail: "Configuration object",
      insertText: "config('${1:key}')",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Helper function to reference configuration values",
    },
    // Session
    {
      label: "session",
      kind: CompletionItemKind.Variable,
      detail: "Session object",
      insertText: "session('${1:key}')",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Read-only copy of the session object",
    },
    // Flash messages
    {
      label: "flashMessages",
      kind: CompletionItemKind.Variable,
      detail: "Session flash messages",
      documentation: "Read-only copy of session flash messages",
    },
    {
      label: "old",
      kind: CompletionItemKind.Function,
      detail: "Get old input value",
      insertText: "old('${1:key}')",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Shorthand for the flashMessages.get method",
    },
    // Internationalization helpers
    {
      label: "t",
      kind: CompletionItemKind.Function,
      detail: "Translate string",
      insertText: "t('${1:key}')",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Method for translations contributed by @adonisjs/i18n package",
    },
    {
      label: "i18n",
      kind: CompletionItemKind.Variable,
      detail: "I18n instance",
      documentation: "Reference to an instance of the I18n class",
    },
    {
      label: "i18n.formatCurrency",
      kind: CompletionItemKind.Method,
      detail: "Format currency value",
      insertText: "i18n.formatCurrency(${1:value}, { currency: '${2:USD}' })",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Format currency using I18n instance",
    },
    // Asset helper
    {
      label: "asset",
      kind: CompletionItemKind.Function,
      detail: "Generate asset URL",
      insertText: "asset('${1:path}')",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Resolves the URL of an asset processed by Vite",
    },
    // Application helper
    {
      label: "app",
      kind: CompletionItemKind.Variable,
      detail: "Application instance",
      documentation: "Reference to the Application instance",
    },
    {
      label: "app.getEnvironment",
      kind: CompletionItemKind.Method,
      detail: "Get application environment",
      insertText: "app.getEnvironment()",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Get the application environment",
    },
    // Mail helpers
    {
      label: "embedImage",
      kind: CompletionItemKind.Function,
      detail: "Embed image in email",
      insertText: "embedImage('${1:path}')",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Helper for embedding images in emails",
    },
    {
      label: "embedImageData",
      kind: CompletionItemKind.Function,
      detail: "Embed image data in email",
      insertText: "embedImageData(${1:data})",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Helper for embedding image data in emails",
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
    {
      label: "$props.get",
      kind: CompletionItemKind.Method,
      detail: "Get property value",
      insertText: "$props.get('${1:key}')",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: "Get a property value from props",
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
      label: "html.escape",
      kind: CompletionItemKind.Function,
      detail: "Escape HTML",
      insertText: "html.escape(${1:html})",
      insertTextFormat: InsertTextFormat.Snippet,
    },
    {
      label: "html.safe",
      kind: CompletionItemKind.Function,
      detail: "Mark as safe HTML",
      insertText: "html.safe(${1:html})",
      insertTextFormat: InsertTextFormat.Snippet,
    },
    {
      label: "html.classNames",
      kind: CompletionItemKind.Function,
      detail: "Generate CSS class names",
      insertText: "html.classNames(${1:classes})",
      insertTextFormat: InsertTextFormat.Snippet,
    },
    {
      label: "html.attrs",
      kind: CompletionItemKind.Function,
      detail: "Generate HTML attributes",
      insertText: "html.attrs(${1:attributes})",
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
      return this.getDirectiveCompletions(node, document, position);
    }

    if (this.isInsideString(node)) {
      return this.getPathCompletions();
    }

    // If we're not in a specific context, provide general Edge directives
    return this.edgeDirectives;
  }

  private getDirectiveCompletions(node: any, document: TextDocument, position: Position): CompletionItem[] {
    // Get the text content to check for specific directive patterns
    const text = document.getText();
    const offset = document.offsetAt(position);
    
    // Check if we're typing after @ symbol (like @component or @button)
    if (offset > 0) {
      const charBefore = text.charAt(offset - 1);
      if (charBefore === '@') {
        // If we just typed @, return all directives starting with @
        return [
          ...this.edgeDirectives.filter(item => 
            item.label.startsWith('@') && !item.label.startsWith('@slot')
          ),
          // Add component tags as mentioned in documentation
          ...this.getComponentTagCompletions()
        ];
      }
    }
    
    return this.edgeDirectives;
  }
  
  private getComponentTagCompletions(): CompletionItem[] {
    return [
      {
        label: "@modal",
        kind: CompletionItemKind.Function,
        detail: "Modal component tag",
        insertText: "@modal()\n\t${1:content}\n@end",
        insertTextFormat: InsertTextFormat.Snippet,
        documentation: "Component as tag from components/modal.edge"
      },
      {
        label: "@form.input",
        kind: CompletionItemKind.Function,
        detail: "Form input component tag",
        insertText: "@form.input()",
        insertTextFormat: InsertTextFormat.Snippet,
        documentation: "Component as tag from form/input.edge"
      },
      {
        label: "@toolTip",
        kind: CompletionItemKind.Function,
        detail: "Tooltip component tag",
        insertText: "@toolTip()",
        insertTextFormat: InsertTextFormat.Snippet,
        documentation: "Component as tag from tool_tip.edge"
      },
      {
        label: "@checkoutForm.input",
        kind: CompletionItemKind.Function,
        detail: "Checkout form input component tag",
        insertText: "@checkoutForm.input()",
        insertTextFormat: InsertTextFormat.Snippet,
        documentation: "Component as tag from checkout_form/input.edge"
      }
    ];
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
