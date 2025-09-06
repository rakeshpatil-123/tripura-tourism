// application-list.component.ts
import { Component } from '@angular/core';
import { ButtonComponent } from '../../../shared/component/button-component/button.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  DynamicTableComponent,
  TableColumn,
  TableRowAction,
} from '../../../shared/component/table/table.component';
import { IlogiSelectComponent } from '../../../customInputComponents/ilogi-select/ilogi-select.component';
import { IlogiInputDateComponent } from '../../../customInputComponents/ilogi-input-date/ilogi-input-date.component';

// --- Import for Dialog ---
import { MatDialog } from '@angular/material/dialog';

// --- Import for Navigation ---
import { Router } from '@angular/router';
import { TransactionHistoryDialogComponent } from './transaction-history';

interface ApplicationDataItem {
  nocDetailsId: string;
  noc_master_id: string;
  nocMasterId: string;
  applicationNumber: string;
  applicationDate: string;
  applicationFor: string;
  departmentName: string;
  applicationType: string;
  status: string;
  renewalDate: string;
  dueDate: string;
  payment_status: string;
}

@Component({
  selector: 'app-application-search-page',
  templateUrl: './application-list.component.html',
  styleUrls: ['./application-list.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    ButtonComponent,
    DynamicTableComponent,
    IlogiSelectComponent,
    IlogiInputDateComponent,
  ],
  standalone: true,
})
export class ApplicationSearchPageComponent {
  constructor(private dialog: MatDialog, private router: Router) {}

  fromDate: string = '';
  toDate: string = '';
  department: string = '';
  applicationType: string = '';

  departmentOptions = [
    { id: '', name: 'Select Department' },
    { id: 'Electrical Inspectorate', name: 'Electrical Inspectorate' },
    {
      id: 'Tripura State Electricity Corporation Ltd',
      name: 'Tripura State Electricity Corporation Ltd',
    },
    { id: 'Co-Operative Registrar', name: 'Co-Operative Registrar' },
  ];

  applicationTypeOptions = [
    { id: '', name: 'Select Application Type' },
    { id: 'CFO', name: 'CFO' },
    { id: 'CFE', name: 'CFE' },
    { id: 'Renewal', name: 'Renewal' },
    { id: 'OTHER', name: 'Other' },
  ];

