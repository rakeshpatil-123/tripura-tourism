import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

export interface ServiceItem {
  name: string;
  icon: SafeHtml;
  description?: string;
}

@Component({
  selector: 'app-services-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './services-card.component.html',
  styleUrls: ['./services-card.component.scss'],
})
export class ServicesCardComponent implements OnInit {
  @Input() services: ServiceItem[] = [];

  visibleServices: ServiceItem[] = [];
  loaded = false;

  ourServices: ServiceItem[] = [];

  // Solid colors with low transparency for backgrounds
  private readonly backgroundColors = [
    'rgba(239, 68, 68, 0.1)',    // Red
    'rgba(34, 197, 94, 0.1)',    // Green
    'rgba(59, 130, 246, 0.1)',   // Blue
    'rgba(168, 85, 247, 0.1)',   // Purple
    'rgba(245, 158, 11, 0.1)',   // Amber
    'rgba(236, 72, 153, 0.1)',   // Pink
    'rgba(20, 184, 166, 0.1)',   // Teal
    'rgba(99, 102, 241, 0.1)',   // Indigo
    'rgba(249, 115, 22, 0.1)',   // Orange
    'rgba(139, 69, 19, 0.1)',    // Brown
    'rgba(75, 85, 99, 0.1)',     // Gray
    'rgba(220, 38, 127, 0.1)',   // Rose
    'rgba(16, 185, 129, 0.1)',   // Emerald
    'rgba(147, 51, 234, 0.1)',   // Violet
  ];

