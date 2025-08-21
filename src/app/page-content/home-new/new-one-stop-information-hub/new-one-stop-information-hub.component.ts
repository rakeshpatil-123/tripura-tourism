import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

interface QuickLink {
  iconSvg: string;
  iconSvgSafe?: SafeHtml;
  iconColor: string;
  label: string;
}

interface Category {
  iconSvg: string;
  iconSvgSafe?: SafeHtml;
  label: string;
  bgColor: string;
  textColor: string;
}

interface Policy {
  title: string;
  description: string;
  type: string;
  size: string;
  updated: string;
  downloads: number;
}

@Component({
  selector: 'app-new-one-stop-information-hub',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './new-one-stop-information-hub.component.html',
  styleUrls: ['./new-one-stop-information-hub.component.scss']
})
export class NewOneStopInformationHubComponent implements OnInit {
  searchSvg = `<circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path>`;
  downloadSvg = `<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" x2="12" y1="15" y2="3"></line>`;
  phoneSvg = `<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>`;
  mailSvg = `<rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>`;
  externalLinkSvg = `<path d="M15 3h6v6"></path><path d="M10 14 21 3"></path><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>`;

  quickLinks: QuickLink[] = [
    {
      iconSvg: `<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path><path d="M14 2v4a2 2 0 0 0 2 2h4"></path><path d="M10 9H8"></path><path d="M16 13H8"></path><path d="M16 17H8"></path>`,
      iconColor: 'text-blue-600',
      label: 'Investment Application Form'
    },
    {
      iconSvg: `<rect width="16" height="20" x="4" y="2" rx="2" ry="2"></rect><path d="M9 22v-4h6v4"></path><path d="M8 6h.01"></path><path d="M16 6h.01"></path><path d="M12 6h.01"></path><path d="M12 10h.01"></path><path d="M12 14h.01"></path><path d="M16 10h.01"></path><path d="M16 14h.01"></path><path d="M8 10h.01"></path><path d="M8 14h.01"></path>`,
      iconColor: 'text-green-600',
      label: 'Land Bank Portal'
    },
    {
      iconSvg: `<circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path>`,
      iconColor: 'text-orange-600',
      label: 'Track Application Status'
    },
    {
      iconSvg: `<circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><path d="M12 17h.01"></path>`,
      iconColor: 'text-red-600',
      label: 'Grievance Portal'
    },
    {
      iconSvg: `<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>`,
      iconColor: 'text-purple-600',
      label: 'Live Chat Support'
    },
    {
      iconSvg: `<rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>`,
      iconColor: 'text-teal-600',
      label: 'Email Support'
    }
  ];

  categories: Category[] = [
    {
      iconSvg: `<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path>`,
      label: 'Policies & Schemes',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      iconSvg: `<circle cx="12" cy="8" r="6"></circle><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"></path>`,
      label: 'Incentives & Subsidies',
      bgColor: 'bg-white',
      textColor: 'text-gray-600'
    },
    {
      iconSvg: `<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>`,
      label: 'Guidelines & Procedures',
      bgColor: 'bg-white',
      textColor: 'text-gray-600'
    },
    {
      iconSvg: `<circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><path d="M12 17h.01"></path>`,
      label: 'FAQs & Support',
      bgColor: 'bg-white',
      textColor: 'text-gray-600'
    },
    {
      iconSvg: `<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>`,
      label: 'Contact Directory',
      bgColor: 'bg-white',
      textColor: 'text-gray-600'
    },
    {
      iconSvg: `<rect width="16" height="20" x="4" y="2" rx="2" ry="2"></rect><path d="M9 22v-4h6v4"></path><path d="M8 6h.01"></path><path d="M16 6h.01"></path><path d="M12 6h.01"></path><path d="M12 10h.01"></path><path d="M12 14h.01"></path><path d="M16 10h.01"></path><path d="M16 14h.01"></path><path d="M8 10h.01"></path><path d="M8 14h.01"></path>`,
      label: 'Infrastructure Info',
      bgColor: 'bg-white',
      textColor: 'text-gray-600'
    }
  ];

  policies: Policy[] = [
    {
      title: 'Tripura Industrial Policy 2024',
      description: 'Comprehensive policy framework for industrial development with enhanced incentives',
      type: 'Policy Document',
      size: '2.5 MB',
      updated: 'Dec 2024',
      downloads: 1234
    },
    {
      title: 'IT & Electronics Policy 2024',
      description: 'Special policy for IT sector development with infrastructure and skill support',
      type: 'Sector Policy',
      size: '1.8 MB',
      updated: 'Nov 2024',
      downloads: 856
    },
    {
      title: 'Renewable Energy Policy 2024',
      description: 'Policy framework for renewable energy projects with grid connectivity support',
      type: 'Sector Policy',
      size: '2.1 MB',
      updated: 'Oct 2024',
      downloads: 642
    },
    {
      title: 'Tourism Development Policy 2024',
      description: 'Comprehensive tourism policy with eco-tourism and heritage conservation focus',
      type: 'Sector Policy',
      size: '1.9 MB',
      updated: 'Sep 2024',
      downloads: 478
    }
  ];

  searchSvgSafe: SafeHtml | undefined;
  downloadSvgSafe: SafeHtml | undefined;
  phoneSvgSafe: SafeHtml | undefined;
  mailSvgSafe: SafeHtml | undefined;
  externalLinkSvgSafe: SafeHtml | undefined;

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    this.quickLinks.forEach(link => {
      link.iconSvgSafe = this.sanitizer.bypassSecurityTrustHtml(link.iconSvg);
    });
    this.categories.forEach(category => {
      category.iconSvgSafe = this.sanitizer.bypassSecurityTrustHtml(category.iconSvg);
    });
    this.searchSvgSafe = this.sanitizer.bypassSecurityTrustHtml(this.searchSvg);
    this.downloadSvgSafe = this.sanitizer.bypassSecurityTrustHtml(this.downloadSvg);
    this.phoneSvgSafe = this.sanitizer.bypassSecurityTrustHtml(this.phoneSvg);
    this.mailSvgSafe = this.sanitizer.bypassSecurityTrustHtml(this.mailSvg);
    this.externalLinkSvgSafe = this.sanitizer.bypassSecurityTrustHtml(this.externalLinkSvg);
  }

  search(query: string): void {
    console.log('Search query:', query);
    // Add search logic here
  }

  onQuickLinkClick(label: string): void {
    console.log(`Quick link clicked: ${label}`);
    // Add navigation logic here
  }

  onCategoryClick(label: string): void {
    console.log(`Category clicked: ${label}`);
    // Add category navigation logic here
  }

  downloadPolicy(title: string): void {
    console.log(`Download policy: ${title}`);
    // Add download logic here
  }

  contactSupport(type: string): void {
    console.log(`Contact support: ${type}`);
    // Add contact logic here
  }
}
