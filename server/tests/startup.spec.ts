import mongoose from 'mongoose';
import { server, startServer } from '../app';

describe('Server Startup', () => {
  let processExitSpy: jest.SpyInstance;
  let consoleLogSpy: jest.SpyInstance;

  beforeAll(() => {
    processExitSpy = jest.spyOn(process, 'exit').mockImplementation((() => {
      return undefined as never;
    }) as any);

    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
  });

  afterAll(() => {
    processExitSpy.mockRestore();
    consoleLogSpy.mockRestore();
    mongoose.disconnect();
    if (server.listening) {
      server.close();
    }
  });

  it('should start server successfully', done => {
    startServer();

    setTimeout(() => {
      const address = server.address();
      expect(address).toBeTruthy();
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Server is running on port'),
      );
      done();
    }, 200);
  });

  it('should handle SIGINT gracefully', async () => {
    const disconnectSpy = jest.spyOn(mongoose, 'disconnect').mockResolvedValue();

    const closeSpy = jest.spyOn(server, 'close').mockImplementation((callback?: any) => {
      if (callback) callback();
      return server;
    });

    process.emit('SIGINT' as any);

    await new Promise(resolve => setTimeout(resolve, 200));

    expect(disconnectSpy).toHaveBeenCalled();
    expect(closeSpy).toHaveBeenCalled();
    expect(processExitSpy).toHaveBeenCalledWith(0);

    disconnectSpy.mockRestore();
    closeSpy.mockRestore();
  });
});
