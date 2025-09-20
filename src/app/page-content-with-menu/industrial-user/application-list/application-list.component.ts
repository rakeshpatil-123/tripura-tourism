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
  // keep original raw object in case you need it
  _raw?: any;
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
  ],
})
export class ApplicationSearchPageComponent implements OnInit {
  ApplicationData: ApplicationDataItem[] = [];
  filteredData: ApplicationDataItem[] = [];
  ApplicationColumns: TableColumn[] = [];

  fromDate: string = '';
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
  private serviceMap: Record<number, { name: string; dept: string; type: string; code: string }> = {
    1: { name: 'Electrical NOC', dept: 'Electrical Inspectorate', type: 'CFO', code: 'CFO-EI1' },
    14: { name: 'Factory License', dept: 'Labour Department', type: 'CFE', code: 'CFE-LB1' },
    21: { name: 'MSME Registration', dept: 'Industries Dept', type: 'OTHER', code: 'OTH-MS1' },
  };

  loading = false;
  loadingDepartments = false;
  appId: number | null = null;
  noDataMessage = 'No applications found';

  constructor(
    private apiService: GenericService,
    private dialog: MatDialog,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.defineColumns();
    this.getAllDepartmentList();
    this.getApplications();
  }

  getAllDepartmentList(): void {
    this.loadingDepartments = true;
    this.apiService.getAllDepartmentNames().subscribe({
      next: (res: any) => {
        this.loadingDepartments = false;
        const list = (res?.data && Array.isArray(res.data)) ? res.data : (res?.data?.departments || []);
        if (Array.isArray(list) && list.length) {
          const opts = list.map((d: any) => {
            return {
              id: d.id ? String(d.id) : (d.department_code || d.name || ''),
              name: d.name || d.department_name || d.department || (d.name_of_enterprise || '')
            };
          });
          this.departmentOptions = [{ id: '', name: 'All Departments' }, ...opts];
        } else {
          this.departmentOptions = [{ id: '', name: 'All Departments' }];
        }
      },

      error: (err) => {
        this.loadingDepartments = false;
        console.error('Error loading departments', err);
        this.departmentOptions = [{ id: '', name: 'All Departments' }];
      },
    });
  }

  getApplications(): void {
    this.loading = true;
    const user_id = localStorage.getItem('userId') || '';

    this.apiService
      .getByConditions({ user_id }, 'api/user/get-all-user-service-applications')
      .subscribe({
        next: (res: any) => {
          this.loading = false;
          if (res?.status === 1 && res?.data) {
            const rawData = Array.isArray(res.data.application) ? res.data.application : (Array.isArray(res.data) ? res.data : (res?.data?.application || []));
            if (!rawData || rawData.length === 0) {
              this.ApplicationData = [];
              this.filteredData = [];
              return;
            }

            this.ApplicationData = rawData.map((app: any) => {
              const rawDateStr = app.application_date || app.applicationDate || '';
              const rawDateObj: Date | null = rawDateStr ? new Date(rawDateStr) : null;

              const serviceName =
                app.service_title_or_description ||
                this.serviceMap[app.service_id]?.name ||
                `Service ${app.service_id}`;

              const deptName =
                app.department_name ||
                this.serviceMap[app.service_id]?.dept ||
                (app.department || 'Unknown Department');

              const appTypeRaw =
                (app.application_type || this.serviceMap[app.service_id]?.type || '').toString();
              const appType = appTypeRaw ? appTypeRaw.toUpperCase() : '';

              return {
                id: app.application_id || app.id || 0,
                applicationNumber: app.application_number || `${app.application_id || app.id || 0}`,
                applicationDate: rawDateObj ? this.formatDate(rawDateObj) : '',
                applicationDateRaw: rawDateObj,
                applicationFor: serviceName,
                departmentName: deptName,
                departmentId: String(app.department || ''),
                applicationType: appType,
                status: app.status || app.latest_workflow_status || '',
                renewalDate: app.renewal_date || 'NA',
                payment_status: this.toTitleCase(app.payment_status || 'pending'),
                nocDetailsId: String(app.application_id || app.id || 0),
                noc_master_id: String(app.service_id || app.noc_master_id || 0),
                nocMasterId: this.serviceMap[app.service_id]?.code || (app.nocMasterId || ''),
                service_id: app.service_id || 0,
                _raw: app,
              } as ApplicationDataItem;
            });

            this.filteredData = [...this.ApplicationData];
          } else {
            this.ApplicationData = [];
            this.filteredData = [];
          }
        },
        error: (err) => {
          this.loading = false;
          this.ApplicationData = [];
          this.filteredData = [];
        },
      });
  }

