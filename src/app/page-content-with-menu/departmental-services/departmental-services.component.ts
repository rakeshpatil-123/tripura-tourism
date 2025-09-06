import { Component, OnInit } from '@angular/core';
import { IlogiSelectComponent } from '../../customInputComponents/ilogi-select/ilogi-select.component';
import { GenericService } from '../../_service/generic/generic.service';
import {
  ColumnType,
  DynamicTableComponent,
  TableColumn,
} from '../../shared/component/table/table.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-departmental-services',
  imports: [IlogiSelectComponent, DynamicTableComponent],
  templateUrl: './departmental-services.component.html',
  styleUrl: './departmental-services.component.scss',
  standalone: true, // ✅ Added if not in module
})
export class DepartmentalServicesComponent implements OnInit {
  allDepartments: any[] = [];
  selectedDepartmentId: number | null = null;
  services: any[] = [];
  isLoading: boolean = false;
  serviceColumns: TableColumn[] = [];

  constructor(private apiService: GenericService, private router: Router) {}

  ngOnInit(): void {
    this.getAllDepartments();
  }

  getAllDepartments(): void {
    this.isLoading = true;
    this.apiService
      .getByConditions({}, 'api/department-get-all-departments')
      .subscribe({
        next: (res: any) => {
          this.isLoading = false;
          if (res?.status === 1 && Array.isArray(res.data)) {
            this.allDepartments = res.data;
            console.log('Departments loaded:', this.allDepartments);
          } else {
            this.apiService.openSnackBar(
              'Failed to load departments.',
              'Close'
            );
          }
        },
        error: (err) => {
          this.isLoading = false;
          console.error('Error loading departments:', err);
          this.apiService.openSnackBar(
            'Network error. Could not load departments.',
            'Close'
          );
        },
      });
  }

  onDepartmentSelected(event: any): void {
    const departmentId = event?.value ?? null;

    if (!departmentId) {
      console.warn('Invalid department selection:', event);
      this.apiService.openSnackBar(
        'Please select a valid department.',
        'Close'
      );
      return;
    }

    this.selectedDepartmentId = departmentId;
    this.loadServices(departmentId);
  }

  loadServices(departmentId: number): void {
    this.services = [];
    this.isLoading = true;

    const payload = { department_id: +departmentId };

    this.apiService
      .getByConditions(payload, 'api/department/services')
      .subscribe({
        next: (res: any) => {
          this.isLoading = false;
          console.log('Service API Response:', res);

          if (res?.status === 1 && Array.isArray(res.data)) {
            this.services = res.data;
            this.serviceColumns = this.generateColumns(res.data);
          } else {
            this.services = [];
            this.serviceColumns = [];
            this.apiService.openSnackBar(
              res?.message || 'No services found for this department.',
              'Close'
            );
          }
        },
        error: (err) => {
          this.isLoading = false;
          console.error('Error loading services:', err);
          this.apiService.openSnackBar('Failed to load services.', 'Close');
        },
      });
  }

  generateColumns(data: any[]): TableColumn[] {
    if (!Array.isArray(data) || data.length === 0) {
      return [];
    }

    const firstItem = data[0];
    const columns: TableColumn[] = [];

    for (const key in firstItem) {
      if (firstItem.hasOwnProperty(key)) {
        const type: ColumnType = this.guessColumnType(key, firstItem[key]);
        columns.push({
          key,
          label: this.formatLabel(key),
          type,
          sortable: true,
        });
      }
    }

    // Add Actions column
    columns.push({
      key: 'actions',
      label: 'Actions',
      type: 'action',
      width: '120px',
      actions: [
        {
          label: 'View applications',
          // icon: '🚀',
          color: 'success',
          onClick: (row: any) => {
            if (!this.selectedDepartmentId || !row.service_id) {
              this.apiService.openSnackBar('Missing required IDs.', 'Close');
              return;
            }
            console.log(this.selectedDepartmentId, "dept", row.service_id, "service");

            this.router.navigate([
              'dashboard/all-service-application',
              this.selectedDepartmentId,
              row.service_id,
            ]);

          },
        },
      ],
    });

    return columns;
  }

  guessColumnType(key: string, value: any): ColumnType {
    const keyLower = key.toLowerCase();

    if (
      keyLower.includes('date') ||
      (keyLower.includes('at') && typeof value === 'string')
    ) {
      return 'date';
    }
    if (
      keyLower.includes('name') ||
      keyLower.includes('desc') ||
      keyLower.includes('details')
    ) {
      return 'text';
    }
    if (
      keyLower.includes('amount') ||
      keyLower.includes('price') ||
      keyLower.includes('salary')
    ) {
      return 'currency';
    }
    if (typeof value === 'number') {
      if (keyLower.includes('id')) return 'number';
      if (
        keyLower.includes('days') ||
        keyLower.includes('count') ||
        keyLower.includes('applications')
      ) {
        return 'number';
      }
      return 'number';
    }
    if (typeof value === 'boolean') {
      return 'boolean';
    }

    return 'text';
  }

  formatLabel(key: string): string {
    return key
      .replace(/_([a-z])/g, ' $1') // snake_case → " snake case"
      .replace(/([a-z])([A-Z])/g, '$1 $2') // camelCase → "camel Case"
      .replace(/^\w/, (c) => c.toUpperCase()) // Capitalize first letter
      .trim();
  }
}
