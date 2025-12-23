// application-list.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  DynamicTableComponent,
  TableColumn,
  TableRowAction,
} from '../../../shared/component/table/table.component';
import { IlogiSelectComponent } from '../../../customInputComponents/ilogi-select/ilogi-select.component';
import { IlogiInputDateComponent } from '../../../customInputComponents/ilogi-input-date/ilogi-input-date.component';
import { ButtonComponent } from '../../../shared/component/button-component/button.component';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { GenericService } from '../../../_service/generic/generic.service';
import { TransactionHistoryDialogComponent } from './transaction-history';
import Swal from 'sweetalert2';
import { LoaderComponent } from '../../../page-template/loader/loader.component';

interface ApplicationDataItem {
  id: number;
  applicationNumber: string;
  applicationDate: string;
  applicationDateRaw: Date | null;
  applicationFor: string;
  departmentName: string;
  departmentId: string;
  applicationType: string;
  status: string;
  renewalDate: string;
  payment_status: string;
  nocDetailsId: string;
  noc_master_id: string;
  nocMasterId: string;
  service_id: number;
  _raw?: any;
  service_mode: string;
  application_id: number;
  is_certificate: string | null;
  already_rated: boolean;
  rating: string;
}

@Component({
  selector: 'app-application-search-page',
  templateUrl: './application-list.component.html',
  styleUrls: ['./application-list.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DynamicTableComponent,
    IlogiSelectComponent,
    IlogiInputDateComponent,
    ButtonComponent,
    LoaderComponent,
  ],
})
export class ApplicationSearchPageComponent implements OnInit {
  serviceFilterOptions: Array<{ id: string | null; name: string }> = [];
  selectedServiceId: string | null = null;
  filteredData: ApplicationDataItem[] = [];
  ApplicationColumns: TableColumn[] = [];
  error: string = '';
currentPageSize = 5;
  fromDate: string = '';
  toDate: string = ''; 
  department: string = '';
  applicationType: string = '';

  departmentOptions: Array<{ id: string; name: string }> = [
    { id: '', name: 'All Departments' },
  ];

  applicationTypeOptions = [
    { id: '', name: 'All Types' },
    { id: 'CFO', name: 'CFO' },
    { id: 'CFE', name: 'CFE' },
    { id: 'OTHER', name: 'Other' },
    { id: 'SPECIAL', name: 'Special' },
  ];
  private skipNextPageSizeUpdate = false;

  private serviceMap: Record<
    number,
    { name: string; dept: string; type: string; code: string }
  > = {
    1: {
      name: 'Electrical NOC',
      dept: 'Electrical Inspectorate',
      type: 'CFO',
      code: 'CFO-EI1',
    },
    14: {
      name: 'Factory License',
      dept: 'Labour Department',
      type: 'CFE',
      code: 'CFE-LB1',
    },
    21: {
      name: 'MSME Registration',
      dept: 'Industries Dept',
      type: 'OTHER',
      code: 'OTH-MS1',
    },
  };

  loading: boolean = false;
  loadingDepartments = false;
  noDataMessage = 'No applications found';

  serverPagination = {
    currentPage: 1,
    pageSize: 10,
    totalItems: 0,
  };

  constructor(
    private apiService: GenericService,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.defineColumns();
    this.getAllDepartmentList();
    this.fetchAllServices();
    this.getApplications();
  }

  getAllDepartmentList(): void {
    this.loadingDepartments = true;
    this.apiService.getAllDepartmentNames().subscribe({
      next: (res: any) => {
        this.loadingDepartments = false;
        const list =
          res?.data && Array.isArray(res.data)
            ? res.data
            : res?.data?.departments || [];
        if (Array.isArray(list) && list.length) {
          const opts = list.map((d: any) => ({
            id: d.id ? String(d.id) : d.department_code || d.name || '',
            name:
              d.name ||
              d.department_name ||
              d.department ||
              d.name_of_enterprise ||
              '',
          }));
          this.departmentOptions = [
            { id: '', name: 'All Departments' },
            ...opts,
          ];
        }
      },
      error: (err) => {
        this.loadingDepartments = false;
        console.error('Error loading departments', err);
      },
    });
  }

