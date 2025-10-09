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
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TooltipModule } from 'primeng/tooltip';
import {ToggleSwitchModule} from "primeng/toggleswitch";
import Swal from 'sweetalert2';
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
    TooltipModule,
    ToggleSwitchModule,
    ReactiveFormsModule
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
  selectedUser: any = null; 
  editMode: boolean = false;
  userForms: { [key: number]: FormGroup } = {};
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
          this.users.forEach(user => {
            this.userForms[user.id] = new FormGroup({
              status: new FormControl(user.status === 'active')
            });
          });
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
    this.selectedUser = null;
    this.displayDialog = true;
    this.editMode = false;
  }
  editUser(user: any): void {
    this.editMode = true;
    this.selectedUser = null;

    const payload = { id: user.id };
    this.genericService.getByConditions(payload, 'api/admin/get-department-user-details').subscribe({
      next: (res: any) => {
        if (res?.success && res?.data) {
          this.selectedUser = { ...res.data, user_id: user.id };
          this.displayDialog = true;
        } else {
          this.genericService.openSnackBar('Failed to load user details.', 'Error');
        }
      },
      error: (err: any) => {
        console.error('Error fetching user details:', err);
        this.genericService.openSnackBar('Something went wrong while loading details.', 'Error');
      }
    });
  }

  closeDialog() {
    this.displayDialog = false;
    this.selectedUser = null;
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
confirmStatusChange(event: any, user: any) {
  const isCurrentlyActive = user.status === 'active';
  const newStatus = isCurrentlyActive ? 'inactive' : 'active';

  Swal.fire({
    title: 'Are you sure?',
    text: `Do you want to change status to "${newStatus}"?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: newStatus === 'active' ? '#10b981' : '#ef4444',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Yes, change it!',
    cancelButtonText: 'Cancel'
  }).then((result) => {
    if (result.isConfirmed) {
      this.updateUserStatus(user, newStatus);
    } else {
      setTimeout(() => {
        this.userForms[user.id].controls['status'].setValue(isCurrentlyActive, { emitEvent: false });
      });
    }
  });
}

updateUserStatus(user: any, status: string) {
  const payload = { id: user.id, status };

  this.genericService.updateDepartmentalUserStatus(payload).subscribe({
    next: () => {
      user.status = status;
      this.userForms[user.id].controls['status'].setValue(status === 'active', { emitEvent: false });

      Swal.fire({
        icon: 'success',
        title: 'Status Updated',
        text: `User status changed to "${status}".`,
        timer: 1500,
        showConfirmButton: false
      });
    },
    error: () => {
      this.userForms[user.id].controls['status'].setValue(user.status === 'active', { emitEvent: false });
      Swal.fire('Error', 'Failed to update status.', 'error');
    }
  });
  }
}
