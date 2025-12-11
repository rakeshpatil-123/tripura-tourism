import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule, ChartComponent, ApexChart, ApexXAxis, ApexYAxis, ApexDataLabels, ApexPlotOptions, ApexGrid, ApexTitleSubtitle, ApexLegend } from 'ng-apexcharts';
import { DashboardService } from '../dashboard-service/dashboard-service';

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
  templateUrl: './bar-chart.component.html',
  styleUrl: './bar-chart.component.scss'
})
export class BarChartComponent implements OnInit {
  @ViewChild('chart') chart!: ChartComponent;
  public chartOptions!: Partial<BarChartOptions>;
  dashboardData: any = null;

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.dashboardService.dashboardData$.subscribe({
      next: (data: any) => {
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
    if (this.dashboardData?.noc_issued_per_service) {
      const nonZeroNocServices = this.dashboardData.noc_issued_per_service.filter((service: any) => service.noc_issued > 0);
      
      const servicesToShow = nonZeroNocServices.length > 0 ? nonZeroNocServices : this.dashboardData.noc_issued_per_service;
      
      const topServices = servicesToShow.slice(0, 10);
      
      const categories = topServices.map((service: any) => service.service_name);
      const seriesData = topServices.map((service: any) => service.noc_issued);

      this.chartOptions = {
        series: [
          {
            name: 'NOCs Issued',
            data: seriesData
          }
        ],
        chart: {
          type: 'bar',
          height: 400,
          toolbar: {
            show: true
          }
        },
        colors: ['#4CAF50'],
        plotOptions: {
          bar: {
            distributed: true,
            borderRadius: 2,
            horizontal: false,
            columnWidth: '50%',
          }
        },
        dataLabels: {
          enabled: true,
          style: {
            fontSize: '18px',
            fontWeight: 600,
            colors: ['#fff']
          },
            formatter: (val: number) => {
            return val > 0 ? val.toString() : '';
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
            text: 'NOC Issued'
          },
          tickPlacement: 'on',
          labels: {
            rotate: -90,
            rotateAlways: true,
            maxHeight: 450,
            style: {
              fontSize: '10px',
              cssClass: 'apexcharts-xaxis-label'
            }
          },
           axisBorder: {
            show: true
          },
          axisTicks: {
            show: true
          }
        },
        yaxis: {
          title: {
            text: 'NOCs Issued Count'
          },
          min: 0,
        },
        legend: {
          show: false
        },
        title: {
          text: 'NOCs Issued per Service',
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
            name: 'NOCs Issued',
            data: []
          }
        ],
        chart: {
          type: 'bar',
          height: 350,
          toolbar: {
            show: true
          }
        },
        colors: ['#4CAF50'],
        plotOptions: {
          bar: {
            distributed: true,
            borderRadius: 8,
            horizontal: false,
            columnWidth: '50%',
          }
        },
        dataLabels: {
          enabled: true,
          style: {
            fontSize: '14px',
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
          categories: [],
          title: {
            text: 'Services'
          },
          labels: {
            rotate: -45,
            style: {
              fontSize: '10px'
            }
          }
        },
        yaxis: {
          title: {
            text: 'NOCs Issued Count'
          },
          min: 0,
        },
        legend: {
          show: false
        },
        title: {
          text: 'NOCs Issued per Service',
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