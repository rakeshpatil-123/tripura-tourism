import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { TableModule } from "primeng/table";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { GenericService } from '../../_service/generic/generic.service';
import { TooltipModule } from 'primeng/tooltip';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { ReactiveFormsModule, FormBuilder, FormGroup } from "@angular/forms";
import Swal from 'sweetalert2';

@Component({
  selector: 'app-business-users',
  templateUrl: './business-users.component.html',
  styleUrls: ['./business-users.component.scss'],
  imports: [CommonModule, TableModule, MatIconModule, MatInputModule, MatButtonModule, TooltipModule, ToggleSwitchModule, ReactiveFormsModule]
})
export class BusinessUsersComponent implements OnInit {
  users: any[] = [];
  loading: boolean = false;
  userForms: { [key: number]: FormGroup } = {};

  columns: { field: string; header: string }[] = [
    { field: 'id', header: 'ID' },
    { field: 'name_of_enterprise', header: 'Enterprise Name' },
    { field: 'authorized_person_name', header: 'Authorized Person' },
    { field: 'email_id', header: 'Email' },
    { field: 'mobile_no', header: 'Mobile' },
    { field: 'user_name', header: 'Username' },
    { field: 'bin', header: 'BIN' },
    { field: 'district_name', header: 'District Name' },
    { field: 'subdivision_name', header: 'Subdivision Name' },
    { field: 'ulb_name', header: 'ULB Name' },
    { field: 'ward_name', header: 'Ward Name' },
    { field: 'registered_enterprise_address', header: 'Address' },
    { field: 'registered_enterprise_city', header: 'City' },
    { field: 'user_type', header: 'User Type' },
    { field: 'status', header: 'Status' }
  ];

  globalFilterFields: string[] = this.columns.map(c => c.field);

  constructor(private genericService: GenericService, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.fetchUsers();
  }

  fetchUsers() {
    this.loading = true;
    this.genericService.getBusinessUsersDetails().subscribe({
      next: (res: any) => {
        this.users = res?.status === 1 && Array.isArray(res.data) ? res.data : [];
        this.loading = false;
        this.users.forEach(user => {
          this.userForms[user.id] = this.fb.group({
            status: [user.status === 'active']
          });
        });
      },
      error: (err) => {
        console.error("Error fetching users:", err);
        this.users = [];
        this.loading = false;
      }
    });
  }

  applyFilter(event: Event, dt: any) {
    const filterValue = (event.target as HTMLInputElement).value;
    dt.filterGlobal(filterValue.trim().toLowerCase(), 'contains');
  }

  confirmStatusChange(user: any) {
    const form = this.userForms[user.id];
    const isActive = form.get('status')?.value;
    const newStatus = isActive ? 'active' : 'inactive';

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
        form.patchValue({ status: !isActive }, { emitEvent: false });
      }
    });
  }

  updateUserStatus(user: any, status: string) {
    this.genericService.updateBusinessUserStatus({ id: user.id, status }).subscribe({
      next: () => {
        user.status = status;
        Swal.fire({
          icon: 'success',
          title: 'Status Updated',
          text: `User status changed to ${status}.`,
          timer: 1500,
          showConfirmButton: false
        });
      },
      error: () => {
        const form = this.userForms[user.id];
        form.patchValue(
          { status: user.status === 'active' },
          { emitEvent: false }
        );
        Swal.fire('Error', 'Failed to update status.', 'error');
      }
    });
  }
}
