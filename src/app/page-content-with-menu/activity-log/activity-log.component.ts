// import { Component, OnInit } from '@angular/core';
// import { trigger, transition, style, animate } from '@angular/animations';
// import { TableModule } from 'primeng/table';
// import { DialogModule } from 'primeng/dialog';
// import { ChartModule } from 'primeng/chart';
// import { MultiSelectModule } from 'primeng/multiselect';
// import { InputTextModule } from 'primeng/inputtext';
// import { ButtonModule } from 'primeng/button';
// import { TooltipModule } from 'primeng/tooltip';

// import { LoaderService } from '../../_service/loader/loader.service';
// import { GenericService } from '../../_service/generic/generic.service';
// import { finalize } from 'rxjs';
// import { CommonModule, DatePipe } from '@angular/common';
// import { IlogiSelectComponent } from '../../customInputComponents/ilogi-select/ilogi-select.component';
// import { FormsModule } from '@angular/forms';

// import { ActivityLoggerService } from '../../_service/activity-log/activity-logger.service';

// interface Activity {
//   id?: string | number;
//   date: Date;
//   action: string;
//   by: string;
//   forWhom: string;
//   module: string;
//   platform: string;
//   oldValue?: string;
//   newValue?: string;
// }

// @Component({
//   selector: 'app-activity-log',
//   templateUrl: './activity-log.component.html',
//   styleUrls: ['./activity-log.component.scss'],
//   standalone: true,
//   imports: [
//     CommonModule,
//     DatePipe,
//     TableModule,
//     DialogModule,
//     ChartModule,
//     MultiSelectModule,
//     InputTextModule,
//     ButtonModule,
//     FormsModule,
//     TooltipModule,
//     IlogiSelectComponent
//   ],
//   animations: [
//     trigger('fadeIn', [
//       transition(':enter', [
//         style({ opacity: 0, transform: 'translateY(10px)' }),
//         animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
//       ])
//     ])
//   ]
// })
// export class ActivityLogComponent implements OnInit {
//   activityData: Activity[] = [];
//   filteredData: Activity[] = [];
//   displayDialog = false;
//   selectedActivity: Activity | null = null;
//   actionTypes: any[] = [{ label: 'Create', value: 'Create' }, { label: 'Update', value: 'Update' }, { label: 'Delete', value: 'Delete' }];
//   platforms: any[] = [{ name: 'Web' }, { name: 'Android' }, { name: 'iOS' }];

//   constructor(
//     private genericService: GenericService,
//     private loaderService: LoaderService,
//     // private activityLogger: ActivityLoggerService
//   ) {}

//   ngOnInit(): void {
//     // this.activityLogger.setUserProvider(() => {
//     //   try {
//     //     const raw = localStorage.getItem('userDetails') || localStorage.getItem('user');
//     //     if (!raw) return null;

//     //     const user = JSON.parse(raw);

//     //     return {
//     //       id: user.userId ?? null,
//     //       dept_id: user.deptId || null,
//     //       role: user.userRole ?? null
//     //     };
//     //   } catch {
//     //     return null;
//     //   }
//     // });

//     /**
//      * 🧾 Log: Admin opened Activity Log page
//      */
//     // this.activityLogger.log({
//     //   action: 'activity_log.open',
//     //   metadata: { page: 'ActivityLog' }
//     // });

//     this.getActivityLogData();
//   }

//   getActivityLogData(): void {
//     const payload = {
//       department_id: this.getDeptIdFromStorage()
//     };

//     this.loaderService.showLoader();

//     this.genericService
//       .getByConditions(payload, 'get-activity-log')
//       .pipe(finalize(() => this.loaderService.hideLoader()))
//       .subscribe((res: any) => {
//         this.activityData = Array.isArray(res?.data) ? res.data : [];
//         this.filteredData = [...this.activityData];
//       });
//   }

//   viewDetails(activity: Activity): void {
//     this.selectedActivity = activity;
//     this.displayDialog = true;

//     // this.activityLogger.log({
//     //   action: 'activity_log.view',
//     //   resource_type: 'activity',
//     //   resource_id: activity.id ?? activity.date.toISOString(),
//     //   payload_summary: {
//     //     action: activity.action,
//     //     module: activity.module
//     //   }
//     // });
//   }

