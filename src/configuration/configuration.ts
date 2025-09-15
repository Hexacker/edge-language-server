/**
 * Configuration management for the Edge language server
 */

import { Connection, WorkspaceFolder } from 'vscode-languageserver/node';

export interface EdgeLanguageServerConfiguration {
  /**
   * Whether to enable auto-completion for Edge directives
   */
  enableCompletions: boolean;
  
  /**
   * Whether to enable hover information for Edge constructs
   */
  enableHover: boolean;
  
  /**
   * Whether to enable definition navigation for includes and components
   */
  enableDefinitions: boolean;
  
  /**
   * Whether to enable syntax validation
   */
  enableValidation: boolean;
  
  /**
   * Path to the views directory
   */
  viewsDirectory: string;
  
  /**
   * Additional template paths to include in completion
   */
  templatePaths: string[];
}

export class ConfigurationService {
  private connection: Connection;
  private workspaceFolders: WorkspaceFolder[] | null = null;
  private defaultConfiguration: EdgeLanguageServerConfiguration = {
    enableCompletions: true,
    enableHover: true,
    enableDefinitions: true,
    enableValidation: true,
    viewsDirectory: './resources/views',
    templatePaths: []
  };

  constructor(connection: Connection) {
    this.connection = connection;
  }

  async getConfiguration(): Promise<EdgeLanguageServerConfiguration> {
    try {
      // Try to get configuration from the client
      const config = await this.connection.workspace.getConfiguration('edgeLanguageServer');
      return { ...this.defaultConfiguration, ...config };
    } catch (error) {
      // Return default configuration if we can't get it from the client
      return this.defaultConfiguration;
    }
  }

  setWorkspaceFolders(folders: WorkspaceFolder[] | null): void {
    this.workspaceFolders = folders;
  }

  getWorkspaceFolders(): WorkspaceFolder[] | null {
    return this.workspaceFolders;
  }
}