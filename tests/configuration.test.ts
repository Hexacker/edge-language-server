const { ConfigurationService } = require('../src/configuration/configuration');

// Mock connection object for testing
const mockConnection: any = {
  workspace: {
    getConfiguration: jest.fn()
  },
  console: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    log: jest.fn()
  }
};

describe('ConfigurationService', () => {
  let configService: any;
  
  beforeEach(() => {
    configService = new ConfigurationService(mockConnection);
    // Reset mock calls
    mockConnection.workspace.getConfiguration.mockClear();
    mockConnection.console.info.mockClear();
    mockConnection.console.warn.mockClear();
    mockConnection.console.error.mockClear();
    mockConnection.console.log.mockClear();
  });

  it('should return default configuration when client config fails', async () => {
    // Simulate configuration retrieval failure
    mockConnection.workspace.getConfiguration.mockRejectedValue(new Error('Config not available'));
    
    const config = await configService.getConfiguration();
    
    expect(config).toBeDefined();
    expect(config.enableCompletions).toBe(true);
    expect(config.enableHover).toBe(true);
    expect(config.enableDefinitions).toBe(true);
    expect(config.enableValidation).toBe(true);
  });

  it('should merge client configuration with defaults', async () => {
    // Simulate partial client configuration
    const clientConfig = {
      enableCompletions: false,
      viewsDirectory: './custom/views'
    };
    
    mockConnection.workspace.getConfiguration.mockResolvedValue(clientConfig);
    
    const config = await configService.getConfiguration();
    
    // Should have client values where provided
    expect(config.enableCompletions).toBe(false);
    expect(config.viewsDirectory).toBe('./custom/views');
    
    // Should have default values where not provided
    expect(config.enableHover).toBe(true);
    expect(config.enableDefinitions).toBe(true);
    expect(config.enableValidation).toBe(true);
  });

  it('should handle workspace folders', () => {
    const workspaceFolders = [
      { uri: 'file:///workspace1', name: 'workspace1' },
      { uri: 'file:///workspace2', name: 'workspace2' }
    ];
    
    configService.setWorkspaceFolders(workspaceFolders);
    
    const folders = configService.getWorkspaceFolders();
    expect(folders).toEqual(workspaceFolders);
  });

  it('should handle null workspace folders', () => {
    configService.setWorkspaceFolders(null);
    
    const folders = configService.getWorkspaceFolders();
    expect(folders).toBeNull();
  });
});