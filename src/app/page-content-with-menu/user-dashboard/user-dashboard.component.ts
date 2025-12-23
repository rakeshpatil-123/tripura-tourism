import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { SummaryCardsComponent } from './summary-cards/summary-cards.component';
import { DynamicTableComponent } from '../../shared/component/table/table.component';
import { DashboardService } from './dashboard-service/dashboard-service';
import { LineChartComponent } from './line-chart/line-chart.component';
import { Route, Router } from '@angular/router';
import { LoaderService } from '../../_service/loader/loader.service';
import { finalize } from 'rxjs';
import { query } from '@angular/animations';
import { GenericService } from '../../_service/generic/generic.service';
import { DomSanitizer } from '@angular/platform-browser';
import { BarChartComponent } from './bar-chart/bar-chart.component';
import { IlogiSelectComponent } from '../../customInputComponents/ilogi-select/ilogi-select.component';
import { FormsModule } from '@angular/forms';
import { LoaderComponent } from "../../page-template/loader/loader.component";

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
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    SummaryCardsComponent,
    LineChartComponent,
    DynamicTableComponent,
    BarChartComponent,
    IlogiSelectComponent,
    FormsModule,
    CommonModule,
    LoaderComponent
],
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.scss'],
})
export class UserDashboardComponent implements OnInit {
  service: string | null = null;
  applicationId: string | null = null;
  appNumber: string | null = null;
  serviceOptions: { id: string; name: string }[] = [];
  applicationNoOptions: { id: string; name: string }[] = [];
  applicationIdOptions: { id: string; name: string }[] = [];
  totalPagesPendingCalculated = 1;
  totalPendingCount = 0;
  clarification_required: any[] = [];

  // Clarification filters
  clarificationAppNumber: string | null = null;
  clarificationService: string | null = null;

  // Options for clarification filters
  clarificationServiceOptions: { id: string; name: string }[] = [];
  clarificationAppNumberOptions: { id: string; name: string }[] = [];
  columns: any[] = [
    {
      key: 'applicationId',
      label: 'Application Number',
      type: 'link',
      sortable: true,
      linkHref: (row: any) => {
        return `/dashboard/service-application/${row.service_id}`;
      },
      linkQueryParams: (row: any) => {
        return {
          application_status: 'send_back',
          application_id: row.application_id,
        };
      },
    },
    // { key: 'applicationId', label: 'Application Number' },
    { key: 'department_name', label: 'Department' },
    { key: 'service_name', label: 'Service' },
    { key: 'remarks', label: 'Remarks' },
    {
      key: 'application_view',
      label: 'Applications',
      type: 'button',
      width: '120px',
      buttonText: 'View',
      buttonColor: 'success',

      onClick: (row: any) => {
        this.router.navigate(
          [`/dashboard/service-application/${row.service_id}`],
          {
            queryParams: {
              application_status: 'send_back',
              application_id: row.application_id,
            },
          }
        );
      },
    },
    {
      key: 'status_file',
      label: 'Status File',
      type: 'view-link',
      viewLinkText: 'View Dept. Uploaded Doc',
    },
  ];
  pendingPayments: Payment[] = [];
  selectedPayments: Set<number> = new Set();
  totalSelectedAmount = 0;
  pageSizes = [5, 10, 20, 50];
  currentPagePending = 1;
  itemsPerPagePending = 5;
  noc_issued_per_service: any[] = [];
  isLoading: boolean = false;

  constructor(
    private dashboardService: DashboardService,
    private router: Router,
    private loaderService: LoaderService,
    private apiService: GenericService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.loaderService.showLoader();
    this.dashboardService.dashboardData$.subscribe({
      next: (data: any) => {
        if (data) {
          this.clarification_required = data.clarification_required || [];
          this.noc_issued_per_service = data.noc_issued_per_service || [];
          this.buildClarificationFilterOptions();
          this.loaderService.hideLoader();
          this.isLoading = false;
        } else {
          this.loaderService.hideLoader();
          // this.clarification_required = [];
        }
      },
      error: (error) => {
        console.error('Error fetching dashboard data', error);
        this.clarification_required = [];
        this.loaderService.hideLoader();
      },
    });
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

  private buildClarificationFilterOptions(): void {
    const appNumbers = new Set<string>();
    const services = new Set<string>();

    this.clarification_required.forEach((item) => {
      if (item.applicationId && item.applicationId !== 'N/A') {
        appNumbers.add(item.applicationId);
      }
      if (item.service_name && item.service_name !== 'N/A') {
        services.add(item.service_name);
      }
    });

    this.clarificationAppNumberOptions = [{ id: '', name: 'All' }].concat(
      Array.from(appNumbers).map((id) => ({ id, name: id }))
    );

    this.clarificationServiceOptions = [{ id: '', name: 'All' }].concat(
      Array.from(services).map((name) => ({ id: name, name }))
    );
  }

  unpaidPayments(
    page: number = 1,
    perPage: number = this.itemsPerPagePending
  ): void {
    const payload = {
      payment_status: 'pending',
      page: page,
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

  get filteredClarificationRequired(): any[] {
    return this.clarification_required.filter((item) => {
      const matchesApp =
        !this.clarificationAppNumber ||
        item.applicationId === this.clarificationAppNumber;
      const matchesService =
        !this.clarificationService ||
        item.service_name === this.clarificationService;
      return matchesApp && matchesService;
    });
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

  // get paginatedPendingPayments() {
  //   const start = (this.currentPagePending - 1) * this.itemsPerPagePending;
  //   return this.pendingPayments.slice(start, start + this.itemsPerPagePending);
  // }

  // get totalPagesPending(): number {
  //   return Math.ceil(this.pendingPayments.length / this.itemsPerPagePending);
  // }

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
        .slice(0, 5)
        .forEach((p) =>
          this.selectedPayments.add(p.user_service_application_id)
        );
    }
    this.calculateTotal();
  }

  isAllSelected(): boolean {
    return (
      this.pendingPayments.length > 0 &&
      this.selectedPayments.size === this.pendingPayments.length
    );
  }

  get maxSelectionReached(): boolean {
    return this.selectedPayments.size >= 5;
  }

  payNow(): void {
    if (this.selectedPayments.size === 0) return;

    const payload = {
      application_id: Array.from(this.selectedPayments),
    };

    this.apiService.postAsText('api/user/update-payment', payload).subscribe({
      next: (htmlResponse: string) => {
        this.showPaymentForm(htmlResponse);
      },
      error: (error: any) => {
        console.error('Failed to generate e-GRAS form', error);
        alert('Payment initiation failed. Please try again.');
      },
    });
  }

  htmlToShow: any = '';
  formSubmitted: boolean = false;
  private showPaymentForm(html: string): void {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const form = doc.querySelector('form');
    if (!form) {
      console.error('No form found in payment response');
      alert('Failed to initiate payment. Please try again.');
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
}
