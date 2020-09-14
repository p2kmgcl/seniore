import fs from 'fs';
import path from 'path';
import tmp from 'tmp';
import unzipper from 'unzipper';
import * as execa from 'execa';

interface SenioreRunner {
  run: (command: string) => SenioreResult;
}

interface SenioreExpectFunction {
  (output: { stdout: string; stderr: string }): void;
}

interface SenioreResult {
  expect: (fn: SenioreExpectFunction) => Promise<void>;
}

export const senioreTest = (
  fixtureName: 'empty' | 'git-init',
): SenioreRunner => {
  const runCommand = async (
    command: string,
    expectedFunction: SenioreExpectFunction,
  ): Promise<void> => {
    const tmpDir = tmp.dirSync({ unsafeCleanup: true });

    await fs
      .createReadStream(
        path.join(__dirname, '..', 'fixtures', `${fixtureName}.zip`),
      )
      .pipe(unzipper.Extract({ path: tmpDir.name }))
      .promise();

    const output = await execa.command(
      `${path.join(__dirname, '..', '..', 'bin', 'seniore')} ${command}`,
      {
        cwd: tmpDir.name,
      },
    );

    tmpDir.removeCallback();
    expectedFunction(output);
  };

  return {
    run: (command): SenioreResult => ({
      expect: (expectedFn: SenioreExpectFunction): Promise<void> =>
        runCommand(command, expectedFn),
    }),
  };
};
