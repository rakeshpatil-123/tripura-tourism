import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { RegistrationComponent } from '../../page-content/auth/registration/registration.component';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { DividerModule } from 'primeng/divider';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { GenericService } from '../../_service/generic/generic.service';
import { IlogiSelectComponent } from "../../customInputComponents/ilogi-select/ilogi-select.component";
import { FormsModule } from '@angular/forms';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-departmental-users',
  standalone: true,
  imports: [
    RouterOutlet,
    RegistrationComponent,
    CommonModule,
    TableModule,
    DividerModule,
    ButtonModule,
    DialogModule,
    IlogiSelectComponent,
    FormsModule,
    TooltipModule
  ],
  templateUrl: './departmental-users.component.html',
  styleUrls: ['./departmental-users.component.scss']
})
export class DepartmentalUsersComponent implements OnInit {
  users: any[] = [];
  loading: boolean = false;
  displayDialog: boolean = false;
  usersBackup: any[] = [];   // keep original users
  departments: any[] = [];
  selectedDepartment: any = null;

  constructor(private genericService: GenericService) { }

  ngOnInit(): void {
    this.fetchProfile();
    this.loadDepartments();
  }

  fetchProfile() {
    this.loading = true;
    const currentUserType = localStorage.getItem('userRole');
    const apiCall =
      currentUserType === 'admin'
        ? this.genericService.getAdminDepartmentalUserProfile()
        : this.genericService.getDepartmentalUserProfile();

    apiCall.subscribe({
      next: (res: any) => {
        if (res.status === 1 && res.data) {
          this.users = res.data.map((user: any) => ({
            id: user.id,
            name_of_enterprise: user.name_of_enterprise,
            authorized_person_name: user.authorized_person_name,
            email_id: user.email_id,
            mobile_no: user.mobile_no,
            user_name: user.user_name,
            district_name: user.district_name,
            subdivision_name: user.subdivision_name,
            ulb_name: user.ulb_name,
            ward_name: user.ward_name,
            bin: user.bin,
            registered_enterprise_address: user.registered_enterprise_address,
            registered_enterprise_city: user.registered_enterprise_city,
            department_name: user.department_name,
            department_id: user.department_id,
            status: user.status
          }));
          this.usersBackup = [...this.users];
        } else {
          console.warn('Failed to fetch profile');
          this.users = [];
          this.usersBackup = [];
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching profile:', err);
        this.users = [];
        this.loading = false;
      }
    });
  }

  loadDepartments(): void {
    this.genericService.getAllDepartmentNames().subscribe({
      next: (res: any) => {
        if (res?.status) {
          this.departments = res.data.map((d: any) => ({
            id: d.id,
            name: d.name
          }));
        }
      },
      error: () => {
        this.departments = [];
      }
    });
  }

  filterByDepartment(departmentId: any): void {
    this.selectedDepartment = departmentId;

    if (departmentId) {
      const depId = +departmentId;
      this.users = this.usersBackup.filter(u => u.department_id === depId);
    } else {
      this.users = [...this.usersBackup];
    }
  }

  openDialog() {
    this.displayDialog = true;
  }

  closeDialog() {
    this.displayDialog = false;
  }

  handleRegistrationSuccess() {
    this.displayDialog = false;
    this.fetchProfile();
  }
  onPageChange(event: any) {
    const table = document.querySelector('.p-datatable-tbody');
    if (table) {
      table.classList.add('table-fade-out');
      setTimeout(() => {
        table.classList.remove('table-fade-out');
      }, 250);
    }
  }
}
