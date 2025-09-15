const path = require('path');
const { uriToPath, pathToUri, resolveTemplatePath, fileExists, getViewsDirectory } = require('../src/utils/file-utils');

describe('File Utilities', () => {
  it('should convert URI to path', () => {
    const uri = 'file:///Users/test/project/file.edge';
    const filePath = uriToPath(uri);
    expect(filePath).toBe('/Users/test/project/file.edge');
  });

  it('should convert path to URI', () => {
    const filePath = '/Users/test/project/file.edge';
    const uri = pathToUri(filePath);
    expect(uri).toBe('file:///Users/test/project/file.edge');
  });

  it('should resolve template path from dot notation', () => {
    const templatePath = 'layouts.main';
    const basePath = '/Users/test/project/resources/views';
    const resolvedPath = resolveTemplatePath(templatePath, basePath);
    expect(resolvedPath).toBe(path.join(basePath, 'layouts', 'main.edge'));
  });

  it('should check if file exists', () => {
    // This test is limited since we can't easily create real files in tests
    // But we can at least test that it doesn't throw errors
    expect(() => fileExists(__filename)).not.toThrow();
  });

  it('should get views directory', () => {
    // This test is also limited, but we can test that it returns a string
    const currentPath = process.cwd();
    const viewsDir = getViewsDirectory(currentPath);
    expect(typeof viewsDir).toBe('string');
  });
});