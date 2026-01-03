import { Component, HostListener, Input, OnDestroy, OnInit } from '@angular/core';
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
export class NewNavComponent implements OnDestroy, OnInit {
  constructor(private router: Router) {}
  @Input() isLogged: boolean = false;
  navigationItems: NavigationItem[] = [
  {
    label: 'Home',
    path: '/',
    hasDropdown: false,
    isActive: true,
    dropdownOpen: false,
    children: []
  },

  {
    label: 'About Tripura',
    path: '',
    hasDropdown: true,
    isActive: false,
    dropdownOpen: false,
    children: [
      {
        label: 'Origin & History of Tripura',
        path: '/about/origin-history',
        hasDropdown: false,
        isActive: false,
        dropdownOpen: false,
        children: []
      },
      {
        label: 'Geographical Profile',
        path: '/about/geographical-profile',
        hasDropdown: false,
        isActive: false,
        dropdownOpen: false,
        children: []
      },
      {
        label: 'State Symbols',
        path: '/about/state-symbols',
        hasDropdown: false,
        isActive: false,
        dropdownOpen: false,
        children: []
      },
      {
        label: 'How to Reach',
        path: '/about/how-to-reach',
        hasDropdown: false,
        isActive: false,
        dropdownOpen: false,
        children: []
      },
      {
        label: 'Tribes & Cultural Heritage',
        path: '/about/tribes-culture',
        hasDropdown: false,
        isActive: false,
        dropdownOpen: false,
        children: []
      },
      {
        label: 'Fairs & Festivals',
        path: '/about/fairs-festivals',
        hasDropdown: false,
        isActive: false,
        dropdownOpen: false,
        children: []
      },
      {
        label: 'Food & Cuisines of Tripura',
        path: '/about/food-cuisine',
        hasDropdown: false,
        isActive: false,
        dropdownOpen: false,
        children: []
      }
    ]
  },

  {
    label: 'Destinations',
    path: '/destinations',
    hasDropdown: false,
    isActive: false,
    dropdownOpen: false,
    children: []
  },

  {
    label: 'Accommodation',
    path: '',
    hasDropdown: true,
    isActive: false,
    dropdownOpen: false,
    children: [
      {
        label: 'TTDCL Accommodations',
        path: '/accommodation/ttdcl',
        hasDropdown: false,
        isActive: false,
        dropdownOpen: false,
        children: []
      },
      {
        label: 'Registered Private Hotels',
        path: '/accommodation/private-hotels',
        hasDropdown: false,
        isActive: false,
        dropdownOpen: false,
        children: []
      },
      {
        label: 'Leased-out TTDCL Accommodations',
        path: '/accommodation/leased-ttdcl',
        hasDropdown: false,
        isActive: false,
        dropdownOpen: false,
        children: []
      },
      {
        label: 'Homestays',
        path: '/accommodation/homestays',
        hasDropdown: false,
        isActive: false,
        dropdownOpen: false,
        children: []
      }
    ]
  },

  {
    label: 'Galleries',
    path: '',
    hasDropdown: true,
    isActive: false,
    dropdownOpen: false,
    children: [
      {
        label: 'Photo Gallery',
        path: '/galleries/photos',
        hasDropdown: false,
        isActive: false,
        dropdownOpen: false,
        children: []
      },
      {
        label: 'Video Gallery',
        path: '/galleries/videos',
        hasDropdown: false,
        isActive: false,
        dropdownOpen: false,
        children: []
      }
    ]
  },

  {
    label: 'Tourist Corner',
    path: '',
    hasDropdown: true,
    isActive: false,
    dropdownOpen: false,
    children: [
      {
        label: 'Package Tours',
        path: '/tourist-corner/package-tours',
        hasDropdown: false,
        isActive: false,
        dropdownOpen: false,
        children: []
      },
      {
        label: 'Conducted Tours',
        path: '/tourist-corner/conducted-tours',
        hasDropdown: false,
        isActive: false,
        dropdownOpen: false,
        children: []
      },
      {
        label: 'Guidelines',
        path: '/tourist-corner/guidelines',
        hasDropdown: false,
        isActive: false,
        dropdownOpen: false,
        children: []
      },
      {
        label: 'Publications',
        path: '/tourist-corner/publications',
        hasDropdown: false,
        isActive: false,
        dropdownOpen: false,
        children: []
      }
    ]
  },

  {
    label: 'Department Info',
    path: '',
    hasDropdown: true,
    isActive: false,
    dropdownOpen: false,
    children: [
      {
        label: 'Notifications',
        path: '/department/notifications',
        hasDropdown: false,
        isActive: false,
        dropdownOpen: false,
        children: []
      },
      {
        label: 'Tenders',
        path: '/department/tenders',
        hasDropdown: false,
        isActive: false,
        dropdownOpen: false,
        children: []
      },
      {
        label: 'Who is Who',
        path: '/department/who-is-who',
        hasDropdown: false,
        isActive: false,
        dropdownOpen: false,
        children: []
      },
      {
        label: 'Tripura Tourism Policy',
        path: '/department/tourism-policy',
        hasDropdown: false,
        isActive: false,
        dropdownOpen: false,
        children: []
      },
      {
        label: 'Recruitment',
        path: '/department/recruitment',
        hasDropdown: false,
        isActive: false,
        dropdownOpen: false,
        children: []
      }
    ]
  }
];


  isMobileMenuOpen = false;
  private hoverTimeout: any = null;
  ngOnInit(): void {
    this.isLogged
  }

  get visibleNavigationItems(): NavigationItem[] {
    if (!this.isLogged) return this.navigationItems;
    return this.navigationItems.filter(item => item.label !== 'Login' && item.label !== 'Register');
  }

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
  setActiveItemByItem(selectedItem: NavigationItem): void {
    this.navigationItems.forEach(item => {
      item.isActive = item === selectedItem;
    });
  }

  onNavItemClick(item: NavigationItem, index: number): void {
  if (item.hasDropdown) {
    item.dropdownOpen = !item.dropdownOpen;
  } else {
    this.setActiveItemByItem(item);
    if (item.path) {
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