//   clearFilters(table: any): void {
//     table.clear();

//     // this.activityLogger.log({
//     //   action: 'activity_log.clear_filters'
//     // });
//   }


//   private getDeptIdFromStorage(): number | null {
//     try {
//       const raw = localStorage.getItem('userDetails') || localStorage.getItem('user');
//       if (!raw) return null;
//       const user = JSON.parse(raw);
//       return user.deptId ? Number(user.deptId) : null;
//     } catch {
//       return null;
//     }
//   }
// }


// ---------------------------------------------------------------------------------------------------


import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ChartModule } from 'primeng/chart';
import { MultiSelectModule } from 'primeng/multiselect';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

import { LoaderService } from '../../_service/loader/loader.service';
import { GenericService } from '../../_service/generic/generic.service';
import { finalize, Subscription } from 'rxjs';
import { CommonModule, DatePipe } from '@angular/common';
import { IlogiSelectComponent } from '../../customInputComponents/ilogi-select/ilogi-select.component';
import { FormsModule } from '@angular/forms';
interface Activity {
  date: Date;
  action: string;
  by: string;
  forWhom: string;
  module: string;
  platform: string;
  oldValue?: string;
  newValue?: string;
}

@Component({
  selector: 'app-activity-log',
  templateUrl: './activity-log.component.html',
  styleUrls: ['./activity-log.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    TableModule,
    DialogModule,
    ChartModule,
    MultiSelectModule,
    InputTextModule,
    ButtonModule,
    FormsModule,
    TooltipModule,
    IlogiSelectComponent
  ],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'translateY(10px)' }))
      ])
    ])
  ]
})
export class ActivityLogComponent implements OnInit {
  activityData: Activity[] = [];
  filteredData: Activity[] = [];
  displayDialog = false;
  selectedActivity: Activity | null = null;
  users: any[] = [{ name: 'Alice' }, { name: 'Bob' }, { name: 'Carol' }];
  departments: any[] = [{ name: 'Sales' }, { name: 'Engineering' }, { name: 'HR' }];
  modules: any[] = [{ name: 'Service' }, { name: 'Incentive' }, { name: 'Report' }, { name: 'Inspection' }];
  actionTypes: any[] = [{ label: 'Create', value: 'Create' }, { label: 'Update', value: 'Update' }, { label: 'Delete', value: 'Delete' }];
  platforms: any[] = [{ name: 'Web' }, { name: 'Android' }, { name: 'iOS' }];

