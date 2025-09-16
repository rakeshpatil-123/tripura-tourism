import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { GenericService } from '../../_service/generic/generic.service';

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
  imports: [CommonModule, RouterModule,],
  templateUrl: './side-bar-menu.component.html',
  styleUrls: ['./side-bar-menu.component.scss'],
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
  currentUserType: string = '';
  routerSubscription: Subscription | undefined;
  userName: string = 'User';
  filteredMenuItems: MenuItem[] = [];

  deptName: string = '';
  emailId: string = '';
  hierarchyLevel: string = '';
  designation: string = '';
  auth_person: string = '';
  bin: string = '';
      
  menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: 'dashboard',
      route: '/dashboard/home',
      roles: ['admin', 'individual', 'department', 'user', 'moderator', 'guest'],
    },
    {
      id: 'Departments',
      title: 'Departments',
      icon: 'apartment',
      route: '/dashboard/departments',
      roles: ['admin', 'department'],
    },
    {
      id: 'Admin Services',
      title: 'Admin Services',
      icon: 'account_balance',
      route: '/dashboard/admin-services',
      roles: ['admin'],
    },
    {
      id: 'Departmental User',
      title: 'Departmental User',
      icon: 'groups',
      route: '/dashboard/departmental-user',
      roles: ['admin', 'department'],
    },
    {
      id: 'common-application-form',
      title: 'Common Application Form',
      icon: 'track_changes',
      route: '/dashboard/caf',
      roles: ['individual', 'user', 'moderator', 'guest'],
    },
    {
      id: 'services',
      title: 'Services',
      icon: 'work',
      route: '/dashboard/services',
      roles: ['individual', 'department','user', 'moderator', 'guest'],
    },
     {
      id: 'Departmental services',
      title: 'Departmental Services',
      icon: 'important_devices',
      route: '/dashboard/departmental-services',
      roles: ['department', ],
    },
  {
      id: 'all-departmental-applications',
      title: 'All departmental applications',
      icon: 'assignment',
      route: '/dashboard/all-departmental-applications',
      roles: ['department', ],
    },
  
    // {
    //   id: 'external-tracking',
    //   title: 'Common Application Form',
    //   icon: 'track_changes',
    //   route: '/dashboard/external-services-tracking',
    //   roles: ['admin', 'user'],
    // },
    // {
    //   id: 'example-form',
    //   title: 'Application List',
    //   icon: 'dynamic_form',
    //   route: '/dashboard/example-form',
    //   roles: ['admin'],
    // },
    // {
    //   id: 'application-list',
    //   title: 'Application List',
    //   icon: 'dynamic_form',
    //   route: '/dashboard/application-list',
    //   roles: ['admin'],
    // },
    {
      id: 'Upload Existing Licence',
      title: 'Upload Existing Licence',
      icon: 'dynamic_form',
      route: '/dashboard/upload-existing-licence',
      roles: ['individual',],
    },
    {
      id: 'Renewal List',
      title: 'Renewal List',
      icon: 'dynamic_form',
      route: '/dashboard/renewal-list',
      roles: ['individual',],
    },
    {
      id: 'Inspection List',
      title: 'Inspection List',
      icon: 'dynamic_form',
      route: '/dashboard/inspection-list',
      roles: ['individual'],
    },

    {
      id: 'Application List',
      title: 'Application List',
      icon: 'dynamic_form',
      route: '/dashboard/application-list',
      roles: ['individual',],
    },
    {
      id: 'reports',
      title: 'Reports',
      icon: 'assessment',
      roles: ['individual', 'department', 'moderator'],
      children: [
        {
          id: 'sales-report',
          title: 'Usage Report',
          icon: 'trending_up',
          route: '/reports/sales',
          roles: [ 'moderator', 'individual', 'department', ],
        },
        {
          id: 'user-report',
          title: 'Engagement',
          icon: 'people_outline',
          route: '/reports/users',
          roles: ['individual', 'department',],
        },
      ],
    },
     {
      id: 'User',
      title: 'Profile',
      icon: 'dynamic_form',
      route: '/dashboard/user-profile',
      roles: ['admin', 'individual', 'department',],
    },
  ];

  constructor(private router: Router, private genericService: GenericService) {
    this.currentUserType = localStorage.getItem('userRole') || 'User';
    this.userName = localStorage.getItem('userName') || 'User';
    this.deptName = localStorage.getItem('deptName') || '';
    this.emailId = localStorage.getItem('email_id') || '';
    this.hierarchyLevel = localStorage.getItem('hierarchy') || 'India';
    this.designation = localStorage.getItem('designation') || '';
    this.bin = this.genericService.decryptLocalStorageItem('bin') || '';
    this.auth_person = this.genericService.decryptLocalStorageItem('authorized_person_name')?.toUpperCase() || '';

  }

  

  ngOnInit(): void {
    this.currentUrl = this.router.url;
    this.filterMenuItems();
    this.checkSidebarVisibility(this.currentUrl);
    // Subscribe to router events to track URL changes
    this.routerSubscription = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
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
    return item.children.some((child) => this.isActive(child.route));
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
    return item.roles.includes(this.currentUserType);
  }

  logout(): void {
    this.genericService.logoutUser(); 
  }
  filterMenuItems(): void {
    if (!this.userRole) {
      this.filteredMenuItems = [];
      return;
    }

    this.filteredMenuItems = this.menuItems
      .map(item => {
        const children = item.children
          ? item.children.filter(child => child.roles.includes(this.userRole!))
          : [];

        return { ...item, children };
      })
      .filter(item =>
        item.roles.includes(this.userRole!) || item.children.length > 0
      );
  }

}