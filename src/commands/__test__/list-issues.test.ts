import { JiraService } from '../../services/JiraService';
import { LogService } from '../../services/LogService';
import { testCommand } from '../../test-command';
import { listIssues } from '../list-issues';

jest.mock('../../services/LogService');
jest.mock('../../services/JiraService');

const MockedJiraService = JiraService as jest.Mocked<typeof JiraService>;
const MockedLogService = LogService as jest.Mocked<typeof LogService>;

describe('commands/list-issues', () => {
  beforeEach(() => {
    MockedLogService.logProgress.mockImplementation(
      (message, anything: unknown) => Promise.resolve(anything),
    );
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('calls JiraService with given board id', async () => {
    MockedJiraService.getBoardIssues.mockReturnValue(Promise.resolve([]));
    await testCommand(listIssues, ['1234']);
    expect(MockedJiraService.getBoardIssues).toHaveBeenCalledWith('1234');
  });

  it('calls LogService with existing Jira issues', async () => {
    MockedJiraService.getBoardIssues.mockReturnValue(
      Promise.resolve([
        {
          key: '1',
          title: 'First issue',
          url: 'https://first.issue.com',
          description: 'This is the first issue',
          assignee: 'Pablo Molina',
          status: 'open',
        },
      ]),
    );

    await testCommand(listIssues, ['1234']);

    expect(MockedLogService.logLines).toHaveBeenCalledWith(
      [
        {
          id: '1',
          description: 'This is the first issue',
          title: 'First issue',
          url: 'https://first.issue.com',
          topics: ['Pablo Molina', 'open'],
        },
      ],
      'No issues',
    );
  });
});
