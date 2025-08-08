import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { PDynamicTableComponent } from '../../../shared/p-dynamic-table/p-dynamic-table.component';
import { DynamicTableComponent } from '../../../shared/component/table/table.component';
import { TableColumn } from '../../../shared/p-dynamic-table/p-table.model';

@Component({
  selector: 'app-clearance-dialog',
  template: `
    <div class="dialog-container">
      <div class="dialog-header">
        <h2>Clearance Details</h2>
        <button class="close-btn" (click)="closeDialog()">×</button>
      </div>

      <div class="dialog-content">
        <div class="loading" *ngIf="loading">
          <p>Loading clearance details...</p>
        </div>

        <div class="details" *ngIf="!loading && selectedRow">
          <div class="detail-row">
            <span class="label">ID:</span>
            <span class="value">{{ selectedRow.id }}</span>
          </div>
          <div class="detail-row">
            <span class="label">Certificate Number:</span>
            <span class="value">{{ selectedRow.certificate_number }}</span>
          </div>
          <div class="detail-row">
            <span class="label">Certificate Date:</span>
            <span class="value">{{ selectedRow.certificate_date }}</span>
          </div>
          <div class="detail-row">
            <span class="label">Clearance Type:</span>
            <span class="value">{{ selectedRow.type }}</span>
          </div>
          <div class="detail-row">
            <span class="label">Clearance Name:</span>
            <span class="value">{{ selectedRow.name_of_noc }}</span>
          </div>
          <div class="detail-row">
            <span class="label">Department:</span>
            <span class="value">{{ selectedRow.department }}</span>
          </div>
          <div class="detail-row">
            <span class="label">Valid Till:</span>
            <span class="value">{{ selectedRow.valid_till }}</span>
          </div>

          <!-- Simulated API response data -->
          <div class="api-data" *ngIf="apiResponse">
            <h3>Additional Details (from API)</h3>
            <div class="detail-row">
              <span class="label">Status:</span>
              <span class="value status-active">{{ apiResponse.status }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Issued By:</span>
              <span class="value">{{ apiResponse.issuedBy }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Remarks:</span>
              <span class="value">{{ apiResponse.remarks }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="dialog-actions">
        <button class="btn btn-secondary" (click)="closeDialog()">Close</button>
        <button class="btn btn-primary" (click)="editItem()">Edit</button>
      </div>
    </div>
  `,
  styles: [
    `
      .dialog-container {
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        min-width: 500px;
        max-width: 90vw;
      }

      .dialog-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px 24px 16px;
        border-bottom: 1px solid #eee;
      }

      .dialog-header h2 {
        margin: 0;
        font-size: 20px;
        color: #333;
      }

      .close-btn {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #999;
        padding: 0;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .close-btn:hover {
        color: #333;
      }

      .dialog-content {
        padding: 20px 24px;
        max-height: 70vh;
        overflow-y: auto;
      }

      .loading {
        text-align: center;
        padding: 30px;
        color: #666;
      }

      .detail-row {
        display: flex;
        margin-bottom: 12px;
        padding: 8px 0;
        border-bottom: 1px solid #f5f5f5;
      }

      .detail-row:last-child {
        border-bottom: none;
      }

      .label {
        font-weight: 600;
        color: #555;
        width: 150px;
        flex-shrink: 0;
      }

      .value {
        flex: 1;
        color: #333;
      }

      .status-active {
        background-color: #d1f7e5;
        color: #0a7a4a;
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 600;
      }

      .api-data {
        margin-top: 20px;
        padding-top: 15px;
        border-top: 2px solid #eee;
      }

      .api-data h3 {
        margin: 0 0 15px 0;
        color: #444;
        font-size: 16px;
      }

      .dialog-actions {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        padding: 16px 24px;
        border-top: 1px solid #eee;
        background: #fafafa;
        border-radius: 0 0 8px 8px;
      }

      .btn {
        padding: 8px 16px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-weight: 500;
        transition: all 0.2s;
      }

      .btn-secondary {
        background: #f1f1f1;
        color: #333;
      }

      .btn-secondary:hover {
        background: #e1e1e1;
      }

      .btn-primary {
        background: #007bff;
        color: white;
      }

      .btn-primary:hover {
        background: #0056b3;
      }
    `,
  ],
  standalone: true,
  imports: [CommonModule],
})
export class ClearanceDialogComponent {
  selectedRow: any;
  loading = true;
  apiResponse: any = null;

