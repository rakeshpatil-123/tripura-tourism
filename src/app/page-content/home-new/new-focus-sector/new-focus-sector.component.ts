import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

interface Sector {
  icon: string;
  iconSvg: string;
  iconSvgSafe?: SafeHtml;
  title: string;
  investment: string;
  jobs: string;
  isActive: boolean;
}

interface SectorDetail {
  icon: string;
  iconSvg: string;
  iconSvgSafe?: SafeHtml;
  title: string;
  description: string;
  stats: { value: string; label: string; color: string }[];
  policies: { text: string; iconColor: string }[];
  opportunities: { text: string; iconColor: string }[];
  incentives: { text: string; iconColor: string }[];
}

@Component({
  selector: 'app-new-focus-sector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './new-focus-sector.component.html',
  styleUrls: ['./new-focus-sector.component.scss']
})
export class NewFocusSectorComponent implements OnInit {
  sectors: Sector[] = [
    {
      icon: 'cpu',
      iconSvg: `<rect x="4" y="4" width="16" height="16" rx="2"></rect><rect x="9" y="9" width="6" height="6"></rect><path d="M15 2v2"></path><path d="M15 20v2"></path><path d="M2 15h2"></path><path d="M2 9h2"></path><path d="M20 15h2"></path><path d="M20 9h2"></path><path d="M9 2v2"></path><path d="M9 20v2"></path>`,
      title: 'IT & Electronics',
      investment: '₹500 Cr',
      jobs: '15,000 Jobs',
      isActive: true
    },
    {
      icon: 'wheat',
      iconSvg: `<path d="M2 22 16 8"></path><path d="M3.47 12.53 5 11l1.53 1.53a3.5 3.5 0 0 1 0 4.94L5 19l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z"></path><path d="M7.47 8.53 9 7l1.53 1.53a3.5 3.5 0 0 1 0 4.94L9 15l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z"></path><path d="M11.47 4.53 13 3l1.53 1.53a3.5 3.5 0 0 1 0 4.94L13 11l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z"></path><path d="M20 2h2v2a4 4 0 0 1-4 4h-2V6a4 4 0 0 1 4-4Z"></path><path d="M11.47 17.47 13 19l-1.53 1.53a3.5 3.5 0 0 1-4.94 0L5 19l1.53-1.53a3.5 3.5 0 0 1 4.94 0Z"></path><path d="M15.47 13.47 17 15l-1.53 1.53a3.5 3.5 0 0 1-4.94 0L9 15l1.53-1.53a3.5 3.5 0 0 1 4.94 0Z"></path><path d="M19.47 9.47 21 11l-1.53 1.53a3.5 3.5 0 0 1-4.94 0L13 11l1.53-1.53a3.5 3.5 0 0 1 4.94 0Z"></path>`,
      title: 'Agro-processing',
      investment: '₹300 Cr',
      jobs: '25,000 Jobs',
      isActive: false
    },
    {
      icon: 'camera',
      iconSvg: `<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path><circle cx="12" cy="13" r="3"></circle>`,
      title: 'Tourism & Hospitality',
      investment: '₹200 Cr',
      jobs: '12,000 Jobs',
      isActive: false
    },
    {
      icon: 'shirt',
      iconSvg: `<path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"></path>`,
      title: 'Textiles & Handloom',
      investment: '₹400 Cr',
      jobs: '20,000 Jobs',
      isActive: false
    },
    {
      icon: 'zap',
      iconSvg: `<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>`,
      title: 'Renewable Energy',
      investment: '₹800 Cr',
      jobs: '8,000 Jobs',
      isActive: false
    },
    {
      icon: 'truck',
      iconSvg: `<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"></path><path d="M15 18H9"></path><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"></path><circle cx="17" cy="18" r="2"></circle><circle cx="7" cy="18" r="2"></circle>`,
      title: 'Rubber & Plantation',
      investment: '₹350 Cr',
      jobs: '18,000 Jobs',
      isActive: false
    }
  ];

