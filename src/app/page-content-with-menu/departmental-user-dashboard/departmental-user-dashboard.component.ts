import { Component, DoCheck, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { SummaryCardsComponent } from "../dashboard-components/summary-cards/summary-cards.component";
import { BarChartComponent } from "../charts/bar-chart/bar-chart";
import { PieChartsComponent } from "../dashboard-components/pie-charts/pie-charts.component";
import { HorizontalBarChartComponent } from "../charts/horizontal-bar-chart/horizontal-bar-chart";
// import { LineChartComponent } from "../charts/line-chart/line-chart";
import { GenericService } from '../../_service/generic/generic.service';
import { ClarificationTableComponent } from "../tables/clarification-table/clarification-table";
// import { ClaimStatusTableComponent } from '../tables/claim-status-table/claim-status-table';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-departmental-user-dashboard',
  standalone: true,
  imports: [
    SummaryCardsComponent,
    BarChartComponent,
    PieChartsComponent,
    HorizontalBarChartComponent,
    // LineChartComponent,
    ClarificationTableComponent,
    // ClaimStatusTableComponent,
    CommonModule
  ],
  templateUrl: './departmental-user-dashboard.component.html',
  styleUrl: './departmental-user-dashboard.component.scss'
})
export class DepartmentalUserDashboardComponent implements OnInit, OnDestroy, OnChanges, DoCheck {

  deptId: any;
  @Input() sidebarCollapsed: boolean = false;
  dashboardData: any = null;
  nocIssuedList: any = null;
  pagination: any = null;

  constructor(private genericService: GenericService) { }

  ngOnInit(): void {
    this.deptId = localStorage.getItem('deptId');
    this.loadDashboardData();
    this.loadNocIssued(1);
  }

  ngOnChanges(): void {
    console.log("Sidebar collapsed in dashboard:", this.sidebarCollapsed);
  }

  loadDashboardData() {
    this.genericService.getDashboardData(this.deptId).subscribe({
      next: (res: any) => {
        if (res?.status === 1) {
          this.dashboardData = res;
        }
      },
      error: (err: any) => {
        console.error('Dashboard data error:', err);
      }
    });
  }

  ngDoCheck() {
    console.log("sidebarCollapsed =", this.sidebarCollapsed);
  }

  loadNocIssued(page: number) {
    const payload = { deptId: this.deptId, page: page, limit: 10 };
    this.genericService.getNocIssuedList(this.deptId, page).subscribe({
      next: (res: any) => {
        this.nocIssuedList = res.list_of_NOC_issued_by_department;
        this.pagination = res.pagination;
      },
      error: (err: any) => {
        console.error('NOC Issue list error:', err);
      }
    });
  }
  ngOnDestroy(): void { }
}
