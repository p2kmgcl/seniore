import { senioreTest } from './util/seniore-test';

describe('help message', () => {
  it('shows a help message when -h is sent as parameter', () =>
    senioreTest('empty')
      .run('-h')
      .expect(({ stdout }) => {
        expect(stdout.startsWith('Usage: seniore [options] [command]')).toBe(
          true,
        );
      }));

  it('shows a help message when --help is sent as parameter', () =>
    senioreTest('empty')
      .run('--help')
      .expect(({ stdout }) => {
        expect(stdout.startsWith('Usage: seniore [options] [command]')).toBe(
          true,
        );
      }));
});
