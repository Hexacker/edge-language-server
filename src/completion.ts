import { TextDocument } from 'vscode-languageserver-textdocument';
import { CompletionItem, CompletionItemKind, InsertTextFormat, Position } from 'vscode-languageserver/node';
import { EdgeParser } from './parser';

export class EdgeCompletionProvider {
  constructor(private edgeParser: EdgeParser) {}

  private edgeDirectives = [
    {
      label: '@if',
      kind: CompletionItemKind.Keyword,
      detail: 'Conditional directive',
      insertText: '@if($1)\n\t$2\n@end',
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: 'Creates a conditional block',
    },
    {
      label: '@else',
      kind: CompletionItemKind.Keyword,
      detail: 'Else directive',
      insertText: '@else\n\t$1',
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: 'Else clause for conditional blocks',
    },
    {
      label: '@each',
      kind: CompletionItemKind.Keyword,
      detail: 'Loop directive',
      insertText: '@each($1 in $2)\n\t$3\n@end',
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: 'Creates a loop over iterable data',
    },
    {
      label: '@include',
      kind: CompletionItemKind.Function,
      detail: 'Include template',
      insertText: "@include('$1')",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: 'Include another template file',
    },
    {
      label: '@component',
      kind: CompletionItemKind.Function,
      detail: 'Include component',
      insertText: "@component('$1')\n\t$2\n@end",
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: 'Include a reusable component',
    },
    {
      label: '@let',
      kind: CompletionItemKind.Variable,
      detail: 'Define variable',
      insertText: '@let($1 = $2)',
      insertTextFormat: InsertTextFormat.Snippet,
      documentation: 'Define a template variable',
    },
    {
      label: '@end',
      kind: CompletionItemKind.Keyword,
      detail: 'End block directive',
      insertText: '@end',
      documentation: 'Closes any block directive',
    },
  ];

  private commonHelpers = [
    { label: 'user', kind: CompletionItemKind.Variable, detail: 'Current user object' },
    { label: 'request', kind: CompletionItemKind.Variable, detail: 'HTTP request object' },
    { label: 'auth', kind: CompletionItemKind.Variable, detail: 'Authentication helper' },
    { label: 'route', kind: CompletionItemKind.Function, detail: 'Route helper function' },
    { label: 'asset', kind: CompletionItemKind.Function, detail: 'Asset URL helper' },
    { label: 'config', kind: CompletionItemKind.Variable, detail: 'Configuration object' },
    { label: 'i18n', kind: CompletionItemKind.Function, detail: 'Internationalization helper' },
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
      if (currentNode.type === 'mustache') {
        return true;
      }
      currentNode = currentNode.parent;
    }
    return false;
  }

  private isInsideDirective(node: any): boolean {
    let currentNode: any = node;
    while (currentNode) {
      if (currentNode.type === 'tag') {
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
    return this.commonHelpers;
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
