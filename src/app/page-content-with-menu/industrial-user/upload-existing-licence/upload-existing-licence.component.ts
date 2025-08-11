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
      label: 'ID',
      type: 'number',
    },
    {
      key: 'name',
      label: 'Full Name',
      type: 'text',
    },
    {
      key: 'email',
      label: 'Email',
      type: 'text',
    },
    {
      key: 'status',
      label: 'Status',
      type: 'status',
    },
    {
      key: 'paymentStatus',
      label: 'Payment',
      type: 'payment',
    },
    {
      key: 'amount',
      label: 'Amount',
      type: 'currency',
    },
    {
      key: 'dateApplied',
      label: 'Applied On',
      type: 'date',
    },
    {
      key: 'lastLogin',
      label: 'Last Seen',
      type: 'text',
    },
    {
      key: 'profileLink',
      label: 'Profile',
      type: 'link',
      linkHref: (row) => row.profileLink,
      linkText: (row) => 'View Profile',
    },
    {
      key: 'actions',
      label: 'Actions',
      type: 'action',
      class: 'text-center',
      actions: [
        {
          label: 'View',
          icon: 'pi pi-eye',
          color: 'secondary',
          handler: (row) => console.log('View:', row),
        },
        {
          label: 'Edit',
          icon: 'pi pi-pencil',
          color: 'info',
          handler: (row) => console.log('Edit:', row),
        },
        {
          label: 'Delete',
          icon: 'pi pi-trash',
          color: 'danger',
          handler: (row) => confirm(`Delete ${row.name}?`),
        },
      ],
    },
  ];

  tableData = [
    {
      id: 1,
      name: 'Alice Johnson',
      email: 'alice@example.com',
      status: 'Active',
      paymentStatus: 'Paid',
      amount: 299.99,
      dateApplied: new Date('2024-01-15'),
      lastLogin: '2 hours ago',
      profileLink: 'https://example.com/alice',
    },
    {
      id: 2,
      name: 'Bob Smith',
      email: 'bob@example.com',
      status: 'Pending',
      paymentStatus: 'Partially Paid',
      amount: 149.5,
      dateApplied: new Date('2024-02-03'),
      lastLogin: '1 day ago',
      profileLink: 'https://example.com/bob',
    },
    {
      id: 3,
      name: 'Carol Davis',
      email: 'carol@example.com',
      status: 'Inactive',
      paymentStatus: 'Overdue',
      amount: 399.0,
      dateApplied: new Date('2024-01-28'),
      lastLogin: '3 weeks ago',
      profileLink: 'https://example.com/carol',
    },
    {
      id: 4,
      name: 'Dan Lee',
      email: 'dan@example.com',
      status: 'Active',
      paymentStatus: 'Refunded',
      amount: 199.99,
      dateApplied: new Date('2024-03-10'),
      lastLogin: '5 days ago',
      profileLink: 'https://example.com/dan',
    },
    {
      id: 5,
      name: 'Eva Martinez',
      email: 'eva@example.com',
      status: 'Completed',
      paymentStatus: 'Paid',
      amount: 599.99,
      dateApplied: new Date('2024-02-20'),
      lastLogin: 'Just now',
      profileLink: 'https://example.com/eva',
    },
  ];

  openDialog(row: any) {
    const dialogRef = this.dialog.open(ClearanceDialogComponent, {
      maxWidth: '95vw',
      data: { selectedRow: row },
    });

    dialogRef.afterOpened().subscribe(() => {
      const dialogComponent = dialogRef.componentInstance;
      dialogComponent.selectedRow = row;
    });
  }
}
