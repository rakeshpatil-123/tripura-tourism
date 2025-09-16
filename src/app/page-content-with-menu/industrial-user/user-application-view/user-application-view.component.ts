// user-application-view.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GenericService } from '../../../_service/generic/generic.service';
import { CommonModule } from '@angular/common';

interface ApplicationDetail {
  application_date: string;
  status: string;
  application_data: Record<string, string>;
  payment_status: string | null;
  final_fee: string;
  current_step_number: string;
  max_processing_date: string;
  NOC_application_date?: string | null;
  NOC_expiry_date?: string | null;
  NOC_letter_number?: string | null;
  NOC_letter_date?: string | null;
  remarks?: string | null;
  payment_transId?: string | null;
  payment_time?: string | null;
  GRN_number?: string | null;
  NOC_penalty_amount?: string | null;
}

@Component({
  selector: 'app-user-application-view',
  templateUrl: './user-application-view.component.html',
  styleUrls: ['./user-application-view.component.scss'],
  standalone: true,
  imports: [CommonModule],
})
export class UserApplicationViewComponent implements OnInit {
  serviceId: number | null = null;
  appId: number | null = null;
  application: ApplicationDetail | null = null;
  isLoading: boolean = false;
  error: string | null = null;

  fieldLabelMap: Record<string, string> = {
    '17': 'Applicant Name',
    '18': 'Business Name',
    '19': 'Owner Name',
    '20': 'District',
    '21': 'Zone',
    '22': 'Sub Division',
    '23': 'S-S Division',
  };

  constructor(
    private route: ActivatedRoute,
    private apiService: GenericService
  ) {}

  ngOnInit(): void {
    this.loadRouteParams();
  }

  loadRouteParams(): void {
    const serviceIdParam = this.route.snapshot.paramMap.get('serviceId');
    const appIdParam = this.route.snapshot.paramMap.get('appId');

    this.serviceId = serviceIdParam ? +serviceIdParam : null;
    this.appId = appIdParam ? +appIdParam : null;

    if (this.serviceId && this.appId) {
      this.fetchApplicationDetails();
    } else {
      this.error = 'Invalid or missing route parameters.';
    }
  }

  fetchApplicationDetails(): void {
    this.isLoading = true;
    this.error = null;

    const payload = {
      service_id: this.serviceId,
      application_id: this.appId,
    };

    this.apiService
      .getByConditions(payload, 'api/user/get-details-user-service-applications')
      .subscribe({
        next: (res: any) => {
          this.isLoading = false;
          if (res?.status === 1 && Array.isArray(res.data) && res.data.length > 0) {
            this.application = res.data[0];
          } else {
            this.error = res?.message || 'No application details found.';
          }
        },
        error: (err) => {
          this.isLoading = false;
          this.error = 'Failed to load application. Please try again later.';
          console.error('API Error:', err);
        },
      });
  }

  getLabel(key: string): string {
    return this.fieldLabelMap[key] || `Field ${key}`;
  }

  // ✅ Accept undefined as well
  formatDate(dateStr: string | null | undefined): string {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  // ✅ Already correct — accepts undefined
  getStatusBadgeClass(status: string | null | undefined): string {
    const s = status?.toLowerCase() || '';
    if (s === 'approved') return 'status-badge status-approved';
    if (s === 'rejected') return 'status-badge status-rejected';
    if (s === 'submitted') return 'status-badge status-submitted';
    if (s === 'send_back') return 'status-badge status-send-back';
    return 'status-badge status-default';
  }
}