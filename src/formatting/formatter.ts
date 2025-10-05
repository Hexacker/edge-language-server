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

      const prettierOptions = {
        parser: "edge" as const,
        plugins: ["prettier-plugin-edgejs"],
        printWidth: 80,
        tabWidth: options?.tabSize || 2,
        useTabs: options?.insertSpaces === false,
        semi: false,
        singleQuote: true,
        trailingComma: "none" as const,
      };

      const formatted = await prettier.format(text, prettierOptions);

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
    return [];
  }
}
