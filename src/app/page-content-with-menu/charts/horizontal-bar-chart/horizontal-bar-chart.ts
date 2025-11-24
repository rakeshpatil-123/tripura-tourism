import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  NgApexchartsModule,
  ChartComponent,
  ApexChart,
  ApexAxisChartSeries,
  ApexXAxis,
  ApexYAxis,
  ApexDataLabels,
  ApexPlotOptions,
  ApexGrid,
  ApexTitleSubtitle
} from 'ng-apexcharts';

export type HorizontalBarChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  colors: string[];
  grid: ApexGrid;
  title: ApexTitleSubtitle;
};

@Component({
  selector: 'app-horizontal-bar-chart',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './horizontal-bar-chart.html',
  styleUrl: './horizontal-bar-chart.scss'
})
export class HorizontalBarChartComponent implements OnChanges {

  @Input() data: any[] | null = null;  // <-- receiving from parent
  @ViewChild('chart') chart!: ChartComponent;

  public chartOptions!: Partial<HorizontalBarChartOptions>;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.data) {
      this.prepareChartData();
    }
  }

  private prepareChartData() {
    const categories = Array.isArray(this.data)
      ? this.data.map(item => item?.service_name ?? '')
      : [];
    const seriesData = Array.isArray(this.data)
      ? this.data.map(item => Number(item?.application_count) || 0)
      : [];
    const perItemHeight = 36;
    const paddingForTitleAndAxes = 120;
    const dynamicHeight = Math.max(350, categories.length * perItemHeight + paddingForTitleAndAxes);
    const barHeightPx = `${Math.max(10, perItemHeight - 12)}px`;

    this.chartOptions = {
      series: [
        {
          name: 'Applications',
          data: seriesData
        }
      ],
      chart: {
        type: 'bar',
        height: dynamicHeight,
        toolbar: { show: true },
        animations: { enabled: true }
      },
      colors: ['#3B82F6'],
      plotOptions: {
        bar: {
          horizontal: true,
          borderRadius: 6,
          barHeight: barHeightPx
        }
      },
      dataLabels: {
        enabled: true,
        style: {
          fontSize: '11px',
          fontWeight: '600',
          colors: ['#fff']
        },
        formatter: (val: any) => String(val)
      },
      grid: {
        borderColor: '#e5e7eb'
      },
      xaxis: {
        categories: categories,
        title: {
          text: 'Application Count',
          style: { fontSize: '14px', fontWeight: 600 }
        },
        labels: {
          style: { fontSize: '12px' }
        }
      },
      yaxis: {
        title: {
          text: 'Services',
          style: { fontSize: '14px', fontWeight: 600 }
        },
        labels: {
          style: { fontSize: '12px' },
          formatter: (val: any) => String(val)
        }
      },
      title: {
        text: 'Applications Per Service',
        align: 'left',
        style: {
          fontSize: '18px',
          fontWeight: '600',
          color: '#1e293b'
        }
      }
    };
    (this.chartOptions as any)._viewportMaxHeight = 600;
  }
}
