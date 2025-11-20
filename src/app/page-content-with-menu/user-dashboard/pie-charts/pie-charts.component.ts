import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule, ChartComponent, ApexChart, ApexNonAxisChartSeries, ApexLegend, ApexResponsive, ApexTitleSubtitle } from 'ng-apexcharts';
import { GenericService } from '../../../_service/generic/generic.service';
import { DashboardService } from '../dashboard-service/dashboard-service';

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
    const approved = this.dashboardData?.total_count_approved_application_in_user || 0;
    const pending = this.dashboardData?.total_count_pending_application_in_user || 0;
    const total = this.dashboardData?.total_applications_for_this_user || 0;
    
    const rejected = this.dashboardData?.$total_count_rejected_application_in_department || 0;

    this.chartOptions = {
      series: [approved, pending, rejected],
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
  }
}