  // Bright colors for SVG icons
  private readonly iconColors = [
    '#ef4444',    // Red
    '#22c55e',    // Green
    '#3b82f6',    // Blue
    '#a855f7',    // Purple
    '#f59e0b',    // Amber
    '#ec4899',    // Pink
    '#14b8a6',    // Teal
    '#6366f1',    // Indigo
    '#f97316',    // Orange
    '#8b4513',    // Brown
    '#4b5563',    // Gray
    '#dc2563',    // Rose
    '#10b981',    // Emerald
    '#9333ea',    // Violet
  ];

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    this.ourServices = this.generateServicesWithSanitizedIcons();
    this.services = this.services.length > 0 ? this.services : this.ourServices;
    this.visibleServices = this.services.slice(0, 12);
    this.loaded = true;
  }

  loadMore() {
    this.visibleServices = [...this.services];
  }

  get hasMoreServices(): boolean {
    return this.services.length > 10 && this.visibleServices.length < this.services.length;
  }

  getBackgroundColorForIndex(index: number): string {
    return this.backgroundColors[index % this.backgroundColors.length];
  }

  getIconColorForIndex(index: number): string {
    return this.iconColors[index % this.iconColors.length];
  }

  sanitize(svg: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(svg);
  }

  private generateServicesWithSanitizedIcons(): ServiceItem[] {
    return [
      {
        name: 'Department of Industries & Commerce',
        icon: this.sanitize(`
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9,22 9,12 15,12 15,22"/>
            <path d="M6 16h.01"/>
            <path d="M18 16h.01"/>
          </svg>
        `),
        description: 'Promotes industrial development, trade, and entrepreneurship across sectors.'
      },
      {
        name: 'Tripura Forest Department',
        icon: this.sanitize(`
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10 10v.01M14 10v.01M12 16v.01M12 2C8.5 2 5 4.5 5 8c0 2 1 4 3 5 0 0 0 2 1 3s3 1 3 1 2 0 3-1 1-3 1-3c2-1 3-3 3-5 0-3.5-3.5-6-8-6z"/>
            <path d="M8.5 8.5c.5-.3 1.1-.5 1.8-.5s1.3.2 1.8.5"/>
            <path d="M17 17l1.5 1.5"/>
          </svg>
        `),
        description: 'Manages conservation of forests, biodiversity, and ecological sustainability.'
      },
      {
        name: 'Health & Family Welfare',
        icon: this.sanitize(`
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            <path d="M7 12v9l5-4 5 4v-9"/>
            <circle cx="12" cy="8" r="3"/>
          </svg>
        `),
        description: 'Ensuring public health, family welfare, and medical infrastructure.'
      },
      {
        name: 'Factories & Boilers Organization',
        icon: this.sanitize(`
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="6" width="20" height="14" rx="2"/>
            <circle cx="8" cy="10" r="1"/>
            <circle cx="12" cy="10" r="1"/>
            <circle cx="16" cy="10" r="1"/>
            <path d="M7 6V4a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2"/>
            <path d="M10 14h4"/>
            <path d="M12 16v4"/>
          </svg>
        `),
        description: 'Ensuring compliance with safety standards in factories and boilers.'
      },
      {
        name: 'Industrial Development Corporation',
        icon: this.sanitize(`
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 21h18"/>
            <path d="M5 21V7l8-4v18"/>
            <path d="M19 21V11l-6-4"/>
            <path d="M9 9v.01"/>
            <path d="M9 12v.01"/>
            <path d="M9 15v.01"/>
            <path d="M16 12v.01"/>
            <path d="M16 15v.01"/>
          </svg>
        `),
        description: 'Facilitating industrial development and investment promotion.'
      },
      {
        name: 'Electrical Inspectorate',
        icon: this.sanitize(`
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
            <circle cx="9" cy="9" r="1"/>
            <circle cx="15" cy="15" r="1"/>
          </svg>
        `),
        description: 'Ensuring safety and compliance in electrical installations and systems.'
      },
      {
        name: 'Directorate of Labour',
        icon: this.sanitize(`
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            <path d="M12 14l2 2 4-4"/>
          </svg>
        `),
        description: 'Regulating labor laws, worker welfare, and employment standards.'
      },
      {
        name: 'Tripura Electricity Board',
        icon: this.sanitize(`
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M12 1v6m-6-2 3 3m6 0 3-3M12 17v6m-6 2 3-3m6 0 3 3"/>
            <path d="M5 12H1m22 0h-4"/>
            <path d="M7.5 7.5 4 4m16 0-3.5 3.5M7.5 16.5 4 20m16 0-3.5-3.5"/>
          </svg>
        `),
        description: 'Managing electricity distribution and energy infrastructure.'
      },
      {
        name: 'State Incentive Programs',
        icon: this.sanitize(`
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="8" r="6"/>
            <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>
            <path d="M9 8h6"/>
            <path d="M12 5v6"/>
          </svg>
        `),
        description: 'State subsidies and financial support schemes for businesses.'
      },
      {
        name: 'Pollution Control Board',
        icon: this.sanitize(`
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 12a9 9 0 1 0 18 0 9 9 0 1 0-18 0"/>
            <path d="M12 3v6l4 2"/>
            <path d="M16 14a4 4 0 1 1-8 0"/>
            <path d="M9 14h6"/>
          </svg>
        `),
        description: 'Environmental protection and pollution control measures.'
      },
      {
        name: 'Commissionerate of Taxes',
        icon: this.sanitize(`
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
            <path d="M8 14h.01"/>
            <path d="M12 14h.01"/>
            <path d="M16 14h.01"/>
            <path d="M8 18h.01"/>
            <path d="M12 18h.01"/>
            <path d="M16 18h.01"/>
          </svg>
        `),
        description: 'Tax administration and revenue collection services.'
      },
      {
        name: 'Department of Co-operation',
        icon: this.sanitize(`
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            <circle cx="12" cy="14" r="2"/>
          </svg>
        `),
        description: 'Promoting cooperative societies and mutual support programs.'
      },
      {
        name: 'Legal Metrology',
        icon: this.sanitize(`
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
            <path d="M9 12l2 2 4-4"/>
            <circle cx="12" cy="8" r="2"/>
          </svg>
        `),
        description: 'Standards and measurements for consumer protection.'
      },
      {
        name: 'Fire & Emergency Services',
        icon: this.sanitize(`
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
            <path d="M12 2v2"/>
            <path d="M12 16v2"/>
          </svg>
        `),
        description: 'Fire safety, emergency response, and disaster management.'
      }
    ];
  }
}