import { ConfigService } from '../../services/ConfigService';
import { testCommand } from '../../test-command';
import { init } from '../init';

jest.mock('../../services/ConfigService');

const MockedConfigService = ConfigService as jest.Mocked<typeof ConfigService>;

describe('commands/init', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('creates a configuration file', async () => {
    await testCommand(init);

    expect(MockedConfigService.init).toHaveBeenCalledWith({
      force: false,
      quiet: false,
    });
  });

  it('overrides existing configuration file if -f is specified', async () => {
    await testCommand(init, ['-f']);

    expect(MockedConfigService.init).toHaveBeenCalledWith({
      force: true,
      quiet: false,
    });
  });

  it('overrides existing configuration file if --force is specified', async () => {
    await testCommand(init, ['--force']);

    expect(MockedConfigService.init).toHaveBeenCalledWith({
      force: true,
      quiet: false,
    });
  });
});
