// user-application-view.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GenericService } from '../../../_service/generic/generic.service';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { LoaderComponent } from '../../../page-template/loader/loader.component';
import {
  DynamicTableComponent,
  TableColumn,
} from '../../../shared/component/table/table.component';

interface HistoryData {
  id: number;
  step_number: number;
  status: string;
  remarks: string | null;
  status_file: string | null;
  action_taken_at: string;
  action_taken_by: number;
  step_type: string;
}

interface ApplicationDetail {
  approved_fee: string;
  applicationId: string;
  application_date: string;
  status: string;
  application_data: Record<string, string>;
  application_data_structured?: {
    id: number;
    question: string;
    answer: string;
    type: string;
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
  history_data?: HistoryData[];
}

@Component({
  selector: 'app-user-application-view',
  templateUrl: './user-application-view.component.html',
  styleUrls: ['./user-application-view.component.scss'],
  standalone: true,
  imports: [CommonModule, LoaderComponent, DynamicTableComponent],
})
export class UserApplicationViewComponent implements OnInit {
  serviceId: number | null = null;
  serviceName: string | null = null;
  appId: number | null = null;
  application: ApplicationDetail | null = null;
  isLoading: boolean = false;
  error: string | null = null;
  isThirdParty: boolean = false;
  hasDownloadUrl: boolean = false;
  transactionDetails: any[] = [];
  transactionColumns: TableColumn[] = [];
  historyDetails: HistoryData[] = [];
  historyColumns: TableColumn[] = [];
  fieldLabelMap: Record<string, string> = {
    '17': 'Applicant Name',
    '18': 'Business Name',
    '19': 'Owner Name',
    '20': 'District',
    '21': 'Zone',
    '22': 'Sub Division',
    '23': 'S-S Division',
  };
  defineHistoryColumns(): void {
    this.historyColumns = [
      { key: 'step_number', label: 'Step #', type: 'text' },
      { key: 'step_type', label: 'Step Type', type: 'text' },
      { key: 'status', label: 'Status', type: 'text' },
      { key: 'remarks', label: 'Remarks', type: 'text' },
      { key: 'action_taken_at', label: 'Action Taken At', type: 'text' },
      {
        key: 'status_file',
        label: 'Status File',
        type: 'view-link',
        viewLinkText: 'View Dept. Uploaded Doc',
      },
    ];
  }

  constructor(
    private route: ActivatedRoute,
    private apiService: GenericService
  ) {}

  ngOnInit(): void {
    this.loadRouteParams();
    this.checkThirdPartyService();
    this.defineColumns();
    this.defineHistoryColumns();
  }

  defineColumns(): void {
    this.transactionColumns = [
      { key: 'transaction_id', label: 'Transaction ID', type: 'text' },
      { key: 'GRN_number', label: 'GRN Number', type: 'text' },
      { key: 'gateway', label: 'Status', type: 'text' },
      { key: 'payment_datetime', label: 'Payment Date', type: 'text' },
      { key: 'payment_amount', label: 'Amount', type: 'text' },
      { key: 'payment_status', label: 'Status', type: 'text' },
    ];
  }

  checkThirdPartyService(): void {
    this.route.queryParams.subscribe((params) => {
      this.isThirdParty = params['service'] === 'third_party';
    });
  }

  checkDownloadUrlAvailability(): void {
    const baseUrl = 'http://swaagatstaging.tripura.cloud/';
    this.apiService.downloadServiceCertificate(this.appId).subscribe({
      next: (res: any) => {
        this.hasDownloadUrl = !!res?.download_url;
      },
      error: () => {
        this.hasDownloadUrl = false;
      },
    });
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
      .getByConditions(
        payload,
        'api/user/get-details-user-service-applications'
      )
      .subscribe({
        next: (res: any) => {
          this.isLoading = false;
          if (res?.status === 1 && res.data && typeof res.data === 'object') {
            this.transactionDetails = res.payment_details.map((item: any) => {
              return {
                transaction_id: item.transaction_id,
                GRN_number: item.GRN_number,
                gateway: item.gateway,
                payment_datetime: item.payment_datetime,
                payment_amount: item.payment_amount,
                payment_status: item.payment_status,
              };
            });

            this.serviceName = res?.service_name;
            const appData = res?.data;

            const structuredData = this.normalizeApplicationData(
              res.application_data
            );
            const filteredData = structuredData.filter((qa) => {
              if (qa.answer == null) return false;
              if (qa.answer === '') return false;
              if (Array.isArray(qa.answer) && qa.answer.length === 0)
                return false;
              return true;
            });

            this.application = {
              ...appData,
              application_data: appData.application_data || {},
              application_data_structured: filteredData,
              extra_payment: appData.extra_payment || '0',
              total_fee: appData.total_fee || '0',
              history_data: Array.isArray(res.history_data)
                ? res.history_data
                : [],
            };

            this.historyDetails = (res.history_data || []).map((h: any) => ({
              step_number: h.step_number,
              step_type: h.step_type || '—',
              status: h.status || '—',
              remarks: h.remarks || '—',
              action_taken_at: this.formatDate(h.action_taken_at),
              status_file: h.status_file,
            }));

            this.checkDownloadUrlAvailability();
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

  getFileNameFromUrl(url: string | null | undefined): string {
    if (!url) return '';
    try {
      const urlWithoutParams = url.split('?')[0];
      return (
        decodeURIComponent(
          urlWithoutParams.substring(urlWithoutParams.lastIndexOf('/') + 1)
        ) || 'document.pdf'
      );
    } catch {
      return 'document.pdf';
    }
  }

  previewFile(url: string): void {
    if (url) {
      window.open(url, '_blank');
    }
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
            confirmButtonText: 'OK',
          });
        }
      },
      error: () => {
        Swal.fire({
          icon: 'error',
          title: 'Download Failed',
          text: 'Something went wrong while fetching the certificate.',
          confirmButtonText: 'Retry',
        });
      },
    });
  }
  formatAnswerForDisplay(answer: any): string {
    if (!answer) return '—';

    if (typeof answer === 'string') {
      if (answer.startsWith('http') || answer.includes('uploads/')) {
        const url = new URL(answer, 'http://dummy.base');
        return url.pathname.split('/').pop() || answer;
      }
      return answer;
    }

    if (Array.isArray(answer)) {
      const flatValues: string[] = [];
      for (const item of answer) {
        if (typeof item === 'object' && item !== null) {
          flatValues.push(...Object.values(item).map((v) => String(v)));
        } else {
          flatValues.push(String(item));
        }
      }
      return flatValues.join(', ');
    }

    if (typeof answer === 'object') {
      return Object.values(answer).join(', ');
    }

    return String(answer);
  }

  private normalizeApplicationData(
    data: any
  ): { id: number; question: string; answer: any; type?: string }[] {
    const result: {
      id: number;
      question: string;
      answer: any;
      type?: string;
    }[] = [];

    const traverse = (obj: any) => {
      if (!obj || typeof obj !== 'object') return;

      if (Array.isArray(obj)) {
        obj.forEach((item) => traverse(item));
        return;
      }

      if (obj.id !== undefined && obj.question !== undefined) {
        result.push({
          id: obj.id,
          question: obj.question,
          answer: obj.answer,
          type: obj.type || 'text',
        });
        return;
      }

      Object.values(obj).forEach((value) => traverse(value));
    };

    traverse(data);
    return result;
  }
}
