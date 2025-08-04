// services-card.component.ts
import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, HostListener } from '@angular/core';
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
  readonly MOBILE_BREAKPOINT = 768;
  isMobile = false;
  loaded = false;

  ourServices: ServiceItem[] = [];

  private readonly gradients = [
    'linear-gradient(135deg, rgb(47, 99, 177), rgb(93, 81, 194))',
    'linear-gradient(135deg, rgb(25, 138, 117), rgb(44, 130, 170))',
    'linear-gradient(135deg, rgb(119, 16, 132), rgb(168, 31, 115))',
    'linear-gradient(135deg, rgb(17, 156, 135), rgb(34, 136, 191))',
    'linear-gradient(135deg, rgb(122, 21, 82), rgb(156, 38, 50))',
    'linear-gradient(135deg, rgb(63, 94, 251), rgb(252, 70, 108))',
    'linear-gradient(135deg, rgb(34, 197, 94), rgb(13, 148, 135))',
    'linear-gradient(135deg, rgb(168, 85, 247), rgb(100, 124, 255))',
    'linear-gradient(135deg, rgb(239, 68, 68), rgb(234, 179, 8))',
    'linear-gradient(135deg, rgb(59, 130, 246), rgb(99, 102, 241))',
    'linear-gradient(135deg, rgb(16, 185, 129), rgb(34, 197, 94))',
    'linear-gradient(135deg, rgb(139, 92, 246), rgb(217, 70, 239))',
  ];

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    this.isMobile = window.innerWidth < this.MOBILE_BREAKPOINT;

    // Safe initialization of ourServices using the sanitizer
    this.ourServices = this.generateServicesWithSanitizedIcons();

    // If no input services provided, fallback to default
    this.services = this.services.length > 0 ? this.services : this.ourServices;
    this.loadServices();
    this.loaded = true;
  }

  @HostListener('window:resize', [])
  onResize() {
    const wasMobile = this.isMobile;
    this.isMobile = window.innerWidth < this.MOBILE_BREAKPOINT;

    if (this.loaded) {
      this.loadServices();
    }
  }

  loadServices() {
    this.visibleServices = this.isMobile
      ? this.services.slice(0, 5)
      : [...this.services];
  }

  loadMore() {
    this.visibleServices = [...this.services];
  }

  get hasMoreServices(): boolean {
    return this.services.length > 5 && this.visibleServices.length < this.services.length;
  }

  getGradientForIndex(index: number): string {
    return this.gradients[index % this.gradients.length];
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
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
        <line x1="8" y1="21" x2="16" y2="21"/>
        <line x1="12" y1="17" x2="12" y2="21"/>
        <path d="m7 7 3 3-3 3"/>
        <path d="m13 7 3 0"/>
        <path d="m13 11 3 0"/>
      </svg>
    `),
    description: 'Promotes industrial development, trade, and entrepreneurship across sectors in Tripura.'
  },
  {
    name: 'Tripura Forest Department',
    icon: this.sanitize(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 22c-4.97 0-9-4.03-9-9 0-2.5 1-4.8 2.6-6.4C7.2 5 9.5 4 12 4s4.8 1 6.4 2.6C20 8.2 21 10.5 21 13c0 4.97-4.03 9-9 9z"/>
        <path d="M12 4V2"/>
        <path d="M8 6l-2-2"/>
        <path d="M16 6l2-2"/>
        <circle cx="12" cy="13" r="3"/>
        <path d="M12 16v6"/>
        <path d="M10 18l-2 2"/>
        <path d="M14 18l2 2"/>
      </svg>
    `),
    description: 'Manages conservation of forests, biodiversity, and ecological sustainability in Tripura.'
  },
  {
    name: 'Health & Family Welfare Department',
    icon: this.sanitize(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
        <path d="M12 2v20"/>
        <path d="M8 12h8"/>
      </svg>
    `),
    description: 'Ensuring public health, family welfare, and medical infrastructure in the state.'
  },
  {
    name: 'Factories & Boilers Organization',
    icon: this.sanitize(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="2" y="8" width="20" height="12" rx="2"/>
        <path d="M6 8V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2"/>
        <circle cx="8" cy="14" r="2"/>
        <circle cx="16" cy="14" r="2"/>
        <path d="M12 4v4"/>
        <path d="M10 2h4"/>
        <path d="M12 8l-2 2"/>
        <path d="M12 8l2 2"/>
      </svg>
    `),
    description: 'Government organization ensuring compliance with safety standards in factories and boilers.'
  },
  {
    name: 'Tripura Industrial Development Corporation Ltd.',
    icon: this.sanitize(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="2" y="6" width="20" height="12" rx="2"/>
        <path d="M2 12h20"/>
        <path d="M6 6V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2"/>
        <circle cx="8" cy="9" r="1"/>
        <circle cx="12" cy="9" r="1"/>
        <circle cx="16" cy="9" r="1"/>
        <path d="M7 15l5-3 5 3"/>
      </svg>
    `),
    description: 'Facilitating industrial development and investment promotion in Tripura.'
  },
  {
    name: 'Electrical Inspectorate',
    icon: this.sanitize(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
        <path d="M8 14v6"/>
        <path d="M16 10V4"/>
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
        <path d="M9 12h6"/>
        <path d="M12 9v6"/>
      </svg>
    `),
    description: 'Responsible for regulating labor laws, worker welfare, and employment standards.'
  },
  {
    name: 'Tripura Electricity',
    icon: this.sanitize(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M2 12h4l3-9 4 18 3-9h4"/>
        <circle cx="12" cy="5" r="2"/>
        <path d="M12 7v10"/>
        <path d="M8 19l8-8"/>
        <path d="M16 19l-8-8"/>
      </svg>
    `),
    description: 'Electricity board symbol representing energy infrastructure and utilities.'
  },
  {
    name: 'State Incentive',
    icon: this.sanitize(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="8" r="6"/>
        <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>
        <path d="M12 2v6"/>
        <path d="M9 5l6 6"/>
        <path d="M15 5l-6 6"/>
      </svg>
    `),
    description: 'Monetary incentive icon representing state subsidies or financial support schemes.'
  },
  {
    name: 'Tripura State Pollution Board',
    icon: this.sanitize(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 6a6 6 0 0 0 0 12"/>
        <path d="M8 12h8"/>
        <path d="M12 8v8"/>
        <path d="M9 9l6 6"/>
        <path d="M15 9l-6 6"/>
      </svg>
    `),
    description: 'Represents Tripura State Pollution Control Board official environmental symbol.'
  },
  {
    name: 'Commissionerate of Taxes & Excise',
    icon: this.sanitize(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="4" width="18" height="16" rx="2"/>
        <path d="M7 8h10"/>
        <path d="M7 12h10"/>
        <path d="M7 16h6"/>
        <circle cx="12" cy="12" r="8"/>
        <path d="M15 9l-6 6"/>
        <path d="M9 9l6 6"/>
      </svg>
    `),
    description: 'Represents financial duties or taxation analytics and forms.'
  },
  {
    name: 'Department of Co-operation',
    icon: this.sanitize(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        <path d="M9 12l2 2 4-4"/>
      </svg>
    `),
    description: 'Symbolizes teamwork, mutual support, and collaborative interaction.'
  },
  {
    name: 'Legal Metrology(Civil Supplies & Consumer Affairs)',
    icon: this.sanitize(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 3v6l4 2"/>
        <circle cx="12" cy="12" r="9"/>
        <path d="M12 1v2"/>
        <path d="M21 12h2"/>
        <path d="M12 21v2"/>
        <path d="M1 12h2"/>
        <path d="M18.36 5.64l1.42 1.42"/>
        <path d="M3.22 18.78l1.42 1.42"/>
        <path d="M18.36 18.36l1.42-1.42"/>
        <path d="M3.22 5.22l1.42-1.42"/>
      </svg>
    `),
    description: 'Atmospheric pressure measurement—weather, altitude, and climate visuals.'
  },
  {
    name: 'Tripura Pollution Control',
    icon: this.sanitize(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 12a9 9 0 1 0 18 0"/>
        <path d="M12 3a9 9 0 0 1 9 9"/>
        <path d="M8 12a4 4 0 1 0 8 0"/>
        <path d="M12 8v8"/>
        <path d="M8 12h8"/>
        <path d="M9 9l6 6"/>
        <path d="M15 9l-6 6"/>
      </svg>
    `),
    description: 'Visualizes hazardous pollution levels or environmental concerns.'
  },
  {
    name: 'Directorate of Fire Service',
    icon: this.sanitize(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
        <path d="M12 2v2"/>
        <path d="M12 18v2"/>
        <path d="M4.93 4.93l1.41 1.41"/>
        <path d="M17.66 17.66l1.41 1.41"/>
      </svg>
    `),
    description: 'Fire department symbol for emergency announcements.'
  }
];
  }
}
