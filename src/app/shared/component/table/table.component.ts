import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  EventEmitter,
  Output,
  HostListener,
  Type,
  ComponentRef,
  ViewChild,
  ViewContainerRef,
  ComponentFactoryResolver,
  Injector,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { IlogiSelectComponent } from '../../../customInputComponents/ilogi-select/ilogi-select.component';
import { MatIcon } from '@angular/material/icon';

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
  | 'custom'
  | 'icon'
  | 'view-link'
  | 'button';

export interface TableColumn {
  key: string;
  label: string;
  type?: ColumnType;
  sortable?: boolean;
  width?: string;
  format?: (value: any, row: any) => string;
  linkHref?: (row: any) => string;
  linkText?: (row: any) => string;
  linkQueryParams?: (row: any) => { [key: string]: any };
  icon?: string;
  onClick?: (row: any) => void;
  buttonText?: string | ((row: any) => string);
  buttonColor?: string;
  buttonVisible?: (row: any) => boolean;
  actions?: Array<{
    label: string;
    action?: string;
    icon?: string;
    color?: 'primary' | 'warn' | 'accent' | 'success' | 'danger';
    handler?: (row: any) => void;
    component?: Type<any>;
    componentInputs?: { [key: string]: any };
    onClick?: (row: any) => void;
    visible?: (row: any) => boolean;
  }>;

  class?: string;
  cellClass?: (value: any, row: any) => string;
  renderComponent?: Type<any>;
  renderComponentInputs?: { [key: string]: any };
}

export interface TableRowAction {
  action: string;
  row: any;
}

@Component({
  selector: 'app-dynamic-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatMenuModule,
    MatButtonModule,
    IlogiSelectComponent,
    MatIcon,
    ReactiveFormsModule,
  ],
})
export class DynamicTableComponent implements OnChanges {
  @Input() data: any[] = [];
  @Input() columns: TableColumn[] = [];
  private _pageSize = 10;
  @Input()
  set pageSize(value: number) {
    this._pageSize = value;
    this.applyPagination();
  }
  get pageSize(): number {
    return this._pageSize;
  }
  @Input() showPagination: boolean = true;
  @Input() searchable: boolean = true;
  @Input() filterColumnKey?: string; // e.g., 'status'
  @Input() filterLabel: string = ''; // Label for dropdown
  @Input() filterOptions: Array<{ id: any; name: string }> = []; // Options
  @Input() filterPlaceholder: string = 'Select...'; // Placeholder

