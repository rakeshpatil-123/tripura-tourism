import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

interface Metric {
  value: string;
  label: string;
  trend: string;
  trendIconSvg: string;
  trendIconSvgSafe?: SafeHtml;
  iconSvg: string;
  iconSvgSafe?: SafeHtml;
}

interface Department {
  name: string;
  applications: string;
  approvals: string;
  avgProcessingTime: string;
  successRate: string;
  iconSvg: string;
  iconSvgSafe?: SafeHtml;
}

interface Insight {
  value: string;
  label: string;
  color: string;
}

@Component({
  selector: 'app-new-performance-analytics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './new-performance-analytics.component.html',
  styleUrls: ['./new-performance-analytics.component.scss']
})
export class NewPerformanceAnalyticsComponent implements OnInit {
  metrics: Metric[] = [
    {
      value: '12,847',
      label: 'Total Applications',
      trend: '+13%',
      trendIconSvg: `<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline>`,
      iconSvg: `<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path><path d="M14 2v4a2 2 0 0 0 2 2h4"></path><path d="M10 9H8"></path><path d="M16 13H8"></path><path d="M16 17H8"></path>`
    },
    {
      value: '11,234',
      label: 'Approvals Issued',
      trend: '+12%',
      trendIconSvg: `<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline>`,
      iconSvg: `<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><path d="m9 11 3 3L22 4"></path>`
    },
    {
      value: '18 Days',
      label: 'Avg. Processing Time',
      trend: '-25%',
      trendIconSvg: `<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline>`,
      iconSvg: `<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>`
    },
    {
      value: '4,567',
      label: 'Active Users',
      trend: '+8%',
      trendIconSvg: `<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline>`,
      iconSvg: `<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>`
    }
  ];

  departments: Department[] = [
    {
      name: 'Industries & Commerce',
      applications: '2,847',
      approvals: '2,634',
      avgProcessingTime: '15 days',
      successRate: '92.5%',
      iconSvg: `<rect width="16" height="20" x="4" y="2" rx="2" ry="2"></rect><path d="M9 22v-4h6v4"></path><path d="M8 6h.01"></path><path d="M16 6h.01"></path><path d="M12 6h.01"></path><path d="M12 10h.01"></path><path d="M12 14h.01"></path><path d="M16 10h.01"></path><path d="M16 14h.01"></path><path d="M8 10h.01"></path><path d="M8 14h.01"></path>`
    },
    {
      name: 'Environment Department',
      applications: '1,856',
      approvals: '1,723',
      avgProcessingTime: '22 days',
      successRate: '92.8%',
      iconSvg: `<rect width="16" height="20" x="4" y="2" rx="2" ry="2"></rect><path d="M9 22v-4h6v4"></path><path d="M8 6h.01"></path><path d="M16 6h.01"></path><path d="M12 6h.01"></path><path d="M12 10h.01"></path><path d="M12 14h.01"></path><path d="M16 10h.01"></path><path d="M16 14h.01"></path><path d="M8 10h.01"></path><path d="M8 14h.01"></path>`
    },
    {
      name: 'Labour Department',
      applications: '1,634',
      approvals: '1,567',
      avgProcessingTime: '12 days',
      successRate: '95.9%',
      iconSvg: `<rect width="16" height="20" x="4" y="2" rx="2" ry="2"></rect><path d="M9 22v-4h6v4"></path><path d="M8 6h.01"></path><path d="M16 6h.01"></path><path d="M12 6h.01"></path><path d="M12 10h.01"></path><path d="M12 14h.01"></path><path d="M16 10h.01"></path><path d="M16 14h.01"></path><path d="M8 10h.01"></path><path d="M8 14h.01"></path>`
    },
    {
      name: 'Revenue Department',
      applications: '1,423',
      approvals: '1,389',
      avgProcessingTime: '18 days',
      successRate: '97.6%',
      iconSvg: `<rect width="16" height="20" x="4" y="2" rx="2" ry="2"></rect><path d="M9 22v-4h6v4"></path><path d="M8 6h.01"></path><path d="M16 6h.01"></path><path d="M12 6h.01"></path><path d="M12 10h.01"></path><path d="M12 14h.01"></path><path d="M16 10h.01"></path><path d="M16 14h.01"></path><path d="M8 10h.01"></path><path d="M8 14h.01"></path>`
    },
    {
      name: 'Forest Department',
      applications: '987',
      approvals: '934',
      avgProcessingTime: '28 days',
      successRate: '94.6%',
      iconSvg: `<rect width="16" height="20" x="4" y="2" rx="2" ry="2"></rect><path d="M9 22v-4h6v4"></path><path d="M8 6h.01"></path><path d="M16 6h.01"></path><path d="M12 6h.01"></path><path d="M12 10h.01"></path><path d="M12 14h.01"></path><path d="M16 10h.01"></path><path d="M16 14h.01"></path><path d="M8 10h.01"></path><path d="M8 14h.01"></path>`
    },
    {
      name: 'Fire & Emergency Services',
      applications: '756',
      approvals: '723',
      avgProcessingTime: '8 days',
      successRate: '95.6%',
      iconSvg: `<rect width="16" height="20" x="4" y="2" rx="2" ry="2"></rect><path d="M9 22v-4h6v4"></path><path d="M8 6h.01"></path><path d="M16 6h.01"></path><path d="M12 6h.01"></path><path d="M12 10h.01"></path><path d="M12 14h.01"></path><path d="M16 10h.01"></path><path d="M16 14h.01"></path><path d="M8 10h.01"></path><path d="M8 14h.01"></path>`
    },
    {
      name: 'Pollution Control Board',
      applications: '634',
      approvals: '598',
      avgProcessingTime: '25 days',
      successRate: '94.3%',
      iconSvg: `<rect width="16" height="20" x="4" y="2" rx="2" ry="2"></rect><path d="M9 22v-4h6v4"></path><path d="M8 6h.01"></path><path d="M16 6h.01"></path><path d="M12 6h.01"></path><path d="M12 10h.01"></path><path d="M12 14h.01"></path><path d="M16 10h.01"></path><path d="M16 14h.01"></path><path d="M8 10h.01"></path><path d="M8 14h.01"></path>`
    }
  ];

