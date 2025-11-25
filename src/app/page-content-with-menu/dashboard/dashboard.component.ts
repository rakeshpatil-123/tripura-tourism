import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserDashboardComponent } from '../user-dashboard/user-dashboard.component';
import { GenericService } from '../../_service/generic/generic.service';
import { DepartmentalUserDashboardComponent } from "../departmental-user-dashboard/departmental-user-dashboard.component";
import { AdminDashboardComponent } from '../admin-dashboard/admin-dashboard.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    UserDashboardComponent,
    DepartmentalUserDashboardComponent,
    AdminDashboardComponent,
],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  userRole: any;
  constructor() { }
  ngOnInit(): void {
    let raw = localStorage.getItem('userRole');
    try {
      if (raw && (raw.trim().startsWith('{') || raw.includes('"'))) {
        const obj = JSON.parse(raw);
        raw = obj?.role ?? obj?.userRole ?? obj?.type ?? obj?.roleName ?? obj?.role_type ?? raw;
      }
    } catch (e) {
    }

    const val = String(raw || '').toLowerCase();
    if (val.includes('admin')) {
      this.userRole = 'admin';
    } else if (val.includes('department') || val.includes('dept')) {
      this.userRole = 'department';
    } else if (val.includes('individ') || val.includes('individual')) {
      this.userRole = 'individual';
    } else {
      this.userRole = val || null;
    }
  }
}
