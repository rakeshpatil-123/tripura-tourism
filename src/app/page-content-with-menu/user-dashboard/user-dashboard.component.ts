import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { BarChartComponent } from './bar-chart/bar-chart.component';
import { PieChartsComponent } from './pie-charts/pie-charts.component';
import { SummaryCardsComponent } from './summary-cards/summary-cards.component';


@Component({
  selector: 'app-user-dashboard',
  imports: [ CommonModule,
    SummaryCardsComponent,
    PieChartsComponent,
    BarChartComponent,
  ],
  templateUrl: './user-dashboard.component.html',
  styleUrl: './user-dashboard.component.scss'
})
export class UserDashboardComponent {

}
