const { Logger } = require('../src/utils/logger');

// Mock connection object for testing
const mockConnection: any = {
  console: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    log: jest.fn()
  }
};

describe('Logger', () => {
  let logger: any;
  
  beforeEach(() => {
    logger = new Logger(mockConnection);
    // Reset mock calls
    mockConnection.console.info.mockClear();
    mockConnection.console.warn.mockClear();
    mockConnection.console.error.mockClear();
    mockConnection.console.log.mockClear();
  });

  it('should log info messages', () => {
    logger.info('Test info message');
    
    expect(mockConnection.console.info).toHaveBeenCalledWith('[Edge LSP] Test info message');
    expect(mockConnection.console.warn).not.toHaveBeenCalled();
    expect(mockConnection.console.error).not.toHaveBeenCalled();
    expect(mockConnection.console.log).not.toHaveBeenCalled();
  });

  it('should log warning messages', () => {
    logger.warn('Test warning message');
    
    expect(mockConnection.console.warn).toHaveBeenCalledWith('[Edge LSP] Test warning message');
    expect(mockConnection.console.info).not.toHaveBeenCalled();
    expect(mockConnection.console.error).not.toHaveBeenCalled();
    expect(mockConnection.console.log).not.toHaveBeenCalled();
  });

  it('should log error messages', () => {
    logger.error('Test error message');
    
    expect(mockConnection.console.error).toHaveBeenCalledWith('[Edge LSP] Test error message');
    expect(mockConnection.console.info).not.toHaveBeenCalled();
    expect(mockConnection.console.warn).not.toHaveBeenCalled();
    expect(mockConnection.console.log).not.toHaveBeenCalled();
  });

  it('should log debug messages', () => {
    logger.debug('Test debug message');
    
    expect(mockConnection.console.log).toHaveBeenCalledWith('[Edge LSP] Test debug message');
    expect(mockConnection.console.info).not.toHaveBeenCalled();
    expect(mockConnection.console.warn).not.toHaveBeenCalled();
    expect(mockConnection.console.error).not.toHaveBeenCalled();
  });
});