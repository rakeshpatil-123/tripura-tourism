import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  trigger,
  transition,
  style,
  animate,
  query,
  stagger,
} from '@angular/animations';

export interface TableColumn {
  key: string;
  header: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'custom' | 'actions';
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  format?: (value: any) => string;
  customTemplate?: any; // For custom cell content
}

export interface TableAction {
  label: string;
  icon?: string;
  type: 'primary' | 'secondary' | 'danger' | 'ghost' | 'text';
  size: 'small' | 'medium' | 'large';
  action: (row: any) => void;
  condition?: (row: any) => boolean; // Show action conditionally
}

export interface TableConfig {
  showSearch?: boolean;
  showPagination?: boolean;
  pageSize?: number;
  sortable?: boolean;
  filterable?: boolean;
  selectable?: boolean;
  striped?: boolean;
  bordered?: boolean;
  hover?: boolean;
  compact?: boolean;
  roundedCorners?: boolean; // New modern option
  animatedRows?: boolean; // New animation option
  stickyHeader?: boolean; // New sticky header option
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.scss'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate(
          '300ms ease-out',
          style({ opacity: 1, transform: 'translateY(0)' })
        ),
      ]),
      transition(':leave', [
        animate(
          '200ms ease-in',
          style({ opacity: 0, transform: 'translateY(-10px)' })
        ),
      ]),
    ]),
    trigger('staggeredRows', [
      transition('* => *', [
        query(
          ':enter',
          [
            style({ opacity: 0, transform: 'translateY(20px)' }),
            stagger('25ms', [
              animate(
                '350ms ease-out',
                style({ opacity: 1, transform: 'translateY(0)' })
              ),
            ]),
          ],
          { optional: true }
        ),
      ]),
    ]),
  ],
})
export class ModernDataTableComponent implements OnInit, OnChanges {
  @Input() data: any[] = [];
  @Input() columns: TableColumn[] = [];
  @Input() actions: TableAction[] = [];
  @Input() config: TableConfig = {
    showSearch: true,
    showPagination: true,
    pageSize: 10,
    sortable: true,
    filterable: true,
    selectable: false,
    striped: true,
    bordered: false, // Modern tables often have less borders
    hover: true,
    compact: false,
    roundedCorners: true, // Modern look
    animatedRows: true, // Modern animations
    stickyHeader: true, // Better UX for long tables
  };

  @Output() rowClick = new EventEmitter<any>();
  @Output() selectionChange = new EventEmitter<any[]>();
  @Output() sortChange = new EventEmitter<{
    column: string;
    direction: 'asc' | 'desc';
  }>();
  @Output() contextMenu = new EventEmitter<{ event: MouseEvent; row: any }>();
  // Internal state
  filteredData: any[] = [];
  paginatedData: any[] = [];
  searchTerm: string = '';
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  currentPage: number = 1;
  totalPages: number = 1;
  selectedRows: any[] = [];
  isSearchFocused: boolean = false;
  hasHeaderSlot: boolean = false;

