// user-caf-view-dept.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute } from '@angular/router';
import { GenericService } from '../../_service/generic/generic.service';
import { finalize } from 'rxjs/operators';

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
  private pendingRequests: number = 0;
  noDataForUser: boolean = false;
  unitDetails: any = null;
  managementDetails: any = null;
  enterpriseDetails: any = null;
  lineOfActivityDetails: any = null;
  generalAttachmentDetails: any = null;
  bankDetails: any = null;
  activityDetails: any = null;

  isLoading: boolean = true;
  error: string | null = null;
  selectedIndex: number = 0;            // currently selected tab index
  private _payload: any = null;         // stores payload after uid is read
  private _firstLoadCompleted = false;
  fetchedTabs: Record<DataProperty, boolean> = {
    unitDetails: false,
    managementDetails: false,
    enterpriseDetails: false,
    lineOfActivityDetails: false,
    generalAttachmentDetails: false,
    bankDetails: false,
    activityDetails: false,
  };

  tabs = [
    { label: 'Unit Details', key: 'unitDetails' },
    { label: 'Enterprise Details', key: 'enterpriseDetails' },
    { label: 'Management Details', key: 'managementDetails' },
    { label: 'Line of Activity', key: 'lineOfActivityDetails' },
    { label: 'General Attachments', key: 'generalAttachmentDetails' },
    { label: 'Bank Details', key: 'bankDetails' },
    { label: 'Activity Details', key: 'activityDetails' },
  ];
    private apiMap: Record<DataProperty, string> = {
    unitDetails: 'api/department/get-user-caf-unit_details',
    enterpriseDetails: 'api/department/get-user-caf-enterprise-details',
    managementDetails: 'api/department/get-user-caf-management-details',
    lineOfActivityDetails: 'api/department/get-user-caf-lineOfActivity-details',
    generalAttachmentDetails: 'api/department/get-user-caf-generalAttachment-details',
    bankDetails: 'api/department/get-user-caf-bank-details',
    activityDetails: 'api/department/get-user-caf-activity-details',
  };

  constructor(
    private route: ActivatedRoute,
    private apiService: GenericService
  ) {}

  ngOnInit(): void {
     this.loadUserIdAndInit();
  }

onTabChange(index: number): void {
    this.selectedIndex = index;
    const prop = this.tabs[index]?.key as DataProperty;
    if (!prop) return;

    // if we've already fetched data for this tab, do nothing
    if (this.fetchedTabs[prop]) return;

    const api = this.apiMap[prop];
    if (!api) return;

    // fetch for this tab
    this.fetchData(api, this._payload, prop).catch(() => {
      // swallow here — fetchData will set property to null and mark fetched
    });
  }


loadUserIdAndInit(): void {
    this.uid = Number(this.route.snapshot.paramMap.get('uid'));

    if (!this.uid || isNaN(this.uid)) {
      this.error = 'Invalid User ID';
      this.isLoading = false;
      return;
    }

    this._payload = { user_id: this.uid };
    this.isLoading = true;
    this.noDataForUser = false;
    this.selectedIndex = 0;

    // load only the initial tab (tab 0) — further tabs load when user selects them
    this.onTabChange(this.selectedIndex);
  }

private fetchData(api: string, payload: any, property: DataProperty): Promise<void> {
    return new Promise((resolve, reject) => {
      this.apiService
        .getByConditions(payload, api)
        .pipe(
          finalize(() => {
            // mark this tab as fetched (even on error) and re-evaluate global no-data only when all tabs fetched
            this.fetchedTabs[property] = true;

            // turn off global loading after the first fetch completes
            if (!this._firstLoadCompleted) {
              this._firstLoadCompleted = true;
              this.isLoading = false;
            }

            // If every tab has been fetched at least once, compute noDataForUser
            if (Object.values(this.fetchedTabs).every((v) => v === true)) {
              this.computeNoDataForUser();
            }
          })
        )
        .subscribe({
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
  private computeNoDataForUser(): void {
    const allProps: any[] = [
      this.unitDetails,
      this.managementDetails,
      this.enterpriseDetails,
      this.lineOfActivityDetails,
      this.generalAttachmentDetails,
      this.bankDetails,
      this.activityDetails,
    ];
    const allEmpty = allProps.every((p) => {
      if (p == null) return true;
      if (Array.isArray(p)) return p.length === 0;
      if (typeof p === 'object') {
        return Object.values(p).every((v) => v == null || (Array.isArray(v) && v.length === 0));
      }
      return false;
    });

    this.noDataForUser = allEmpty;
  }
private decrementPendingAndComputeNoData(): void {
  this.pendingRequests = Math.max(0, this.pendingRequests - 1);
  if (this.pendingRequests === 0) {
    this.isLoading = false;
    // compute if all data properties are null/empty
    const allProps: any[] = [
      this.unitDetails,
      this.managementDetails,
      this.enterpriseDetails,
      this.lineOfActivityDetails,
      this.generalAttachmentDetails,
      this.bankDetails,
      this.activityDetails,
    ];
    const allEmpty = allProps.every((p) => {
      if (p == null) return true;
      // arrays or objects with empty arrays considered empty
      if (Array.isArray(p)) return p.length === 0;
      if (typeof p === 'object') {
        // check object has any non-empty value
        return Object.values(p).every((v) => v == null || (Array.isArray(v) && v.length === 0));
      }
      return false;
    });

    this.noDataForUser = allEmpty;
  }
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
    return value != null
      ? `₹${new Intl.NumberFormat('en-IN').format(value)}`
      : '-';
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
