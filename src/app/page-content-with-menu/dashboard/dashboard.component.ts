import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BarChartComponent } from './bar-chart/bar-chart.component';
import { ClarificationRequiredTableComponent } from './certification-required-table/certification-required-table.component';
import { ClaimStatusTableComponent } from './claim-status-table/claim-status-table.component';
import { DonutChartComponent } from './donut-chart/donut-chart.component';
import { StatsCardComponent } from './stats-card/stats-card.component';
import { ButtonComponent } from '../../shared/component/button-component/button.component';
import { TimelineCardComponent } from '../../shared/timeline-card/timeline-card.component';
import { TableColumn } from '../../shared/component/table/table.component';
import { GenericService } from '../../_service/generic/generic.service';
import { UserDashboardComponent } from '../user-dashboard/user-dashboard.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    UserDashboardComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent  {
 
}
