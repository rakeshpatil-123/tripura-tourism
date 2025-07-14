///side-bar-menu.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';

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
  imports: [CommonModule],
  selector: 'app-sidebar',
  templateUrl: './side-bar-menu.component.html',
  styleUrls: ['./side-bar-menu.component.scss']
})
export class SidebarComponent implements OnInit {
  @Input() isCollapsed = false;
  @Input() currentUser: UserRole = { role: 'admin', permissions: [] };
  @Output() toggleSidebar = new EventEmitter<boolean>();

  menuItems: MenuItem[] = [
  {
    id: 'dashboard',
    title: 'Citizen Dashboard',
    icon: 'dashboard',
    route: '/dashboard',
    roles: ['admin', 'user', 'moderator', 'guest']
  },
  {
    id: 'analytics',
    title: 'Service Analytics',
    icon: 'analytics',
    route: '/analytics',
    roles: ['admin', 'moderator'],
    badge: 'Gov'
  },
  {
    id: 'users',
    title: 'User Directory',
    icon: 'people',
    roles: ['admin'],
    children: [
      {
        id: 'all-users',
        title: 'Registered Citizens',
        icon: 'group',
        route: '/users/all',
        roles: ['admin']
      },
      {
        id: 'user-roles',
        title: 'Access Control',
        icon: 'admin_panel_settings',
        route: '/users/roles',
        roles: ['admin']
      },
      {
        id: 'user-activity',
        title: 'Audit Logs',
        icon: 'history',
        route: '/users/activity',
        roles: ['admin']
      }
    ]
  },
  {
    id: 'content',
    title: 'Document Services',
    icon: 'article',
    roles: ['admin', 'moderator'],
    children: [
      {
        id: 'posts',
        title: 'Official Notices',
        icon: 'post_add',
        route: '/content/posts',
        roles: ['admin', 'moderator']
      },
      {
        id: 'pages',
        title: 'Policy Pages',
        icon: 'pages',
        route: '/content/pages',
        roles: ['admin', 'moderator']
      },
      {
        id: 'media',
        title: 'Digital Repository',
        icon: 'perm_media',
        route: '/content/media',
        roles: ['admin', 'moderator']
      }
    ]
  },
  {
    id: 'projects',
    title: 'Govt Projects',
    icon: 'work',
    route: '/projects',
    roles: ['admin', 'user', 'moderator']
  },
  {
    id: 'tasks',
    title: 'Citizen Requests',
    icon: 'task',
    route: '/tasks',
    roles: ['admin', 'user', 'moderator'],
    badge: '12'
  },
  {
    id: 'reports',
    title: 'Statutory Reports',
    icon: 'assessment',
    roles: ['admin', 'moderator'],
    children: [
      {
        id: 'sales-report',
        title: 'Service Usage Report',
        icon: 'trending_up',
        route: '/reports/sales',
        roles: ['admin', 'moderator']
      },
      {
        id: 'user-report',
        title: 'Citizen Engagement',
        icon: 'people_outline',
        route: '/reports/users',
        roles: ['admin']
      }
    ]
  },
  {
    id: 'settings',
    title: 'System Configuration',
    icon: 'settings',
    roles: ['admin', 'user', 'moderator'],
    children: [
      {
        id: 'general',
        title: 'General Settings',
        icon: 'tune',
        route: '/settings/general',
        roles: ['admin', 'user', 'moderator']
      },
      {
        id: 'security',
        title: 'Security Controls',
        icon: 'security',
        route: '/settings/security',
        roles: ['admin', 'user', 'moderator']
      },
      {
        id: 'notifications',
        title: 'Communication Settings',
        icon: 'notifications',
        route: '/settings/notifications',
        roles: ['admin', 'user', 'moderator']
      },
      {
        id: 'system',
        title: 'Govt IT Settings',
        icon: 'computer',
        route: '/settings/system',
        roles: ['admin']
      }
    ]
  }
];


  expandedItems: Set<string> = new Set();
  filteredMenuItems: MenuItem[] = [];

  constructor(private router: Router) {}

  ngOnInit() {
    this.filterMenuByRole();
    this.setActiveMenuItem();
  }

  filterMenuByRole(): void {
    this.filteredMenuItems = this.menuItems.filter(item => 
      item.roles.includes(this.currentUser.role)
    ).map(item => ({
      ...item,
      children: item.children?.filter(child => 
        child.roles.includes(this.currentUser.role)
      )
    }));
  }

  setActiveMenuItem(): void {
    const currentRoute = this.router.url;
    this.markActiveItem(this.filteredMenuItems, currentRoute);
  }

  markActiveItem(items: MenuItem[], currentRoute: string): void {
    items.forEach(item => {
      if (item.route === currentRoute) {
        item.isActive = true;
      } else if (item.children) {
        this.markActiveItem(item.children, currentRoute);
      }
    });
  }

  toggleMenuItem(itemId: string): void {
    if (this.expandedItems.has(itemId)) {
      this.expandedItems.delete(itemId);
    } else {
      this.expandedItems.add(itemId);
    }
  }

  isMenuExpanded(itemId: string): boolean {
    return this.expandedItems.has(itemId);
  }

  navigateToRoute(route: string): void {
    if (route) {
      this.router.navigate([route]);
    }
  }

  onToggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
    this.toggleSidebar.emit(this.isCollapsed);
  }

  hasChildren(item: MenuItem): boolean | undefined {
    return item.children && item.children.length > 0;
  }
}