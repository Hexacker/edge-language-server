import { TextDocument } from 'vscode-languageserver-textdocument';
import {
  CompletionItem,
  CompletionItemKind,
  InsertTextFormat,
  Position
} from 'vscode-languageserver/node';
import { EdgeParser } from '../server/parser';

export class EdgeCompletionProvider {
  constructor(private edgeParser: EdgeParser) {}

  private edgeDirectives: CompletionItem[] = [
    // Conditional directives
    {
      label: '@if',
      kind: CompletionItemKind.Keyword,
      detail: 'Conditional directive',
      insertText: '@if(${1:condition})\n\t${2:content}\n@endif',
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: 'Creates a conditional block that renders content based on a condition.'
    },
    {
      label: '@elseif',
      kind: CompletionItemKind.Keyword,
      detail: 'Else-if directive',
      insertText: '@elseif(${1:condition})\n\t${2:content}',
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: 'Adds an else-if condition to an if block.'
    },
    {
      label: '@else',
      kind: CompletionItemKind.Keyword,
      detail: 'Else directive',
      insertText: '@else\n\t${1:content}',
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: 'Adds an else clause to an if block.'
    },
    {
      label: '@unless',
      kind: CompletionItemKind.Keyword,
      detail: 'Unless directive',
      insertText: '@unless(${1:condition})\n\t${2:content}\n@endunless',
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: 'Creates a conditional block that renders content unless a condition is true.'
    },
    
    // Loop directives
    {
      label: '@each',
      kind: CompletionItemKind.Keyword,
      detail: 'Loop directive',
      insertText: '@each(${1:item} in ${2:items})\n\t${3:content}\n@endforeach',
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: 'Loops over iterable data and renders content for each item.'
    },
    {
      label: '@forelse',
      kind: CompletionItemKind.Keyword,
      detail: 'Loop with empty state',
      insertText: '@forelse(${1:item} in ${2:items})\n\t${3:content}\n@empty\n\t${4:emptyContent}\n@endforelse',
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: 'Loops over iterable data with a fallback for empty collections.'
    },
    
    // Component and template directives
    {
      label: '@component',
      kind: CompletionItemKind.Function,
      detail: 'Include component',
      insertText: "@component('${1:name}')\n\t${2:content}\n@endcomponent",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: 'Include a reusable component.'
    },
    {
      label: '@!component',
      kind: CompletionItemKind.Function,
      detail: 'Inline component rendering',
      insertText: "@!component('${1:name}')",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: 'Include a component inline without a block.'
    },
    {
      label: '@slot',
      kind: CompletionItemKind.Function,
      detail: 'Define slot',
      insertText: "@slot('${1:name}')\n\t${2:content}\n@endslot",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: 'Define a named slot in a component.'
    },
    {
      label: '@inject',
      kind: CompletionItemKind.Variable,
      detail: 'Inject variable',
      insertText: '@inject(${1:variable})',
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: 'Inject a variable into the template context.'
    },
    {
      label: '@include',
      kind: CompletionItemKind.Function,
      detail: 'Include template',
      insertText: "@include('${1:template}')",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: 'Include another template file.'
    },
    {
      label: '@includeIf',
      kind: CompletionItemKind.Function,
      detail: 'Conditional include',
      insertText: "@includeIf(${1:condition}, '${2:template}')",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: 'Include a template file only if a condition is true.'
    },
    
    // Utility directives
    {
      label: '@eval',
      kind: CompletionItemKind.Function,
      detail: 'Evaluate expression',
      insertText: '@eval(${1:expression})',
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: 'Evaluate a JavaScript expression.'
    },
    {
      label: '@newError',
      kind: CompletionItemKind.Function,
      detail: 'Create new error',
      insertText: '@newError(${1:message}, ${2:filename}, ${3:line}, ${4:column})',
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: 'Create a new error with message, filename, line, and column.'
    },
    {
      label: '@svg',
      kind: CompletionItemKind.Function,
      detail: 'Include SVG',
      insertText: "@svg('${1:path}')",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: 'Include an SVG file.'
    },
    {
      label: '@debugger',
      kind: CompletionItemKind.Keyword,
      detail: 'Debug breakpoint',
      insertText: '@debugger',
      documentation: 'Set a debug breakpoint.'
    },
    {
      label: '@let',
      kind: CompletionItemKind.Variable,
      detail: 'Declare variable',
      insertText: '@let(${1:name} = ${2:value})',
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: 'Declare a template variable.'
    },
    {
      label: '@assign',
      kind: CompletionItemKind.Variable,
      detail: 'Assign value',
      insertText: '@assign(${1:name} = ${2:value})',
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: 'Assign a value to a variable.'
    },
    {
      label: '@vite',
      kind: CompletionItemKind.Function,
      detail: 'Vite asset',
      insertText: "@vite('${1:path}')",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: 'Handle Vite assets.'
    },
    
    // Other directives
    {
      label: '@section',
      kind: CompletionItemKind.Function,
      detail: 'Define section',
      insertText: "@section('${1:name}')\n\t${2:content}\n@endsection",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: 'Define a named section.'
    },
    {
      label: '@yield',
      kind: CompletionItemKind.Function,
      detail: 'Yield section',
      insertText: "@yield('${1:name}')",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: 'Yield content for a named section.'
    },
    {
      label: '@extends',
      kind: CompletionItemKind.Function,
      detail: 'Extend layout',
      insertText: "@extends('${1:layout}')",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: 'Extend a layout template.'
    },
    {
      label: '@block',
      kind: CompletionItemKind.Function,
      detail: 'Define block',
      insertText: "@block('${1:name}')\n\t${2:content}\n@endblock",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: 'Define a named block.'
    },
    {
      label: '@hasBlock',
      kind: CompletionItemKind.Function,
      detail: 'Check block exists',
      insertText: "@hasBlock('${1:name}')",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: 'Check if a named block exists.'
    },
    {
      label: '@for',
      kind: CompletionItemKind.Keyword,
      detail: 'For loop',
      insertText: '@for(${1:init}; ${2:condition}; ${3:increment})\n\t${4:content}\n@endfor',
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: 'Create a for loop.'
    },
    {
      label: '@while',
      kind: CompletionItemKind.Keyword,
      detail: 'While loop',
      insertText: '@while(${1:condition})\n\t${2:content}\n@endwhile',
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: 'Create a while loop.'
    },
    {
      label: '@break',
      kind: CompletionItemKind.Keyword,
      detail: 'Break loop',
      insertText: '@break',
      documentation: 'Break out of a loop.'
    },
    {
      label: '@continue',
      kind: CompletionItemKind.Keyword,
      detail: 'Continue loop',
      insertText: '@continue',
      documentation: 'Continue to the next iteration of a loop.'
    },
    {
      label: '@super',
      kind: CompletionItemKind.Keyword,
      detail: 'Super block',
      insertText: '@super',
      documentation: 'Render the parent block content.'
    },
    {
      label: '@debug',
      kind: CompletionItemKind.Keyword,
      detail: 'Debug output',
      insertText: '@debug(${1:expression})',
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: 'Output debug information.'
    },
    {
      label: '@endphp',
      kind: CompletionItemKind.Keyword,
      detail: 'PHP block',
      insertText: '@endphp\n\t${1:content}\n@',
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: 'Write raw PHP code.'
    },
    {
      label: '@verbatim',
      kind: CompletionItemKind.Keyword,
      detail: 'Verbatim block',
      insertText: '@verbatim\n\t${1:content}\n@endverbatim',
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: 'Output content without parsing Edge syntax.'
    }
  ];

