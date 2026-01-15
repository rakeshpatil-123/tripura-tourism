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
import { HelpService } from '../../_service/help/help.service'; 

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
  styleUrls: ['./side-bar-menu.component.scss'],
})
export class SidebarComponent implements OnInit, OnDestroy {
  @Input() isCollapsed = false;
  @Input() isVisible = false;
  @Input() hidden = false;
  @Input() userRole: string = 'admin';
  @Output() onToggle = new EventEmitter<void>();
  @Output() onNavigate = new EventEmitter<void>();

  showSidebar = false;
  expandedSubmenu: string | null = null;
  currentUrl: string = '';
  currentUserType: string = '';
  routerSubscription: Subscription | undefined;

  userName: string = 'User';
  deptName: string = '';
  currentUserEnterpriseName: string = '';
  emailId: string = '';
  hierarchyLevel: string = '';
  designation: string = '';
  blockUser: string = '';
  subDivisionUser: string = '';
  districtUser: string = '';
  filteredMenuItems: MenuItem[] = [];

  auth_person: string = '';
  bin: string = '';

  menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: 'dashboard',
      route: '/dashboard/home',
      roles: [
        'admin',
        'individual',
        'department',
        'inspector',
      ],
    },
    {
      id: 'my-departmental-applications',
      title: 'Pending Applications',
      icon: 'layers',
      route: '/dashboard/my-departmental-applications',
      roles: ['department'],
    },
    {
      id: 'Departments',
      title: 'Departments',
      icon: 'apartment',
      route: '/dashboard/departments',
      roles: ['admin'],
    },
    {
      id: 'Admin Services',
      title: 'Admin Services',
      icon: 'account_balance',
      route: '/dashboard/admin-services',
      roles: ['admin'],
    },
    // {
    //   id: 'Incentive',
    //   title: 'Incentive',
    //   icon: 'military_tech',
    //   route: '/dashboard/admin-incentive',
    //   roles: ['admin'],
    // },
    {
      id: 'BusinessUser',
      title: 'Business User',
      icon: 'supervisor_account',
      route: '/dashboard/business-user',
      roles: ['admin'],
    },
    {
      id: 'UserPaymentList',
      title: 'User Payment List',
      icon: 'payment',
      route: '/dashboard/user-payment-list',
      roles: ['admin'],
    },
    {
      id: 'activityLog',
      title: 'Activity Log',
      icon: 'history',
      route: '/dashboard/activity-log',
      roles: ['admin'],
    },
    {
      id: 'Holidays',
      title: 'Holidays',
      icon: 'celebration',
      route: '/dashboard/holidays',
      roles: ['admin'],
    },
    // {
    //   id: 'common-application-form',
    //   title: 'Common Application Form',
    //   icon: 'assignment',
    //   route: '/dashboard/caf',
    //   roles: ['individual', 'user', 'moderator', 'guest'],
    // },
    {
      id: 'services',
      title: 'Services',
      icon: 'work',
      route: '/dashboard/services',
      roles: ['individual'],
    },
    // {
    //   id: 'incentive',
    //   title: 'Incentive',
    //   icon: 'card_giftcard',
    //   roles: ['individual'],
    //   children: [
    //     {
    //       id: 'eligibility',
    //       title: 'Eligibility',
    //       icon: 'trending_up',
    //       route: '/dashboard/eligibility',
    //       roles: ['individual'],
    //     },
    //     {
    //       id: 'claim',
    //       title: 'Claim',
    //       icon: 'people_outline',
    //       route: '/dashboard/claim',
    //       roles: ['individual'],
    //     },
    //   ],
    // },
    // {
    //   id: 'Departmental services',
    //   title: 'Departmental Services',
    //   icon: 'important_devices',
    //   route: '/dashboard/departmental-services',
    //   roles: ['department'],
    // },
    {
      id: 'all-departmental-applications',
      title: 'My Departmental Applications',
      icon: 'assignment',
      route: '/dashboard/all-departmental-applications',
      roles: ['department'],
    },
    // {
    //   id: 'Incentive Applications',
    //   title: 'Incentive Applications',
    //   icon: 'military_tech',
    //   route: '/dashboard/incentive-applications',
    //   roles: ['department'],
    // },
       {
      id: 'Departmental User',
      title: 'My Departmental Users',
      icon: 'groups',
      route: '/dashboard/departmental-user',
      roles: ['admin', 'department'],
    },
    // {
    //   id: 'jsontoexcel',
    //   title: 'Json to Excel',
    //   icon: 'folders',
    //   route: '/dashboard/json-to-excel',
    //   roles: ['department', 'individual', 'admin'],
    // },
    // {
    //   id: 'Upload Existing Licence',
    //   title: 'Upload Existing Licence',
    //   icon: 'chrome_reader_mode',
    //   route: '/dashboard/upload-existing-licence',
    //   roles: ['individual'],
    // },
    {
      id: 'Renewal List',
      title: 'Renewal List',
      icon: 'description',
      route: '/dashboard/renewal-application-list',
      roles: ['individual'],
    },
    // {
    //   id: 'Inspection List',
    //   title: 'Inspection List',
    //   icon: 'receipt',
    //   route: '/dashboard/inspection-list',
    //   roles: ['individual'],
    // },
    // {
    //   id: 'Departmental Inspection',
    //   title: 'Departmental Inspection',
    //   icon: 'task_alt',
    //   route: '/dashboard/departmental-inspection',
    //   roles: ['department'],
    // },
    {
      id: 'Application List',
      title: 'Application List',
      icon: 'list_alt',
      route: '/dashboard/application-list',
      roles: ['individual'],
    },
    {
      id: 'reports',
      title: 'Reports',
      icon: 'assessment',
      roles: ['department', 'moderator'],
      children: [
        // {
        //   id: 'sales-report',
        //   title: 'Usage Report',
        //   icon: 'trending_up',
        //   route: '/dashboard/reports/sales',
        //   roles: ['individual', 'department'],
        // },
        // {
        //   id: 'user-report',
        //   title: 'Engagement',
        //   icon: 'people_outline',
        //   route: '/dashboard/reports/users',
        //   roles: ['individual', 'department'],
        // },
        {
          id: 'payment',
          title: 'Payment',
          icon: 'payments',
          route: '/dashboard/reports/payment',
          roles: ['individual', 'department'],
        },
        // {
        //   id: 'department-user-list',
        //   title: 'Department User List',
        //   icon: 'group',
        //   route: '/dashboard/reports/department-user-list',
        //   roles: ['department', 'moderator'],
        // },
        {
          id: 'application-status',
          title: 'Application Status',
          icon: 'task_alt',
          route: '/dashboard/reports/application-status',
          roles: ['individual', 'department'],
        },
        // {
        //   id: 'industry-report-summary',
        //   title: 'Industry Report Summary',
        //   icon: 'business_center',
        //   route: '/dashboard/reports/industry-report-summary',
        //   roles: ['department'],
        // },
        // {
        //   id: 'industry-report-details',
        //   title: 'Industry Report Details',
        //   icon: 'assessment',
        //   route: '/dashboard/reports/industry-report-details',
        //   roles: ['department'],
        // },
        {
          id: 'noc-issue-status',
          title: 'NOC Issue Status',
          icon: 'contact_mail',
          route: '/dashboard/reports/noc-issue-status',
          roles: ['individual', 'department'],
        },
        // {
        //   id: 'cis-summary',
        //   title: 'CIS Summary',
        //   icon: 'bar_chart',
        //   route: '/dashboard/reports/cis-summary',
        //   roles: ['department'],
        // },
        // {
        //   id: 'cis-details',
        //   title: 'CIS Details',
        //   icon: 'dataset',
        //   route: '/dashboard/reports/cis-details',
        //   roles: ['department', 'moderator'],
        // },
        // {
        //   id: 'user-list',
        //   title: 'User List',
        //   icon: 'person',
        //   route: '/dashboard/reports/user-list',
        //   roles: ['moderator', 'department'],
        // },
        // {
        //   id: 'labour-register',
        //   title: 'Labour Register',
        //   icon: 'menu_book',
        //   route: '/dashboard/reports/labour-register',
        //   roles: ['department', 'moderator'],
        // }
      ]
    },
    {
      id: 'Feedback',
      title: 'Feedback',
      icon: 'feedback',
      route: '/dashboard/feedback',
      roles: ['admin', 'department'],
    },
    // {
    //   id: 'serviceFeedback',
    //   title: 'Query & Feedback',
    //   icon: 'reviews',
    //   route: '/dashboard/service-feedback',
    //   roles: ['admin', 'department'],
    // },
    {
      id: 'payments',
      title: 'All Payments (Unified)',
      icon: 'account_balance',
      route: '/dashboard/payments',
      roles: ['individual'],
    },
    {
      id: 'User',
      title: 'Profile',
      icon: 'person_pin',
      route: '/dashboard/user-profile',
      roles: ['admin', 'individual', 'department'],
    },
  ];

  constructor(
    private router: Router,
    private genericService: GenericService,
    private helpService: HelpService 
  ) {
    this.currentUserType = localStorage.getItem('userRole') || 'User';
    this.userName = this.genericService.decryptLocalStorageItem('user_name') || 'User';
    this.deptName = localStorage.getItem('deptName') || '';
    this.emailId = localStorage.getItem('email_id') || '';
    this.currentUserEnterpriseName = this.genericService.decryptLocalStorageItem('name_of_enterprise') || '';
    this.hierarchyLevel = localStorage.getItem('hierarchy') || 'India';
    this.designation = localStorage.getItem('designation') || '';
    this.bin = this.genericService.decryptLocalStorageItem('bin') || '';
    this.auth_person =
      this.genericService
        .decryptLocalStorageItem('authorized_person_name')
        ?.toUpperCase() || '';
    this.blockUser = localStorage.getItem('block') || '';
    this.subDivisionUser = localStorage.getItem('subdivision') || '';
    this.districtUser = localStorage.getItem('district') || '';
  }

  ngOnInit(): void {
    this.currentUrl = this.router.url;
    const deptItem = this.menuItems.find(item => item.id === 'Departmental User');
    if (deptItem) {
      deptItem.title = this.currentUserType === 'admin'
        ? 'All Departmental Users'
        : 'My Departmental Users';
    }
    this.filterMenuItems();
    this.checkSidebarVisibility(this.currentUrl);

    this.routerSubscription = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentUrl = event.url;
        this.checkSidebarVisibility(event.url);
        this.checkAndExpandActiveParent();
      });
    // this.hideSidebar();
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  private checkSidebarVisibility(url: string): void {
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

  // Add method to toggle help sidebar
  toggleHelp(): void {
    this.helpService.toggleHelpSidebar();
  }

  filterMenuItems(): void {
    if (!this.userRole) {
      this.filteredMenuItems = [];
      return;
    }

    this.filteredMenuItems = this.menuItems
      .map((item) => {
        const children = item.children
          ? item.children.filter((child) =>
              child.roles.includes(this.userRole!)
            )
          : [];

        return { ...item, children };
      })
      .filter(
        (item) =>
          item.roles.includes(this.userRole!) || item.children.length > 0
      );
  }
  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
    this.hidden = false;
    if (window.innerWidth <= 1024 && !this.isVisible) {
      this.isVisible = true;
    }
    if (window.innerWidth <= 1024 && this.isCollapsed) {
      this.hidden = true;
    }

    this.onToggle.emit();
  }

  // hideSidebar():void{
  //   if (window.innerWidth <= 1024 && this.isCollapsed) {
  //     this.hidden = true;
  //     this.onToggle.emit();
  //   }
  // }
}
