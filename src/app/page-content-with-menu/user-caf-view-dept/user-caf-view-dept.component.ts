// user-caf-view-dept.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute } from '@angular/router';
import { GenericService } from '../../_service/generic/generic.service';

type DataProperty =
  | 'unitDetails'
  | 'managementDetails'
  | 'enterpriseDetails'
  | 'lineOfActivityDetails'
  | 'generalAttachmentDetails'
  | 'bankDetails'
  | 'activityDetails';

@Component({
  selector: 'app-user-caf-view-dept',
  imports: [CommonModule, MatTabsModule, MatCardModule],
  templateUrl: './user-caf-view-dept.component.html',
  styleUrl: './user-caf-view-dept.component.scss',
  standalone: true,
})
export class UserCafViewDeptComponent implements OnInit {
  uid: number | null = null;

  unitDetails: any = null;
  managementDetails: any = null;
  enterpriseDetails: any = null;
  lineOfActivityDetails: any = null;
  generalAttachmentDetails: any = null;
  bankDetails: any = null;
  activityDetails: any = null;

  isLoading: boolean = true;
  error: string | null = null;

  // ✅ Tab labels
  tabs = [
    { label: 'Unit Details', key: 'unitDetails' },
    { label: 'Enterprise Details', key: 'enterpriseDetails' },
    { label: 'Management Details', key: 'managementDetails' },
    { label: 'Line of Activity', key: 'lineOfActivityDetails' },
    { label: 'General Attachments', key: 'generalAttachmentDetails' },
    { label: 'Bank Details', key: 'bankDetails' },
    { label: 'Activity Details', key: 'activityDetails' },
  ];

  constructor(
    private route: ActivatedRoute,
    private apiService: GenericService
  ) {}

  ngOnInit(): void {
    this.loadUserIdAndData();
  }

  loadUserIdAndData(): void {
    this.uid = Number(this.route.snapshot.paramMap.get('uid'));

    if (!this.uid || isNaN(this.uid)) {
      this.error = 'Invalid User ID';
      this.isLoading = false;
      return;
    }

    const payload = { user_id: this.uid };

    Promise.all([
      this.fetchData('api/department/get-user-caf-unit_details', payload, 'unitDetails'),
      this.fetchData('api/department/get-user-caf-enterprise-details', payload, 'enterpriseDetails'),
      this.fetchData('api/department/get-user-caf-management-details', payload, 'managementDetails'),
      this.fetchData('api/department/get-user-caf-lineOfActivity-details', payload, 'lineOfActivityDetails'),
      this.fetchData('api/department/get-user-caf-generalAttachment-details', payload, 'generalAttachmentDetails'),
      this.fetchData('api/department/get-user-caf-bank-details', payload, 'bankDetails'),
      this.fetchData('api/department/get-user-caf-activity-details', payload, 'activityDetails'),
    ])
      .then(() => {
        this.isLoading = false;
      })
      .catch((err) => {
        console.error('Error loading CAF data:', err);
        this.error = 'Failed to load user data.';
        this.isLoading = false;
      });
  }

  private fetchData(api: string, payload: any, property: DataProperty): Promise<void> {
  return new Promise((resolve, reject) => {
    this.apiService.getByConditions(payload, api).subscribe({
      next: (res: any) => {
        if (res?.status === 1 || res?.success) {
          const normalizedData = res.data !== undefined ? res.data : res;
          this[property] = normalizedData;
        } else {
          console.warn(`API ${api} returned no data:`, res);
          this[property] = null;
        }
        resolve();
      },
      error: (err) => {
        console.error(`API ${api} failed:`, err);
        this[property] = null;
        reject(err);
      },
    });
  });
}

  formatDate(dateString: string): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  formatCurrency(value: number): string {
    return value != null ? `₹${new Intl.NumberFormat('en-IN').format(value)}` : '-';
  }

  safeDisplay(value: any): string {
    return value != null ? String(value) : '-';
  }


  formatNicCode(codeString: string): string {
  if (!codeString) return '-';
  if (codeString.includes(' - ')) {
    return codeString.trim();
  }
  return codeString.trim();
}
}