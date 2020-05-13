import React from 'react';
import { Table } from './Table';

export interface Line {
  id: string;
  title: string;
  description?: string;
  topics?: string[];
  url?: string;
}

interface LineProps {
  lines: Array<Line>;
}

export const Lines: React.FC<LineProps> = ({ lines }) => {
  return (
    <Table
      columnWidths={[10, 'auto', 15, 15]}
      rows={[
        ['id', 'title', 'username', 'status'],
        ...lines.map((line) => [line.id, line.title, ...(line.topics || [])]),
      ]}
    />
  );
};