  defineColumns(): void {
    this.ApplicationColumns = [
      {
        key: 'applicationNumber',
        label: 'Application No.',
        type: 'link',
        linkHref: (row: ApplicationDataItem) => {
          if (row.applicationType?.toLowerCase() === 'cfo') {
            return `#/cfo/electrical-inspectorate/${row.nocDetailsId}?mode=view`;
          } else if (row.applicationType?.toLowerCase() === 'other') {
            if (row.nocMasterId === 'OTH-ED1') {
              return `#/other-services/view-power-LT/${row.noc_master_id}/${row.nocDetailsId}`;
            } else if (row.nocMasterId === 'OTH-ED0') {
              return `#/other-services/view-power-temporary/${row.noc_master_id}/${row.nocDetailsId}`;
            }
          }
          return '#';
        },
        linkText: (row: ApplicationDataItem) => row.applicationNumber || '',
        class: 'input-large-custom',
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
          if (v === 'send_back' || v === 'send back' || v === 'sendback') return 'status-send-back';
          if (v === 'approved') return 'status-approved';
          if (v === 'submitted') return 'status-submitted';
          if (v === 'extra_payment' || v === 'extra payment') return 'status-extra-payment';
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
        key: 'actions',
        label: 'Action',
        type: 'action',
        actions: [
          {
            label: 'Download Certificate',
            action: 'download',
            color: 'warn',
            visible: (row: ApplicationDataItem) =>
              (row.status || '').toLowerCase() === 'approved',
            handler: (row: ApplicationDataItem) => {
              this.downloadCertificate(row.id);
            },
          },
        ],
        class: 'text-center',
      }

      // {
      //   key: 'dueDate',
      //   label: 'Due Date',
      //   type: 'date',
      //   format: (value: string) => value || '',
      // },
      // {
      //   key: 'actions',
      //   label: 'Action',
      //   type: 'action',
      //   actions: [
      //     {
      //       label: 'View',
      //       action: 'view',
      //       icon: 'visibility',
      //       color: 'primary',
      //       handler: (row: ApplicationDataItem) => {
      //         this.router.navigate([`/dashboard/service-view`, row.id]);
      //       },
      //     },
      //     {
      //       label: 'Modify',
      //       action: 'modify',
      //       icon: 'edit',
      //       color: 'accent',
      //       handler: (row: ApplicationDataItem) => {
      //         this.handleModifyNavigation(row);
      //       },
      //     },
      //     {
      //       label: 'Transaction History',
      //       action: 'transactionHistory',
      //       icon: 'receipt',
      //       color: 'success',
      //       handler: (row: ApplicationDataItem) => {
      //         this.openTransactionHistoryDialog(row);
      //       },
      //     },
      //   ],
      //   class: 'text-center',
      // },
    ];
  }

  formatDate(date: string | Date): string {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    if (!(d instanceof Date) || isNaN(d.getTime())) return '';

    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
  }
  toTitleCase(str?: string): string {
    if (!str) return '';
    const s = str.replace(/_/g, ' ').toLowerCase();
    return s.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1));
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

  onSearch(): void {
    let result = [...this.ApplicationData];

    if (this.fromDate) {
      const parsedFrom = this.parseInputDate(this.fromDate);
      if (parsedFrom) {
        result = result.filter((row) =>
          row.applicationDateRaw && row.applicationDateRaw >= parsedFrom
        );
      }
    }
    if (this.department) {
      result = result.filter((row) => row.departmentId === this.department);
    }
    if (this.applicationType) {
      result = result.filter((row) => row.applicationType?.toLowerCase() === this.applicationType.toLowerCase());
    }

    this.filteredData = result;
  }

  onReset(): void {
    this.fromDate = '';
    this.department = '';
    this.applicationType = '';
    this.filteredData = [...this.ApplicationData];
  }
  private parseInputDate(input: string | Date): Date | null {
    if (!input) return null;
    if (input instanceof Date && !isNaN(input.getTime())) {
      return input;
    }
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
        if (res?.download_url) {
          const openPdf = baseUrl + res.download_url;
          window.open(openPdf, '_blank');
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'PDF URL not found. Please try again.',
            confirmButtonText: 'OK',
          });
        }
      },
      error: () => {
        Swal.fire({
          icon: 'error',
          title: 'Download Failed',
          text: 'Something went wrong while fetching the certificate.',
          confirmButtonText: 'Retry',
        });
      },
    });
  }
}