  ApplicationColumns: TableColumn[] = [
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
      label: 'Application date',
      type: 'date',
      format: (value: string) => {
        if (!value) return '';
        const parts = value.split('-');
        if (parts.length === 3) {
          return `${parts[2]}/${parts[1]}/${parts[0]}`;
        }
        return value;
      },
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

      cellClass: (value: string, row: any) => {
        if (value === 'Clarification Required') {
          return 'status-clarification-required input-large-custom wid-cus ';
        } else if (value === 'Submitted') {
          return 'status-submitted input-large-custom wid-cus';
        }
        return 'input-large-custom wid-cus badge';
      },
    },
    {
      key: 'payment_status',
      label: 'Payment Status',
      type: 'custom',
      format: (value: string, row: ApplicationDataItem) => {
        return `<a href="" class="clkable text-decoration-none">${
          value || ''
        }</a>`;
      },
      cellClass: () => 'input-large-custom wid-cus',
    },
    {
      key: 'renewalDate',
      label: 'Renewal Date',
      format: (value: string) => (value === 'NA' ? 'NA' : value),
    },
    {
      key: 'dueDate',
      label: 'Due Date',
      type: 'date',
      format: (value: string) => {
        if (!value) return '';
        const parts = value.split('-');
        if (parts.length === 3) {
          return `${parts[2]}/${parts[1]}/${parts[0]}`;
        }
        return value;
      },
    },
    {
      key: 'actions',
      label: 'Action',
      type: 'action',
      actions: [
        {
          label: 'View',
          action: 'view',
          icon: '👁️',
          color: 'primary',
          handler: (row: ApplicationDataItem) => {
            this.router.navigate([`/dashboard`]);
            console.log('View action clicked for:', row);
          },
        },
        {
          label: 'Modify',
          action: 'modify',
          icon: '✏️',
          color: 'accent',
          handler: (row: ApplicationDataItem) => {
            console.log('Modify action clicked for:', row);
            this.handleModifyNavigation(row);
          },
        },
        {
          label: 'Transaction History',
          action: 'transactionHistory',
          icon: '💳',
          color: 'success',
          handler: (row: ApplicationDataItem) => {
            console.log('Transaction History action clicked for:', row);
            this.openTransactionHistoryDialog(row);
          },
        },
      ],
      class: 'text-center',
    },
  ];

  ApplicationData = [
    {
      nocDetailsId: '395118',
      noc_master_id: '19142',
      nocMasterId: 'CFO-EI1',
      applicationNumber: 'CFO-54-000011',
      download_estimate: '',
      download_noc: '',
      download_rejection: '',
      applicationDate: '2024-06-18',
      applicationFor: 'Application for NOC from Electrical Inspectorate',
      departmentName: 'Electrical Inspectorate',
      applicationType: 'cfo',
      status: 'Clarification Required',
      renewalDate: 'NA',
      dueDate: '',
      payment_status: 'Success',
      has_form: '1',
      extraPaymentAmount: '',
    },
    {
      nocDetailsId: '399692',
      noc_master_id: '13640',
      nocMasterId: 'OTH-ED1',
      applicationNumber: 'OTH-13-000002',
      download_estimate: '',
      download_noc: '',
      download_rejection: '',
      applicationDate: '2024-06-28',
      applicationFor: 'Application for Estimation of power connectivity - LT',
      departmentName: 'Tripura State Electricity Corporation Ltd',
      applicationType: 'other',
      status: 'Submitted',
      renewalDate: 'NA',
      dueDate: '2024-07-05',
      payment_status: 'Success',
      has_form: '1',
      extraPaymentAmount: '',
    },
    {
      nocDetailsId: '399158',
      noc_master_id: '28383',
      nocMasterId: 'OTH-ED0',
      applicationNumber: 'OTH-89-000002',
      download_estimate: '',
      download_noc: '',
      download_rejection: '',
      applicationDate: '2024-06-26',
      applicationFor:
        'Application for Estimation of Temporary Connectivity (CFE)',
      departmentName: 'Tripura State Electricity Corporation Ltd',
      applicationType: 'other',
      status: 'Submitted',
      renewalDate: '',
      dueDate: '2024-07-11',
      payment_status: 'Success',
      has_form: '1',
      extraPaymentAmount: '',
    },
  ];

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

    console.log('Navigating to:', route);

    this.router.navigate([route]);
  }

  openTransactionHistoryDialog(row: ApplicationDataItem): void {
    const dialogRef = this.dialog.open(TransactionHistoryDialogComponent, {
      width: '600px',
      data: row,
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log('Transaction history dialog closed');
    });
  }

  onRowAction(event: TableRowAction): void {
    const { action, row } = event;
    console.log(`Action '${action}' triggered on row:`, row);

    switch (action) {
      case 'viewFromEmitter':
        break;

      default:
        console.log('Unhandled action from emitter:', action);
    }
  }

  onSearch(): void {
    console.log('Searching with:', {
      fromDate: this.fromDate,
      toDate: this.toDate,
      department: this.department,
      applicationType: this.applicationType,
    });
  }

  onReset(): void {
    this.fromDate = '';
    this.toDate = '';
    this.department = '';
    this.applicationType = '';
  }
}





/* 


// application-list.component.ts
import { Component } from '@angular/core';
import { ButtonComponent } from '../../../shared/component/button-component/button.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  DynamicTableComponent,
  TableColumn,
  TableRowAction,
} from '../../../shared/component/table/table.component';

// --- Import for Dialog ---
import { MatDialog } from '@angular/material/dialog';

// --- Import for Navigation ---
import { Router } from '@angular/router';
import { TransactionHistoryDialogComponent } from './transaction-history';
import { GenericService } from '../../../_service/generic/generic.service';

interface ApplicationDataItem {
  nocDetailsId: string;
  noc_master_id: string;
  nocMasterId: string;
  applicationNumber: string;
  applicationDate: string;
  applicationFor: string;
  departmentName: string;
  applicationType: string;
  status: string;
  renewalDate: string;
  dueDate: string;
  payment_status: string;
}

@Component({
  selector: 'app-application-search-page',
  templateUrl: './application-list.component.html',
  styleUrls: ['./application-list.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    DynamicTableComponent,
  ],
  standalone: true,
})
export class ApplicationSearchPageComponent {
  constructor( private apiService : GenericService) {}

  fromDate: string = '';
  toDate: string = '';
  department: string = '';
  applicationType: string = '';



 
ngOnInit(): void {
  this.getApplications();
}







  

 


getApplications(): void{
this.apiService.getByConditions({},'api/user/service-application-view').subscribe({
  next: (res:any)=>{
    if(res && res.status ===1 && Array.isArray(res.data)){
      // this.ApplicationData = res.data;
      console.log("Applications",res.data);
      
    }
  }

});

}}
*/