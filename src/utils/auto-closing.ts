import { TextDocument } from "vscode-languageserver-textdocument";
import { Position, Range, TextEdit } from "vscode-languageserver/node";

export class AutoClosingPairs {
  private static readonly PAIRS: { [key: string]: string } = {
    '{': '}',
    '(': ')',
    '[': ']',
    // For EdgeJS specific cases like {{, we handle them separately
  };

  private static readonly EDGE_PAIRS: { [key: string]: string } = {
    '{{': '}}',
    '{%': '%}',
    // Add more Edge-specific pairs if needed
  };

  public static handleAutoClosing(document: TextDocument, position: Position, ch: string): TextEdit[] {
    const text = document.getText();
    const offset = document.offsetAt(position);
    
    // Handle regular bracket pairs
    if (this.PAIRS[ch]) {
      return [this.createTextEdit(position, this.PAIRS[ch])];
    }
    
    // Handle EdgeJS-specific pairs like {{ }}
    if (ch === '{' && offset > 0) {
      const prevChar = text.charAt(offset - 1);
      if (prevChar === '{') {
        // We just typed the second '{' in '{{', so insert '}}'
        return [this.createTextEdit(position, '}')];
      } else if (prevChar === '@' && offset > 1 && text.charAt(offset - 2) === '{') {
        // We just typed the second '{' in '@{', so insert '}'
        return [this.createTextEdit(position, '}')];
      }
    }
    
    // Handle EdgeJS directives like @if() that might benefit from parentheses auto-closing
    if (ch === '(') {
      // Check if we're inside an Edge directive that uses parentheses
      const lineText = this.getLineText(text, position.line);
      if (lineText.includes('@')) {
        return [this.createTextEdit(position, ')')];
      }
    }
    
    return [];
  }

  private static getLineText(text: string, line: number): string {
    const lines = text.split('\n');
    if (line < 0 || line >= lines.length) {
      return '';
    }
    return lines[line];
  }

  private static createTextEdit(position: Position, newText: string): TextEdit {
    const nextPosition = {
      line: position.line,
      character: position.character + 1
    };
    
    return {
      range: Range.create(nextPosition, nextPosition),
      newText: newText
    };
  }
}