import React from 'react';
import './table.css';

interface TableProps {
  className?: string;
  children: React.ReactNode;
}

interface TableHeaderProps {
  className?: string;
  children: React.ReactNode;
}

interface TableBodyProps {
  className?: string;
  children: React.ReactNode;
}

interface TableRowProps {
  className?: string;
  children: React.ReactNode;
}

interface TableHeadProps {
  className?: string;
  children: React.ReactNode;
}

interface TableCellProps {
  className?: string;
  children: React.ReactNode;
}

export function Table({ className = '', children }: TableProps) {
  return (
    <div className="table-container">
      <table className={`table ${className}`}>
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ className = '', children }: TableHeaderProps) {
  return (
    <thead className={`table-header ${className}`}>
      {children}
    </thead>
  );
}

export function TableBody({ className = '', children }: TableBodyProps) {
  return (
    <tbody className={`table-body ${className}`}>
      {children}
    </tbody>
  );
}

export function TableRow({ className = '', children }: TableRowProps) {
  return (
    <tr className={`table-row ${className}`}>
      {children}
    </tr>
  );
}

export function TableHead({ className = '', children }: TableHeadProps) {
  return (
    <th className={`table-head ${className}`}>
      {children}
    </th>
  );
}

export function TableCell({ className = '', children }: TableCellProps) {
  return (
    <td className={`table-cell ${className}`}>
      {children}
    </td>
  );
}