  private fetchAllServices(): void {
    const user_id = localStorage.getItem('userId') || '';

    this.apiService
      .getByConditions(
        { user_id, per_page: 1000 }, // get all in one go
        'api/user/get-all-user-service-applications'
      )
      .subscribe({
        next: (res: any) => {
          if (res?.status === 1 && Array.isArray(res.data)) {
            const serviceMap = new Map<string, { id: string; name: string }>();

            res.data.forEach((app: any) => {
              if (
                app?.service_id != null &&
                app?.service_title_or_description
              ) {
                const idStr = String(app.service_id);
                if (!serviceMap.has(idStr)) {
                  serviceMap.set(idStr, {
                    id: idStr,
                    name: app.service_title_or_description,
                  });
                }
              }
            });

            this.serviceFilterOptions = [
              { id: null, name: 'All Services' },
              ...Array.from(serviceMap.values()),
            ];
          }
        },
        error: (err) => {
          console.error('Failed to fetch service options', err);
          this.serviceFilterOptions = [{ id: null, name: 'All Services' }];
        },
      });
  }

 

  getApplications(page: number = 1, perPage: number = 5): void {
    this.loading = true;
    const user_id = localStorage.getItem('userId') || '';

    const payload: any = {
      user_id,
      page: page,
      per_page: perPage,
    };

    if (this.fromDate) {
      payload.date_from = this.formatDateForBackend(this.fromDate);
    }
    if (this.toDate) {
      payload.date_to = this.formatDateForBackend(this.toDate);
    }

    if (this.department) payload.department_id = this.department;
    if (this.applicationType) payload.application_type = this.applicationType;
    if (this.selectedServiceId) {
      payload.service_id = Number(this.selectedServiceId);
    }

    this.apiService
      .getByConditions(payload, 'api/user/get-all-user-service-applications')
      .subscribe({
        next: (res: any) => {
          this.loading = false;
          if (res?.status === 1 && Array.isArray(res.data)) {
            this.filteredData = res.data.map((app: any) => {
              const rawDateStr =
                app.application_date || app.applicationDate || '';
              const rawDateObj: Date | null = rawDateStr
                ? new Date(rawDateStr)
                : null;
              const serviceName =
                app.service_title_or_description ||
                this.serviceMap[app.service_id]?.name ||
                `Service ${app.service_id}`;
              const deptName =
                app.department_name ||
                this.serviceMap[app.service_id]?.dept ||
                app.department ||
                'Unknown Department';
              const appTypeRaw = (
                app.application_type ||
                this.serviceMap[app.service_id]?.type ||
                ''
              ).toString();
              const appType = appTypeRaw ? appTypeRaw.toUpperCase() : '';

              return {
                id: app.application_id || app.id || 0,
                applicationNumber:
                  app.application_number ||
                  `${app.application_id || app.id || 0}`,
                applicationDate: rawDateObj ? this.formatDate(rawDateObj) : '',
                applicationDateRaw: rawDateObj,
                applicationFor: serviceName,
                departmentName: deptName,
                departmentId: String(app.department || ''),
                applicationType: appType,
                status: app.status || app.latest_workflow_status || '',
                renewalDate: app.renewal_date || 'NA',
                payment_status: this.toTitleCase(
                  app.payment_status || 'pending'
                ),
                nocDetailsId: String(app.application_id || 0),
                noc_master_id: String(app.service_id || app.noc_master_id || 0),
                nocMasterId:
                  this.serviceMap[app.service_id]?.code ||
                  app.nocMasterId ||
                  '',
                service_id: app.service_id || 0,
                _raw: app,
                service_mode: app.service_mode || 'native',
                is_certificate: app.is_certificate,
                already_rated: app.already_rated,
                rating: app.rating || '',
              } as ApplicationDataItem;
            });

            const serviceMap = new Map<string, { id: string; name: string }>();

            this.filteredData.forEach((item) => {
              const raw = item._raw;
              if (raw?.service_id && raw?.service_title_or_description) {
                const key = String(raw.service_id);
                if (!serviceMap.has(key)) {
                  serviceMap.set(key, {
                    id: key,
                    name: raw.service_title_or_description,
                  });
                }
              }
            });

           const meta = res.pagination || {};
        this.skipNextPageSizeUpdate = true;
      this.serverPagination = {
        currentPage: page,
        pageSize: perPage, 
        totalItems: meta.total || 0,
      };
      } else {
        this.filteredData = [];
        this.serverPagination.totalItems = 0;
      }
    },
    error: (err) => {
      this.loading = false;
      this.filteredData = [];
    },
      });
  }

private formatDateForBackend(input: string): string {
  const parsed = this.parseInputDate(input);
  if (!parsed) return '';
  const utcDate = new Date(Date.UTC(
    parsed.getFullYear(),
    parsed.getMonth(),
    parsed.getDate()
  ));
  return utcDate.toISOString().split('T')[0];
}

