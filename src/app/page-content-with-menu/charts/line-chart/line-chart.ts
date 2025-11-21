import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  NgApexchartsModule,
  ChartComponent,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexStroke,
  ApexMarkers,
  ApexYAxis,
  ApexGrid,
  ApexTitleSubtitle,
  ApexLegend,
  ApexAxisChartSeries
} from 'ng-apexcharts';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  dataLabels: ApexDataLabels;
  stroke: ApexStroke;
  markers: ApexMarkers;
  colors: string[];
  yaxis: ApexYAxis;
  grid: ApexGrid;
  legend: ApexLegend;
  title: ApexTitleSubtitle;
};

@Component({
  selector: 'app-line-chart',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './line-chart.html',
  styleUrl: './line-chart.scss'
})
export class LineChartComponent implements OnInit {

  @Input() dashboardData: any;

  @ViewChild('chart') chart!: ChartComponent;
  public chartOptions!: Partial<ChartOptions>;

  ngOnInit(): void {
    if (this.dashboardData) {
      this.prepareChart();
    }
  }

  ngOnChanges(): void {
    if (this.dashboardData) {
      this.prepareChart();
    }
  }
  prepareChart() {
    const serviceNames = this.dashboardData.application_count_per_service?.map((s: any) => s.service_name) ?? [];
    const serviceCounts = this.dashboardData.application_count_per_service?.map((s: any) => s.application_count) ?? [];

    this.chartOptions = {
      series: [
        {
          name: 'Applications',
          data: serviceCounts
        }
      ],
      chart: {
        height: 350,
        type: 'line',
        toolbar: { show: true },
        zoom: { enabled: false }
      },
      colors: ['#4CAF50'],
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: 'smooth',
        width: 3
      },
      markers: {
        size: 5,
        hover: { size: 7 }
      },
      grid: {
        borderColor: '#e7e7e7',
        row: {
          colors: ['#f3f3f3', 'transparent'],
          opacity: 0.5
        }
      },
      xaxis: {
        categories: serviceNames,
        title: { text: 'Services' },
        labels: { rotate: -45 }
      },
      yaxis: {
        title: { text: 'Application Count' },
        min: 0
      },
      legend: {
        position: 'top',
        horizontalAlign: 'right'
      },
      title: {
        text: 'Applications per Service Trend',
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
