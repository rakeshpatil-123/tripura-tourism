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
          label: 'Team',
          path: '/page/services/team',
          hasDropdown: false,
          isActive: false,
          dropdownOpen: false,
          children: []
        },
        {
          label: 'History',
          path: '/page/services/history',
          hasDropdown: false,
          isActive: false,
          dropdownOpen: false,
          children: []
        }
      ]
    },
    {
      label: 'Related Departments',
      path: '/page/related-departments',
      hasDropdown: false,
      isActive: false,
      dropdownOpen: false,
      children: []
    },
    {
      label: 'Information Wizard',
      path: '/page/information-wizard',
      hasDropdown: false,
      isActive: false,
      dropdownOpen: false,
      children: []
    },
    {
      label: 'Acts & Rules',
      path: '/page/acts-rules',
      hasDropdown: false,
      isActive: false,
      dropdownOpen: false,
      children: []
    },
    {
      label: 'Contact Us',
      path: '/page/contact-us',
      hasDropdown: false,
      isActive: false,
      dropdownOpen: false,
      children: []
    },
    {
      label: 'Business Regulations',
      path: '/page/business-regulations',
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
        this.router.navigate([item.path]);
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