  private commonHelpers: CompletionItem[] = [
    { label: 'user', kind: CompletionItemKind.Variable, detail: 'Current user object' },
    { label: 'request', kind: CompletionItemKind.Variable, detail: 'HTTP request object' },
    { label: 'auth', kind: CompletionItemKind.Variable, detail: 'Authentication helper' },
    { label: 'route', kind: CompletionItemKind.Function, detail: 'Route helper function' },
    { label: 'asset', kind: CompletionItemKind.Function, detail: 'Asset URL helper' },
    { label: 'config', kind: CompletionItemKind.Variable, detail: 'Configuration object' },
    { label: 'i18n', kind: CompletionItemKind.Function, detail: 'Internationalization helper' },
  ];

  private adonisJsHelpers: CompletionItem[] = [
    // Route helpers
    {
      label: 'route',
      kind: CompletionItemKind.Function,
      detail: 'Generate URL for named route',
      insertText: "route('${1:routeName}')",
      insertTextFormat: InsertTextFormat.Snippet
    },
    {
      label: 'signedRoute',
      kind: CompletionItemKind.Function,
      detail: 'Generate signed URL for named route',
      insertText: "signedRoute('${1:routeName}')",
      insertTextFormat: InsertTextFormat.Snippet
    },
    // Internationalization helper
    {
      label: 't',
      kind: CompletionItemKind.Function,
      detail: 'Translate string',
      insertText: "t('${1:key}')",
      insertTextFormat: InsertTextFormat.Snippet
    },
    // Flash messages
    {
      label: 'flash',
      kind: CompletionItemKind.Variable,
      detail: 'Flash messages object'
    },
    // Asset handling
    {
      label: 'asset',
      kind: CompletionItemKind.Function,
      detail: 'Generate asset URL',
      insertText: "asset('${1:path}')",
      insertTextFormat: InsertTextFormat.Snippet
    },
    // Authentication
    {
      label: 'auth',
      kind: CompletionItemKind.Variable,
      detail: 'Authentication object'
    },
    // Configuration
    {
      label: 'config',
      kind: CompletionItemKind.Variable,
      detail: 'Configuration object'
    },
    // Session
    {
      label: 'session',
      kind: CompletionItemKind.Variable,
      detail: 'Session object',
      insertText: "session('${1:key}')",
      insertTextFormat: InsertTextFormat.Snippet
    },
    // Request
    {
      label: 'request',
      kind: CompletionItemKind.Variable,
      detail: 'HTTP request object'
    },
    // Response
    {
      label: 'response',
      kind: CompletionItemKind.Variable,
      detail: 'HTTP response object'
    },
    // Redirect
    {
      label: 'redirect',
      kind: CompletionItemKind.Function,
      detail: 'Redirect helper',
      insertText: "redirect('${1:path}')",
      insertTextFormat: InsertTextFormat.Snippet
    },
    // Cache
    {
      label: 'cache',
      kind: CompletionItemKind.Variable,
      detail: 'Cache object'
    },
    // Date
    {
      label: 'date',
      kind: CompletionItemKind.Variable,
      detail: 'Date helper'
    },
    // Paginator
    {
      label: 'paginator',
      kind: CompletionItemKind.Variable,
      detail: 'Paginator object'
    },
    // CSP Nonce
    {
      label: 'cspNonce',
      kind: CompletionItemKind.Variable,
      detail: 'CSP nonce for inline scripts'
    }
  ];

