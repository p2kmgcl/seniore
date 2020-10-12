import { listNotifications } from '../list-notifications';
import { GitHubService } from '../../services/GitHubService';
import { LogService } from '../../services/LogService';
import { testCommand } from '../../test-command';

jest.mock('../../services/LogService');
jest.mock('../../services/GitHubService');

const MockedGitHubService = GitHubService as jest.Mocked<typeof GitHubService>;
const MockedLogService = LogService as jest.Mocked<typeof LogService>;

describe('commands/list-notifications', () => {
  beforeEach(() => {
    MockedLogService.logProgress.mockImplementation(
      (message, anything: unknown) => Promise.resolve(anything),
    );
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('calls LogService with existing GitHub notifications', async () => {
    MockedGitHubService.getNotifications.mockReturnValue(
      Promise.resolve([
        {
          id: '1',
          title: 'First notification',
          repository: 'p2kmgcl/seniore',
          reason: 'testing',
        },
      ]),
    );

    await testCommand(listNotifications);

    expect(MockedLogService.logLines).toHaveBeenCalledWith(
      [
        {
          id: '1',
          title: 'First notification',
          topics: ['p2kmgcl/seniore', 'testing'],
        },
      ],
      'No notifications',
    );
  });

  it('clears all notifications by default', async () => {
    MockedGitHubService.getNotifications.mockReturnValue(Promise.resolve([]));
    await testCommand(listNotifications);
    expect(MockedGitHubService.clearNotifications).toHaveBeenCalled();
  });

  it('does not clear notifications if specified', async () => {
    MockedGitHubService.getNotifications.mockReturnValue(Promise.resolve([]));
    await testCommand(listNotifications, ['--no-clear']);
    expect(MockedGitHubService.clearNotifications).not.toHaveBeenCalled();
  });
});
