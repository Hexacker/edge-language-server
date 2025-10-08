// src/formatting/formatter.ts
import { TextDocument } from "vscode-languageserver-textdocument";
import {
  TextEdit,
  Range,
  FormattingOptions,
  Position,
} from "vscode-languageserver/node";
import * as prettier from "prettier";

export class EdgeFormattingProvider {
  constructor() {}

  async formatDocument(
    document: TextDocument,
    options?: FormattingOptions,
  ): Promise<TextEdit[]> {
    try {
      const text = document.getText();

      // Try to format with prettier using the edge plugin
      // Handle potential plugin loading issues
      const prettierOptions: any = {
        parser: "edge",
        printWidth: 80,
        tabWidth: options?.tabSize || 2,
        useTabs: options?.insertSpaces === false,
        semi: false,
        singleQuote: true,
        trailingComma: "none",
      };

      // Try loading the plugin - this is more robust
      let formatted: string;
      try {
        // Try using the plugin as a string reference first
        formatted = await prettier.format(text, {
          ...prettierOptions,
          plugins: ["prettier-plugin-edgejs"],
        });
      } catch (pluginError) {
        // If that fails, try without specifying plugins (prettier may auto-resolve)
        try {
          formatted = await prettier.format(text, prettierOptions);
        } catch {
          // If both fail, fall back to custom indentation logic
          console.error("EdgeJS formatting failed, using fallback logic:", pluginError);
          formatted = this.customFormatDocument(text, options?.tabSize || 2, options?.insertSpaces !== false);
          console.log("Custom formatting applied");
        }
      }

      if (formatted === text) {
        return [];
      }

      return [
        {
          range: Range.create(
            document.positionAt(0),
            document.positionAt(text.length),
          ),
          newText: formatted,
        },
      ];
    } catch (error) {
      console.error("EdgeJS formatting error:", error);
      return [];
    }
  }

  private customFormatDocument(text: string, tabSize: number, useSpaces: boolean): string {
    const lines = text.split('\n');
    let indentLevel = 0;
    const indentedLines: string[] = [];

    for (const line of lines) {
      const originalLine = line;
      const trimmedLine = originalLine.trim();
      
      if (!trimmedLine) {
        // For empty lines, preserve the indentation level and just add an empty line
        let currentIndent = useSpaces ? ' '.repeat(indentLevel * tabSize) : '\t'.repeat(indentLevel);
        indentedLines.push(currentIndent);
        continue;
      }
      
      // Check if the line is a closing directive
      const isBlockEnd = trimmedLine.startsWith('@end');
      
      // If it's a block end, decrease the indent level BEFORE processing the line
      if (isBlockEnd && indentLevel > 0) {
        indentLevel--;
        // Ensure we don't go below 0
        indentLevel = Math.max(0, indentLevel);
      }
      
      // Determine current indentation
      let currentIndent = useSpaces ? ' '.repeat(indentLevel * tabSize) : '\t'.repeat(indentLevel);
      
      // Add the current line with current indent level
      indentedLines.push(currentIndent + trimmedLine);
      
      // Check if the line starts a block opening directive
      const isBlockStart = trimmedLine.startsWith('@if(') || 
                           trimmedLine.startsWith('@unless(') || 
                           trimmedLine.startsWith('@each(') || 
                           trimmedLine.startsWith('@component(') ||
                           trimmedLine.startsWith('@slot(') ||
                           trimmedLine.startsWith('@flashMessage(') ||
                           trimmedLine.startsWith('@error(') ||
                           trimmedLine.startsWith('@inputError(') ||
                           trimmedLine.startsWith('@can(') ||
                           trimmedLine.startsWith('@cannot(');
      
      // If it's a block start, increase the indent level AFTER processing the line
      if (isBlockStart) {
        indentLevel++;
      }
    }

    return indentedLines.join('\n');
  }

  async formatRange(
    document: TextDocument,
    range: Range,
    options?: FormattingOptions,
  ): Promise<TextEdit[]> {
    return this.formatDocument(document, options);
  }

  async formatOnType(
    document: TextDocument,
    position: Position,
    character: string,
    options?: FormattingOptions,
  ): Promise<TextEdit[]> {
    // Delegate to the Edge-specific on-type formatting logic
    return this.formatOnTypeEdge(document, position, character, options);
  }
  
  async formatOnTypeEdge(
    document: TextDocument,
    position: Position,
    character: string,
    options?: FormattingOptions,
  ): Promise<TextEdit[]> {
    // For Edge-specific on-type formatting like auto-indenting after @end
    // For now, return empty array, but this could be enhanced
    if (character === '\n') {
      // Potentially format indentation after new lines
      const line = document.getText(Range.create(
        Position.create(position.line - 1, 0),
        Position.create(position.line, 0)
      ));
      
      // Check if we just completed a block directive like @end
      if (line.trim().startsWith('@end')) {
        // Format the current document to ensure proper indentation
        return this.formatDocument(document, options);
      }
    }
    
    return [];
  }
}
