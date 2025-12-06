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
    if (changes['data']) {
      if (!this.data || !Array.isArray(this.data) || this.data.length === 0) {
        this.chartOptions = undefined as any;
      } else {
        this.prepareChart();
      }
    }
  }
  prepareChart() {
    const arr = Array.isArray(this.data) ? this.data : [];
    const serviceNames = arr.map(item => {
      return item?.service_name ?? item?.service?.name ?? item?.name ?? '';
    });
    const serviceCounts = arr.map(item => {
      const v = item?.licenses_issued ?? item?.application_count ?? item?.count ?? 0;
      const n = Number(v);
      return Number.isFinite(n) ? n : 0;
    });
    const hasLicenses = arr.some(item => item && Object.prototype.hasOwnProperty.call(item, 'licenses_issued'));
    const seriesLabel = hasLicenses ? 'Licenses Issued' : 'Applications';

    this.chartOptions = {
      series: [
        {
          name: seriesLabel,
          data: serviceCounts
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
          rotate: -90,
          style: {
            fontSize: '12px',
            fontWeight: 500
          }
        }
      },
      yaxis: {
        title: { text: seriesLabel },
        min: 0
      },
      legend: { show: false },
      title: {
        text: `${seriesLabel} per Service`,
        align: 'left',
        style: {
          fontSize: '18px',
          fontWeight: '600',
          color: '#1e293b'
        }
      }
    };
  }
  public hasChartData(): boolean {
    const opts = this.chartOptions as unknown as {
      series?: Array<{ data?: any }>;
    } | undefined;

    if (!opts?.series || !Array.isArray(opts.series) || opts.series.length === 0) {
      return false;
    }
    const firstSeries = opts.series[0];
    if (!firstSeries) {
      return false;
    }

    if (Array.isArray(firstSeries.data)) {
      return firstSeries.data.length > 0;
    }
    return firstSeries.data !== undefined && firstSeries.data !== null;
  }
}
