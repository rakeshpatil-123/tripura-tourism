// all-payments.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GenericService } from '../../../_service/generic/generic.service';
import { DomSanitizer } from '@angular/platform-browser';

interface Payment {
  slNo: number;
  serviceName: string;
  applicationId: string; 
  applicationDate: string;
  paymentType: string;
  status: string;
  amount: number;
  grnNumber?: string;
   user_service_application_id: number;
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

  constructor(private apiService: GenericService, private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    this.paidPayments();
    this.unpaidPayments();
  }

 unpaidPayments(): void {
  this.apiService
    .getByConditions(
      { payment_status: 'pending' },
      'api/user/user-service-applications-by-payment-status'
    )
    .subscribe({
      next: (response: any) => {
        if (response?.status === 1 && Array.isArray(response.data)) {
          this.pendingPayments = response.data.map((item: any, index: number) => ({
            slNo: index + 1,
            serviceName: item.service_title_or_description || 'N/A',
            applicationId: item.application_id || 'N/A',
            applicationDate: item.application_date
              ? item.application_date.split(' ')[0]
              : 'N/A',
            paymentType: item.payment_type || 'Application Fee Payment',
            status: 'Pending',
            amount: item.amount ? parseFloat(item.amount) : 0,
            user_service_application_id: item.user_service_application_id, 
          }));
        } else {
          this.pendingPayments = [];
        }
      },
      error: () => {
        this.pendingPayments = [];
      }
    });
}

paidPayments(): void {
  this.apiService
    .getByConditions(
      { payment_status: 'paid' },
      'api/user/user-service-applications-by-payment-status'
    )
    .subscribe({
      next: (response: any) => {
        if (response?.status === 1 && Array.isArray(response.data)) {
          this.completedPayments = response.data.map((item: any, index: number) => ({
            slNo: index + 1,
            serviceName: item.service_title_or_description || 'N/A',
            applicationId: item.application_id || 'N/A',
            applicationDate: item.application_date
              ? item.application_date.split(' ')[0]
              : 'N/A',
            paymentType: item.payment_type || 'N/A',
            status: 'Paid',
            amount: item.amount ? parseFloat(item.amount) : 0,
            grnNumber: item.grn_number || `GRN-${(index + 1).toString().padStart(4, '0')}`,
            user_service_application_id: item.user_service_application_id,
          }));
        } else {
          this.completedPayments = [];
        }
      },
      error: () => {
        this.completedPayments = [];
      }
    });
}

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

  get paginatedCompletedPayments() {
    const start = (this.currentPageCompleted - 1) * this.itemsPerPageCompleted;
    return this.completedPayments.slice(start, start + this.itemsPerPageCompleted);
  }

  get totalPagesCompleted(): number {
    return Math.ceil(this.completedPayments.length / this.itemsPerPageCompleted);
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

 toggleSelection(id: number): void {
  if (this.selectedPayments.has(id)) {
    this.selectedPayments.delete(id);
  } else {
    if (this.selectedPayments.size < 5) {
      this.selectedPayments.add(id);
    } else {
      alert('You can select a maximum of 5 payments.');
      return;
    }
  }
  this.calculateTotal();
}

isSelected(id: number): boolean {
  return this.selectedPayments.has(id);
}

calculateTotal(): void {
  this.totalSelectedAmount = Array.from(this.selectedPayments)
    .map(id => this.pendingPayments.find(p => p.user_service_application_id === id)?.amount || 0)
    .reduce((sum, amt) => sum + amt, 0);
}

toggleAllSelection(): void {
  if (this.isAllSelected()) {
    this.selectedPayments.clear();
  } else {
    this.selectedPayments.clear();
    this.pendingPayments.slice(0, 5).forEach(p => this.selectedPayments.add(p.user_service_application_id));
  }
  this.calculateTotal();
}

isAllSelected(): boolean {
  return this.pendingPayments.length > 0 &&
         this.selectedPayments.size === this.pendingPayments.length;
}

get maxSelectionReached(): boolean {
  return this.selectedPayments.size >= 5;
}



payNow(): void {
  if (this.selectedPayments.size === 0) return;

  const payload = {
    application_id: Array.from(this.selectedPayments)
  };

  this.apiService.postAsText('api/user/update-payment', payload).subscribe({
    next: (htmlResponse: string) => {
      this.showPaymentForm(htmlResponse);
    },
    error: (error: any) => {
      console.error('Failed to generate e-GRAS form', error);
      alert('Payment initiation failed. Please try again.');
    }
  });
}

  htmlToShow: any = '';
  formSubmitted: boolean = false;
  private showPaymentForm(html: string): void {
    this.htmlToShow = this.sanitizer.bypassSecurityTrustHtml(html);
    this.formSubmitted = false;
  }
}