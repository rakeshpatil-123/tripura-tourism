import { Component, HostListener, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

interface NavigationItem {
  label: string;
  path?: string;
  hasDropdown: boolean;
  isActive: boolean;
  dropdownOpen: boolean;
  children: NavigationItem[];
}

@Component({
  selector: 'app-new-nav',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './new-nav.component.html',
  styleUrls: ['./new-nav.component.scss']
})
export class NewNavComponent implements OnDestroy {
  constructor(private router: Router) {}

  navigationItems: NavigationItem[] = [
    {
      label: 'Home',
      path: '',
      hasDropdown: false,
      isActive: true,
      dropdownOpen: false,
      children: []
    },
    {
      label: 'About us',
      path: '/page/about-us',
      hasDropdown: false,
      isActive: false,
      dropdownOpen: false,
      children: []
    },
    {
      label: 'Services',
      path: '/page/services',
      hasDropdown: true,
      isActive: false,
      dropdownOpen: false,
      children: [
        {
          label: 'SWAAGAT Certificate Verification',
          path: '/page/swaagat-certificate-verification',
          hasDropdown: false,
          isActive: false,
          dropdownOpen: false,
          children: []
        },
        {
          label: 'Incentive',
          path: '/page/incentive',
          hasDropdown: false,
          isActive: false,
          dropdownOpen: false,
          children: []
        },
        {
          label: 'Investor Facilitation Cell',
          path: '/page/investor-facilitation-cell',
          hasDropdown: false,
          isActive: false,
          dropdownOpen: false,
          children: []
        },
        {
          label: 'Central Inspection System',
          path: '/page/central-inspection-system',
          hasDropdown: false,
          isActive: false,
          dropdownOpen: false,
          children: []
        },
        {
          label: 'MIS Reports',
          path: '/page/mis-reports',
          hasDropdown: false,
          isActive: false,
          dropdownOpen: false,
          children: []
        },
        {
          label: 'Land Availability',
          path: '/page/land-availability',
          hasDropdown: false,
          isActive: false,
          dropdownOpen: false,
          children: []
        },
        {
          label: 'Land Availability - GIS',
          path: '/page/land-availability-gis',
          hasDropdown: false,
          isActive: false,
          dropdownOpen: false,
          children: []
        },
        {
          label: 'List of Services',
          path: '/page/list-of-services',
          hasDropdown: false,
          isActive: false,
          dropdownOpen: false,
          children: []
        },
        {
          label: 'Query/Feedback',
          path: '/page/query-feedback',
          hasDropdown: false,
          isActive: false,
          dropdownOpen: false,
          children: []
        },
        {
          label: 'Investor Query',
          path: '/page/investor-query',
          hasDropdown: false,
          isActive: false,
          dropdownOpen: false,
          children: []
        }
      ]
    },
    {
      label: 'Departments',
      path: '/page/related-departments',
      hasDropdown: false,
      isActive: false,
      dropdownOpen: false,
      children: []
    },
    {
      label: 'Land',
      path: 'https://landbank.tripura.gov.in/',
      hasDropdown: false,
      isActive: false,
      dropdownOpen: false,
      children: []
    },
    {
      label: 'KYA',
      path: '/page/kya',
      hasDropdown: false,
      isActive: false,
      dropdownOpen: false,
      children: []
    },
    // {
    //   label: 'Information Wizard',
    //   path: '/page/information-wizard',
    //   hasDropdown: false,
    //   isActive: false,
    //   dropdownOpen: false,
    //   children: []
    // },
    {
      label: 'Acts & Rules',
      path: '/page/acts-rules',
      hasDropdown: false,
      isActive: false,
      dropdownOpen: false,
      children: []
    },
    // {
    //   label: 'Contact Us',
    //   path: '/page/contact-us',
    //   hasDropdown: false,
    //   isActive: false,
    //   dropdownOpen: false,
    //   children: []
    // },
    {
      label: 'NSWS',
      path: 'https://www.nsws.gov.in/',
      hasDropdown: false,
      isActive: false,
      dropdownOpen: false,
      children: []
    },
    {
      label: 'Feedback & Rating',
      path: '/page/feedback-rating',
      hasDropdown: false,
      isActive: false,
      dropdownOpen: false,
      children: []
    },
    {
      label: 'Incentive Calculator',
      path: '/page/incentive-calculator',
      hasDropdown: false,
      isActive: false,
      dropdownOpen: false,
      children: []
    },
    {
      label: 'Login',
      path: '/page/login',
      hasDropdown: false,
      isActive: false,
      dropdownOpen: false,
      children: []
    },
    {
      label: 'Register',
      path: '/page/registration',
      hasDropdown: false,
      isActive: false,
      dropdownOpen: false,
      children: []
    },
  ];

  isMobileMenuOpen = false;
  private hoverTimeout: any = null;

  ngOnDestroy(): void {
    this.clearHoverTimeout();
  }

  clearHoverTimeout(): void {
    if (this.hoverTimeout) {
      clearTimeout(this.hoverTimeout);
      this.hoverTimeout = null;
    }
  }

  onNavItemHover(item: NavigationItem, index: number): void {
    if (item.hasDropdown) {
      this.clearHoverTimeout();
      this.hoverTimeout = setTimeout(() => {
        this.closeAllDropdowns();
        item.dropdownOpen = true;
      }, 50);
    }
  }

  onNavItemLeave(): void {
    this.clearHoverTimeout();
    this.hoverTimeout = setTimeout(() => {
      this.closeAllDropdowns();
    }, 300);
  }

  onDropdownHover(): void {
    this.clearHoverTimeout();
  }

  onDropdownLeave(): void {
    this.clearHoverTimeout();
    this.hoverTimeout = setTimeout(() => {
      this.closeAllDropdowns();
    }, 150);
  }

  closeAllDropdowns(): void {
    this.navigationItems.forEach(item => {
      item.dropdownOpen = false;
    });
  }

  onNavItemClick(item: NavigationItem, index: number): void {
  if (item.hasDropdown) {
    item.dropdownOpen = !item.dropdownOpen;
  } else {
    this.setActiveItem(index);
    if (item.path) {
      // Check if the path is an external URL
      if (item.path.startsWith('http://') || item.path.startsWith('https://')) {
        window.open(item.path, '_blank');
      } else {
        this.router.navigate([item.path]);
      }
    }
  }
}

  onDropdownItemClick(parentIndex: number, childItem: NavigationItem): void {
    this.closeAllDropdowns();
    this.isMobileMenuOpen = false;
    if (childItem.path) {
      this.router.navigate([childItem.path]);
    }
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  getChevronClass(item: NavigationItem): string {
    return item.dropdownOpen ? 'rotated' : '';
  }

  setActiveItem(index: number): void {
    this.navigationItems.forEach((item, i) => {
      item.isActive = i === index;
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    if (this.isMobileMenuOpen && !(event.target as HTMLElement).closest('.mobile-menu-overlay, .mobile-menu-btn')) {
      this.isMobileMenuOpen = false;
    }
  }
}