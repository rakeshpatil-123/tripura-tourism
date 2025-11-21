import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  NgApexchartsModule,
  ChartComponent,
  ApexChart,
  ApexXAxis,
  ApexYAxis,
  ApexDataLabels,
  ApexPlotOptions,
  ApexGrid,
  ApexTitleSubtitle,
  ApexLegend,
  ApexAxisChartSeries
} from 'ng-apexcharts';

export type BarChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  colors: string[];
  grid: ApexGrid;
  legend: ApexLegend;
  title: ApexTitleSubtitle;
};

@Component({
  selector: 'app-bar-chart',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './bar-chart.html',
  styleUrl: './bar-chart.scss'
})
export class BarChartComponent implements OnChanges {

  @Input() data: any[] | null = null;

  @ViewChild('chart') chart!: ChartComponent;
  public chartOptions!: Partial<BarChartOptions>;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data'] && this.data) {
      this.prepareChart();
    }
  }
  prepareChart() {
    const serviceNames = this.data?.map((item: any) => item.service_name ?? []);
    const serviceCounts = this.data?.map((item: any) => item.application_count ?? []);

    this.chartOptions = {
      series: [
        {
          name: 'Applications',
          data: Array.isArray(serviceCounts) ? serviceCounts : []
        }
      ],
      chart: {
        type: 'bar',
        height: 350,
        toolbar: { show: true }
      },
      colors: ['#4CAF50'],
      plotOptions: {
        bar: {
          distributed: true,
          borderRadius: 8,
          horizontal: false,
          columnWidth: '55%'
        }
      },
      dataLabels: {
        enabled: true,
        style: {
          fontSize: '13px',
          fontWeight: 600,
          colors: ['#fff']
        }
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
        labels: {
          rotate: -45,
          style: {
            fontSize: '12px',
            fontWeight: 500
          }
        }
      },
      yaxis: {
        title: { text: 'Application Count' },
        min: 0
      },
      legend: { show: false },
      title: {
        text: 'Applications per Service',
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
