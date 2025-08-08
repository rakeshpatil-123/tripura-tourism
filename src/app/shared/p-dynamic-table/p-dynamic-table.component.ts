import {
  Component,
  Input,
  Output,
  EventEmitter,
  Type,
  OnInit,
  Injector,
  CUSTOM_ELEMENTS_SCHEMA,
  ChangeDetectorRef,
} from '@angular/core';
import { Table } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { ButtonSeverity } from 'primeng/button';
import { TableColumn } from './p-table.model';
import { Menu } from 'primeng/menu';

@Component({
  selector: 'app-p-dynamic-table',
  templateUrl: './p-dynamic-table.component.html',
  styleUrls: ['./p-dynamic-table.component.scss'],
  imports: [CommonModule, TableModule, ButtonModule, FormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PDynamicTableComponent implements OnInit {
  @Input() data: any[] = [];
  @Input() columns: TableColumn[] = [];
  @Input() globalFilterFields: string[] = [];
  @Input() loading: boolean = false;
  @Input() paginator: boolean = true;
  @Input() rows: number = 10;
  @Input() rowsPerPageOptions: number[] = [5, 10, 25, 50];
  @Input() showGridlines: boolean = false;
  @Input() stripedRows: boolean = false;
  @Input() resizableColumns: boolean = false;
  @Input() reorderableColumns: boolean = false;
  @Input() tableStyle: any = { 'min-width': '50rem' };
  @Input() scrollable: boolean = false;
  @Input() scrollHeight: string = '400px';
  @Input() sortMode: 'single' | 'multiple' = 'single';
  @Input() sortField?: string;
  @Input() sortOrder?: number;

  @Input() searchable: boolean = false;
  @Input() showPagination: boolean = true;
  @Input() getRowClass?: (row: any) => string;

  @Output() rowSelect = new EventEmitter<any>();
  @Output() rowUnselect = new EventEmitter<any>();
  @Output() actionClick = new EventEmitter<{ action: string; row: any }>();
  @Output() customAction = new EventEmitter<{ action: any; row: any }>();
  @Output() searchTermChange = new EventEmitter<string>();

  searchTerm: string = '';
  internalSortField: string | null = null;
  internalSortOrder: number = 1;
  filteredAndSortedData: any[] = [];
  selectedRow: any = null;

  filteredColumns: TableColumn[] = [];
  currencyCode: string = 'USD';

  constructor(public injector: Injector, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.filteredColumns = this.columns.filter((col) => col);
    if (this.sortField) {
      this.internalSortField = this.sortField;
      this.internalSortOrder = this.sortOrder ?? 1;
    }
    this.applyFiltersAndSorting();
  }

  applyFiltersAndSorting() {
    let result = [...this.data];

    if (this.searchable && this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter((item) =>
        this.columns.some((col) => {
          const value = item[col.key];
          return (
            value !== null &&
            value !== undefined &&
            value.toString().toLowerCase().includes(term)
          );
        })
      );
    }

    if (this.internalSortField) {
      const sortField = this.internalSortField;
      const sortOrder = this.internalSortOrder;
      result.sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];

        if (valA == null && valB == null) return 0;
        if (valA == null) return 1 * sortOrder;
        if (valB == null) return -1 * sortOrder;

        if (typeof valA === 'string' && typeof valB === 'string') {
          return valA.localeCompare(valB) * sortOrder;
        } else if (typeof valA === 'number' && typeof valB === 'number') {
          return (valA - valB) * sortOrder;
        } else if (valA instanceof Date && valB instanceof Date) {
          return (valA.getTime() - valB.getTime()) * sortOrder;
        } else {
          return valA.toString().localeCompare(valB.toString()) * sortOrder;
        }
      });
    }

    this.filteredAndSortedData = result;
  }

  onSearch() {
    this.applyFiltersAndSorting();
    this.searchTermChange.emit(this.searchTerm);
  }

  onSort(field: string) {
    if (this.internalSortField === field) {
      this.internalSortOrder = this.internalSortOrder === 1 ? -1 : 1;
    } else {
      this.internalSortField = field;
      this.internalSortOrder = 1;
    }
    this.applyFiltersAndSorting();
  }

  getRenderComponentInputs(
    col: TableColumn,
    rowData: any
  ): { [key: string]: any } {
    const baseInputs = col.renderComponentInputs || {};
    const value = this.getCellValue(rowData, col);
    return {
      ...baseInputs,
      value: value,
      row: rowData,
      column: col,
    };
  }

  getActionComponentInputs(action: any, rowData: any): { [key: string]: any } {
    const baseInputs = action.componentInputs || {};
    return {
      ...baseInputs,
      row: rowData,
      actionConfig: action,
    };
  }

  onRowSelect(event: any) {
    this.selectedRow = event.data;
    this.rowSelect.emit(event.data);
  }

  onRowUnselect(event: any) {
    this.selectedRow = null;
    this.rowUnselect.emit(event.data);
  }

  onCustomActionClick(actionConfig: any, row: any) {
    if (actionConfig.handler) {
      actionConfig.handler(row);
    }
    this.customAction.emit({ action: actionConfig, row });
  }

  getCellValue(rowData: any, col: TableColumn): any {
    return rowData[col.key];
  }

  getFormattedValue(value: any, row: any, col: TableColumn): any {
    if (col.format) {
      return col.format(value, row);
    }

    switch (col.type) {
      case 'currency':
        const currencyFormatter = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: this.currencyCode,
        });
        return currencyFormatter.format(value);
      case 'date':
        if (value instanceof Date) {
          return value.toLocaleDateString();
        } else if (typeof value === 'string') {
          const dateObj = new Date(value);
          return isNaN(dateObj.getTime())
            ? value
            : dateObj.toLocaleDateString();
        }
        return value;
      case 'boolean':
        return value ? 'Yes' : 'No';
      case 'status':
      case 'payment':
        return value;
      case 'link':
        return value;
      default:
        return value;
    }
  }

  getCellClass(value: any, row: any, col: TableColumn): string {
    if (col.cellClass) {
      return col.cellClass(value, row);
    }
    return '';
  }

  getColumnWidth(col: TableColumn): string | undefined {
    return col.width;
  }

  isColumnSortable(col: TableColumn): boolean {
    return col.sortable !== false;
  }

  getStatusSeverity(status: string): string {
    const severityMap: { [key: string]: string } = {
      Active: 'success',
      Inactive: 'danger',
      Pending: 'warning',
      Completed: 'success',
      Failed: 'danger',
    };
    return severityMap[status] || 'info';
  }

  trackByColumnKey(index: number, item: TableColumn): string {
    return item.key;
  }

  trackByAction(index: number, item: any): string | number | undefined {
    return item.action || item.label || index;
  }

  minValue(a: number, b: number): number {
    return Math.min(a, b);
  }

  hasActionComponent(action: any): boolean {
    return !!action.component;
  }
}
