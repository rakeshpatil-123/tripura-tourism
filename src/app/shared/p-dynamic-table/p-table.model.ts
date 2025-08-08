import { Type } from '@angular/core';

// Define only the severities allowed by BadgeDirective
export type BadgeSeverity =
  | 'secondary'
  | 'info'
  | 'success'
  | 'warn'
  | 'danger'
  | 'contrast'
  | null
  | undefined;

// Add ButtonSeverity if not already defined
export type ButtonSeverity =
  | 'secondary'
  | 'info'
  | 'success'
  | 'warn'
  | 'danger'
  | 'help'
  | 'primary'
  | 'contrast'
  | null
  | undefined;

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
    color?: BadgeSeverity;
    handler?: (row: any) => void;
    onClick?: (row: any) => void;
    component?: Type<any>;
    componentInputs?: { [key: string]: any };
  }>;
  class?: string;
  cellClass?: (value: any, row: any) => string;
  renderComponent?: Type<any>;
  renderComponentInputs?: { [key: string]: any };
}
