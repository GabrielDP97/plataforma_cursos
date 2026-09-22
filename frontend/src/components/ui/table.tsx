import type { ReactNode } from 'react';

interface TableProps {
  children: ReactNode;
}

interface TableHeaderProps {
  children: ReactNode;
}

interface TableBodyProps {
  children: ReactNode;
}

interface TableRowProps {
  children: ReactNode;
}

interface TableCellProps {
  children: ReactNode;
  className?: string;
}

export function Table({ children }: TableProps) {
  return (
    <div className="overflow-x-auto rounded-xl">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ children }: TableHeaderProps) {
  return <thead className="bg-gray-50 dark:bg-gray-800">{children}</thead>;
}

export function TableBody({ children }: TableBodyProps) {
  return <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">{children}</tbody>;
}

export function TableRow({ children }: TableRowProps) {
  return <tr className="hover:bg-gray-50 transition-colors dark:hover:bg-gray-800/50">{children}</tr>;
}

export function TableCell({ children, className = '' }: TableCellProps) {
  return (
    <td className={`whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-gray-200 ${className}`}>
      {children}
    </td>
  );
}

export function TableHead({ children, className = '' }: TableCellProps) {
  return (
    <th className={`whitespace-nowrap px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 ${className}`}>
      {children}
    </th>
  );
}