  private propsHelpers: CompletionItem[] = [
    {
      label: 'toAttrs',
      kind: CompletionItemKind.Function,
      detail: 'Convert props to HTML attributes',
      insertText: 'toAttrs(${1:props})',
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: 'Convert props object to HTML attributes string'
    },
    {
      label: 'merge',
      kind: CompletionItemKind.Function,
      detail: 'Merge props with defaults',
      insertText: 'merge(${1:props}, ${2:defaults})',
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: 'Merge props object with default values'
    },
    {
      label: 'only',
      kind: CompletionItemKind.Function,
      detail: 'Extract specific props',
      insertText: 'only(${1:props}, [${2:keys}])',
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: 'Extract only specified props from props object'
    },
    {
      label: 'except',
      kind: CompletionItemKind.Function,
      detail: 'Exclude specific props',
      insertText: 'except(${1:props}, [${2:keys}])',
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: 'Exclude specified props from props object'
    }
  ];

  private slotsHelpers: CompletionItem[] = [
    {
      label: 'slots',
      kind: CompletionItemKind.Variable,
      detail: 'Component slots object',
      documentation: 'Access component slots'
    }
  ];

  private debugHelpers: CompletionItem[] = [
    {
      label: 'filename',
      kind: CompletionItemKind.Variable,
      detail: 'Current template filename',
      documentation: 'Get the current template filename'
    },
    {
      label: 'caller',
      kind: CompletionItemKind.Variable,
      detail: 'Caller information',
      documentation: 'Get information about the caller'
    }
  ];

  private textProcessingHelpers: CompletionItem[] = [
    {
      label: 'nl2br',
      kind: CompletionItemKind.Function,
      detail: 'Convert newlines to <br> tags',
      insertText: 'nl2br(${1:text})',
      insertTextFormat: InsertTextFormat.Snippet
    },
    {
      label: 'truncate',
      kind: CompletionItemKind.Function,
      detail: 'Truncate text',
      insertText: 'truncate(${1:text}, ${2:length})',
      insertTextFormat: InsertTextFormat.Snippet
    },
    {
      label: 'excerpt',
      kind: CompletionItemKind.Function,
      detail: 'Create excerpt from text',
      insertText: 'excerpt(${1:text}, ${2:length})',
      insertTextFormat: InsertTextFormat.Snippet
    }
  ];

