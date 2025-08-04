import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-analytics-section',
  imports: [CommonModule],
  templateUrl: './analytics-section.component.html',
  styleUrl: './analytics-section.component.scss'
})
export class AnalyticsSectionComponent {
kpiData = [
    {
      title: 'Applications Submitted',
      value: '35,007',
      change: '+8.2% from last month',
      trend: 'up',
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      color: 'purple'
    },
    {
      title: 'Online NOC Issued',
      value: '32,532',
      change: '+12.8% from last month',
      trend: 'up',
      icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      color: 'green'
    },
    {
      title: 'Investor Query Submitted',
      value: '42',
      change: '+15.4% from last month',
      trend: 'up',
      icon: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      color: 'blue'
    },
    {
      title: 'Investor Query Responded',
      value: '40',
      change: '+13.6% from last month',
      trend: 'up',
      icon: 'M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6',
      color: 'orange'
    }
  ];

  // Summary stats
  summaryStats = [
    { label: 'System Reliability', value: '98.5%', color: '#7c3aed' },
    { label: 'Avg Response Time', value: '24 days', color: '#059669' },
    { label: 'Data Accuracy', value: '99.9%', color: '#0284c7' }
  ];

  ngOnInit(): void {
    console.log('Landing Page component initialized');
  }

  ngOnDestroy(): void {
    console.log('Landing Page component destroyed');
  }

  // Helper method to get trend direction
  getTrendClass(trend: string): string {
    return trend === 'up' ? 'trend-up' : 'trend-down';
  }

  // Helper method to get color class
  getColorClass(color: string): string {
    return `color-${color}`;
  }
}
