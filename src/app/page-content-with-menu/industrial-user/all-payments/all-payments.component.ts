// all-payments.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GenericService } from '../../../_service/generic/generic.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { IlogiSelectComponent } from '../../../customInputComponents/ilogi-select/ilogi-select.component';

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
  imports: [CommonModule, FormsModule, IlogiSelectComponent],
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
  totalPagesPendingCalculated = 1;
  totalPendingCount = 0;
  totalPagesCompletedCalculated = 1;
  totalCompletedCount = 0;
  htmlToShow: SafeHtml | string | null = '';
  formSubmitted = false;
  loading = false;

  service: string | null = null;
  applicationId: string | null = null;

  serviceOptions: { id: string; name: string }[] = [];
  applicationIdOptions: { id: string; name: string }[] = [];

  readonly maxSelectable = 5;

  constructor(
    private apiService: GenericService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.paidPayments(this.currentPageCompleted, this.itemsPerPageCompleted);
    this.unpaidPayments(this.currentPagePending, this.itemsPerPagePending);
  }

  formatApplicationDate(isoString: string): string {
    if (!isoString) return 'N/A';

    const date = new Date(isoString);

    if (isNaN(date.getTime())) return 'Invalid Date';

    const day = date.getUTCDate();
    const getOrdinal = (n: number): string => {
      if (n > 3 && n < 21) return 'th';
      switch (n % 10) {
        case 1:
          return 'st';
        case 2:
          return 'nd';
        case 3:
          return 'rd';
        default:
          return 'th';
      }
    };
    const dayWithOrdinal = `${day}${getOrdinal(day)}`;

    const month = date.toLocaleString('en-US', {
      month: 'short',
      timeZone: 'UTC',
    });

    const year = date.getUTCFullYear();

    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');

    return `${dayWithOrdinal} ${month} ${year} - ${hours} : ${minutes}`;
  }

  unpaidPayments(
    page: number = 1,
    perPage: number = this.itemsPerPagePending
  ): void {
    const payload = {
      payment_status: 'pending',
      current_page: page,
      per_page: perPage,
    };

    this.apiService
      .getByConditions(
        payload,
        'api/user/user-service-applications-by-payment-status'
      )
      .subscribe({
        next: (response: any) => {
          if (response?.status === 1 && Array.isArray(response.data)) {
            this.pendingPayments = response.data.map(
              (item: any, index: number) => ({
                slNo: (page - 1) * perPage + index + 1,
                serviceName: item.service_title_or_description || 'N/A',
                applicationId: item.application_id || 'N/A',
                applicationDate: item.application_date
                  ? this.formatApplicationDate(item.application_date)
                  : 'N/A',
                paymentType: item.payment_type || 'Application Fee Payment',
                status: 'Pending',
                amount: item.amount ? parseFloat(item.amount) : 0,
                user_service_application_id: item.user_service_application_id,
              })
            );
            this.buildFilterOptions();
            this.currentPagePending = page;
            this.itemsPerPagePending = perPage;
            this.totalPagesPendingCalculated =
              response.pagination?.last_page || 1;
            this.totalPendingCount = response.pagination?.total || 0;
          } else {
            this.pendingPayments = [];
            this.totalPagesPendingCalculated = 1;
            this.totalPendingCount = 0;
          }
        },
        error: () => {
          this.pendingPayments = [];
          this.totalPagesPendingCalculated = 1;
          this.totalPendingCount = 0;
        },
      });
  }

  private buildFilterOptions(): void {
    const services = new Set<string>();
    const appIds = new Set<string>();

    this.pendingPayments.forEach((payment) => {
      if (payment.serviceName && payment.serviceName !== 'N/A') {
        services.add(payment.serviceName);
      }
      if (payment.applicationId && payment.applicationId !== 'N/A') {
        appIds.add(payment.applicationId);
      }
    });

    this.serviceOptions = [{ id: '', name: 'All' }].concat(
      Array.from(services).map((s) => ({ id: s, name: s }))
    );

    this.applicationIdOptions = [{ id: '', name: 'All' }].concat(
      Array.from(appIds).map((id) => ({ id: id, name: id }))
    );
  }
  get filteredPendingPayments(): Payment[] {
    return this.pendingPayments.filter((payment) => {
      const matchesService =
        !this.service || payment.serviceName === this.service;
      const matchesAppId =
        !this.applicationId || payment.applicationId === this.applicationId;
      return matchesService && matchesAppId;
    });
  }

  paidPayments(
    page: number = 1,
    perPage: number = this.itemsPerPageCompleted
  ): void {
    const payload = {
      payment_status: 'paid',
      current_page: page,
      per_page: perPage,
    };

    this.apiService
      .getByConditions(
        payload,
        'api/user/user-service-applications-by-payment-status'
      )
      .subscribe({
        next: (response: any) => {
          if (response?.status === 1 && Array.isArray(response.data)) {
            this.completedPayments = response.data.map(
              (item: any, index: number) => ({
                slNo: (page - 1) * perPage + index + 1,
                serviceName: item.service_title_or_description || 'N/A',
                applicationId: item.application_id || 'N/A',
                applicationDate: item.application_date
                  ? this.formatApplicationDate(item.application_date)
                  : 'N/A',
                paymentType: item.payment_type || 'N/A',
                status: 'Paid',
                amount: item.amount ? parseFloat(item.amount) : 0,
                grnNumber:
                  item.grn_number ||
                  `GRN-${(index + 1).toString().padStart(4, '0')}`,
                user_service_application_id: item.user_service_application_id,
              })
            );

            this.currentPageCompleted = page;
            this.itemsPerPageCompleted = perPage;
            this.totalPagesCompletedCalculated =
              response.pagination?.last_page || 1;
            this.totalCompletedCount = response.pagination?.total || 0;
          } else {
            this.completedPayments = [];
            this.totalPagesCompletedCalculated = 1;
            this.totalCompletedCount = 0;
          }
        },
        error: () => {
          this.completedPayments = [];
          this.totalPagesCompletedCalculated = 1;
          this.totalCompletedCount = 0;
        },
      });
  }

  goToPagePending(page: number): void {
    if (page < 1 || page > this.totalPagesPendingCalculated) return;
    this.unpaidPayments(page, this.itemsPerPagePending);
  }

  nextPagePending(): void {
    if (this.currentPagePending < this.totalPagesPendingCalculated) {
      this.unpaidPayments(
        this.currentPagePending + 1,
        this.itemsPerPagePending
      );
    }
  }

  prevPagePending(): void {
    if (this.currentPagePending > 1) {
      this.unpaidPayments(
        this.currentPagePending - 1,
        this.itemsPerPagePending
      );
    }
  }

  onPageSizeChangePending(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const newSize = +target.value;
    this.itemsPerPagePending = newSize;
    this.unpaidPayments(1, newSize); // Reset to page 1
  }

  goToPageCompleted(page: number): void {
    if (page < 1 || page > this.totalPagesCompletedCalculated) return;
    this.paidPayments(page, this.itemsPerPageCompleted);
  }

  nextPageCompleted(): void {
    if (this.currentPageCompleted < this.totalPagesCompletedCalculated) {
      this.paidPayments(
        this.currentPageCompleted + 1,
        this.itemsPerPageCompleted
      );
    }
  }

  prevPageCompleted(): void {
    if (this.currentPageCompleted > 1) {
      this.paidPayments(
        this.currentPageCompleted - 1,
        this.itemsPerPageCompleted
      );
    }
  }

  onPageSizeChangeCompleted(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const newSize = +target.value;
    this.itemsPerPageCompleted = newSize;
    this.paidPayments(1, newSize);
  }

  toggleSelection(id: number): void {
    if (this.selectedPayments.has(id)) {
      this.selectedPayments.delete(id);
    } else {
      if (this.selectedPayments.size < this.maxSelectable) {
        this.selectedPayments.add(id);
      } else {
        alert(`You can select a maximum of ${this.maxSelectable} payments.`);
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
      .map(
        (id) =>
          this.pendingPayments.find((p) => p.user_service_application_id === id)
            ?.amount || 0
      )
      .reduce((sum, amt) => sum + amt, 0);
  }

  toggleAllSelection(): void {
    if (this.isAllSelected()) {
      this.selectedPayments.clear();
    } else {
      this.selectedPayments.clear();
      this.pendingPayments
        .slice(0, this.maxSelectable)
        .forEach((p) =>
          this.selectedPayments.add(p.user_service_application_id)
        );
    }
    this.calculateTotal();
  }

  isAllSelected(): boolean {
    return (
      this.pendingPayments.length > 0 &&
      this.selectedPayments.size ===
        Math.min(this.pendingPayments.length, this.maxSelectable)
    );
  }

  get maxSelectionReached(): boolean {
    return this.selectedPayments.size >= this.maxSelectable;
  }

  payNow(): void {
    if (this.selectedPayments.size === 0) {
      alert('Please select at least one payment to proceed.');
      return;
    }

    const payload = {
      application_id: Array.from(this.selectedPayments),
    };

    this.loading = true;

    this.apiService.postAsText('api/user/update-payment', payload).subscribe({
      next: (htmlResponse: string) => {
        this.showPaymentForm(htmlResponse);
      },
      error: (error: any) => {
        console.error('Failed to generate e-GRAS form', error);
        alert('Payment initiation failed. Please try again.');
      },
      complete: () => {
        this.loading = false;
      },
    });
  }

  private showPaymentForm(html: string): void {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const form = doc.querySelector('form');
    if (!form) {
      console.error('No form found in payment response');
      alert('Failed to initiate payment. Please try again.');
      this.loading = false;
      return;
    }

    const newForm = document.createElement('form');
    newForm.method =
      form.getAttribute('method')?.toUpperCase() === 'POST' ? 'POST' : 'GET';
    newForm.action = (form.getAttribute('action') || '').trim();

    Array.from(form.querySelectorAll('input')).forEach((input) => {
      const newInput = document.createElement('input');
      newInput.type = 'hidden';
      newInput.name = input.name;
      newInput.value = input.value;
      newInput.required = false;
      newForm.appendChild(newInput);
    });

    setTimeout(() => {
      document.body.appendChild(newForm);
      console.log('Submitting payment form to:', newForm.action);
      newForm.submit();
    }, 1000);
  }

  markFormSubmitted(): void {
    this.formSubmitted = true;
  }
}
