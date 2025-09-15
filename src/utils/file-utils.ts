/**
 * Utility functions for the Edge language server
 */

import * as path from 'path';
import * as fs from 'fs';

/**
 * Convert a URI to a file path
 */
export function uriToPath(uri: string): string {
  return uri.replace('file://', '');
}

/**
 * Convert a file path to a URI
 */
export function pathToUri(filePath: string): string {
  return `file://${filePath}`;
}

/**
 * Resolve a template path from dot notation to file path
 */
export function resolveTemplatePath(templatePath: string, basePath: string): string {
  const relativePath = templatePath.replace(/\./g, '/') + '.edge';
  return path.join(basePath, relativePath);
}

/**
 * Check if a file exists
 */
export function fileExists(filePath: string): boolean {
  try {
    fs.accessSync(filePath, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get the views directory for an Edge project
 */
export function getViewsDirectory(currentPath: string): string {
  // Look for common project structures
  const possiblePaths = [
    path.join(currentPath, 'resources', 'views'),
    path.join(currentPath, 'views'),
    path.join(currentPath, 'templates'),
    currentPath
  ];

  for (const viewsPath of possiblePaths) {
    if (fileExists(viewsPath)) {
      return viewsPath;
    }
  }

  // Default to current directory if no views directory found
  return currentPath;
}