import { TextDocument } from 'vscode-languageserver-textdocument';
import { CompletionItem, CompletionItemKind, InsertTextFormat, Position } from 'vscode-languageserver/node';

export class EdgeCompletionProvider {
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
    const text = document.getText();
    const offset = document.offsetAt(position);
    const lineStart = document.offsetAt({ line: position.line, character: 0 });
    const lineText = text.slice(lineStart, offset);

    // Check context and provide appropriate completions
    if (this.isInDirectiveContext(lineText)) {
      return this.edgeDirectives;
    }

    if (this.isInInterpolationContext(text, offset)) {
      return this.getInterpolationCompletions(text, offset);
    }

    if (this.isInStringContext(lineText)) {
      return this.getPathCompletions();
    }

    return [];
  }

  private isInDirectiveContext(lineText: string): boolean {
    return /^\s*@\w*$/.test(lineText);
  }

  private isInInterpolationContext(text: string, offset: number): boolean {
    const beforeCursor = text.slice(0, offset);
    const afterCursor = text.slice(offset);

    // Check if we're inside {{ }}
    const lastOpenBrace = beforeCursor.lastIndexOf('{{');
    const lastCloseBrace = beforeCursor.lastIndexOf('}}');
    const nextCloseBrace = afterCursor.indexOf('}}');

    return lastOpenBrace > lastCloseBrace && nextCloseBrace !== -1;
  }

  private isInStringContext(lineText: string): boolean {
    const quotes = lineText.match(/['"`]/g);
    return quotes && quotes.length % 2 === 1;
  }

  private getInterpolationCompletions(text: string, offset: number): CompletionItem[] {
    const completions = [...this.commonHelpers];

    // Add method completions based on context
    const beforeCursor = text.slice(0, offset);
    const currentExpression = this.extractCurrentExpression(beforeCursor);

    if (currentExpression.includes('.')) {
      // Provide method completions for known objects
      return this.getMethodCompletions(currentExpression);
    }

    return completions;
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

  private extractCurrentExpression(text: string): string {
    const match = text.match(/\{\{\s*([^}]*)$/);
    return match ? match[1] : '';
  }

  private getMethodCompletions(expression: string): CompletionItem[] {
    const parts = expression.split('.');
    const lastPart = parts[parts.length - 1];

    // Provide method completions based on object type
    if (parts[0] === 'user') {
      return [
        { label: 'name', kind: CompletionItemKind.Property, detail: 'User name' },
        { label: 'email', kind: CompletionItemKind.Property, detail: 'User email' },
        { label: 'avatar', kind: CompletionItemKind.Property, detail: 'User avatar URL' },
        { label: 'isActive()', kind: CompletionItemKind.Method, detail: 'Check if user is active' },
      ];
    }

    if (parts[0] === 'request') {
      return [
        { label: 'url', kind: CompletionItemKind.Property, detail: 'Request URL' },
        { label: 'method', kind: CompletionItemKind.Property, detail: 'HTTP method' },
        { label: 'headers', kind: CompletionItemKind.Property, detail: 'Request headers' },
        { label: 'input()', kind: CompletionItemKind.Method, detail: 'Get input value' },
      ];
    }

    return [];
  }
}
