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

interface ApplicationDataItem {
  id: number;
  applicationNumber: string; // We'll generate this as "APP-{id}"
  applicationDate: string; // formatted from application_date
  applicationFor: string; // You'll need service name — for now, use service_id
  departmentName: string; // Map service_id → department (mock or API)
  applicationType: string; // Map service_id → type (CFO/CFE/etc)
  status: string;
  renewalDate: string;
  dueDate: string; // max_processing_date
  payment_status: string;
  nocDetailsId: string; // = id
  noc_master_id: string; // = service_id
  nocMasterId: string; // You can map service_id → code like "CFO-EI1"
  service_id: number;
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
  toDate: string = '';
  department: string = '';
  applicationType: string = '';

  // Mock mappings — replace with real API if available
  private serviceMap: Record<number, { name: string; dept: string; type: string; code: string }> = {
    1: { name: 'Electrical NOC', dept: 'Electrical Inspectorate', type: 'CFO', code: 'CFO-EI1' },
    14: { name: 'Factory License', dept: 'Labour Department', type: 'CFE', code: 'CFE-LB1' },
    21: { name: 'MSME Registration', dept: 'Industries Dept', type: 'OTHER', code: 'OTH-MS1' },
    // Add more as needed
  };

  departmentOptions = [
    { id: '', name: 'All Departments' },
    { id: 'Electrical Inspectorate', name: 'Electrical Inspectorate' },
    { id: 'Labour Department', name: 'Labour Department' },
    { id: 'Industries Dept', name: 'Industries Dept' },
  ];

  applicationTypeOptions = [
    { id: '', name: 'All Types' },
    { id: 'CFO', name: 'CFO' },
    { id: 'CFE', name: 'CFE' },
    { id: 'OTHER', name: 'Other' },
  ];

  constructor(
    private apiService: GenericService,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getApplications();
    this.defineColumns();
  }

  getApplications(): void {
const user_id = localStorage.getItem('userId') || '';


    this.apiService
      .getByConditions({user_id}, 'api/user/get-all-user-service-applications')
      .subscribe({
        next: (res: any) => {
          if (res?.status === 1 && res?.data?.application) {
            const rawData = res.data.application;

            this.ApplicationData = rawData.map((app: any) => {
              const serviceInfo = this.serviceMap[app.service_id] || {
                name: `Service ${app.service_id}`,
                dept: 'Unknown Department',
                type: 'OTHER',
                code: `UNKNOWN-${app.service_id}`,
              };

              return {
                id: app.id,
                applicationNumber: `APP-${app.id}`,
                applicationDate: this.formatDate(app.application_date),
                applicationFor: serviceInfo.name,
                departmentName: serviceInfo.dept,
                applicationType: serviceInfo.type,
                status: app.status,
                renewalDate: 'NA', // Update if you have renewal logic
                dueDate: this.formatDate(app.max_processing_date),
                payment_status: app.payment_status || 'pending',
                nocDetailsId: String(app.id),
                noc_master_id: String(app.service_id),
                nocMasterId: serviceInfo.code,
                service_id: app.service_id,
              };
            });

            this.filteredData = [...this.ApplicationData];
          } else {
            console.warn('⚠️ No applications found or invalid response');
            this.ApplicationData = [];
            this.filteredData = [];
          }
        },
        error: (err) => {
          console.error('❌ API Error:', err);
          this.ApplicationData = [];
          this.filteredData = [];
        },
      });
  }

  defineColumns(): void {
    this.ApplicationColumns = [
      {
        key: 'applicationNumber',
        label: 'Application Number',
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
        label: 'Application For – NOC/License',
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
        format: (value: string) => value?.toUpperCase() || '',
      },
      {
        key: 'status',
        label: 'Status',
        type: 'status',
        cellClass: (value: string) => {
          if (value === 'send_back') return 'status-send-back';
          if (value === 'approved') return 'status-approved';
          if (value === 'submitted') return 'status-submitted';
          return '';
        },
      },
      {
        key: 'payment_status',
        label: 'Payment Status',
        type: 'text',
        cellClass: () => 'input-large-custom wid-cus',
      },
      {
        key: 'dueDate',
        label: 'Due Date',
        type: 'date',
        format: (value: string) => value || '',
      },
      {
        key: 'actions',
        label: 'Action',
        type: 'action',
        actions: [
          {
            label: 'View',
            action: 'view',
            icon: 'visibility',
            color: 'primary',
            handler: (row: ApplicationDataItem) => {
              this.router.navigate([`/dashboard/service-view`, row.id]);
            },
          },
          {
            label: 'Modify',
            action: 'modify',
            icon: 'edit',
            color: 'accent',
            handler: (row: ApplicationDataItem) => {
              this.handleModifyNavigation(row);
            },
          },
          {
            label: 'Transaction History',
            action: 'transactionHistory',
            icon: 'receipt',
            color: 'success',
            handler: (row: ApplicationDataItem) => {
              this.openTransactionHistoryDialog(row);
            },
          },
        ],
        class: 'text-center',
      },
    ];
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1)
      .toString()
      .padStart(2, '0')}/${d.getFullYear()}`;
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
  }

  onSearch(): void {
    let result = [...this.ApplicationData];

    // Filter by date range
    if (this.fromDate || this.toDate) {
      result = result.filter((row) => {
        const appDate = new Date(row.applicationDate.split('/').reverse().join('-')); // Convert DD/MM/YYYY → YYYY-MM-DD
        const from = this.fromDate ? new Date(this.fromDate.split('/').reverse().join('-')) : null;
        const to = this.toDate ? new Date(this.toDate.split('/').reverse().join('-')) : null;

        if (from && appDate < from) return false;
        if (to && appDate > to) return false;
        return true;
      });
    }

    // Filter by department
    if (this.department) {
      result = result.filter((row) => row.departmentName === this.department);
    }

    // Filter by application type
    if (this.applicationType) {
      result = result.filter((row) => row.applicationType === this.applicationType);
    }

    this.filteredData = result;
  }

  onReset(): void {
    this.fromDate = '';
    this.toDate = '';
    this.department = '';
    this.applicationType = '';
    this.filteredData = [...this.ApplicationData];
  }
}