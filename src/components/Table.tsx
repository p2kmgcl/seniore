import React, { FC, useMemo, useEffect, useState } from 'react';
import { Box, Color, useStdout } from 'ink';

interface TableProps {
  columnWidths: (number | 'auto')[];
  headings: string[];
  rows: string[][];
}

export const Table: FC<TableProps> = ({ columnWidths, headings, rows }) => {
  const { stdout } = useStdout();
  const [maxColumns, setMaxColumns] = useState(stdout.columns || 100);
  const isVariable = (width: number | 'auto'): width is 'auto' =>
    width === 'auto';

  const widths = useMemo(() => {
    let restWidth = maxColumns - columnWidths.length;

    const widths = columnWidths.map((width, index) => {
      if (isVariable(width)) {
        return 'auto';
      } else {
        const clampedWidth = Math.min(
          width,
          restWidth,
          rows.reduce(
            (maxLength, row) => Math.max(maxLength, row[index].length),
            0,
          ),
        );

        restWidth -= clampedWidth;

        return clampedWidth;
      }
    });

    const variableWidth = Math.floor(
      restWidth / widths.filter((width) => isVariable(width)).length,
    );

    return widths.map((width) => (isVariable(width) ? variableWidth : width));
  }, [columnWidths, maxColumns, rows]);

  useEffect(() => {
    let prevMaxColumns = 100;

    setMaxColumns(prevMaxColumns);

    const id = setInterval(() => {
      if (stdout.columns !== prevMaxColumns) {
        prevMaxColumns = stdout.columns || 100;
        setMaxColumns(prevMaxColumns);
      }
    }, 300);

    return (): void => {
      clearInterval(id);
    };
  }, [setMaxColumns, stdout]);

  return (
    <>
      <Box width={maxColumns}>
        {headings.map((heading, index) => (
          <Box key={heading} width={widths[index] + 1}>
            <Color dim>{heading.substr(0, widths[index])}</Color>
          </Box>
        ))}
      </Box>

      {rows.map((row) => (
        <Box key={row.join()} width={maxColumns}>
          {row.map((col, index) => (
            <Box key={col} width={widths[index] + 1}>
              {col.substr(0, widths[index])}
            </Box>
          ))}
        </Box>
      ))}
    </>
  );
};
