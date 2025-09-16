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
  standalone: true,
})
export class DepartmentalServicesComponent implements OnInit {
  allDepartments: any[] = [];
  selectedDepartmentId: number | null = null;
  services: any[] = [];
  isLoading: boolean = false;
  serviceColumns: TableColumn[] = [];

  constructor(private apiService: GenericService, private router: Router) {}

  ngOnInit(): void {
    // Get deptId from localStorage when component initializes
    const deptId = localStorage.getItem('deptId');
    if (deptId) {
      this.selectedDepartmentId = Number(deptId);
    }
    this.loadServices();
  }

  loadServices(): void {
    const departmentId = localStorage.getItem('deptId');
    if (!departmentId) {
      this.apiService.openSnackBar('Department ID not found.', 'Close');
      return;
    }
    
    this.selectedDepartmentId = Number(departmentId); // Store it for later use
    this.services = [];
    this.isLoading = true;

    const payload = { department_id: departmentId };

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
  if (!firstItem.hasOwnProperty(key)) continue;

  let column: TableColumn;

  if (key === 'service_name') {
    // ✅ Make service_name a clickable link (full page reload is fine)
    column = {
      key: 'service_name',
      label: 'Service Name',
      type: 'link',
      sortable: true,
      linkHref: (row: any) => {
        const deptId = this.selectedDepartmentId || Number(localStorage.getItem('deptId'));
        if (!deptId || !row.service_id) {
          this.apiService.openSnackBar('Missing required IDs.', 'Close');
          return '#';
        }
        // ✅ Return full URL path — will cause reload, but that's fine for now
        return `/dashboard/all-service-application/${deptId}/${row.service_id}`;
      },
    };
  } else {
    const type: ColumnType = this.guessColumnType(key, firstItem[key]);
    column = {
      key,
      label: this.formatLabel(key),
      type,
      sortable: true,
    };
  }

  columns.push(column);
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
          color: 'success',
          onClick: (row: any) => {
            // Use the stored selectedDepartmentId or get fresh from localStorage
            const deptId = this.selectedDepartmentId || Number(localStorage.getItem('deptId'));
            if (!deptId || !row.service_id) {
              this.apiService.openSnackBar('Missing required IDs.', 'Close');
              return;
            }
            console.log(deptId, "dept", row.service_id, "service");

            this.router.navigate([
              'dashboard/all-service-application',
              deptId,
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
      .replace(/_([a-z])/g, ' $1')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/^\w/, (c) => c.toUpperCase())
      .trim();
  }
}