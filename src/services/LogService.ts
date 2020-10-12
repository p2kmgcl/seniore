import chalk from 'chalk';
import ora from 'ora';

export interface Line {
  id: string;
  title: string;
  description?: string;
  topics?: string[];
  url?: string;
}

const fixWidth = (text: string, length: number): string => {
  if (text.length <= length) {
    return text.padEnd(length, ' ');
  }

  return `${text.substr(0, length - 3).trim()}...`.padEnd(length, ' ');
};

export const LogService = {
  logError(message: string): void {
    console.error(chalk.bold.red(message));
  },

  logNotFound(message: string): void {
    console.log(chalk.dim(message));
  },

  logText(message: string): void {
    console.log(message);
  },

  async logProgress<T>(message: string, anything: T): Promise<T> {
    const spinner = ora({
      text: message,
      spinner: 'dots',
    }).start();

    try {
      await anything;
    } finally {
      spinner.stop();
    }

    return anything;
  },

  logLines(lines: Line[], noLinesMessage = ''): void {
    if (!lines.length && noLinesMessage) {
      this.logNotFound(noLinesMessage);
      return;
    }

    const topicsColors = [chalk.green, chalk.cyan, chalk.yellow, chalk.red];
    const topicsWidths: number[] = [];
    let idWidth = 0;

    lines.forEach((line) => {
      idWidth = Math.max(idWidth, line.id.length);

      line.topics?.forEach((topic, index) => {
        topicsWidths[index] = Math.max(topicsWidths[index] || 0, topic.length);
      });
    });

    const titleWidth =
      (process.stdout.columns || 100) -
      idWidth -
      topicsWidths.reduce((a, b) => a + b, 0) -
      (1 + topicsWidths.length);

    lines.forEach((line) => {
      console.log(
        chalk.bold.blue(fixWidth(line.id, idWidth)),
        fixWidth(line.title, titleWidth),
        ...(line.topics?.map((topic, index) =>
          topicsColors[index](fixWidth(topic, topicsWidths[index] || 10)),
        ) || []),
      );

      if (line.description) {
        console.log(
          ''.padEnd(idWidth, ' '),
          chalk.dim.italic(
            fixWidth(
              line.description,
              (process.stdout.columns || 100) - idWidth - 1,
            ),
          ),
        );
      }
    });
  },
};
