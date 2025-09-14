import { TextDocument } from 'vscode-languageserver-textdocument';
import { EdgeCompletionProvider } from '../src/completion';

describe('EdgeCompletionProvider', () => {
  it('should provide directive completions', () => {
    const provider = new EdgeCompletionProvider();
    const document = TextDocument.create('test.edge', 'edge', 1, '@');
    const completions = provider.provideCompletions(document, { line: 0, character: 1 });
    expect(completions.length).toBeGreaterThan(0);
    expect(completions[0].label).toBe('@if');
  });
});