  selectedSector: SectorDetail = {
    icon: 'cpu',
    iconSvg: `<rect x="4" y="4" width="16" height="16" rx="2"></rect><rect x="9" y="9" width="6" height="6"></rect><path d="M15 2v2"></path><path d="M15 20v2"></path><path d="M2 15h2"></path><path d="M2 9h2"></path><path d="M20 15h2"></path><path d="M20 9h2"></path><path d="M9 2v2"></path><path d="M9 20v2"></path>`,
    title: 'IT & Electronics',
    description: 'Advanced technology solutions and electronics manufacturing with state-of-the-art infrastructure and skilled workforce.',
    stats: [
      { value: '₹500 Cr', label: 'Investment', color: 'green-600' },
      { value: '15,000', label: 'Jobs', color: 'blue-600' },
      { value: '45%', label: 'Growth', color: 'orange-600' },
      { value: 'Agartala IT Park', label: 'Location', color: 'purple-600' }
    ],
    policies: [
      { text: 'IT Policy 2024 with 100% exemption on stamp duty', iconColor: 'blue-400' },
      { text: 'Special Economic Zone benefits', iconColor: 'blue-400' },
      { text: 'Skill development programs', iconColor: 'blue-400' },
      { text: 'High-speed internet connectivity', iconColor: 'blue-400' }
    ],
    opportunities: [
      { text: 'Software Development Centers', iconColor: 'green-400' },
      { text: 'Electronics Manufacturing', iconColor: 'green-400' },
      { text: 'Data Centers', iconColor: 'green-400' },
      { text: 'R&D Facilities', iconColor: 'green-400' }
    ],
    incentives: [
      { text: 'Capital subsidy up to 25%', iconColor: 'orange-400' },
      { text: 'Power subsidy for 5 years', iconColor: 'orange-400' },
      { text: 'Land at concessional rates', iconColor: 'orange-400' },
      { text: 'Single window clearance', iconColor: 'orange-400' }
    ]
  };

  chevronSvg = `<path d="m9 18 6-6-6-6"></path>`;
  policySvg = `<path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"></path><path d="M17 18h1"></path><path d="M12 18h1"></path><path d="M7 18h1"></path>`;
  opportunitySvg = `<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline>`;
  incentiveSvg = `<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"></path><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"></path>`;
  locationSvg = `<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle>`;

  chevronSvgSafe: SafeHtml | undefined;
  policySvgSafe: SafeHtml | undefined;
  opportunitySvgSafe: SafeHtml | undefined;
  incentiveSvgSafe: SafeHtml | undefined;
  locationSvgSafe: SafeHtml | undefined;

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    this.sectors.forEach(sector => {
      sector.iconSvgSafe = this.sanitizer.bypassSecurityTrustHtml(sector.iconSvg);
    });
    this.selectedSector.iconSvgSafe = this.sanitizer.bypassSecurityTrustHtml(this.selectedSector.iconSvg);
    this.chevronSvgSafe = this.sanitizer.bypassSecurityTrustHtml(this.chevronSvg);
    this.policySvgSafe = this.sanitizer.bypassSecurityTrustHtml(this.policySvg);
    this.opportunitySvgSafe = this.sanitizer.bypassSecurityTrustHtml(this.opportunitySvg);
    this.incentiveSvgSafe = this.sanitizer.bypassSecurityTrustHtml(this.incentiveSvg);
    this.locationSvgSafe = this.sanitizer.bypassSecurityTrustHtml(this.locationSvg);
  }

  selectSector(sector: Sector): void {
    this.sectors.forEach(s => (s.isActive = false));
    sector.isActive = true;
    // Update selectedSector based on sector selection (simplified for demo)
    this.selectedSector = {
      icon: sector.icon,
      iconSvg: sector.iconSvg,
      iconSvgSafe: sector.iconSvgSafe,
      title: sector.title,
      description: `Advanced technology solutions and ${sector.title.toLowerCase()} with state-of-the-art infrastructure and skilled workforce.`,
      stats: [
        { value: sector.investment, label: 'Investment', color: 'green-600' },
        { value: sector.jobs.replace(' Jobs', ''), label: 'Jobs', color: 'blue-600' },
        { value: '45%', label: 'Growth', color: 'orange-600' },
        { value: 'Agartala IT Park', label: 'Location', color: 'purple-600' }
      ],
      policies: [
        { text: `${sector.title} Policy 2024 with 100% exemption on stamp duty`, iconColor: 'blue-400' },
        { text: 'Special Economic Zone benefits', iconColor: 'blue-400' },
        { text: 'Skill development programs', iconColor: 'blue-400' },
        { text: 'High-speed internet connectivity', iconColor: 'blue-400' }
      ],
      opportunities: [
        { text: `${sector.title} Development Centers`, iconColor: 'green-400' },
        { text: `${sector.title} Manufacturing`, iconColor: 'green-400' },
        { text: 'Data Centers', iconColor: 'green-400' },
        { text: 'R&D Facilities', iconColor: 'green-400' }
      ],
      incentives: [
        { text: 'Capital subsidy up to 25%', iconColor: 'orange-400' },
        { text: 'Power subsidy for 5 years', iconColor: 'orange-400' },
        { text: 'Land at concessional rates', iconColor: 'orange-400' },
        { text: 'Single window clearance', iconColor: 'orange-400' }
      ]
    };
    console.log(`Selected sector: ${sector.title}`);
  }

  applyForInvestment(): void {
    console.log('Applying for investment');
    // Add navigation or form logic
  }

  downloadProfile(): void {
    console.log('Downloading sector profile');
    // Add download logic
  }

  contactExpert(): void {
    console.log('Contacting sector expert');
    // Add contact form or navigation logic
  }
}