  insights: Insight[] = [
    { value: '98.7%', label: 'System Uptime', color: 'text-orange-400' },
    { value: '2.3s', label: 'Avg Response Time', color: 'text-green-400' },
    { value: '15', label: 'Integrated Depts', color: 'text-yellow-400' },
    { value: '24/7', label: 'Support Available', color: 'text-purple-400' }
  ];

  barChartSvg = `<path d="M3 3v18h18"></path><path d="M18 17V9"></path><path d="M13 17V5"></path><path d="M8 17v-3"></path>`;
  filterSvg = `<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>`;

  barChartSvgSafe: SafeHtml | undefined;
  filterSvgSafe: SafeHtml | undefined;

  activeTab: string = 'Department Performance';

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    this.metrics.forEach(metric => {
      metric.iconSvgSafe = this.sanitizer.bypassSecurityTrustHtml(metric.iconSvg);
      metric.trendIconSvgSafe = this.sanitizer.bypassSecurityTrustHtml(metric.trendIconSvg);
    });
    this.departments.forEach(dept => {
      dept.iconSvgSafe = this.sanitizer.bypassSecurityTrustHtml(dept.iconSvg);
    });
    this.barChartSvgSafe = this.sanitizer.bypassSecurityTrustHtml(this.barChartSvg);
    this.filterSvgSafe = this.sanitizer.bypassSecurityTrustHtml(this.filterSvg);
  }

  selectTab(tab: string): void {
    this.activeTab = tab;
    console.log(`Selected tab: ${tab}`);
    // Add logic to switch content if needed
  }

  viewReports(): void {
    console.log('Viewing detailed reports');
    // Add navigation or report generation logic
  }

  customAnalytics(): void {
    console.log('Accessing custom analytics');
    // Add navigation or analytics logic
  }
}