  ngOnInit() {
    this.initializeData();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data'] || changes['columns'] || changes['config']) {
      this.initializeData();
    }
  }

  private initializeData() {
    this.filteredData = [...this.data];
    this.applyFiltersAndSort();
    this.updatePagination();
  }
  showContextMenu(event: MouseEvent, row: any): void {
  event.preventDefault(); // Prevent default browser context menu
  event.stopPropagation(); // Don't trigger row click

  // Emit the event so parent can handle it
  this.contextMenu.emit({ event, row });
}

  // Search functionality
  onSearch() {
    if (!this.searchTerm.trim()) {
      this.filteredData = [...this.data];
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredData = this.data.filter((row) => {
        return this.columns.some((column) => {
          if (column.filterable === false) return false;
          const value = row[column.key];
          if (value == null) return false;
          return String(value).toLowerCase().includes(term);
        });
      });
    }
    this.currentPage = 1;
    this.updatePagination();
  }

  clearSearch() {
    this.searchTerm = '';
    this.onSearch();
  }

  // Sorting functionality
  sort(column: TableColumn) {
    if (!column.sortable || !this.config.sortable) return;

    if (this.sortColumn === column.key) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column.key;
      this.sortDirection = 'asc';
    }

    this.applyFiltersAndSort();
    this.updatePagination();
    this.sortChange.emit({ column: column.key, direction: this.sortDirection });
  }

  private applyFiltersAndSort() {
    if (this.sortColumn) {
      this.filteredData.sort((a, b) => {
        const aVal = a[this.sortColumn];
        const bVal = b[this.sortColumn];

        if (aVal == null && bVal == null) return 0;
        if (aVal == null) return 1;
        if (bVal == null) return -1;

        let comparison = 0;
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          comparison = aVal - bVal;
        } else if (aVal instanceof Date && bVal instanceof Date) {
          comparison = aVal.getTime() - bVal.getTime();
        } else {
          comparison = String(aVal).localeCompare(String(bVal));
        }

        return this.sortDirection === 'asc' ? comparison : -comparison;
      });
    }
  }

  // Pagination
  private updatePagination() {
    if (!this.config.showPagination) {
      this.paginatedData = this.filteredData;
      return;
    }

    this.totalPages = Math.ceil(
      this.filteredData.length / (this.config.pageSize || 10)
    );
    const startIndex = (this.currentPage - 1) * (this.config.pageSize || 10);
    const endIndex = startIndex + (this.config.pageSize || 10);
    this.paginatedData = this.filteredData.slice(startIndex, endIndex);
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  goToPage(page: number) {
    this.currentPage = page;
    this.updatePagination();
  }

  getVisiblePages(): (number | string)[] {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];
    let l;

    for (
      let i = Math.max(2, this.currentPage - delta);
      i <= Math.min(this.totalPages - 1, this.currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (this.currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (this.currentPage + delta < this.totalPages - 1) {
      rangeWithDots.push('...', this.totalPages);
    } else if (this.totalPages > 1) {
      rangeWithDots.push(this.totalPages);
    }

    return rangeWithDots;
  }

  getPageInfo(): string {
    const start = (this.currentPage - 1) * (this.config.pageSize || 10) + 1;
    const end = Math.min(
      start + (this.config.pageSize || 10) - 1,
      this.filteredData.length
    );
    return `${start}-${end} of ${this.filteredData.length}`;
  }

  // Selection functionality
  toggleRowSelection(row: any) {
    const index = this.selectedRows.findIndex((selected) =>
      this.isSameRow(selected, row)
    );
    if (index > -1) {
      this.selectedRows.splice(index, 1);
    } else {
      this.selectedRows.push(row);
    }
    this.selectionChange.emit([...this.selectedRows]);
  }

  toggleAllSelection() {
    if (this.isAllSelected()) {
      this.selectedRows = [];
    } else {
      this.selectedRows = [...this.paginatedData];
    }
    this.selectionChange.emit([...this.selectedRows]);
  }

  isRowSelected(row: any): boolean {
    return this.selectedRows.some((selected) => this.isSameRow(selected, row));
  }

  isAllSelected(): boolean {
    return (
      this.paginatedData.length > 0 &&
      this.paginatedData.every((row) => this.isRowSelected(row))
    );
  }

  isSomeSelected(): boolean {
    return this.selectedRows.length > 0 && !this.isAllSelected();
  }

  clearSelection(): void {
    this.selectedRows = [];
    this.selectionChange.emit([]);
  }

  private isSameRow(row1: any, row2: any): boolean {
    // If there's an id field, use that for comparison
    if (row1.id !== undefined && row2.id !== undefined) {
      return row1.id === row2.id;
    }
    // Otherwise, compare stringified objects
    return JSON.stringify(row1) === JSON.stringify(row2);
  }

  // Utility methods
  formatCellValue(value: any, column: TableColumn): string | any {
    if (value == null) return '';

    if (column.format) {
      return column.format(value);
    }

    switch (column.type) {
      case 'date':
        return value instanceof Date
          ? value.toLocaleDateString()
          : new Date(value).toLocaleDateString();
      case 'number':
        return typeof value === 'number'
          ? value.toLocaleString()
          : String(value);
      case 'boolean':
        return value
          ? '<span class="badge-true">Yes</span>'
          : '<span class="badge-false">No</span>';
      default:
        return String(value);
    }
  }

  getRowActions(row: any): TableAction[] {
    return this.actions.filter(
      (action) => !action.condition || action.condition(row)
    );
  }

  getTotalColumns(): number {
    let count = this.columns.length;
    if (this.config.selectable) count++;
    if (this.actions.length > 0) count++;
    return count;
  }

  trackByFn(index: number, item: any): any {
    return item.id || index;
  }

  handleRowClick(row: any, event: MouseEvent) {
    // If the click is on a checkbox or a button, don't trigger row click
    if (
      (event.target as HTMLElement).tagName === 'INPUT' ||
      (event.target as HTMLElement).tagName === 'BUTTON' ||
      (event.target as HTMLElement).closest('button')
    ) {
      return;
    }

    this.rowClick.emit(row);
  }
}
