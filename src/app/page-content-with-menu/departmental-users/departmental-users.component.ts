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
  profile: any = null;
  profileTable: { field: string; value: any }[] = [];
  loading: boolean = false;

  constructor(private genericService: GenericService) { }

  ngOnInit(): void {
    this.fetchProfile();
  }

  fetchProfile() {
    this.loading = true;
    this.genericService.getDepartmentalUserProfile().subscribe({
      next: (res) => {
        if (res.success) {
          this.profile = res.data;
          this.prepareProfileTable();
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

  prepareProfileTable() {
    this.profileTable = [
      { field: 'Name', value: this.profile.name },
      { field: 'Email', value: this.profile.email },
      { field: 'Mobile', value: this.profile.mobile },
      { field: 'Address', value: this.profile.address },
      { field: 'District ID', value: this.profile.district_id },
      { field: 'Subdivision ID', value: this.profile.subdivision_id },
      { field: 'Block ID', value: this.profile.block_id || 'N/A' }
    ];
  }
}
