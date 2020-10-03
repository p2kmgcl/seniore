import { GitService } from '../../services/GitService';
import { GitHubService } from '../../services/GitHubService';
import { LogService } from '../../services/LogService';
import { testCommand } from '../../test-command';
import { listPullRequests } from '../list-pull-requests';

jest.mock('../../services/LogService');
jest.mock('../../services/GitService');
jest.mock('../../services/GitHubService');

const MockedLogService = LogService as jest.Mocked<typeof LogService>;
const MockedGitService = GitService as jest.Mocked<typeof GitService>;
const MockedGitHubService = GitHubService as jest.Mocked<typeof GitHubService>;

describe('commands/list-pull-requests', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('uses current repository name and owner', async () => {
    MockedGitService.getRepositoryOwner.mockReturnValue(Promise.resolve('foo'));
    MockedGitService.getRepositoryName.mockReturnValue(Promise.resolve('var'));
    MockedGitHubService.getPullRequests.mockReturnValue(Promise.resolve([]));

    await testCommand(listPullRequests);

    expect(MockedGitHubService.getPullRequests).toHaveBeenCalledWith(
      'foo',
      'var',
    );
  });

  it('uses given owner if specified with --owner', async () => {
    MockedGitService.getRepositoryName.mockReturnValue(Promise.resolve('var'));
    MockedGitHubService.getPullRequests.mockReturnValue(Promise.resolve([]));

    await testCommand(listPullRequests, ['--owner', 'someone']);

    expect(MockedGitHubService.getPullRequests).toHaveBeenCalledWith(
      'someone',
      'var',
    );
  });

  it('uses given owner if specified with -o', async () => {
    MockedGitService.getRepositoryName.mockReturnValue(Promise.resolve('var'));
    MockedGitHubService.getPullRequests.mockReturnValue(Promise.resolve([]));

    await testCommand(listPullRequests, ['-o', 'someone']);

    expect(MockedGitHubService.getPullRequests).toHaveBeenCalledWith(
      'someone',
      'var',
    );
  });

  it('calls LogService with existing GitHub pull requests', async () => {
    MockedGitHubService.getPullRequests.mockReturnValue(
      Promise.resolve([
        {
          id: 'asd123',
          number: 123,
          title: 'First pull request',
          url: 'https://first.pull.request.com',
          creator: 'p2kmgcl',
          status: 'Pending',
        },
      ]),
    );

    await testCommand(listPullRequests);

    expect(MockedLogService.logLines).toHaveBeenCalledWith(
      [
        {
          id: 'asd123',
          title: 'First pull request',
          url: 'https://first.pull.request.com',
          topics: ['@p2kmgcl', 'Pending'],
        },
      ],
      'No PRs',
    );
  });
});
