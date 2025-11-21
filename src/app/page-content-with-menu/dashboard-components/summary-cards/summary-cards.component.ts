import { Component, Input, OnInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';


interface SummaryCard {
  title: string;
  value: number;
  percentage: number;
  icon: string;
  color: string;
  change?: string;
}

@Component({
  selector: 'app-summary-cards',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './summary-cards.component.html',
  styleUrl: './summary-cards.component.scss'
})
export class SummaryCardsComponent implements OnInit, OnChanges {
  @Input() dashboardData: any;
  @Input() sidebarCollapsed: boolean = false;

  cards: SummaryCard[] = [];


  constructor() { }


  ngOnInit(): void {
    if (this.dashboardData) {
      this.mapDashboardDataToCards();
    }
  }


  ngOnChanges(): void {
    if (this.dashboardData) {
      this.mapDashboardDataToCards();
    }
  }


  mapDashboardDataToCards() {
      this.cards = [
        {
          title: 'Total Applications',
          value: this.dashboardData.total_applications_for_this_department ?? 0,
          percentage: this.dashboardData.percentage_total_application ?? 0,
          icon: '📝',
          color: 'blue',
        },
        {
          title: 'Approved',
          value: this.dashboardData.total_count_approved_application_in_department ?? 0,
          percentage: this.dashboardData.percentage_approved_application ?? 0,
          icon: '✅',
          color: 'green',
        },
        {
          title: 'Pending',
          value: this.dashboardData.total_count_pending_application_in_department ?? 0,
          percentage: this.dashboardData.percentage_pending_application ?? 0,
          icon: '⏳',
          color: 'orange',
        },
        {
          title: 'Rejected',
          value: this.dashboardData.$total_count_rejected_application_in_department ?? 0,
          percentage: this.dashboardData.percentage_rejected_application ?? 0,
          icon: '❌',
          color: 'red',
        }
      ];
    }
  }