import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { RegistrationComponent } from '../../page-content/auth/registration/registration.component';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { DividerModule } from 'primeng/divider';
import { ButtonModule } from 'primeng/button';
import { GenericService } from '../../_service/generic/generic.service';

@Component({
  selector: 'app-departmental-users',
  standalone: true,
  imports: [RouterOutlet, RegistrationComponent, CommonModule, TableModule, DividerModule, ButtonModule],
  templateUrl: './departmental-users.component.html',
  styleUrls: ['./departmental-users.component.scss']
})
export class DepartmentalUsersComponent implements OnInit {
  users: any[] = [];
  loading: boolean = false;

  constructor(private genericService: GenericService) { }

  ngOnInit(): void {
    this.fetchProfile();
  }

  fetchProfile() {
    this.loading = true;
    this.genericService.getDepartmentalUserProfile().subscribe({
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
            status: user.status
          }));
        } else {
          console.warn('Failed to fetch profile');
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching profile:', err);
        this.loading = false;
      }
    });
  }
}