  defineColumns(): void {
    this.ApplicationColumns = [
      {
        key: 'applicationNumber',
        label: 'Application No.',
        type: 'text',
        // linkHref: (row: ApplicationDataItem) => {
        //   if (row.applicationType?.toLowerCase() === 'cfo') {
        //     return `#/cfo/electrical-inspectorate/${row.nocDetailsId}?mode=view`;
        //   } else if (row.applicationType?.toLowerCase() === 'other') {
        //     if (row.nocMasterId === 'OTH-ED1') {
        //       return `#/other-services/view-power-LT/${row.noc_master_id}/${row.nocDetailsId}`;
        //     } else if (row.nocMasterId === 'OTH-ED0') {
        //       return `#/other-services/view-power-temporary/${row.noc_master_id}/${row.nocDetailsId}`;
        //     }
        //   }
        //   return '#';
        // },
        // linkText: (row: ApplicationDataItem) => row.applicationNumber || '',
        // class: 'input-large-custom',
      },
      {
        key: 'applicationDate',
        label: 'Application Date',
        type: 'date',
        format: (value: string) => value || '',
      },
      {
        key: 'applicationFor',
        label: 'Service Name',
        class: 'input-large-custom2',
      },
      {
        key: 'departmentName',
        label: 'Department',
        class: 'input-large-custom wid-cus2',
      },
      {
        key: 'applicationType',
        label: 'Application Type',
      },
      {
        key: 'status',
        label: 'Status',
        type: 'status',
        format: (value: string) => this.toTitleCase(value),
        cellClass: (value: string) => {
          const v = (value || '').toString().toLowerCase();
          if (v === 'send_back' || v === 'send back' || v === 'sendback')
            return 'status-send-back';
          if (v === 'approved') return 'status-approved';
          if (v === 'submitted') return 'status-submitted';
          if (v === 'extra_payment' || v === 'extra payment')
            return 'status-extra-payment';
          if (v === 'rejected') return 'status-rejected';
          return 'status-default';
        },
      },
      {
        key: 'payment_status',
        label: 'Payment Status',
        type: 'text',
        format: (value: string) => this.toTitleCase(value),
        cellClass: () => 'input-large-custom wid-cus',
      },
      {
        key: 'renew',
        label: 'Query & Feedback',
        type: 'button',
        width: '120px',
        buttonText: (row: any) => {
          return row.already_rated ? `${row.rating}⭐` : 'Rating';
        },
        buttonColor: 'btn-success',
        buttonVisible: (row: any) =>
          row.payment_status.toLowerCase() === 'paid',
        onClick: (row: any) => {
          if (row.already_rated === false) {
            this.router.navigate([`/dashboard/service-feedback`, row.id]);
          }

          console.log(row.rating);
        },
      },
      {
        key: 'actions',
        label: 'Action',
        type: 'action',
        actions: [
          {
            label: 'Download Certificate',
            action: 'download',
            color: 'warn',
            visible: (row: ApplicationDataItem) => row.is_certificate !== null ,
            handler: (row: ApplicationDataItem) => {
              this.downloadCertificate(row.id);
            },
          },
          {
            label: 'View',
            action: 'view',
            color: 'warn',
            visible: (row) => row.id != null,
            handler: (row: ApplicationDataItem) => {
              const queryParams: any = {};
              if (row.service_mode === 'third_party') {
                queryParams.service = 'third_party';
              }
              this.router.navigate(
                [`/dashboard/user-app-view`, row.service_id, row.id],
                {
                  queryParams: queryParams,
                }
              );
            },
          },
          {
            label: (row: any) => {
              return row.status === 'draft' ? 'Edit Draft' : 'Re-submit';
            },
            action: 'view',
            color: 'warn',
            visible: (row) =>
              row.status === 'extra_payment' ||
              row.status === 'send_back' ||
              row.status === 'draft',
            handler: (row: ApplicationDataItem) => {
              const queryParams: any = { application_status: row.status };
              // console.log(row.nocDetailsId);
              if (row.status == 'draft') {
                queryParams.application_id = row.nocDetailsId;
              }

              this.router.navigate(
                [`/dashboard/service-application`, row.service_id],
                {
                  queryParams: queryParams,
                }
              );
            },
          },
        ],
        class: 'text-center',
      },
    ];
  }

