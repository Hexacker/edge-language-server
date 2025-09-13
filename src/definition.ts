import * as path from 'path';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { Definition, Location, Position } from 'vscode-languageserver/node';
import { EdgeParser } from './parser';

export class EdgeDefinitionProvider {
  private parser = new EdgeParser();

  provideDefinition(document: TextDocument, position: Position): Definition | null {
    const text = document.getText();
    const tree = this.parser.parse(text);
    const node = this.parser.getNodeAtPosition(tree, position.line, position.character);

    if (!node) return null;

    // Handle @include and @component directives
    if (node.type === 'include_directive' || node.type === 'component_directive') {
      return this.resolveTemplateReference(node, document);
    }

    return null;
  }

  private resolveTemplateReference(node: Parser.SyntaxNode, document: TextDocument): Location | null {
    // Extract the template path from the directive
    const stringNodes = node.descendantsOfType('string_literal');
    if (stringNodes.length === 0) return null;

    const templatePath = stringNodes[0].text.slice(1, -1); // Remove quotes

    // Convert dot notation to file path
    const filePath = this.resolveTemplatePath(templatePath, document.uri);

    if (filePath) {
      return Location.create(filePath, {
        start: { line: 0, character: 0 },
        end: { line: 0, character: 0 },
      });
    }

    return null;
  }

  private resolveTemplatePath(templatePath: string, currentDocumentUri: string): string | null {
    // Convert URI to file path
    const currentDir = path.dirname(currentDocumentUri.replace('file://', ''));

    // Convert dot notation to file path (e.g., 'layouts.main' -> 'layouts/main.edge')
    const relativePath = templatePath.replace(/\./g, '/') + '.edge';

    // Resolve relative to views directory (adjust based on your project structure)
    const viewsDir = path.join(currentDir, '../../resources/views');
    const resolvedPath = path.join(viewsDir, relativePath);

    // Return as file URI
    return `file://${resolvedPath}`;
  }
}
