import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  Injector,
  ChangeDetectorRef,
  CUSTOM_ELEMENTS_SCHEMA,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { Menu, MenuModule } from 'primeng/menu';
import { FormsModule } from '@angular/forms';
import { ButtonSeverity } from 'primeng/button';
import { BadgeSeverity, TableColumn } from './p-table.model';
import { BadgeModule } from 'primeng/badge';

@Component({
  selector: 'app-p-dynamic-table',
  templateUrl: './p-dynamic-table.component.html',
  styleUrls: ['./p-dynamic-table.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    MenuModule,
    MenuModule,
    BadgeModule,
    FormsModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  host: { class: 'block' },
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

  // Track open menu for cleanup
  private openMenuInstance: Menu | null = null;

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

    // Global search
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

    // Sorting
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

      default:
        return value != null ? value : '';
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
  getStatusSeverity(status: string): BadgeSeverity {
    const map: { [key: string]: BadgeSeverity } = {
      Active: 'success',
      Inactive: 'danger',
      Pending: 'warn',
      Draft: 'info',
      Verified: 'success',
    };
    return map[status] ?? 'info';
  }

  getPaymentSeverity(status: string): ButtonSeverity {
    const map: { [key: string]: ButtonSeverity } = {
      Paid: 'success',
      'Partially Paid': 'warn',
      Overdue: 'danger',
      Refunded: 'info',
      Failed: 'danger',
      Cancelled: 'danger',
    };
    return map[status] || 'info';
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

  // Action handling
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

  getRenderComponentInputs(
    col: TableColumn,
    rowData: any
  ): { [key: string]: any } {
    const baseInputs = col.renderComponentInputs || {};
    const value = this.getCellValue(rowData, col);
    return {
      ...baseInputs,
      value,
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

  // Dropdown Menu Logic
  toggleMenuWithCol(event: Event, menu: Menu, col: TableColumn, rowData: any) {
    // Close previous menu
    if (this.openMenuInstance && this.openMenuInstance !== menu) {
      this.openMenuInstance.hide();
    }

    // Set dynamic items
    menu.model = this.getActionItems(col, rowData);
    menu.toggle(event);
    this.openMenuInstance = menu;

    // Prevent event propagation
    event.preventDefault();
    event.stopPropagation();
  }

  getActionItems(col: TableColumn, rowData: any): any[] {
    return (col.actions || []).map((action) => ({
      label: action.label,
      icon: action.icon || 'pi pi-arrow-right',
      command: () => {
        if (action.handler) {
          action.handler(rowData);
        }
      },
    }));
  }

  onMenuOpen(event: any) {
    // Optional: add analytics or logging
  }

  onMenuHide(event: any) {
    this.openMenuInstance = null;
  }
}
