import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GenericService } from '../../_service/generic/generic.service';
import {
  DynamicTableComponent,
  TableColumn,
  ColumnType,
} from '../../shared/component/table/table.component';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { IlogiInputComponent } from '../../customInputComponents/ilogi-input/ilogi-input.component';

interface StatusActionModal {
  visible: boolean;
  applicationId: number;
  action: 'approved' | 'send_back' | 'rejected';
  title: string;
}

@Component({
  selector: 'app-applications',
  imports: [
    CommonModule,
    DynamicTableComponent,
    IlogiInputComponent,
    ReactiveFormsModule,
  ],
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

    const uid = this.apiService.getDecryptedUserId();
    console.log(uid, 'User id');

    // Define both APIs
    const api1 = `api/department/user/${uid}/assigned-applications`; // default
    const api2 = `api/department/applications`; // for "all"

    // 👇 Conditionally pick API based on query param
    const viewMode = this.route.snapshot.queryParamMap.get('view');
    const selectedApi = viewMode === 'all-applications' ? api2 : api1;

    this.isLoading = true; // ⚠️ Set loading BEFORE request

    this.apiService.getByConditions(payload, selectedApi).subscribe({
      next: (res: any) => {
        this.isLoading = false;

        if (
          res?.success === true ||
          (res?.status === 1 && Array.isArray(res.data))
        ) {
          this.applications = res.data.map((app: any) => ({
            ...app,
            submission_date: this.formatDateTime(app.submission_date),
            max_processing_date: this.formatDateTime(app.max_processing_date),
          }));

          this.columns = this.generateColumns(this.applications);
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

  // generateColumns(data: any[]): TableColumn[] {
  //   if (!Array.isArray(data) || data.length === 0) return [];

  //   const firstItem = data[0];
  //   const columns: TableColumn[] = [];

  //   const columnConfig: Record<string, { type?: ColumnType; label?: string; width?: string }> = {
  //     application_id: { label: 'Application ID', width: '120px' },
  //     service_name: { label: 'Service', width: '180px' },
  //     applicant_name: { label: 'Applicant Name', width: '180px' },
  //     applicant_email: { label: 'Email', width: '200px' },
  //     applicant_mobile: { label: 'Mobile', width: '140px' },
  //     department: { label: 'Department', width: '160px' },
  //     status: { type: 'status', label: 'Status', width: '140px' },
  //     current_step: { label: 'Current Step', width: '120px' },
  //   };

  //   for (const key in firstItem) {
  //     if (!firstItem.hasOwnProperty(key)) continue;

  //     const config = columnConfig[key] || {};
  //     const type: ColumnType = config.type || this.guessColumnType(key, firstItem[key]);
  //     const label = config.label || this.formatLabel(key);
  //     const width = config.width;

  //     columns.push({
  //       key,
  //       label,
  //       type,
  //       sortable: true,
  //       ...(width && { width }), // conditionally add width
  //     });
  //   }

  //   columns.push({
  //     key: 'actions',
  //     label: 'Actions',
  //     type: 'action',
  //     width: '150px',
  //     actions: [
  //       {
  //         label: 'View',
  //         color: 'primary',
  //         onClick: (row: any) => {
  //           this.router.navigate(['/dashboard/service-view', row.application_id]);
  //         },
  //       },
  //     ],
  //   });

  //   return columns;
  // }

  generateColumns(data: any[]): TableColumn[] {
    if (!Array.isArray(data) || data.length === 0) return [];

    const firstItem = data[0];
    const columns: TableColumn[] = [];



    const columnConfig: Record<
      string,
      { type?: ColumnType; label?: string; width?: string,  linkHref?: (row: any) => string; }
    > = {
       application_id: {
    label: 'Application ID',
    width: '120px',
    type: 'link', 
    linkHref: (row: any) => `/dashboard/service-view/${row.application_id}`,
  },
      service_name: { label: 'Service', width: '180px' },
      applicant_name: { label: 'Applicant Name', width: '180px' },
      applicant_email: { label: 'Email', width: '200px' },
      applicant_mobile: { label: 'Mobile', width: '140px' },
      department: { label: 'Department', width: '160px' },
      status: { type: 'status', label: 'Status', width: '140px' },
      current_step: { label: 'Current Step', width: '120px' },
      submission_date: {
        type: 'text',
        label: 'Submission Date',
        width: '180px',
      },
      max_processing_date: {
        type: 'text',
        label: 'Max Processing Date',
        width: '180px',
      },
    };

  

    // 👇 Generate other columns
    for (const key in firstItem) {
      if (!firstItem.hasOwnProperty(key)) continue;

      // Skip if already handled (like 'view')
      if (key === 'view') continue;

      const config = columnConfig[key] || {};
      const type: ColumnType =
        config.type || this.guessColumnType(key, firstItem[key]);
      const label = config.label || this.formatLabel(key);
      const width = config.width;

      columns.push({
        key,
        label,
        type,
        sortable: true,
        ...(width && { width }),
        ...(config.linkHref && { linkHref: config.linkHref }),
      });
    }

          columns.push({
      key: 'view',
      label: 'View',
      type: 'icon',
      icon: 'visibility',
      width: '60px',
      onClick: (row: any) => {
        this.router.navigate(['/dashboard/service-view', row.application_id]);
      },
      sortable: false,
    });

    return columns;
  }

  formatDateTime(dateTimeString: string): string {
    if (!dateTimeString) return '-';

    const date = new Date(dateTimeString);
    if (isNaN(date.getTime())) return dateTimeString; // fallback

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
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
              `Application ${status
                .replace('_', ' ')
                .toUpperCase()} successfully.`,
              'Close'
            );
            // Update status in UI
            const app = this.applications.find(
              (a) => a.application_id === applicationId
            );
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
