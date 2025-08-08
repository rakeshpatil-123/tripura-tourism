import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

export interface TransactionData {
  date: string;
  transactionId: string;
  amount: string;
  status: string;
}

@Component({
  selector: 'app-transaction-history-dialog',
  template: `
    <div matDialogTitle>
      Transaction History for {{ data.applicationNumber }}
    </div>
    <div matDialogContent>
      <table class="table table-bordered">
        <thead>
          <tr>
            <th>Date</th>
            <th>Transaction ID</th>
            <th>Amount</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <!-- Dummy Data or iterate over data.transactions if passed -->
          <tr *ngFor="let txn of dummyTransactions">
            <td>{{ txn.date }}</td>
            <td>{{ txn.transactionId }}</td>
            <td>{{ txn.amount }}</td>
            <td [class]="'status-' + txn.status.toLowerCase()">
              {{ txn.status }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div matDialogActions>
      <button mat-button matDialogClose>Close</button>
    </div>
  `,
  styles: [
    `
      .status-success {
        color: green;
      }
      .status-failed {
        color: red;
      }
      .status-pending {
        color: orange;
      }
      /* Add more status styles as needed */
    `,
  ],
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
})
export class TransactionHistoryDialogComponent {
  dummyTransactions: TransactionData[] = [
    {
      date: '01/01/2024',
      transactionId: 'Txn-001',
      amount: '₹100.00',
      status: 'Success',
    },
    {
      date: '15/01/2024',
      transactionId: 'Txn-002',
      amount: '₹50.00',
      status: 'Failed',
    },
    {
      date: '20/06/2024',
      transactionId: 'Txn-003',
      amount: '₹200.00',
      status: 'Success',
    },
    {
      date: '10/07/2024',
      transactionId: 'Txn-004',
      amount: '₹75.50',
      status: 'Pending',
    },
  ];

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    console.log('Dialog data received:', this.data);
  }
}
