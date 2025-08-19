// clearence.component.ts
import { Component } from '@angular/core';

// Import your actual dynamic table and its types
import { DynamicTableComponent, TableColumn, TableRowAction } from '../../../../shared/component/table/table.component';
// import { IlogiFileUploadComponent } from '../../../../customInputComponents/ilogi-file-upload/ilogi-file-upload.component';

interface NocDataItem {
  id: number;
  certificate_number: string;
  certificate_date: string;
  type: string;
  name_of_noc: string;
  department: string;
  valid_till: string;
}

@Component({
  selector: 'app-clearence',
  templateUrl: './clearence.component.html',
  styleUrls: ['./clearence.component.scss'],
  standalone: true,
  imports: [
    DynamicTableComponent, // ✅ Must be standalone and imported
  ],
})
export class ClearenceComponent {
  // Sample NOC data
  nocData: NocDataItem[] = [
    {
      id: 1,
      certificate_number: 'CL-2024-0001',
      certificate_date: '2024-01-15',
      type: 'Electrical Clearance',
      name_of_noc: 'Fire Safety NOC',
      department: 'Electrical Inspectorate',
      valid_till: '2025-01-15',
    },
    {
      id: 2,
      certificate_number: 'CL-2024-0002',
      certificate_date: '2024-02-20',
      type: 'Building Safety',
      name_of_noc: 'Structural Stability Certificate',
      department: 'Urban Development',
      valid_till: '2025-02-20',
    },
    {
      id: 3,
      certificate_number: 'CL-2024-0003',
      certificate_date: '2024-03-10',
      type: 'Environmental Clearance',
      name_of_noc: 'Pollution Control NOC',
      department: 'Environment Department',
      valid_till: '2025-03-10',
    },
  ];

  // Define columns for the dynamic table
  columns: TableColumn[] = [
    {
      key: 'id',
      label: 'Sl No.',
      type: 'text',
      sortable: true,
      class: 'text-center',
    },
    {
      key: 'certificate_number',
      label: 'Clearance Number',
      type: 'text',
      sortable: true,
    },
    {
      key: 'certificate_date',
      label: 'Clearance Date',
      type: 'date',
      sortable: true,
    },
    {
      key: 'type',
      label: 'Clearance Type',
      sortable: true,
    },
    {
      key: 'name_of_noc',
      label: 'Clearance Name',
      sortable: true,
    },
    {
      key: 'department',
      label: 'Department',
      sortable: true,
    },
    {
      key: 'valid_till',
      label: 'Valid Till',
      type: 'date',
      sortable: true,
    },
    {
      key: 'actions',
      label: 'Action',
      type: 'action',
      actions: [
        {
          label: 'View',
          icon: '👁️',
          color: 'primary',
          handler: (row: NocDataItem) => {
            alert(`Viewing: ${row.certificate_number}`);
          },
        },
        {
          label: 'Download',
          icon: '⬇️',
          color: 'accent',
          handler: (row: NocDataItem) => {
            alert(`Downloading: ${row.certificate_number}.pdf`);
          },
        },
        {
          label: 'Renew',
          icon: '🔄',
          color: 'success',
          handler: (row: NocDataItem) => {
            alert(`Renewing: ${row.certificate_number}`);
          },
        },
      ],
      class: 'text-center',
    },
  ];

  // Table inputs
  pageSize = 5;
  searchable = true;
  showPagination = true;

  // Handle row actions
  onRowAction(event: TableRowAction): void {
    console.log(`Action triggered: ${event.action}`, event.row);
  }
}