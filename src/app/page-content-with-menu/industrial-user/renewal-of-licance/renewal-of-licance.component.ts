import { Component } from '@angular/core';
import {
  DynamicTableComponent,
  TableColumn,
} from '../../../shared/component/table/table.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-renewal-of-licance',
  imports: [DynamicTableComponent],
  templateUrl: './renewal-of-licance.component.html',
  styleUrl: './renewal-of-licance.component.scss',
})
export class RenewalOfLicanceComponent {
  constructor(private dialog: MatDialog) {}

  columns: TableColumn[] = [
    {
      key: 'id',
      label: 'SL No',
      type: 'number',
      sortable: true,
      width: '80px',
    },
    {
      key: 'department',
      label: 'Department',
      type: 'text',
      sortable: true,
      width: '200px',
    },
    {
      key: 'noc_license',
      label: 'NOC/Licenses',
      type: 'text',
      sortable: true,
      width: '250px',
    },
    {
      key: 'renewal_date',
      label: 'Renewal Date',
      type: 'date',
      sortable: true,
      width: '150px',
    },
    {
      key: 'status',
      label: 'Status',
      type: 'status',
      sortable: true,
      width: '120px',
    },
    {
      key: 'actions',
      label: 'Action',
      type: 'action',
      sortable: false,
      width: '150px',
      actions: [
        {
          label: 'View Details',
          icon: '👁️',
          color: 'primary',
          action: 'view',
          handler: (row: any) => {
            this.viewDetails(row);
          },
        },
        {
          label: 'Renew Now',
          icon: '🔄',
          color: 'primary',
          action: 'renew',
          handler: (row: any) => {
            this.renewLicense(row);
          },
        },
        {
          label: 'History',
          icon: '🕒',
          color: 'accent',
          action: 'history',
          handler: (row: any) => {
            this.viewHistory(row);
          },
        },
      ],
    },
  ];

  renewalData = [
    {
      id: 1,
      department: 'Fire & Emergency Services',
      noc_license: 'Fire Safety Certificate',
      renewal_date: '2024-03-15',
      status: 'Pending',
    },
    {
      id: 2,
      department: 'Environment Department',
      noc_license: 'Pollution Control NOC',
      renewal_date: '2024-02-28',
      status: 'Overdue',
    },
    {
      id: 3,
      department: 'Municipal Corporation',
      noc_license: 'Trade License',
      renewal_date: '2024-04-10',
      status: 'Upcoming',
    },
    {
      id: 4,
      department: 'Health Department',
      noc_license: 'Food Safety License',
      renewal_date: '2024-01-20',
      status: 'Overdue',
    },
    {
      id: 5,
      department: 'Labor Department',
      noc_license: 'Shop & Establishment License',
      renewal_date: '2024-05-05',
      status: 'Upcoming',
    },
    {
      id: 6,
      department: 'Telecom Department',
      noc_license: 'Wireless Equipment License',
      renewal_date: '2024-03-30',
      status: 'Pending',
    },
  ];

  handleRowAction(event: any) {
    console.log('Row action triggered:', event);
    // Handle any actions not covered by direct handlers
  }

  viewDetails(row: any) {
    console.log('Viewing details for:', row);
    alert(`Viewing details for: ${row.noc_license}`);
    // In real app, open dialog or navigate to details page
  }

  renewLicense(row: any) {
    console.log('Renewing license:', row);
    alert(`Initiating renewal for: ${row.noc_license}`);
    // In real app, navigate to renewal form or open renewal dialog
  }

  viewHistory(row: any) {
    console.log('Viewing history for:', row);
    alert(`Viewing history for: ${row.noc_license}`);
    // In real app, open history dialog or navigate to history page
  }
}
