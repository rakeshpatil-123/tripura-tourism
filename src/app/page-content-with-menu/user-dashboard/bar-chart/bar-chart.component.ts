import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule, ChartComponent, ApexChart, ApexXAxis, ApexYAxis, ApexDataLabels, ApexPlotOptions, ApexGrid, ApexTitleSubtitle, ApexLegend } from 'ng-apexcharts';
import { GenericService } from '../../../_service/generic/generic.service';
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
    const approved = this.dashboardData?.total_count_approved_application_in_user || 0;
    const pending = this.dashboardData?.total_count_pending_application_in_user || 0;
    const total = this.dashboardData?.total_applications_for_this_user || 0;
    
    const rejected = this.dashboardData?.$total_count_rejected_application_in_department || 0;


    this.chartOptions = {
      series: [
        {
          name: 'Applications',
          data: [approved, pending, rejected] 
        }
      ],
      chart: {
        type: 'bar',
        height: 350,
        toolbar: {
          show: true
        }
      },
      colors: ['#4CAF50', '#FF9800', '#F44336'],
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
        categories: ['Approved', 'Pending', 'Rejected'],
        title: {
          text: 'Status'
        },
        labels: {
          style: {
            fontSize: '12px',
            fontWeight: 500
          }
        }
      },
      yaxis: {
        title: {
          text: 'Count'
        },
        min: 0,
      },
      legend: {
        show: false
      },
      title: {
        text: 'Application Status Breakdown',
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

