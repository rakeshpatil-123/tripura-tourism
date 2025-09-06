import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GenericService } from '../../_service/generic/generic.service';
import {
  DynamicTableComponent,
  TableColumn,
  ColumnType,
} from '../../shared/component/table/table.component';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IlogiInputComponent } from '../../customInputComponents/ilogi-input/ilogi-input.component';

interface StatusActionModal {
  visible: boolean;
  applicationId: number;
  action: 'approved' | 'send_back' | 'rejected';
  title: string;
}

@Component({
  selector: 'app-applications',
  imports: [CommonModule, DynamicTableComponent, IlogiInputComponent, ReactiveFormsModule],
  templateUrl: './applications.component.html',
  styleUrl: './applications.component.scss',
  standalone: true,
})
export class ApplicationsComponent implements OnInit {
  departmentId: number | null = null;
  serviceId: number | null = null;

  applications: any[] = [];
  columns: TableColumn[] = [];
  isLoading: boolean = false;

  // Modal state
  statusModal: StatusActionModal = {
    visible: false,
    applicationId: 0,
    action: 'approved',
    title: '',
  };

  // Form for remarks
  remarkForm: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: GenericService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.remarkForm = this.fb.group({
      remarks: ['', [Validators.required, Validators.minLength(5)]],
    });
  }

  ngOnInit(): void {
    this.loadParamsAndData();
  }

  loadParamsAndData(): void {
    this.isLoading = true;

    this.route.params.subscribe((params) => {
      const deptId = +params['departmentId'];
      const servId = +params['serviceId'];

      if (isNaN(deptId) || isNaN(servId)) {
        this.apiService.openSnackBar('Invalid application link.', 'Close');
        this.router.navigate(['/departmental-services']);
        return;
      }

      this.departmentId = deptId;
      this.serviceId = servId;
      this.loadApplications();
    });
  }

  loadApplications(): void {
    const payload = {
      department_id: this.departmentId,
      service_id: this.serviceId,
    };

    this.apiService
      .getByConditions(payload, 'api/department/applications')
      .subscribe({
        next: (res: any) => {
          this.isLoading = false;

          if (res?.status === 1 && Array.isArray(res.data)) {
            this.applications = res.data;
            this.columns = this.generateColumns(res.data);
          } else {
            this.applications = [];
            this.columns = [];
            this.apiService.openSnackBar(
              res?.message || 'No applications found.',
              'Close'
            );
          }
        },
        error: (err) => {
          this.isLoading = false;
          console.error('API Error:', err);
          this.apiService.openSnackBar('Failed to load applications.', 'Close');
        },
      });
  }

  generateColumns(data: any[]): TableColumn[] {
  if (!Array.isArray(data) || data.length === 0) return [];

  const firstItem = data[0];
  const columns: TableColumn[] = [];

  for (const key in firstItem) {
    if (!firstItem.hasOwnProperty(key)) continue;

    const type: ColumnType = this.guessColumnType(key, firstItem[key]);

    if (key === 'status') {
      columns.push({
        key,
        label: 'Status',
        type: 'status',
        sortable: true,
      });
    } else {
      columns.push({
        key,
        label: this.formatLabel(key),
        type,
        sortable: true,
      });
    }
  }

  columns.push({
    key: 'actions',
    label: 'Actions',
    type: 'action',
    width: '150px',
    actions: [
      {
        label: 'View',
        color: 'primary',
        onClick: (row: any) => {
          this.router.navigate(['/dashboard/service-view', row.application_id]);
        },
      },
    ],
  });

  return columns;
}

 openStatusModal(
  applicationId: number,
  action: 'approved' | 'send_back' | 'rejected',
  title: string
): void {
  this.statusModal.visible = true;
  this.statusModal.applicationId = applicationId;
  this.statusModal.action = action;
  this.statusModal.title = title;
  this.remarkForm.reset();
   this.cdr.detectChanges();
}

  closeModal(): void {
    this.statusModal.visible = false;
    this.remarkForm.reset();
  }

  onSubmitStatus(): void {
    if (this.remarkForm.invalid) {
      this.remarkForm.markAllAsTouched();
      return;
    }

    const remarks = this.remarkForm.get('remarks')?.value;
    const { applicationId, action } = this.statusModal;

    this.updateApplicationStatus(applicationId, action, remarks);
    this.closeModal();
  }

  updateApplicationStatus(
    applicationId: number,
    status: string,
    remarks: string
  ): void {
    const payload = { status, remarks };

    this.apiService
      .getByConditions(
        payload,
        `api/department/applications/${applicationId}/status`
      )
      .subscribe({
        next: (res: any) => {
          if (res?.status === 1) {
            this.apiService.openSnackBar(
              `Application ${status.replace('_', ' ').toUpperCase()} successfully.`,
              'Close'
            );
            // Update status in UI
            const app = this.applications.find(a => a.application_id === applicationId);
            if (app) {
              app.status = status;
            }
          } else {
            this.apiService.openSnackBar(
              res?.message || 'Failed to update status.',
              'Close'
            );
          }
        },
        error: (err) => {
          console.error('Status update failed:', err);
          this.apiService.openSnackBar(
            'Could not update status. Please try again.',
            'Close'
          );
        },
      });
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
      keyLower.includes('phone') ||
      keyLower.includes('email')
    ) {
      return 'text';
    }
    if (keyLower.includes('amount') || keyLower.includes('fee')) {
      return 'currency';
    }
    if (typeof value === 'number') {
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