import { Component, OnDestroy, OnInit } from '@angular/core';
import { LoaderService } from '../../_service/loader/loader.service';
import { GenericService } from '../../_service/generic/generic.service';
import { Subscription, of } from 'rxjs';
import { delay, finalize } from 'rxjs/operators';
import { SummaryCardsComponent } from '../dashboard-components/summary-cards/summary-cards.component';
import { BarChartComponent } from '../charts/bar-chart/bar-chart';
import { PieChartsComponent } from '../dashboard-components/pie-charts/pie-charts.component';
import { ClarificationTableComponent } from '../tables/clarification-table/clarification-table';
import { HorizontalBarChartComponent } from '../charts/horizontal-bar-chart/horizontal-bar-chart';

const DUMMY_DATA = {};

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss'],
  imports: [SummaryCardsComponent,
    BarChartComponent,
    PieChartsComponent,
    ClarificationTableComponent,
    HorizontalBarChartComponent
  ]
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  subs: Subscription;
  dashboardData: any = null;
  sidebarCollapsed = false;
  isLoading = false;

  constructor(
    private loaderService: LoaderService,
    private genericService: GenericService
  ) {
    this.subs = new Subscription();
  }

  ngOnInit(): void {
    const adminDashboardDataSubs = this.getAdminDashboardData();
    this.subs.add(adminDashboardDataSubs);
  }

  getAdminDashboardData(): Subscription {
    this.isLoading = true;
    const payload = {
      department_id: 1,
    }
    this.loaderService.showLoader();
    this.genericService.getByConditions({}, 'api/admin/get-total-applications-by-admin')
      .pipe(finalize(() => this.loaderService.hideLoader()))
      .subscribe((res: any) => {
        this.dashboardData = {
          ...res,
          total_applications_for_this_department: res.total_applications,
          total_count_pending_application_in_department: res.total_count_pending_application,
          total_count_approved_application_in_department: res.total_count_approved_application,
          $total_count_rejected_application_in_department: res.$total_count_rejected_application
        };
        this.isLoading = false;
      }, () => {
        this.isLoading = false;
      })
    try {
      if (this.loaderService && typeof (this.loaderService as any).showLoader === 'function') {
        try { (this.loaderService as any).showLoader(); } catch { }
      }
    } catch { }
    return of(DUMMY_DATA).pipe(delay(700)).subscribe((res: any) => {
      if (!this.dashboardData) {
        this.dashboardData = res;
      }
      this.isLoading = false;
      if (this.loaderService && typeof (this.loaderService as any).hideLoader === 'function') {
        try { (this.loaderService as any).hideLoader(); } catch {  }
      }
    }, (err) => {
      this.isLoading = false;
      if (this.loaderService && typeof (this.loaderService as any).hideLoader === 'function') {
        try { (this.loaderService as any).hideLoader(); } catch {}
      }
      console.error('Error fetching admin dashboard data (dummy flow):', err);
    });
  }

  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
