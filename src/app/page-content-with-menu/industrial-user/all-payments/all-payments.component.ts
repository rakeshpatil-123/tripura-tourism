// all-payments.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface Payment {
  id: number;
  slNo: number;
  serviceName: string;
  applicationId: string;
  applicationDate: string;
  paymentType: string;
  status: string;
  amount: number;
  grnNumber?: string;
}

@Component({
  selector: 'app-all-payments',
  templateUrl: './all-payments.component.html',
  styleUrls: ['./all-payments.component.scss'],
  imports: [CommonModule, FormsModule],
  standalone: true,
})
export class AllPaymentsComponent implements OnInit {
  pendingPayments: Payment[] = [];
  completedPayments: Payment[] = [];
  currentPagePending = 1;
  currentPageCompleted = 1;
  itemsPerPagePending = 5;
  itemsPerPageCompleted = 5;
  selectedPayments: Set<number> = new Set();
  totalSelectedAmount = 0;
  pageSizes = [5, 10, 20, 50];
  ngOnInit(): void {
    this.loadMockData();
  }

  private loadMockData(): void {
    this.pendingPayments = [
      {
        id: 1,
        slNo: 1,
        serviceName: 'Inspection Fee',
        applicationId: 'APP-001',
        applicationDate: '2025-11-01',
        paymentType: 'Application Fee Payment',
        status: 'Pending',
        amount: 300,
      },
      {
        id: 2,
        slNo: 2,
        serviceName: 'Legal Metrology Fee',
        applicationId: 'APP-002',
        applicationDate: '2025-11-05',
        paymentType: 'Extra Payment Raised',
        status: 'Pending',
        amount: 450,
      },
      {
        id: 3,
        slNo: 3,
        serviceName: 'Labour Department Fee',
        applicationId: 'APP-003',
        applicationDate: '2025-11-10',
        paymentType: 'Application Fee Payment',
        status: 'Pending',
        amount: 200,
      },
    ];

    this.completedPayments = [
      {
        id: 4,
        slNo: 1,
        serviceName: 'Inspection Fee',
        applicationDate: 'Inspection Fee',
        applicationId: 'APP-001',
        paymentType: 'Application Fee Payment',
        status: 'paid',
        amount: 300,
        grnNumber: 'GRN-2025-001',
      },
      {
        id: 5,
        slNo: 2,
        serviceName: 'Legal Metrology Fee',
        applicationDate: 'Legal Metrology Fee',
        applicationId: 'APP-002',
        paymentType: 'Extra Payment Raised',
        status: 'paid',
        amount: 450,
        grnNumber: 'GRN-2025-002',
      },
    ];
  }

  // pending table

  get paginatedPendingPayments() {
    const start = (this.currentPagePending - 1) * this.itemsPerPagePending;
    return this.pendingPayments.slice(start, start + this.itemsPerPagePending);
  }

  get totalPagesPending(): number {
    return Math.ceil(this.pendingPayments.length / this.itemsPerPagePending);
  }

  goToPagePending(page: number): void {
    if (page < 1 || page > this.totalPagesPending) return;
    this.currentPagePending = page;
  }

  nextPagePending(): void {
    if (this.currentPagePending < this.totalPagesPending) {
      this.currentPagePending++;
    }
  }

  prevPagePending(): void {
    if (this.currentPagePending > 1) {
      this.currentPagePending--;
    }
  }

  onPageSizeChangePending(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.itemsPerPagePending = +target.value;
    this.currentPagePending = 1;
  }

  // complete table

  get paginatedCompletedPayments() {
    const start = (this.currentPageCompleted - 1) * this.itemsPerPageCompleted;
    return this.completedPayments.slice(
      start,
      start + this.itemsPerPageCompleted
    );
  }

  get totalPagesCompleted(): number {
    return Math.ceil(
      this.completedPayments.length / this.itemsPerPageCompleted
    );
  }

  goToPageCompleted(page: number): void {
    if (page < 1 || page > this.totalPagesCompleted) return;
    this.currentPageCompleted = page;
  }

  nextPageCompleted(): void {
    if (this.currentPageCompleted < this.totalPagesCompleted) {
      this.currentPageCompleted++;
    }
  }

  prevPageCompleted(): void {
    if (this.currentPageCompleted > 1) {
      this.currentPageCompleted--;
    }
  }

  onPageSizeChangeCompleted(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.itemsPerPageCompleted = +target.value;
    this.currentPageCompleted = 1;
  }

  toggleSelection(paymentId: number): void {
    if (this.selectedPayments.has(paymentId)) {
      this.selectedPayments.delete(paymentId);
    } else {
      this.selectedPayments.add(paymentId);
    }
    this.calculateTotal();
  }

  isSelected(paymentId: number): boolean {
    return this.selectedPayments.has(paymentId);
  }

  calculateTotal(): void {
    this.totalSelectedAmount = Array.from(this.selectedPayments)
      .map((id) => this.pendingPayments.find((p) => p.id === id)?.amount || 0)
      .reduce((sum, amt) => sum + amt, 0);
  }

  payNow(): void {
    console.log(
      'Paying:',
      this.totalSelectedAmount,
      'for',
      this.selectedPayments.size,
      'items'
    );
    alert(
      `Proceeding to pay ₹${this.totalSelectedAmount} for ${this.selectedPayments.size} item(s)`
    );
  }

  isAllSelected(): boolean {
    return (
      this.pendingPayments.length > 0 &&
      this.selectedPayments.size === this.pendingPayments.length
    );
  }

  toggleAllSelection(): void {
    if (this.isAllSelected()) {
      this.selectedPayments.clear();
    } else {
      this.pendingPayments.forEach((payment) => {
        this.selectedPayments.add(payment.id);
      });
    }
    this.calculateTotal();
  }
}
