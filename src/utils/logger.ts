/**
 * Logging utilities for the Edge language server
 */

import { Connection } from 'vscode-languageserver/node';

export class Logger {
  private connection: Connection;

  constructor(connection: Connection) {
    this.connection = connection;
  }

  info(message: string): void {
    this.connection.console.info(`[Edge LSP] ${message}`);
  }

  warn(message: string): void {
    this.connection.console.warn(`[Edge LSP] ${message}`);
  }

  error(message: string): void {
    this.connection.console.error(`[Edge LSP] ${message}`);
  }

  debug(message: string): void {
    this.connection.console.log(`[Edge LSP] ${message}`);
  }
}