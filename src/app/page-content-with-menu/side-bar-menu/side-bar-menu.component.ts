import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  OnInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';


interface MenuItem {
  id: string;
  title: string;
  icon: string;
  route?: string;
  children?: MenuItem[];
  roles: string[];
  badge?: string;
  isActive?: boolean;
}

interface UserRole {
  role: 'admin' | 'user' | 'moderator' | 'guest';
  permissions: string[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, TitleCasePipe],
  templateUrl: './side-bar-menu.component.html',
  styleUrls: ['./side-bar-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('slideInOut', [
      state('in', style({ height: '*', opacity: 1 })),
      transition(':enter', [
        style({ height: '0', opacity: 0 }),
        animate('200ms ease-in'),
      ]),
      transition(':leave', [
        animate('200ms ease-out', style({ height: '0', opacity: 0 })),
      ]),
    ]),
  ],
})
export class SidebarComponent implements OnInit, OnChanges {
  @Input() isCollapsed = true;
  @Input() isVisible = true; 
  @Input() currentUser: UserRole = { role: 'admin', permissions: [] };

  @Output() onToggle = new EventEmitter<void>();
  @Output() onNavigate = new EventEmitter<void>();

  menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: 'dashboard',
      route: 'home',
      roles: ['admin', 'user', 'moderator', 'guest'],
    },
    {
      id: 'external-tracking',
      title: 'External Services',
      icon: 'track_changes',
      route: 'external-services-tracking',
      roles: ['admin', 'user'],
    },
    {
      id: 'example-form',
      title: 'Dynamic Form',
      icon: 'dynamic_form',
      route: 'example-form',
      roles: ['admin'],
    },
    {
      id: 'reports',
      title: 'Reports',
      icon: 'assessment',
      roles: ['admin', 'moderator'],
      children: [
        {
          id: 'sales-report',
          title: 'Usage Report',
          icon: 'trending_up',
          route: '/reports/sales',
          roles: ['admin', 'moderator'],
        },
        {
          id: 'user-report',
          title: 'Engagement',
          icon: 'people_outline',
          route: '/reports/users',
          roles: ['admin'],
        },
      ],
    },
  ];

  filteredMenuItems: MenuItem[] = [];
  expandedItems = new Set<string>();

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.filterMenuByRole();

    
    this.router.events
      .pipe(
        filter(
          (event): event is NavigationEnd => event instanceof NavigationEnd
        )
      )
      .subscribe((event: NavigationEnd) => {
        this.updateActiveState(event.urlAfterRedirects);
      });

    
    this.updateActiveState(this.router.url);
  }

  ngOnChanges(changes: SimpleChanges): void {
    
    if (changes['isCollapsed'] && this.isCollapsed) {
      this.expandedItems.clear();
    }
  }

  filterMenuByRole(): void {
    this.filteredMenuItems = this.menuItems
      .filter((item) => item.roles.includes(this.currentUser.role))
      .map((item) => ({
        ...item,
        children: item.children?.filter((child) =>
          child.roles.includes(this.currentUser.role)
        ),
      }));
  }

  updateActiveState(currentUrl: string): void {
    const setActive = (items: MenuItem[]): boolean => {
      let isParentActive = false;
      for (const item of items) {
        
        item.isActive = item.route
          ? currentUrl.endsWith('/' + item.route)
          : false;

        if (this.hasChildren(item)) {
          if (setActive(item.children!)) {
            item.isActive = true; 
            if (!this.isCollapsed) {
              this.expandedItems.add(item.id); 
            }
            isParentActive = true;
          }
        } else if (item.isActive) {
          isParentActive = true;
        }
      }
      return isParentActive;
    };
    setActive(this.filteredMenuItems);
  }

  
  handleNavigation(route: string | undefined): void {
    if (route) {
      this.router.navigate([route]);
      
      this.onNavigate.emit();
    }
  }

  
  toggleMenuItem(itemId: string): void {
    if (this.isCollapsed) return; 

    if (this.expandedItems.has(itemId)) {
      this.expandedItems.delete(itemId);
    } else {
      this.expandedItems.add(itemId);
    }
  }

  

  get toggleIcon(): string {
    if (this.isVisible) return 'close';
    if (this.isCollapsed) return 'menu';
    return 'menu_open';
  }

  hasChildren = (item: MenuItem): boolean =>
    !!item.children && item.children.length > 0;
  isMenuExpanded = (itemId: string): boolean => this.expandedItems.has(itemId);
}