  onPageChange(newPage: number): void {
    this.getApplications(newPage, this.serverPagination.pageSize);
  }

  onSearch(): void {
    this.serverPagination.currentPage = 1; // Reset to first page on new filters
    this.getApplications(1, this.serverPagination.pageSize);
  }

  onReset(): void {
    this.fromDate = '';
    this.toDate = '';
    this.department = '';
    this.applicationType = '';
    this.selectedServiceId = null;
    this.onSearch();
  }

  // Helper method for date parsing
  private parseInputDate(input: string | Date): Date | null {
    if (!input) return null;
    if (input instanceof Date && !isNaN(input.getTime())) return input;
    if (typeof input === 'string') {
      if (/^\d{4}-\d{2}-\d{2}$/.test(input)) {
        const [y, m, d] = input.split('-').map(Number);
        return new Date(y, m - 1, d);
      }
      if (/^\d{2}[/-]\d{2}[/-]\d{4}$/.test(input)) {
        const [d, m, y] = input.split(/[-/]/).map(Number);
        return new Date(y, m - 1, d);
      }
    }
    return null;
  }

  downloadCertificate(appId: number): void {
    const baseUrl = 'http://swaagatstaging.tripura.cloud/';
    this.apiService.downloadUserServiceCertificate(appId).subscribe({
      next: (res: any) => {
        if (res.status === 1 && res?.download_url) {
          const openPdf = baseUrl + res.download_url;
          window.open(openPdf, '_blank');
        } else {
          this.error =
            res?.message || 'PDF file not found for this application.';
          Swal.fire({
            icon: 'warning',
            title: 'Warning',
            text: this.error || 'PDF file not found for this application.',
            confirmButtonText: 'OK',
          });
        }
      },
      error: (err: any) => {
        Swal.fire({
          icon: 'error',
          title: 'Download Failed',
          text:
            err?.error?.message || 'PDF file not found for this application.',
          confirmButtonText: 'Retry',
        });
      },
    });
  }

  formatDate(date: string | Date): string {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    if (!(d instanceof Date) || isNaN(d.getTime())) return '';

    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1)
      .toString()
      .padStart(2, '0')}/${d.getFullYear()}`;
  }
  toTitleCase(str?: string): string {
    if (!str) return '';
    const s = str.replace(/_/g, ' ').toLowerCase();
    return s.replace(
      /\w\S*/g,
      (txt) => txt.charAt(0).toUpperCase() + txt.substr(1)
    );
  }

  handleModifyNavigation(row: ApplicationDataItem): void {
    let route = '/not-found';

    if (row.applicationType?.toLowerCase() === 'cfo') {
      route = `/cfo/electrical-inspectorate/${row.nocDetailsId}/modify`;
    } else if (row.applicationType?.toLowerCase() === 'other') {
      if (row.nocMasterId === 'OTH-ED1') {
        route = `/other-services/modify-power-LT/${row.noc_master_id}/${row.nocDetailsId}`;
      } else if (row.nocMasterId === 'OTH-ED0') {
        route = `/other-services/modify-power-temporary/${row.noc_master_id}/${row.nocDetailsId}`;
      }
    }

    this.router.navigate([route]);
  }

  openTransactionHistoryDialog(row: ApplicationDataItem): void {
    this.dialog.open(TransactionHistoryDialogComponent, {
      width: '600px',
      data: row,
    });
  }

  onRowAction(event: TableRowAction): void {
    console.log('Row action:', event);
    if (event.action === 'download') {
      this.downloadCertificate(event.row.id);
    }
  }

onPageSizeChange(newSize: number): void {
  if (this.skipNextPageSizeUpdate) {
    this.skipNextPageSizeUpdate = false;
    return;
  }
  this.serverPagination.pageSize = newSize;
  this.getApplications(1, newSize);
}
}