  constructor(private dialog: MatDialog) {}

  ngOnInit() {
    setTimeout(() => {
      this.loading = false;
      this.apiResponse = {
        status: 'Active',
        issuedBy: 'Chief Fire Officer',
        remarks: 'All safety requirements met. Certificate valid for 2 years.',
      };
    }, 1500);
  }

  closeDialog() {
    this.dialog.closeAll();
  }

  editItem() {
    console.log('Edit clicked for:', this.selectedRow);
    alert(`Editing item: ${this.selectedRow.certificate_number}`);
    this.closeDialog();
  }
}

@Component({
  selector: 'app-upload-existing-licence',
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    PDynamicTableComponent,
  ],
  templateUrl: './upload-existing-licence.component.html',
  styleUrl: './upload-existing-licence.component.scss',
})
export class UploadExistingLicenceComponent {
  constructor(private dialog: MatDialog) {}

  simulateApiCall(action: string, id: number) {
    setTimeout(() => {
      console.log(`${action} API call completed for ID: ${id}`);
      alert(
        `${
          action.charAt(0).toUpperCase() + action.slice(1)
        } successful for item ID: ${id}`
      );
    }, 1000);
  }

  columns: TableColumn[] = [
    {
      key: 'id',
      label: 'Sl No.',
      type: 'number',
      sortable: false,
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
      type: 'text',
      sortable: true,
    },
    {
      key: 'name_of_noc',
      label: 'Clearance Name',
      type: 'text',
      sortable: true,
    },
    {
      key: 'department',
      label: 'Department',
      type: 'text',
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
      sortable: false,
      actions: [
        {
          label: 'View Details',
          icon: '👁️',
          action: 'view-details',
          handler: (row: any) => {
            this.openDialog(row);
          },
        },
        {
          label: 'Edit',
          icon: '✏️',
          action: 'edit',
          handler: (row: any) => {
            console.log('Edit clicked for row ID:', row.id);
            this.simulateApiCall('edit', row.id);
          },
        },
        {
          label: 'Delete',
          icon: '🗑️',
          color: 'warn',
          action: 'delete',
          handler: (row: any) => {
            console.log('Delete clicked for row ID:', row.id);
            this.simulateApiCall('delete', row.id);
          },
        },
      ],
    },
  ];

  tableData = [
    {
      id: 1,
      certificate_number: 'CLR-2023-001',
      certificate_date: '2023-12-01',
      type: 'Fire Safety',
      name_of_noc: 'Fire Department NOC',
      department: 'Fire & Emergency',
      valid_till: '2025-12-01',
    },
    {
      id: 2,
      certificate_number: 'CLR-2023-002',
      certificate_date: '2024-01-15',
      type: 'Environmental Clearance',
      name_of_noc: 'Pollution Control NOC',
      department: 'Environment Dept.',
      valid_till: '2026-01-15',
    },
    {
      id: 3,
      certificate_number: 'CLR-2023-003',
      certificate_date: '2024-06-10',
      type: 'Structural Stability',
      name_of_noc: 'Building Safety NOC',
      department: 'Urban Planning',
      valid_till: '2027-06-10',
    },
  ];

  openDialog(row: any) {
    const dialogRef = this.dialog.open(ClearanceDialogComponent, {
      width: '600px',
      maxWidth: '95vw',
      data: { selectedRow: row },
    });

    dialogRef.afterOpened().subscribe(() => {
      const dialogComponent = dialogRef.componentInstance;
      dialogComponent.selectedRow = row;
    });
  }
}
