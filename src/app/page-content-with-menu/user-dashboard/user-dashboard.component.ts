import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { SummaryCardsComponent } from './summary-cards/summary-cards.component';
import { DynamicTableComponent } from '../../shared/component/table/table.component';
import { DashboardService } from './dashboard-service/dashboard-service';
import { LineChartComponent } from './line-chart/line-chart.component';
import { Route, Router } from '@angular/router';
import { LoaderService } from '../../_service/loader/loader.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    SummaryCardsComponent,
    LineChartComponent,
    DynamicTableComponent,
  ],
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.scss'],
})
export class UserDashboardComponent implements OnInit {
  clarification_required: any[] = [];
  columns: any[] = [


    {
      key: 'application_id',
      label: 'Application ID',
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
    { key: 'applicationId', label: 'Application Number' },
    { key: 'department_name', label: 'Department' },
    { key: 'NOC_letter_number', label: 'NOC Number' },
    {
      key: 'status_file',
      label: 'Status File',
      type: 'view-link',
    },
  ];

  constructor(
    private dashboardService: DashboardService,
    private router: Router,
    private loaderService: LoaderService
  ) {}

  ngOnInit(): void {
    this.loaderService.showLoader();
    this.dashboardService.dashboardData$.subscribe({
      next: (data: any) => {
        if (data) {
          this.clarification_required = data.clarification_required || [];
          this.loaderService.hideLoader();
        }
      },
      error: (error) => {
        console.error('Error fetching dashboard data', error);
        this.clarification_required = [];
        this.loaderService.hideLoader();
      },
    });
  }
}
