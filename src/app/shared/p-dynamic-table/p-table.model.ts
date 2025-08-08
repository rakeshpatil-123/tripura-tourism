// table-column.interface.ts
import { Type } from '@angular/core';
// If you can import ButtonSeverity directly, use it. Otherwise, define a compatible type.
// import { ButtonModule, ButtonSeverity } from 'primeng/button'; // Check actual import path
type ButtonSeverity =
  | 'secondary'
  | 'success'
  | 'info'
  | 'warn'
  | 'danger'
  | 'contrast'
  | undefined
  | null; // Simplified version

export type ColumnType =
  | 'text'
  | 'number'
  | 'date'
  | 'currency'
  | 'boolean'
  | 'status'
  | 'payment'
  | 'link'
  | 'file'
  | 'action'
  | 'custom';

export interface TableColumn {
  key: string;
  label: string;
  type?: ColumnType;
  sortable?: boolean;
  width?: string;
  format?: (value: any, row: any) => string;
  linkHref?: (row: any) => string;
  linkText?: (row: any) => string;
  actions?: Array<{
    label?: string;
    action?: string;
    icon?: string;
    // Constrain color to PrimeNG severity types
    color?: ButtonSeverity;
    handler?: (row: any) => void;
    component?: Type<any>;
    componentInputs?: { [key: string]: any };
    onClick?: (row: any) => void;
  }>;
  class?: string;
  cellClass?: (value: any, row: any) => string;
  renderComponent?: Type<any>;
  renderComponentInputs?: { [key: string]: any };
}
