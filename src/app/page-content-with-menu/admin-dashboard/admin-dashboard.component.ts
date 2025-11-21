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

const DUMMY_DATA = {
  "status": 1,
  "message": "Total count applications under this department fetched successfully",
  "total_applications_for_this_department": 42,
  "percentage_total_application": 350,
  "total_count_pending_application_in_department": 1,
  "percentage_pending_application": 2.380952380952381,
  "percentage_approved_application": 33.33333333333333,
  "percentage_rejected_application": 2.380952380952381,
  "total_count_approved_application_in_department": 14,
  "$total_count_rejected_application_in_department": 1,
  "number_of_NOC_issued_by_department": 14,
  "application_count_per_service": [
    { "service_id": 10, "service_name": "Test-Third Party", "application_count": 4 },
    { "service_id": 7, "service_name": "Electrical Line Clearance for Building Plan Approval", "application_count": 5 },
    { "service_id": 14, "service_name": "test", "application_count": 3 },
    { "service_id": 15, "service_name": "Approval for Energisation of DG Set", "application_count": 4 },
    { "service_id": 22, "service_name": "Approval for Energisation of Transformer", "application_count": 1 },
    { "service_id": 47, "service_name": "Test-Native", "application_count": 7 },
    { "service_id": 49, "service_name": "Test-native2", "application_count": 3 },
    { "service_id": 59, "service_name": "test5", "application_count": 1 },
    { "service_id": 65, "service_name": "testTest", "application_count": 1 },
    { "service_id": 66, "service_name": "just testing", "application_count": 8 },
    { "service_id": 67, "service_name": "testing 123", "application_count": 5 },
    { "service_id": 68, "service_name": "final testing", "application_count": 0 }
  ],
  "district_wise_application_in_department": [
    { "district_name": "Khowai", "count": 19 },
    { "district_name": "Gomati", "count": 14 },
    { "district_name": "West Tripura", "count": 8 },
    { "district_name": "", "count": 1 }
  ],
  "district_wise_application_per_service": [
    { "service_name": "Electrical Line Clearance for Building Plan Approval", "districts": [{ "district_name": "Khowai", "count": 1 }, { "district_name": "West Tripura", "count": 3 }, { "district_name": "Gomati", "count": 1 }] },
    { "service_name": "test", "districts": [{ "district_name": "Gomati", "count": 1 }, { "district_name": "Khowai", "count": 1 }, { "district_name": "", "count": 1 }] },
    { "service_name": "Test-Native", "districts": [{ "district_name": "Khowai", "count": 7 }] },
    { "service_name": "Approval for Energisation of DG Set", "districts": [{ "district_name": "West Tripura", "count": 4 }] },
    { "service_name": "Approval for Energisation of Transformer", "districts": [{ "district_name": "West Tripura", "count": 1 }] },
    { "service_name": "test5", "districts": [{ "district_name": "Khowai", "count": 1 }] },
    { "service_name": "Test-native2", "districts": [{ "district_name": "Khowai", "count": 3 }] },
    { "service_name": "testTest", "districts": [{ "district_name": "Khowai", "count": 1 }] },
    { "service_name": "just testing", "districts": [{ "district_name": "Gomati", "count": 6 }, { "district_name": "Khowai", "count": 2 }] },
    { "service_name": "testing 123", "districts": [{ "district_name": "Gomati", "count": 5 }] },
    { "service_name": "Test-Third Party", "districts": [{ "district_name": "Khowai", "count": 3 }, { "district_name": "Gomati", "count": 1 }] }
  ],
  "clarification_required": [
    { "application_id": 131, "applicationId": null, "NOC_letter_number": null, "status_file": null },
    { "application_id": 138, "applicationId": null, "NOC_letter_number": null, "status_file": null },
    { "application_id": 131, "applicationId": null, "NOC_letter_number": null, "status_file": null },
    { "application_id": 131, "applicationId": null, "NOC_letter_number": null, "status_file": null },
    { "application_id": 131, "applicationId": null, "NOC_letter_number": null, "status_file": null },
    { "application_id": 131, "applicationId": null, "NOC_letter_number": null, "status_file": null },
    { "application_id": 132, "applicationId": "CFE-LI1171020250632", "NOC_letter_number": null, "status_file": "http://swaagatstaging.tripura.cloud/uploads/144/application_status/68fb6c7231425.pdf" },
    { "application_id": 173, "applicationId": "CFE-LO1221020251111", "NOC_letter_number": null, "status_file": null },
    { "application_id": 206, "applicationId": "123121120250753", "NOC_letter_number": null, "status_file": null }
  ]
};

@Component({
  selector: 'app-admin-dashboard',
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
  dashboardData: any = null; // this will be bound to child components
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
    this.genericService.getByConditions(payload, 'admin-dashboard-data').pipe(finalize(()=> this.loaderService.hideLoader())).subscribe((res: any)=>{
      res;
    })
    try {
      if (this.loaderService && typeof (this.loaderService as any).showLoader === 'function') {
        try { (this.loaderService as any).showLoader(); } catch { }
      }
    } catch { }
    return of(DUMMY_DATA).pipe(delay(700)).subscribe((res: any) => {
      this.dashboardData = res;
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