  constructor(private genericService: GenericService, private loaderService: LoaderService) { }
  ngOnInit() {
    this.getActivityLogData();
    this.activityData = [
      { date: new Date(Date.now() - 200000000), action: 'Create', by: 'Rohan', forWhom: 'Kavita', module: 'User', platform: 'Web', oldValue: '', newValue: 'New user account created.' },
      { date: new Date(Date.now() - 220000000), action: 'Update', by: 'Priya', forWhom: 'Amit', module: 'Service', platform: 'Android', oldValue: 'Plan: Basic', newValue: 'Plan: Premium' },
      { date: new Date(Date.now() - 240000000), action: 'Delete', by: 'Vikram', forWhom: 'Sneha', module: 'Incentive', platform: 'Web', oldValue: 'Incentive #547', newValue: '' },
      { date: new Date(Date.now() - 260000000), action: 'Create', by: 'Anita', forWhom: 'Rahul', module: 'Report', platform: 'Web', oldValue: '', newValue: 'Monthly performance report created.' },
      { date: new Date(Date.now() - 280000000), action: 'Update', by: 'Suresh', forWhom: 'Mohan', module: 'Settings', platform: 'iOS', oldValue: 'Notifications: OFF', newValue: 'Notifications: ON' },
      { date: new Date(Date.now() - 300000000), action: 'Create', by: 'Deepak', forWhom: 'Harsha', module: 'Ticket', platform: 'Web', oldValue: '', newValue: 'Ticket #993 opened.' },
      { date: new Date(Date.now() - 320000000), action: 'Update', by: 'Kiran', forWhom: 'Sanjay', module: 'Profile', platform: 'Android', oldValue: 'Email: old@example.com', newValue: 'Email: new@example.com' },
      { date: new Date(Date.now() - 340000000), action: 'Delete', by: 'Meera', forWhom: 'Varun', module: 'Report', platform: 'Web', oldValue: 'Report ID 221', newValue: '' },
      { date: new Date(Date.now() - 360000000), action: 'Create', by: 'Arjun', forWhom: 'Lakshmi', module: 'Dashboard', platform: 'Web', oldValue: '', newValue: 'Custom dashboard created.' },
      { date: new Date(Date.now() - 380000000), action: 'Update', by: 'Pooja', forWhom: 'Ishaan', module: 'User', platform: 'iOS', oldValue: 'Role: Viewer', newValue: 'Role: Admin' },
      { date: new Date(Date.now() - 400000000), action: 'Create', by: 'Nikhil', forWhom: 'Anjali', module: 'Service', platform: 'Web', oldValue: '', newValue: 'Service request created.' },
      { date: new Date(Date.now() - 420000000), action: 'Delete', by: 'Manoj', forWhom: 'Gaurav', module: 'Ticket', platform: 'Android', oldValue: 'Ticket #432', newValue: '' },
      { date: new Date(Date.now() - 440000000), action: 'Update', by: 'Divya', forWhom: 'Shalini', module: 'Incentive', platform: 'Web', oldValue: 'Points: 200', newValue: 'Points: 350' },
      { date: new Date(Date.now() - 460000000), action: 'Create', by: 'Harish', forWhom: 'Prakash', module: 'Report', platform: 'Web', oldValue: '', newValue: 'Weekly summary report created.' },
      { date: new Date(Date.now() - 480000000), action: 'Update', by: 'Rekha', forWhom: 'Payal', module: 'Profile', platform: 'Android', oldValue: 'Phone: 9876543210', newValue: 'Phone: 9123456780' },
      { date: new Date(Date.now() - 500000000), action: 'Delete', by: 'Sagar', forWhom: 'Yusuf', module: 'User', platform: 'Web', oldValue: 'Account: Active', newValue: '' },
      { date: new Date(Date.now() - 520000000), action: 'Create', by: 'Ayesha', forWhom: 'Tarun', module: 'Settings', platform: 'iOS', oldValue: '', newValue: 'Custom preferences saved.' },
      { date: new Date(Date.now() - 540000000), action: 'Update', by: 'Ashok', forWhom: 'Karan', module: 'Service', platform: 'Web', oldValue: 'Status: Queued', newValue: 'Status: Processing' },
      { date: new Date(Date.now() - 560000000), action: 'Create', by: 'Rita', forWhom: 'Punit', module: 'Ticket', platform: 'Android', oldValue: '', newValue: 'New ticket generated.' },
      { date: new Date(Date.now() - 580000000), action: 'Update', by: 'Vijay', forWhom: 'Neha', module: 'Dashboard', platform: 'Web', oldValue: 'Layout: Grid', newValue: 'Layout: List' },
      { date: new Date(Date.now() - 600000000), action: 'Delete', by: 'Sonia', forWhom: 'Dhruv', module: 'Settings', platform: 'iOS', oldValue: 'Saved preferences', newValue: '' },
      { date: new Date(Date.now() - 620000000), action: 'Create', by: 'Imran', forWhom: 'Farah', module: 'User', platform: 'Web', oldValue: '', newValue: 'User profile created.' },
      { date: new Date(Date.now() - 640000000), action: 'Update', by: 'Geeta', forWhom: 'Ritesh', module: 'Report', platform: 'Android', oldValue: 'Report status: Draft', newValue: 'Report status: Final' }
    ];

    this.filteredData = [...this.activityData];
  }

  getActivityLogData(): void {
    const payload = {
      department_id: 1,
    }
    this.loaderService.showLoader();
    this.genericService.getByConditions(payload, 'get-activity-log').pipe(finalize(() => this.loaderService.hideLoader())).subscribe((res: any) => {
      res;
    })
  }

  viewDetails(activity: Activity) {
    this.selectedActivity = activity;
    this.displayDialog = true;
  }
  clearFilters(table: any) {
    table.clear();
  }
}
