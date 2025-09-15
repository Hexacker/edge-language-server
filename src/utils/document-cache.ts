/**
 * Document cache for the Edge language server
 * Caches parsed documents to improve performance
 */

import { TextDocument } from 'vscode-languageserver-textdocument';
import { EdgeParser } from '../server/parser';

interface CachedDocument {
  version: number;
  text: string;
  tree: any;
  timestamp: number;
}

export class DocumentCache {
  private cache: Map<string, CachedDocument> = new Map();
  private maxSize: number;
  private ttl: number; // Time to live in milliseconds

  constructor(maxSize: number = 100, ttl: number = 300000) { // 5 minutes default TTL
    this.maxSize = maxSize;
    this.ttl = ttl;
  }

  /**
   * Get a parsed tree for a document, either from cache or by parsing
   */
  async getTree(document: TextDocument, parser: EdgeParser): Promise<any> {
    const uri = document.uri;
    const version = document.version;
    const text = document.getText();
    
    // Check if we have a cached version
    const cached = this.cache.get(uri);
    
    if (cached && cached.version === version && cached.text === text) {
      // Check if the cached entry is still valid (not expired)
      if (Date.now() - cached.timestamp < this.ttl) {
        return cached.tree;
      } else {
        // Remove expired entry
        this.cache.delete(uri);
      }
    }
    
    // Parse the document
    const tree = parser.parse(text);
    
    // Cache the result
    this.cache.set(uri, {
      version,
      text,
      tree,
      timestamp: Date.now()
    });
    
    // Clean up if we've exceeded max size
    this.cleanup();
    
    return tree;
  }

  /**
   * Invalidate a document in the cache
   */
  invalidate(uri: string): void {
    this.cache.delete(uri);
  }

  /**
   * Invalidate all documents in the cache
   */
  invalidateAll(): void {
    this.cache.clear();
  }

  /**
   * Clean up the cache by removing old entries when it exceeds max size
   */
  private cleanup(): void {
    if (this.cache.size <= this.maxSize) {
      return;
    }
    
    // Remove the oldest entries
    const entries = Array.from(this.cache.entries());
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
    
    const excess = this.cache.size - this.maxSize;
    for (let i = 0; i < excess; i++) {
      this.cache.delete(entries[i][0]);
    }
  }

  /**
   * Get the current size of the cache
   */
  getSize(): number {
    return this.cache.size;
  }

  /**
   * Update the TTL for cached entries
   */
  setTTL(ttl: number): void {
    this.ttl = ttl;
  }

  /**
   * Update the maximum size of the cache
   */
  setMaxSize(maxSize: number): void {
    this.maxSize = maxSize;
    this.cleanup();
  }
}