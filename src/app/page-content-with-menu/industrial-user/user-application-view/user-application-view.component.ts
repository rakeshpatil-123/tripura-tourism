// user-application-view.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GenericService } from '../../../_service/generic/generic.service';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

interface ApplicationDetail {
  application_date: string;
  status: string;
  application_data: Record<string, string>;
  application_data_structured?: {
    id: number;
    question: string;
    answer: string;
  }[];
  payment_status: string | null;
  final_fee: string;
  extra_payment?: string; 
  total_fee?: string;
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

  // fetchApplicationDetails(): void {
  //   this.isLoading = true;
  //   this.error = null;

  //   const payload = {
  //     service_id: this.serviceId,
  //     application_id: this.appId,
  //   };

  //   this.apiService
  //     .getByConditions(
  //       payload,
  //       'api/user/get-details-user-service-applications'
  //     )
  //     .subscribe({
  //       next: (res: any) => {
  //         this.isLoading = false;
  //         if (
  //           res?.status === 1 &&
  //           Array.isArray(res.data) &&
  //           res.data.length > 0
  //         ) {
  //           const appData = res.data[0];

  //           this.application = {
  //             ...appData,
  //             application_data_structured: Array.isArray(res.application_data)
  //               ? res.application_data.map((item: any) => ({
  //                   id: item.id,
  //                   question: item.question,
  //                   answer: item.answer || '—',
  //                 }))
  //               : [],
  //             extra_payment: appData.extra_payment || '0',
  //             total_fee: appData.total_fee || '0',
  //           };
  //         } else {
  //           this.error = res?.message || 'No application details found.';
  //         }
  //       },
  //       error: (err) => {
  //         this.isLoading = false;
  //         this.error = 'Failed to load application. Please try again later.';
  //         console.error('API Error:', err);
  //       },
  //     });
  // }

  fetchApplicationDetails(): void {
  this.isLoading = true;
  this.error = null;

  const payload = {
    service_id: this.serviceId,
    application_id: this.appId,
  };

  this.apiService
    .getByConditions(
      payload,
      'api/user/get-details-user-service-applications'
    )
    .subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (
          res?.status === 1 &&
          res.data &&
          typeof res.data === 'object'
        ) {
          const appData = res.data;

          this.application = {
            ...appData,
            application_data: res.application_data || appData.application_data || {},
            application_data_structured: Array.isArray(res.application_data)
              ? res.application_data.map((item: any) => ({
                  id: item.id,
                  question: item.question,
                  answer: item.answer || '—',
                }))
              : [],
            extra_payment: appData.extra_payment || '0',
            total_fee: appData.total_fee || '0',
          };
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

  getStatusBadgeClass(status: string | null | undefined): string {
    const s = status?.toLowerCase() || '';
    if (s === 'approved') return 'status-badge status-approved';
    if (s === 'rejected') return 'status-badge status-rejected';
    if (s === 'submitted') return 'status-badge status-submitted';
    if (s === 'send_back') return 'status-badge status-send-back';
    return 'status-badge status-default';
  }

  get hasExtraPayment(): boolean {
  if (!this.application?.extra_payment) return false;
  const amount = parseFloat(this.application.extra_payment);
  return !isNaN(amount) && amount > 0;
  }
  downloadCertificate(): void {
    const baseUrl = 'http://swaagatstaging.tripura.cloud/';
    this.apiService.downloadServiceCertificate(this.appId).subscribe({
      next: (res: any) => {
        if (res?.download_url) {
          const openPdf = baseUrl + res.download_url;
          window.open(openPdf, '_blank');
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'PDF URL not found. Please try again.',
            confirmButtonText: 'OK'
          });
        }
      },
      error: () => {
        Swal.fire({
          icon: 'error',
          title: 'Download Failed',
          text: 'Something went wrong while fetching the certificate.',
          confirmButtonText: 'Retry'
        });
      }
    });
  }
  formatAnswerForDisplay(answer: any): string {
  if (!answer) return '—';

  // Case 1: It's a string (likely a file URL)
  if (typeof answer === 'string') {
    // Check if it looks like a URL (has http or .pdf, etc.)
    if (answer.startsWith('http') || answer.includes('uploads/')) {
      // Extract filename from URL or path
      const url = new URL(answer, 'http://dummy.base'); // dummy base to avoid error if relative
      return url.pathname.split('/').pop() || answer;
    }
    return answer;
  }

  // Case 2: It's an array (like TestSection)
  if (Array.isArray(answer)) {
    // Flatten array of objects into comma-separated values
    const flatValues: string[] = [];
    for (const item of answer) {
      if (typeof item === 'object' && item !== null) {
        // Push all values (ignore keys like "616", "617")
        flatValues.push(...Object.values(item).map(v => String(v)));
      } else {
        flatValues.push(String(item));
      }
    }
    return flatValues.join(', ');
  }

  // Case 3: It's a plain object (unlikely based on your data, but safe)
  if (typeof answer === 'object') {
    return Object.values(answer).join(', ');
  }

  // Fallback
  return String(answer);
}
}
