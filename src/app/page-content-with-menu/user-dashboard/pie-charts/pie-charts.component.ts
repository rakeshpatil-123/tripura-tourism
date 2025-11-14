import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule, ChartComponent, ApexChart, ApexNonAxisChartSeries, ApexLegend, ApexResponsive, ApexTitleSubtitle } from 'ng-apexcharts';

export type PieChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  labels: string[];
  colors: string[];
  legend: ApexLegend;
  responsive: ApexResponsive[];
  title: ApexTitleSubtitle;
  toolbar?: {
    show: boolean;
    tools?: {
      download: boolean;
    };
  };
};

@Component({
  selector: 'app-pie-chart',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './pie-charts.component.html',
  styleUrl: './pie-charts.component.scss'
})
export class PieChartsComponent implements OnInit {
  @ViewChild('chart') chart!: ChartComponent;
  public chartOptions!: Partial<PieChartOptions>;

  constructor() {}

  ngOnInit(): void {
    
      this.chartOptions = {
        series: [50, 60, 70],
        chart: {
          type: 'pie',
          height: 380,
          toolbar: {
            show: true,
            tools: {
              download: true
            }
          }
        },
        labels: ['Approved', 'Pending', 'Rejected'],
        colors: ['#4CAF50', '#FF9800', '#F44336'],
        legend: {
          position: 'bottom',
          fontSize: '14px',
          fontFamily: 'Inter, sans-serif',
          labels: {
            colors: '#64748b'
          }
        },
        responsive: [
          {
            breakpoint: 480,
            options: {
              chart: {
                height: 300
              },
              legend: {
                position: 'bottom'
              }
            }
          }
        ],
        title: {
          text: 'Status Distribution',
          align: 'left',
          style: {
            fontSize: '18px',
            fontWeight: '600',
            color: '#1e293b'
          }
        }
      };
    };
  }

