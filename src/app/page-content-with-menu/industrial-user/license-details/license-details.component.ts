import { Component } from '@angular/core';
import { DynamicTableComponent } from '../../../shared/component/table/table.component';
import { CommonModule, DatePipe } from '@angular/common';
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
    { key: 'license_file', label: 'Uploaded File',  type: 'view-link',
      viewLinkText: 'View File',},
    { key: 'valid_from_display', label: 'Valid From', type: 'text' },
    { key: 'expiry_date_display', label: 'Expiry Date', type: 'text' },
    { key: 'created_at_display', label: 'Created At', type: 'text' },
    { key: 'updated_at_display', label: 'Updated At', type: 'text' },
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
    if (id) {
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
            const rawItem = res.data;

            const formattedItem = {
              ...rawItem,
              valid_from_display: this.formatDateForDisplay(rawItem.valid_from),
              expiry_date_display: this.formatDateForDisplay(
                rawItem.expiry_date
              ),
              created_at_display: this.formatDateForDisplay(rawItem.created_at),
              updated_at_display: this.formatDateForDisplay(rawItem.updated_at),
            };

            this.applications = [formattedItem];
          } else {
            this.applications = [];
          }
        },

        error: (err) => {
          this.applications = [];
          console.error('Failed to load Details:', err);
          this.apiService.openSnackBar('Failed to load Details', 'error');
          this.loading = false;
        },
      });
  }

  private formatDateForDisplay(dateString: string): string {
    if (!dateString) return '—';

    let date: Date;
    if (dateString.includes('T')) {
      date = new Date(dateString);
    } else {
      date = new Date(dateString.replace(' ', 'T') + 'Z');
    }

    const datePipe = new DatePipe('en-US');

    const day = date.getDate();
    const ordinal = this.getOrdinal(day);
    let formatted = datePipe.transform(date, `d'th' MMM yyyy - hh:mm a`);

    if (!formatted) return dateString;
    return formatted.replace('th', ordinal);
  }

  private getOrdinal(n: number): string {
    if (n > 3 && n < 21) return 'th';
    switch (n % 10) {
      case 1:
        return 'st';
      case 2:
        return 'nd';
      case 3:
        return 'rd';
      default:
        return 'th';
    }
  }
}
