import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IlogiSelectComponent } from '../../customInputComponents/ilogi-select/ilogi-select.component';
import { IlogiInputDateComponent } from '../../customInputComponents/ilogi-input-date/ilogi-input-date.component';

@Component({
  selector: 'app-user-report',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IlogiSelectComponent,
    IlogiInputDateComponent,
  ],
  templateUrl: './user-report.component.html',
  styleUrls: ['./user-report.component.scss']
})
export class UserReportComponent {
  fromDate: string = '';
  toDate: string = '';
  selectedDept: string = '';
  selectedRole: string = '';
  selectedStatus: string = '';

  departments = [
    { name: 'IT', id: 'it' },
    { name: 'HR', id: 'hr' },
    { name: 'Finance', id: 'finance' }
  ];

  roles = [
    { name: 'Admin', id: 'admin' },
    { name: 'Manager', id: 'manager' }
  ];

  statuses = [
    { name: 'Active', id: 'active' },
    { name: 'Inactive', id: 'inactive' },
    { name: 'Pending', id: 'pending' }
  ];

  usersList = [
    {
      userName: 'John Doe',
      email: 'john@example.com',
      role: 'Admin',
      department: 'IT',
      status: 'Active',
      reportType: 'Monthly Report',
      amount: 5000
    },
    {
      userName: 'Jane Smith',
      email: 'jane@example.com',
      role: 'Manager',
      department: 'Finance',
      status: 'Pending',
      reportType: 'Quarterly Report',
      amount: 12000
    },
    {
      userName: 'Sam Wilson',
      email: 'sam@example.com',
      role: 'Admin',
      department: 'HR',
      status: 'Inactive',
      reportType: 'Annual Report',
      amount: 15000
    }
  ];

  filteredUsers = [...this.usersList];
  search() {
    this.filteredUsers = this.usersList.filter(user => {
      return (
        (!this.selectedDept || user.department.toLowerCase() === this.selectedDept.toLowerCase()) &&
        (!this.selectedRole || user.role.toLowerCase() === this.selectedRole.toLowerCase()) &&
        (!this.selectedStatus || user.status.toLowerCase() === this.selectedStatus.toLowerCase())
      );
    });
  }

  reset() {
    this.fromDate = '';
    this.toDate = '';
    this.selectedDept = '';
    this.selectedRole = '';
    this.selectedStatus = '';
    this.filteredUsers = [...this.usersList];
  }

  exportData() {
    alert('Export functionality coming soon');
  }
}
