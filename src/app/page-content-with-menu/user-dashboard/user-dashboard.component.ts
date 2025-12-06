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
    BarChartComponent
  ],
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.scss'],
})
export class UserDashboardComponent implements OnInit {
  clarification_required: any[] = [];
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
  constructor(
    private dashboardService: DashboardService,
    private router: Router,
    private loaderService: LoaderService,
    private apiService: GenericService,
    private sanitizer: DomSanitizer

  ) {}

  ngOnInit(): void {
    this.loaderService.showLoader();
    this.dashboardService.dashboardData$.subscribe({
      next: (data: any) => {
        if (data) {
          this.clarification_required = data.clarification_required || [];
          this.noc_issued_per_service = data.noc_issued_per_service || [];
          this.loaderService.hideLoader();
        }else{
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
            this.pendingPayments = response.data.map(
              (item: any, index: number) => ({
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
              })
            );
          } else {
            this.pendingPayments = [];
          }
        },
        error: () => {
          this.pendingPayments = [];
        },
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
    this.htmlToShow = this.sanitizer.bypassSecurityTrustHtml(html);
    this.formSubmitted = false;
  }

}