  private htmlHelpers: CompletionItem[] = [
    {
      label: 'escape',
      kind: CompletionItemKind.Function,
      detail: 'Escape HTML',
      insertText: 'escape(${1:html})',
      insertTextFormat: InsertTextFormat.Snippet
    },
    {
      label: 'safe',
      kind: CompletionItemKind.Function,
      detail: 'Mark as safe HTML',
      insertText: 'safe(${1:html})',
      insertTextFormat: InsertTextFormat.Snippet
    },
    {
      label: 'classNames',
      kind: CompletionItemKind.Function,
      detail: 'Generate CSS class names',
      insertText: 'classNames(${1:classes})',
      insertTextFormat: InsertTextFormat.Snippet
    },
    {
      label: 'attrs',
      kind: CompletionItemKind.Function,
      detail: 'Generate HTML attributes',
      insertText: 'attrs(${1:attributes})',
      insertTextFormat: InsertTextFormat.Snippet
    }
  ];

  private stringHelpers: CompletionItem[] = [
    {
      label: 'camelCase',
      kind: CompletionItemKind.Function,
      detail: 'Convert to camelCase',
      insertText: 'camelCase(${1:text})',
      insertTextFormat: InsertTextFormat.Snippet
    },
    {
      label: 'snakeCase',
      kind: CompletionItemKind.Function,
      detail: 'Convert to snake_case',
      insertText: 'snakeCase(${1:text})',
      insertTextFormat: InsertTextFormat.Snippet
    },
    {
      label: 'dashCase',
      kind: CompletionItemKind.Function,
      detail: 'Convert to dash-case',
      insertText: 'dashCase(${1:text})',
      insertTextFormat: InsertTextFormat.Snippet
    },
    {
      label: 'pascalCase',
      kind: CompletionItemKind.Function,
      detail: 'Convert to PascalCase',
      insertText: 'pascalCase(${1:text})',
      insertTextFormat: InsertTextFormat.Snippet
    },
    {
      label: 'titleCase',
      kind: CompletionItemKind.Function,
      detail: 'Convert to Title Case',
      insertText: 'titleCase(${1:text})',
      insertTextFormat: InsertTextFormat.Snippet
    },
    {
      label: 'capitalCase',
      kind: CompletionItemKind.Function,
      detail: 'Convert to Capital Case',
      insertText: 'capitalCase(${1:text})',
      insertTextFormat: InsertTextFormat.Snippet
    }
  ];

  private numberTimeHelpers: CompletionItem[] = [
    {
      label: 'prettyMs',
      kind: CompletionItemKind.Function,
      detail: 'Format milliseconds',
      insertText: 'prettyMs(${1:milliseconds})',
      insertTextFormat: InsertTextFormat.Snippet
    },
    {
      label: 'toBytes',
      kind: CompletionItemKind.Function,
      detail: 'Convert to bytes',
      insertText: 'toBytes(${1:size})',
      insertTextFormat: InsertTextFormat.Snippet
    },
    {
      label: 'ordinal',
      kind: CompletionItemKind.Function,
      detail: 'Convert to ordinal',
      insertText: 'ordinal(${1:number})',
      insertTextFormat: InsertTextFormat.Snippet
    }
  ];

  provideCompletions(document: TextDocument, position: Position): CompletionItem[] {
    const tree: any = this.edgeParser.parse(document.getText());
    const node: any = this.edgeParser.getNodeAtPosition(tree, position.line, position.character);

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
      if (currentNode.type === 'mustache' || currentNode.type === 'safe_mustache') {
        return true;
      }
      currentNode = currentNode.parent;
    }
    return false;
  }

  private isInsideDirective(node: any): boolean {
    let currentNode: any = node;
    while (currentNode) {
      if (currentNode.type === 'tag' || currentNode.type.endsWith('_directive')) {
        return true;
      }
      currentNode = currentNode.parent;
    }
    return false;
  }
  
  private isInsideString(node: any): boolean {
    return node.type === 'string';
  }

  private getInterpolationCompletions(node: any): CompletionItem[] {
    // For now, return common helpers.
    // In the future, we can analyze the expression to provide more specific completions.
    return [
      ...this.commonHelpers,
      ...this.adonisJsHelpers,
      ...this.propsHelpers,
      ...this.slotsHelpers,
      ...this.debugHelpers,
      ...this.textProcessingHelpers,
      ...this.htmlHelpers,
      ...this.stringHelpers,
      ...this.numberTimeHelpers
    ];
  }

  private getPathCompletions(): CompletionItem[] {
    // In a real implementation, you'd scan the file system
    // For now, return common template paths
    return [
      { label: 'layouts/', kind: CompletionItemKind.Folder, detail: 'Layout templates' },
      { label: 'components/', kind: CompletionItemKind.Folder, detail: 'Component templates' },
      { label: 'partials/', kind: CompletionItemKind.Folder, detail: 'Partial templates' },
    ];
  }
}