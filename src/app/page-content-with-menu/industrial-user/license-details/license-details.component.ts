import { Component } from '@angular/core';
import { DynamicTableComponent } from '../../../shared/component/table/table.component';
import { CommonModule } from '@angular/common';
import { GenericService } from '../../../_service/generic/generic.service';
import { ActivatedRoute } from '@angular/router';
import { LoaderComponent } from '../../../page-template/loader/loader.component';

@Component({
  selector: 'app-license-details',
  imports: [DynamicTableComponent, CommonModule, LoaderComponent],
  templateUrl: './license-details.component.html',
  styleUrl: './license-details.component.scss',
})
export class LicenseDetailsComponent {
  applications: any[] = [];
  columns: any[] = [
    { key: 'id', label: '#', type: 'text' },
    { key: 'licensee_name', label: 'Licensee Name', type: 'text' },
    { key: 'application_no', label: 'Application No', type: 'text' },
    { key: 'license_no', label: 'License No', type: 'text' },
    { key: 'valid_from', label: 'Valid From', type: 'text' },
    { key: 'expiry_date', label: 'Expiry Date', type: 'text' },
    { key: 'created_at', label: 'Created At', type: 'text' },
    { key: 'updated_at', label: 'Updated At', type: 'text' },
  ];
  loading: boolean = false;
  licId: string = '';
  constructor(
    private apiService: GenericService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.licId = id;
    }
    if(id){
      this.getLicDetails();
    }
  }

  getLicDetails(): void {
    this.loading = true;
    const payload = { id: this.licId };
    this.apiService
      .getByConditions(payload, 'api/user/existing-license-details')
      .subscribe({
        next: (res: any) => {
          this.loading = false;
          if (res?.status === 1 && res?.data) {
           this.applications = Array.isArray(res.data) ? res.data : [res.data];
          }
          console.log(this.applications, "c");
          
        },

        error: (err) => {
          this.applications = [];
          console.error('Failed to load Details:', err);
          this.apiService.openSnackBar('Failed to load Details', 'error');
          this.loading = false;

        },
      });
  }
}
