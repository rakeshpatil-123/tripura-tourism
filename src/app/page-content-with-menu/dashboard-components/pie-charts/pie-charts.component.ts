import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  NgApexchartsModule,
  ChartComponent,
  ApexChart,
  ApexNonAxisChartSeries,
  ApexLegend,
  ApexResponsive,
  ApexTitleSubtitle
} from 'ng-apexcharts';

export type PieChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  labels: string[];
  colors: string[];
  legend: ApexLegend;
  responsive: ApexResponsive[];
  title: ApexTitleSubtitle;
};

@Component({
  selector: 'app-pie-chart',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './pie-charts.component.html',
  styleUrl: './pie-charts.component.scss'
})
export class PieChartsComponent implements OnChanges {
  @Input() data: any[] | null = null;
  @ViewChild('chart') chart!: ChartComponent;
  public chartOptions!: Partial<PieChartOptions>;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.data) {
      this.prepareChartData();
    }
  }

  private prepareChartData(): void {
    const labels = this.data?.map((d: any) => d.district_name) ?? [];
    const series = this.data?.map((d: any) => d.count) ?? [];
      this.chartOptions = {
        series: series,
        chart: {
          type: 'pie',
          height: 380
        },
        labels: labels,
        colors: ['#4CAF50', '#FF9800', '#2196F3', '#F44336', '#9C27B0'],
        legend: {
          position: 'bottom',
          fontSize: '14px' },
        responsive: [
          {
            breakpoint: 480,
            options: {
              chart: { height: 300 },
              legend: { position: 'bottom' }
            }
          }
        ],
        title: {
          text: 'District-wise Application Distribution',
          align: 'left',
          style: {
            fontSize: '18px',
            fontWeight: '600',
            color: '#1e293b'
          }
        }
    };
  }
}
