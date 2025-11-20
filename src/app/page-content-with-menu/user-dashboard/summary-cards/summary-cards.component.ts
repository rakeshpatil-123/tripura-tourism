import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { DashboardService } from '../dashboard-service/dashboard-service';
import { MatIconModule } from '@angular/material/icon';

interface SummaryCard {
  title: string;
  value: number;
  icon: string;
  color: string;
  change: any;
}

@Component({
  selector: 'app-summary-cards',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './summary-cards.component.html',
  styleUrl: './summary-cards.component.scss',
})
export class SummaryCardsComponent implements OnInit {
  cards: SummaryCard[] = [];
  dashboardData: any = null;

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    // Subscribe to the shared observable
    this.dashboardService.dashboardData$.subscribe({
      next: (data: any) => {
        if (data) {
          this.dashboardData = data;
          this.initializeCards();
        }
      },
      error: (error) => {
        console.error('Error fetching dashboard data', error);
      },
    });
  }

  initializeCards(): void {
    if (this.dashboardData) {
      this.cards = [
        {
          title: 'Total Applications',
          value: this.dashboardData.total_applications_for_this_user || 0,
          icon: 'description',
          color: 'blue',
          change:
            `+${Math.round(
              this.dashboardData.percentage_total_application
            )}% from last month ` || 0,
        },
        {
          title: 'Approved',
          value:
            this.dashboardData.total_count_approved_application_in_user || 0,
          icon: 'check_circle',
          color: 'green',
          change:
            `+${Math.round(
              this.dashboardData.percentage_approved_application
            )}% from last month ` || 0,
        },
        {
          title: 'Pending',
          value:
            this.dashboardData.total_count_pending_application_in_user || 0,
          icon: 'hourglass_empty',
          color: 'orange',
          change:
            `+${Math.round(
              this.dashboardData.percentage_pending_application
            )}% from last month ` || 0,
        },
        {
          title: 'Rejected',
          value:
              this.dashboardData.$total_count_rejected_application_in_department
             || 0,
          icon: 'cancel',
          color: 'red',
          change:
            `+${Math.round(
              this.dashboardData.percentage_rejected_application
            )}% from last month ` || 0,
        },
      ];
    }
  }
}
