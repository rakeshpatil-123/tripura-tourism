import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule, ChartComponent, ApexChart, ApexXAxis, ApexDataLabels, ApexStroke, ApexMarkers, ApexYAxis, ApexGrid, ApexTitleSubtitle, ApexLegend } from 'ng-apexcharts';
import { DashboardService } from '../dashboard-service/dashboard-service';

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
  templateUrl: './line-chart.component.html',
  styleUrl: './line-chart.component.scss'
})
export class LineChartComponent implements OnInit {
   @ViewChild('chart') chart!: ChartComponent;
  public chartOptions!: Partial<ChartOptions>;
  dashboardData: any = null;

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.dashboardService.dashboardData$.subscribe({
      next: ( data:any) => {
        if (data) {
          this.dashboardData = data;
          this.initializeChart();
        }
      },
      error: (error) => {
        console.error('Error fetching dashboard data', error);
        this.initializeChart();
      }
    });
  }

  initializeChart(): void {
    if (this.dashboardData) {
      const services = this.dashboardData.application_count_per_service || [];
      
      const nonZeroServices = services.filter((service: any) => service.application_count > 0);
      
      const topServices = nonZeroServices.slice(0, 10);
      
      const categories = topServices.map((service: any) => service.service_name);
      const seriesData = topServices.map((service: any) => service.application_count);

      this.chartOptions = {
        series: [
          {
            name: 'Applications per Service',
            data: seriesData
          }
        ],
        chart: {
          height: 350,
          type: 'line',
          toolbar: {
            show: true
          },
          zoom: {
            enabled: false
          }
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
          hover: {
            size: 7
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
          categories: categories,
          title: {
            text: 'Services'
          },
          labels: {
            rotate: -45,
            rotateAlways: true,
            maxHeight: 120,
            style: {
              fontSize: '10px',
              cssClass: 'apexcharts-xaxis-label'
            }
          }
        },
        yaxis: {
          title: {
            text: 'Number of Applications'
          },
          min: 0
        },
        legend: {
          position: 'top',
          horizontalAlign: 'right'
        },
        title: {
          text: 'Applications Count by Service',
          align: 'left',
          style: {
            fontSize: '18px',
            fontWeight: '600',
            color: '#1e293b'
          }
        }
      };
    } else {
      this.chartOptions = {
        series: [
          {
            name: 'Applications per Service',
            data: []
          }
        ],
        chart: {
          height: 350,
          type: 'line',
          toolbar: {
            show: true
          },
          zoom: {
            enabled: false
          }
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
          hover: {
            size: 7
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
          categories: [],
          title: {
            text: 'Services'
          }
        },
        yaxis: {
          title: {
            text: 'Number of Applications'
          },
          min: 0
        },
        legend: {
          position: 'top',
          horizontalAlign: 'right'
        },
        title: {
          text: 'Applications Count by Service',
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
  }

