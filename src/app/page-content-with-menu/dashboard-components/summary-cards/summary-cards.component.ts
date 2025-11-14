import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface SummaryCard {
  title: string;
  value: number;
  icon: string;
  color: string;
  change: string;
}

@Component({
  selector: 'app-summary-cards',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './summary-cards.component.html',
  styleUrl: './summary-cards.component.scss'
})
export class SummaryCardsComponent implements OnInit {
  cards: SummaryCard[] = [];

  constructor() {}

  ngOnInit(): void {
      this.cards = [
        {
          title: 'Total Applications',
          value: 5,
          icon: '📝',
          color: 'blue',
          change: '+12% from last month'
        },
        {
          title: 'Approved',
          value: 5,
          icon: '✅',
          color: 'green',
          change: '+8% from last month'
        },
        {
          title: 'Pending',
          value: 5,
          icon: '⏳',
          color: 'orange',
          change: '-3% from last month'
        },
        {
          title: 'Rejected',
          value: 5,
          icon: '❌',
          color: 'red',
          change: '+2% from last month'
        }
      ];
    };
  }

