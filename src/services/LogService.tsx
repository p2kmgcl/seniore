import { Color, Text, render } from 'ink';
import React from 'react';
import { Line, Lines } from '../components/Lines';

interface Options {
  bold?: boolean;
  dim?: boolean;
  error?: boolean;
}

const defaultOptions = {
  bold: false,
  dim: false,
  error: false,
};

export const LogService = {
  logText(message: string, options: Options = defaultOptions): void {
    const { unmount } = render(
      <Text bold={options.bold || options.error} key={message}>
        <Color dim={options.dim} red={options.error}>
          {message || '\n'}
        </Color>
      </Text>,
    );

    unmount();
  },

  logLines(lines: Line[], noLinesMessage = ''): void {
    if (lines.length) {
      const { unmount } = render(<Lines lines={lines} />);
      unmount();
    } else if (noLinesMessage) {
      this.logText(noLinesMessage, { dim: true });
    }
  },
};
