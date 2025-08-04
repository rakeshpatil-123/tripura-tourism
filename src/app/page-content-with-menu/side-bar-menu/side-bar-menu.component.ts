import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { filter, Subscription } from 'rxjs';

export interface MenuItem {
  id: string;
  title: string;
  icon: string;
  route?: string;
  roles: string[];
  children?: MenuItem[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './side-bar-menu.component.html',
  styleUrls: ['./side-bar-menu.component.scss']
})
export class SidebarComponent implements OnInit, OnDestroy {
  @Input() isCollapsed = false;
  @Input() isVisible = false;
  @Input() userRole: string = 'admin';
  @Output() onToggle = new EventEmitter<void>();
  @Output() onNavigate = new EventEmitter<void>();

  showSidebar = false;
  expandedSubmenu: string | null = null;
  currentUrl: string = '';
  routerSubscription: Subscription | undefined;

  menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: 'dashboard',
      route: '/dashboard/home',
      roles: ['admin', 'user', 'moderator', 'guest'],
    },
    {
      id: 'external-tracking',
      title: 'External Services',
      icon: 'track_changes',
      route: '/dashboard/external-services-tracking',
      roles: ['admin', 'user'],
    },
    {
      id: 'example-form',
      title: 'Dynamic Form',
      icon: 'dynamic_form',
      route: '/dashboard/example-form',
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

  constructor(private router: Router) { }

  ngOnInit(): void {
    // Get current URL on init
    this.currentUrl = this.router.url;
    this.checkSidebarVisibility(this.currentUrl);

    // Subscribe to router events to track URL changes
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentUrl = event.url;
        this.checkSidebarVisibility(event.url);
        this.checkAndExpandActiveParent();
      });
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  private checkSidebarVisibility(url: string): void {
    // Show sidebar only if URL starts with '/dashboard'
    this.showSidebar = url.startsWith('/dashboard');
  }

  isActive(route: string | undefined): boolean {
    if (!route) return false;
    return this.currentUrl === route || this.currentUrl.startsWith(`${route}/`);
  }

  hasActiveChild(item: MenuItem): boolean {
    if (!item.children) return false;
    return item.children.some(child => this.isActive(child.route));
  }

  checkAndExpandActiveParent(): void {
    for (const item of this.menuItems) {
      if (item.children && this.hasActiveChild(item)) {
        this.expandedSubmenu = item.id;
        break;
      }
    }
  }

  toggleSubmenu(submenuId: string): void {
    if (this.isCollapsed) {
      this.onToggle.emit();
      setTimeout(() => {
        this.expandedSubmenu = submenuId;
      }, 300);
    } else {
      this.expandedSubmenu = 
        this.expandedSubmenu === submenuId ? null : submenuId;
    }
  }

  navigate(path: string | undefined): void {
    if (!path) return;
    this.router.navigate([path]);
    this.onNavigate.emit();
  }

  canAccess(item: MenuItem): boolean {
    return item.roles.includes(this.userRole);
  }
}