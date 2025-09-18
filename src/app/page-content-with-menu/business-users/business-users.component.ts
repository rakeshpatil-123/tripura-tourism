import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { TableModule } from "primeng/table";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { GenericService } from '../../_service/generic/generic.service';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-business-users',
  templateUrl: './business-users.component.html',
  styleUrls: ['./business-users.component.scss'],
  imports: [CommonModule, TableModule, MatIconModule, MatInputModule, MatButtonModule, TooltipModule]
})
export class BusinessUsersComponent implements OnInit {
  users: any[] = [];
  loading: boolean = false;

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

  constructor(private genericService: GenericService) { }

  ngOnInit(): void {
    this.fetchUsers();
  }

  fetchUsers() {
    this.loading = true;
    this.genericService.getBusinessUsersDetails().subscribe({
      next: (res: any) => {
        this.users = res?.status === 1 && Array.isArray(res.data) ? res.data : [];
        this.loading = false;
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
}
