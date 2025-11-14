import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { SummaryCardsComponent } from '../dashboard-components/summary-cards/summary-cards.component';
import { BarChartComponent } from '../dashboard-components/bar-chart/bar-chart.component';
import { PieChartsComponent } from '../dashboard-components/pie-charts/pie-charts.component';


@Component({
  selector: 'app-user-dashboard',
  imports: [ CommonModule,
    SummaryCardsComponent,
  //   LineChartComponent,
    PieChartsComponent,
    BarChartComponent,
  //   HorizontalBarChartComponent,
  //   ClaimStatusTableComponent,
    // ClarificationTableComponent
  ],
  templateUrl: './user-dashboard.component.html',
  styleUrl: './user-dashboard.component.scss'
})
export class UserDashboardComponent {

}