  @Input() selectedFilterValue: any = null;
  //   get selectedFilterValue(): any {
  //   return this._selectedFilterValue;
  // }
  @Output() rowAction = new EventEmitter<TableRowAction>();
  pageSizes = [5, 10, 20, 30, 40, 50];
  filteredData: any[] = [];
  paginatedData: any[] = [];
  currentPage: number = 1;
  searchTerm: string = '';
  sortColumn: string | null = null;
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor(
    private sanitizer: DomSanitizer,
    private componentFactoryResolver: ComponentFactoryResolver,
    public injector: Injector
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] || changes['columns']) {
      this.applyFilters();
    }
  }

  trackByRowIndex(index: number, item: any): any {
    return index;
  }

  trackByColumnKey(index: number, item: TableColumn): string {
    return item.key;
  }

  trackByActionLabel(index: number, item: any): string {
    return item.action || item.label;
  }

  minValue(a: any, b: any): number {
    return a < b ? a : b;
  }

  // applyFilters(): void {
  //   let result = [...this.data];

  //   if (this.searchable && this.searchTerm) {
  //     const term = this.searchTerm.toLowerCase();
  //     result = result.filter((row) =>
  //       Object.values(row).some((val) =>
  //         String(val).toLowerCase().includes(term)
  //       )
  //     );
  //   }

  //   if (this.sortColumn) {
  //     const col = this.columns.find((c) => c.key === this.sortColumn);
  //     result.sort((a, b) => this.sortData(a, b, this.sortColumn!, col?.type));
  //   }

  //   this.filteredData = result;
  //   this.currentPage = 1;
  //   this.applyPagination();
  // }

  applyFilters(): void {
    let result = [...this.data];

    // 🔹 1. Apply select filter (if active)
    if (this.filterColumnKey && this.selectedFilterValue !== null) {
      result = result.filter((row) => {
        const cellValue = row[this.filterColumnKey!];
        return cellValue == this.selectedFilterValue; // '==' to match string/number
      });
    }

    // 🔹 2. Apply search term (existing)
    if (this.searchable && this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter((row) =>
        Object.values(row).some((val) =>
          String(val).toLowerCase().includes(term)
        )
      );
    }

    // 🔹 3. Apply sorting (existing)
    if (this.sortColumn) {
      const col = this.columns.find((c) => c.key === this.sortColumn);
      result.sort((a, b) => this.sortData(a, b, this.sortColumn!, col?.type));
    }

    this.filteredData = result;
    this.currentPage = 1;
    this.applyPagination();
  }

  applyPagination(): void {
    if (!this.showPagination) {
      this.paginatedData = [...this.filteredData];
      return;
    }
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedData = this.filteredData.slice(start, end);
  }

  onSearch(): void {
    this.applyFilters();
  }

  onSort(key: string): void {
    const col = this.columns.find((c) => c.key === key);
    if (!col?.sortable) return;

    if (this.sortColumn === key) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = key;
      this.sortDirection = 'asc';
    }

    this.applyFilters();
  }

  onPageChange(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.applyPagination();
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredData.length / this.pageSize));
  }

  get pageNumbers(): number[] {
    const pages = [];
    const maxVisible = 5;
    const half = Math.floor(maxVisible / 2);

    const totalPages = this.totalPages;
    let start = Math.max(this.currentPage - half, 1);
    let end = start + maxVisible - 1;

    if (end > totalPages) {
      end = totalPages;
      start = Math.max(end - maxVisible + 1, 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  private sortData(a: any, b: any, key: string, type?: ColumnType): number {
    const aVal = a[key];
    const bVal = b[key];

    if (aVal == null && bVal == null) return 0;
    if (aVal == null) return this.sortDirection === 'asc' ? 1 : -1;
    if (bVal == null) return this.sortDirection === 'asc' ? -1 : 1;

    if (type === 'date') {
      const da = new Date(aVal).getTime();
      const db = new Date(bVal).getTime();
      return this.sortDirection === 'asc' ? da - db : db - da;
    }

    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return this.sortDirection === 'asc'
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }

    return this.sortDirection === 'asc'
      ? aVal < bVal
        ? -1
        : aVal > bVal
        ? 1
        : 0
      : aVal > bVal
      ? -1
      : aVal < bVal
      ? 1
      : 0;
  }

  formatValue(value: any, column: TableColumn, row: any): string | SafeHtml {
    if (column.format) {
      return column.format(value, row);
    }

    switch (column.type) {
      case 'date':
        return value
          ? new Date(value).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })
          : this.sanitizer.bypassSecurityTrustHtml(
              '<span class="text-muted">—</span>'
            );

      case 'currency':
        return value != null
          ? this.sanitizer.bypassSecurityTrustHtml(
              `<span class="text-currency">₹${new Intl.NumberFormat(
                'en-IN'
              ).format(value)}</span>`
            )
          : this.sanitizer.bypassSecurityTrustHtml(
              '<span class="text-muted">—</span>'
            );

      case 'number':
        return value != null
          ? new Intl.NumberFormat('en-IN').format(value)
          : '<span class="text-muted">—</span>';

      case 'boolean':
        const boolClass = value ? 'badge-success' : 'badge-muted';
        const boolText = value ? 'Yes' : 'No';
        return this.sanitizer.bypassSecurityTrustHtml(
          `<span class="badge ${boolClass}">${boolText}</span>`
        );

      case 'status':
        return this.sanitizer.bypassSecurityTrustHtml(
          this.getStatusBadge(value)
        );

      case 'payment':
        return this.sanitizer.bypassSecurityTrustHtml(
          this.getPaymentBadge(value)
        );

      case 'link':
        const href = column.linkHref ? column.linkHref(row) : '#';
        const queryParams = column.linkQueryParams
          ? column.linkQueryParams(row)
          : {};
        const text = column.linkText
          ? column.linkText(row)
          : String(value || href);
        let fullHref = href;
        if (Object.keys(queryParams).length > 0) {
          const queryString = new URLSearchParams(queryParams).toString();
          fullHref = queryString ? `${href}?${queryString}` : href;
        }
        return this.sanitizer.bypassSecurityTrustHtml(
          `<a href="${fullHref}" class="table-link">${text}</a>`
        );

      case 'file':
        const fileHref = column.linkHref ? column.linkHref(row) : '#';
        const fileName = column.linkText
          ? column.linkText(row)
          : 'Download File';
        return this.sanitizer.bypassSecurityTrustHtml(
          `<a href="${this.sanitizeUrl(
            fileHref
          )}" target="_blank" class="table-file">📎 ${fileName}</a>`
        );

      case 'view-link':
        if (value) {
          return this.sanitizer.bypassSecurityTrustHtml(
            `<button class="btn btn-success" onclick="window.open('${this.sanitizeUrl(
              value
            )}', '_blank')" type="button">View</button>`
          );
        }
        return this.sanitizer.bypassSecurityTrustHtml(
          '<span class="text-muted">—</span>'
        );
      case 'button': {
        const isVisible = column.buttonVisible
          ? column.buttonVisible(row)
          : true;
        if (!isVisible) {
          return this.sanitizer.bypassSecurityTrustHtml(
            '<span class="text-muted">—</span>'
          );
        }

        const text =
          typeof column.buttonText === 'function'
            ? column.buttonText(row)
            : column.buttonText || 'Click';
        const colorClass = column.buttonColor || 'success';
        return '__BUTTON_PLACEHOLDER__';
      }

      default:
        return value != null
          ? String(value)
          : '<span class="text-muted">—</span>';
    }
  }

  private getStatusBadge(status: string): string {
    const s = (status || '').toLowerCase();
    let label = 'Unknown';
    let badgeClass = 'badge-muted';

    if (s.includes('approved') || s.includes('completed')) {
      label = 'Approved';
      badgeClass = 'badge-success';
    } else if (s.includes('submitted')) {
      label = 'Submitted';
      badgeClass = 'badge-info';
    } else if (s.includes('rejected') || s.includes('cancelled')) {
      label = 'Rejected';
      badgeClass = 'badge-danger';
    } else if (s.includes('pending')) {
      label = 'Pending';
      badgeClass = 'badge-warning';
    } else if (s.includes('progress') || s.includes('processing')) {
      label = 'In Progress';
      badgeClass = 'badge-primary';
    } else if (s.includes('clarification')) {
      label = 'Clarification';
      badgeClass = 'badge-accent';
    } else if (status) {
      label = status;
      badgeClass = 'badge-default';
    }

    return `<div class="badge ${badgeClass}">${label}</div>`;
  }

  private getPaymentBadge(status: string): string {
    const s = (status || '').toLowerCase().trim();
    let label = 'Failed';
    let badgeClass = 'badge-danger';

    if (['success', 'paid', 'completed'].includes(s)) {
      label = 'Paid';
      badgeClass = 'badge-success';
    } else if (['pending', 'processing'].includes(s)) {
      label = 'Pending';
      badgeClass = 'badge-warning';
    } else if (['failed', 'rejected'].includes(s)) {
      label = 'Failed';
      badgeClass = 'badge-danger';
    }

    return `<span class="badge ${badgeClass}">${label}</span>`;
  }

  onRowActionAndClose(
    actionItem: {
      action?: string;
      label: string;
      handler?: (row: any) => void;
      onClick?: (row: any) => void;
      visible?: (row: any) => boolean;
    },
    row: any
  ): void {
    const actionIdentifier = actionItem.action || actionItem.label;

    if (actionItem.onClick) {
      try {
        actionItem.onClick(row);
        return;
      } catch (error) {
        console.error('Error in onClick handler:', error);
      }
    }

    if (actionItem.handler) {
      try {
        actionItem.handler(row);
        return;
      } catch (error) {
        console.error('Error in action handler:', error);
      }
    }

    this.rowAction.emit({ action: actionIdentifier, row });
  }

  sanitizeUrl(url: string): string {
    try {
      return new URL(url).href;
    } catch {
      return '#';
    }
  }

  isCustomComponentColumn(column: TableColumn): boolean {
    return column.type === 'custom' && !!column.renderComponent;
  }

  hasActionComponent(action: any): boolean {
    return !!action.component;
  }

  getComponentInputs(action: any, row: any): any {
    const inputs = { ...action.componentInputs };

    if (!inputs.row) {
      inputs.row = row;
    }
    return inputs;
  }

  // shouldShowActionMenu(col: TableColumn, row: any): boolean {
  //   if (!col.actions || col.actions.length === 0) return false;

  //   // Show menu if at least one action is visible (or has no visible condition)
  //   return col.actions.some(action =>
  //     !action.visible || action.visible(row)
  //   );
  // }

  shouldEnableActionMenu(col: TableColumn, row: any): boolean {
    if (!col.actions || col.actions.length === 0) return false;

    return col.actions.some((action) => !action.visible || action.visible(row));
  }

  getActionLabel(action: any, row: any): string {
    if (typeof action.label === 'function') {
      return action.label(row);
    }
    return action.label || 'Action';
  }
}
