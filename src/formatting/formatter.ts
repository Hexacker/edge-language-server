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
          // If both fail, return empty array
          console.error("EdgeJS formatting failed:", pluginError);
          return [];
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
    // Optional: Implement on-type formatting for specific characters
    // For now, return empty array (no formatting on type)
    // Could be enhanced to format specific constructs when certain characters are typed
    return [];
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
