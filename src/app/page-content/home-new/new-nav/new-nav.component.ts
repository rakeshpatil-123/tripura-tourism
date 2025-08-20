import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

interface NavigationItem {
  label: string;
  path?: string;
  hasDropdown: boolean;
  isActive?: boolean;
  dropdownOpen?: boolean;
  children?: NavigationItem[];
}

@Component({
  selector: 'app-new-nav',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './new-nav.component.html',
  styleUrls: ['./new-nav.component.scss']
})
export class NewNavComponent {
  isMobileMenuOpen = false;
  
  navigationItems: NavigationItem[] = [
    {
      label: 'Home',
      path: '/home',
      hasDropdown: false,
      isActive: true
    },
    {
      label: 'About',
      path: '/about',
      hasDropdown: true,
      dropdownOpen: false,
      children: [
        { label: 'About Us', path: '/about/us', hasDropdown: false },
        { label: 'Our Vision', path: '/about/vision', hasDropdown: false },
        { label: 'Our Mission', path: '/about/mission', hasDropdown: false },
        { label: 'Leadership', path: '/about/leadership', hasDropdown: false },
        { label: 'History', path: '/about/history', hasDropdown: false }
      ]
    },
    {
      label: 'Investor Services',
      path: '/investor-services',
      hasDropdown: true,
      dropdownOpen: false,
      children: [
        { label: 'Investment Opportunities', path: '/investor-services/opportunities', hasDropdown: false },
        { label: 'Investment Procedures', path: '/investor-services/procedures', hasDropdown: false },
        { label: 'Clearances', path: '/investor-services/clearances', hasDropdown: false },
        { label: 'Incentives', path: '/investor-services/incentives', hasDropdown: false },
        { label: 'Investment Facilitation', path: '/investor-services/facilitation', hasDropdown: false },
        { label: 'Investor Grievances', path: '/investor-services/grievances', hasDropdown: false }
      ]
    },
    {
      label: 'Departments',
      path: '/departments',
      hasDropdown: true,
      dropdownOpen: false,
      children: [
        { label: 'Industries & Commerce', path: '/departments/industries-commerce', hasDropdown: false },
        { label: 'Information Technology', path: '/departments/it', hasDropdown: false },
        { label: 'Tourism', path: '/departments/tourism', hasDropdown: false },
        { label: 'Handloom & Textiles', path: '/departments/handloom-textiles', hasDropdown: false },
        { label: 'Food Processing', path: '/departments/food-processing', hasDropdown: false }
      ]
    },
    {
      label: 'Land Bank',
      path: '/land-bank',
      hasDropdown: true,
      dropdownOpen: false,
      children: [
        { label: 'Available Land', path: '/land-bank/available', hasDropdown: false },
        { label: 'Industrial Parks', path: '/land-bank/industrial-parks', hasDropdown: false },
        { label: 'Land Acquisition', path: '/land-bank/acquisition', hasDropdown: false },
        { label: 'Land Records', path: '/land-bank/records', hasDropdown: false }
      ]
    },
    {
      label: 'KYA',
      path: '/kya',
      hasDropdown: false
    },
    {
      label: 'Acts & Rules',
      path: '/acts-rules',
      hasDropdown: false
    },
    {
      label: 'NSWS',
      path: '/nsws',
      hasDropdown: false
    }
  ];

  constructor() {}

  onNavItemClick(item: NavigationItem, index: number): void {
    if (item.hasDropdown) {
      this.toggleDropdown(index);
    } else {
      this.navigateToRoute(item.path || '/');
      this.setActiveItem(index);
      this.closeMobileMenu();
    }
  }

  onDropdownItemClick(parentIndex: number, childItem: NavigationItem): void {
    this.navigateToRoute(childItem.path || '/');
    this.closeAllDropdowns();
    this.closeMobileMenu();
    console.log('Navigate to:', childItem.path, childItem.label);
  }

  toggleDropdown(index: number): void {
    // Close all other dropdowns first
    this.navigationItems.forEach((item, i) => {
      if (i !== index && item.dropdownOpen) {
        item.dropdownOpen = false;
      }
    });

    // Toggle current dropdown
    this.navigationItems[index].dropdownOpen = !this.navigationItems[index].dropdownOpen;
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    
    // Close all dropdowns when closing mobile menu
    if (!this.isMobileMenuOpen) {
      this.closeAllDropdowns();
    }
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
    this.closeAllDropdowns();
  }

  closeAllDropdowns(): void {
    this.navigationItems.forEach(item => {
      item.dropdownOpen = false;
    });
  }

  setActiveItem(index: number): void {
    this.navigationItems.forEach((item, i) => {
      item.isActive = i === index;
    });
  }

  private navigateToRoute(path: string): void {
    console.log('Navigating to:', path);
    // Implement your navigation logic here
    // Example: this.router.navigate([path]);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    const navContainer = document.querySelector('.main-navigation');
    
    // Close dropdowns if clicking outside the navigation
    if (navContainer && !navContainer.contains(target)) {
      this.closeAllDropdowns();
    }
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize(event: Event): void {
    const target = event.target as Window;
    
    // Close mobile menu on desktop resize
    if (target.innerWidth >= 1024) {
      this.closeMobileMenu();
    }
  }

  // Helper method to get chevron rotation class
  getChevronClass(item: NavigationItem): string {
    return item.dropdownOpen ? 'rotated' : '';
  }

  // Helper method to check if any dropdown is open (for mobile menu styling)
  hasOpenDropdowns(): boolean {
    return this.navigationItems.some(item => item.dropdownOpen);
  }
}
