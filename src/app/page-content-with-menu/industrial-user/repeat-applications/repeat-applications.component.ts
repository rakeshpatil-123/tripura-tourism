// repeat-applications.component.ts
import { Component, OnInit } from '@angular/core';
import { DynamicTableComponent } from '../../../shared/component/table/table.component';
import { GenericService } from '../../../_service/generic/generic.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LoaderComponent } from '../../../page-template/loader/loader.component';

@Component({
  selector: 'app-repeat-applications',
  imports: [DynamicTableComponent, CommonModule, LoaderComponent],
  templateUrl: './repeat-applications.component.html',
  styleUrl: './repeat-applications.component.scss',
  standalone: true,
})
export class RepeatApplicationsComponent implements OnInit {
  serviceId!: number;
  applications: any[] = [];
  loading: boolean = true;
  constructor(
    private route: ActivatedRoute,
    private apiService: GenericService,
    private router: Router
  ) {}
  columns: any[] = [];
  ngOnInit(): void {
    this.serviceId = Number(this.route.snapshot.paramMap.get('serviceid'));
    if (!this.serviceId) {
      this.apiService.openSnackBar('Invalid service ID', 'error');
      this.router.navigate(['/dashboard/services']);
      return;
    }

    this.loadApplications();
  }

  loadApplications(): void {
    this.loading = true;
    const userId = this.apiService.getDecryptedUserId();
    if (!userId) {
      this.apiService.openSnackBar('User not authenticated', 'error');
      this.router.navigate(['/login']);
      return;
    }

    const payload = {
      user_id: Number(userId),
      service_id: this.serviceId,
    };

    this.apiService
      .getByConditions(payload, 'api/user/get-user-applications-per-service')
      .subscribe({
        next: (res: any) => {
          if (res?.status === 1 && Array.isArray(res.data)) {
            this.applications = res.data.map((app: any) => ({
              ...app,
              formatted_latest_workflow_status: this.formatStatus(
                app.latest_workflow_status
              ),
              formatted_application_datetime: this.formatDateTime(app.application_date),
            }));
            this.buildColumns();
          } else {
            this.applications = [];
            this.apiService.openSnackBar('No applications found.', 'info');
          }
          this.loading = false;
        },
        error: (err) => {
          console.error('Failed to load applications:', err);
          this.apiService.openSnackBar('Failed to load applications.', 'error');
          this.loading = false;
        },
      });
  }
 formatDateTime(isoString: string | null): string {
  if (!isoString) return '—';

  const date = new Date(isoString);
  if (isNaN(date.getTime())) return '—';

  const day = date.getDate();
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();

  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  
  hours = hours % 12;
  hours = hours ? hours : 12;

  const time = `${hours}:${minutes} ${ampm}`;

  return `${day} ${month} ${year} - ${time}`;
}

  formatStatus(status: string): string {
    const map: { [key: string]: string } = {
      send_back: 'Send Back',
      extra_payment: 'Extra Payment',
      re_submitted: 'Re-Submitted',
      submitted: 'Submitted',
      approved: 'Approved',
      draft: 'Draft',
      saved: 'Saved',
      pending: 'Pending',
      rejected: 'Rejected',
    };
    return map[status] || (status ? status.replace(/_/g, ' ') : '—');
  }

  buildColumns(): void {
    if (this.applications.length === 0) return;

    const allowedKeys = [
      'application_id',
      'service_title_or_description',
      'application_type',
      'department_name',
      'formatted_application_datetime',
      'payment_status',

      'formatted_latest_workflow_status',
    ];

    const columns: any[] = [];

    columns.push({
      key: 'application_number',
      label: 'Application Number',
      type: 'link',
      sortable: true,
      linkHref: (row: any) => {
        return `/dashboard/user-app-view/${this.serviceId}/${row.application_id}`;
      },
    });
    allowedKeys.forEach((key) => {
      let label = key
        .replace(/^formatted_/, '')
        .replace(/_([a-z])/g, (match, letter) => ` ${letter.toUpperCase()}`)
        .replace(/^./, (str) => str.toUpperCase());

      let type = 'text';
      if (key.includes('status')) {
        type = 'status';
      } else if (key === 'application_id') {
        type = 'number';
      }

      columns.push({
        key,
        label,
        type,
        sortable: true,
        width: key === 'service_title_or_description' ? '200px' : '140px',
      });
    });

    columns.push({
      key: 'actions',
      label: 'Actions',
      type: 'action',
      actions: [
        {
          label: 'View',
          color: 'primary',
          visible: () => true,
          onClick: (row: any) => {
            const queryParams: any = {};
            if (row.service_mode === 'third_party') {
              queryParams.service = 'third_party';
            }
            this.router.navigate(
              ['/dashboard/user-app-view', this.serviceId, row.application_id],
              {
                queryParams: queryParams,
              }
            );
          },
        },
        {
          label: (row: any) => {
            return row.status === 'draft' ? 'Edit Draft' : 'Re-Submit';
          },
          color: 'warn',
          visible: (row: any) =>
            row.status === 'send_back' ||
            row.status === 'extra_payment' ||
            row.status === 'draft',
          onClick: (row: any) => {
            this.router.navigate(
              ['/dashboard/service-application', this.serviceId],
              {
                queryParams: {
                  application_status: row.status,
                  application_id: row.application_id,
                },
              }
            );
          },
        },
      ],
    });

    this.columns = columns;
  }
}
