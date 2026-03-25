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
import { FormGroup } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
(pdfMake as any).vfs = pdfFonts;
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
  applicationData: any = null;
  application: ApplicationDetail | null = null;
  isLoading: boolean = false;
  error: string | null = null;
  isThirdParty: boolean = false;
  hasDownloadUrl: boolean = false;
  transactionDetails: any[] = [];
  transactionColumns: TableColumn[] = [];
  historyDetails: HistoryData[] = [];
  historyColumns: TableColumn[] = [];
   pdfBlobUrl: string | null = null;
  showPdfPreview = false;
  pdfZoom = 1;
  now: Date = new Date();
  showUploadDialog = false;
  dialogWidth = '1200px';
  pdfUrl: SafeResourceUrl | null = null;
  fileToUpload: File | null = null;
  selectedFileName: string | null = null;
  uploading = false;
  uploadedUrl: string | null = null;
  safePreviewUrl: SafeResourceUrl | null = null;
  showPreview = false;
  dragOver = false;
  fieldLabelMap: Record<string, string> = {
    '17': 'Applicant Name',
    '18': 'Business Name',
    '19': 'Owner Name',
    '20': 'District',
    '21': 'Zone',
    '22': 'Sub Division',
    '23': 'S-S Division',
  };
  private readonly fileBaseUrl = 'http://tripuratourism.gov.in/onlineservices/storage/';

private lastPdfDefinition: any = null;
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
    private sanitizer: DomSanitizer,
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
    // const baseUrl = 'http://swaagatstaging.tripura.cloud/';
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
  //         if (res?.status === 1 && res.data && typeof res.data === 'object') {
  //           this.transactionDetails = res.payment_details.map((item: any) => {
  //             return {
  //               transaction_id: item.transaction_id,
  //               GRN_number: item.GRN_number,
  //               gateway: item.gateway,
  //               payment_datetime: item.payment_datetime,
  //               payment_amount: item.payment_amount,
  //               payment_status: item.payment_status,
  //             };
  //           });

  //           this.serviceName = res?.service_name;
  //           const appData = res?.data;

  //           const structuredData = this.normalizeApplicationData(
  //             res.application_data
  //           );
  //           const filteredData = structuredData.filter((qa) => {
  //             if (qa.answer == null) return false;
  //             if (qa.answer === '') return false;
  //             if (Array.isArray(qa.answer) && qa.answer.length === 0)
  //               return false;
  //             return true;
  //           });

  //           this.application = {
  //             ...appData,
  //             application_data: appData.application_data || {},
  //             application_data_structured: filteredData,
  //             extra_payment: appData.extra_payment || '0',
  //             total_fee: appData.total_fee || '0',
  //             history_data: Array.isArray(res.history_data)
  //               ? res.history_data
  //               : [],
  //           };

  //           this.historyDetails = (res.history_data || []).map((h: any) => ({
  //             step_number: h.step_number,
  //             step_type: h.step_type || '—',
  //             status: h.status || '—',
  //             remarks: h.remarks || '—',
  //             action_taken_at: this.formatDate(h.action_taken_at),
  //             status_file: h.status_file,
  //           }));

  //           this.checkDownloadUrlAvailability();
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
    // const baseUrl = 'http://swaagatstaging.tripura.cloud/';
    this.apiService.downloadServiceCertificate(this.appId).subscribe({
      next: (res: any) => {
        if (res?.download_url) {
          const openPdf = res.download_url;
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

  // private normalizeApplicationData(
  //   data: any
  // ): { id: number; question: string; answer: any; type?: string }[] {
  //   const result: {
  //     id: number;
  //     question: string;
  //     answer: any;
  //     type?: string;
  //   }[] = [];

  //   const traverse = (obj: any) => {
  //     if (!obj || typeof obj !== 'object') return;

  //     if (Array.isArray(obj)) {
  //       obj.forEach((item) => traverse(item));
  //       return;
  //     }

  //     if (obj.id !== undefined && obj.question !== undefined) {
  //       result.push({
  //         id: obj.id,
  //         question: obj.question,
  //         answer: obj.answer,
  //         type: obj.type || 'text',
  //       });
  //       return;
  //     }

  //     Object.values(obj).forEach((value) => traverse(value));
  //   };

  //   traverse(data);
  //   return result;
  // }
  private safeText(value: any): string {
  if (value === null || value === undefined) return '—';
  if (Array.isArray(value)) return value.length ? value.join(', ') : '—';
  const text = String(value).trim();
  return text ? text : '—';
}

private sanitizeText(value: any): string {
  return this.safeText(value)
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

private titleCase(value: any): string {
  const text = this.safeText(value).toString();
  if (text === '—') return text;
  return text
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

private formatPdfDate(value: any): string {
  if (!value) return '—';
  const d = new Date(value);
  if (isNaN(d.getTime())) return this.safeText(value);
  return d.toLocaleString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

private formatPdfDateOnly(value: any): string {
  if (!value) return '—';
  const d = new Date(value);
  if (isNaN(d.getTime())) return this.safeText(value);
  return d.toLocaleDateString('en-GB');
}

private resolveFileUrl(url: any): string {
  const raw = this.safeText(url);
  if (raw === '—') return '—';
  if (/^https?:\/\//i.test(raw)) return raw;
  return `${this.fileBaseUrl}${raw.replace(/^\/+/, '')}`;
}

private fileNameFromUrl(url: any): string {
  const resolved = this.resolveFileUrl(url);
  if (resolved === '—') return 'View File';
  const last = resolved.split('/').pop() || 'View File';
  return decodeURIComponent(last);
}

private getFieldValueById(fields: any[] = [], id: number): string {
  const found = fields.find((f: any) => Number(f?.id) === Number(id));
  return this.safeText(found?.answer);
}

private getApplicantName(app: any, structuredFields: any[] = []): string {
  const candidates = [
    app?.applicant_name,
    app?.user_name,
    app?.name,
    this.getFieldValueById(structuredFields, 1213),
    this.getFieldValueById(structuredFields, 1238),
    this.getFieldValueById(structuredFields, 1250),
    this.getFieldValueById(structuredFields, 1246),
  ];
  const hit = candidates.find((x) => this.safeText(x) !== '—');
  return this.safeText(hit || 'Applicant');
}

public getApplicationNumber(app: any): string {
  return this.safeText(
    app?.applicationId ||
      app?.application_id ||
      app?.application_number ||
      app?.applicationId ||
      app?.id
  );
}

private normalizeApplicationData(input: any): Array<{
  id: number | string;
  question: string;
  answer: any;
  type?: string;
  isFile?: boolean;
  fileUrl?: string;
  fileName?: string;
}> {
  const output: any[] = [];
  if (!input) return output;

  const fields = Array.isArray(input?.fields) ? input.fields : [];
  fields.forEach((f: any) => {
    const answer = f?.answer;
    const isFile =
      f?.type === 'file' ||
      (typeof answer === 'string' && /^https?:\/\/|^uploads\//i.test(answer)) ||
      /document|photo|photograph|file|license|plan|form/i.test(
        this.safeText(f?.question)
      );

    output.push({
      id: f?.id ?? '',
      question: this.safeText(f?.question || `Field ${f?.id ?? ''}`),
      answer,
      type: f?.type || 'text',
      isFile,
      fileUrl: isFile ? this.resolveFileUrl(answer) : undefined,
      fileName: isFile ? this.fileNameFromUrl(answer) : undefined,
    });
  });

  Object.keys(input).forEach((key) => {
    if (key === 'fields') return;
    const val = input[key];
    if (val === null || val === undefined || val === '') return;

    if (Array.isArray(val)) {
      val.forEach((item: any, idx: number) => {
        if (item && typeof item === 'object') {
          Object.keys(item).forEach((subKey) => {
            const subVal = item[subKey];
            if (!subVal) return;
            const isFile =
              typeof subVal === 'string' &&
              (/^https?:\/\/|^uploads\//i.test(subVal) ||
                /\.pdf$|\.png$|\.jpg$|\.jpeg$/i.test(subVal));
            output.push({
              id: `${key}-${idx}-${subKey}`,
              question: this.titleCase(
                `${key} ${idx + 1}${subKey ? ` - ${subKey}` : ''}`
              ),
              answer: subVal,
              type: isFile ? 'file' : 'text',
              isFile,
              fileUrl: isFile ? this.resolveFileUrl(subVal) : undefined,
              fileName: isFile ? this.fileNameFromUrl(subVal) : undefined,
            });
          });
        } else {
          const isFile =
            typeof item === 'string' &&
            (/^https?:\/\/|^uploads\//i.test(item) ||
              /\.pdf$|\.png$|\.jpg$|\.jpeg$/i.test(item));
          output.push({
            id: `${key}-${idx}`,
            question: this.titleCase(`${key} ${idx + 1}`),
            answer: item,
            type: isFile ? 'file' : 'text',
            isFile,
            fileUrl: isFile ? this.resolveFileUrl(item) : undefined,
            fileName: isFile ? this.fileNameFromUrl(item) : undefined,
          });
        }
      });
    } else if (typeof val === 'object') {
      Object.keys(val).forEach((subKey) => {
        const subVal = val[subKey];
        if (!subVal) return;
        const isFile =
          typeof subVal === 'string' &&
          (/^https?:\/\/|^uploads\//i.test(subVal) ||
            /\.pdf$|\.png$|\.jpg$|\.jpeg$/i.test(subVal));
        output.push({
          id: `${key}-${subKey}`,
          question: this.titleCase(`${key} ${subKey}`),
          answer: subVal,
          type: isFile ? 'file' : 'text',
          isFile,
          fileUrl: isFile ? this.resolveFileUrl(subVal) : undefined,
          fileName: isFile ? this.fileNameFromUrl(subVal) : undefined,
        });
      });
    } else {
      const isFile =
        typeof val === 'string' &&
        (/^https?:\/\/|^uploads\//i.test(val) ||
          /\.pdf$|\.png$|\.jpg$|\.jpeg$/i.test(val));
      output.push({
        id: key,
        question: this.titleCase(key),
        answer: val,
        type: isFile ? 'file' : 'text',
        isFile,
        fileUrl: isFile ? this.resolveFileUrl(val) : undefined,
        fileName: isFile ? this.fileNameFromUrl(val) : undefined,
      });
    }
  });

  return output;
}

private collectFileDocuments(fields: any[]): Array<{
  question: string;
  fileUrl: string;
  fileName: string;
}> {
  return (fields || [])
    .filter((f) => f?.isFile && f?.fileUrl && f.fileUrl !== '—')
    .map((f) => ({
      question: this.safeText(f.question),
      fileUrl: this.resolveFileUrl(f.fileUrl),
      fileName: this.safeText(f.fileName || this.fileNameFromUrl(f.fileUrl)),
    }));
}

private buildSummaryRows(app: any, structuredFields: any[]): any[][] {
  const paymentDetails = Array.isArray(app?.payment_details)
    ? app.payment_details
    : Array.isArray(this.transactionDetails)
      ? this.transactionDetails
      : [];

  return [
    [
      { text: 'Application Number', style: 'summaryKey' },
      { text: this.getApplicationNumber(app), style: 'summaryValue' },
      { text: 'Application Date', style: 'summaryKey' },
      { text: this.formatPdfDate(app?.application_date || app?.created_at), style: 'summaryValue' },
    ],
    [
      { text: 'Service Name', style: 'summaryKey' },
      { text: this.safeText(app?.service_name), style: 'summaryValue' },
      { text: 'Status', style: 'summaryKey' },
      { text: this.titleCase(app?.status), style: 'summaryValue' },
    ],
    [
      { text: 'Applicant Name', style: 'summaryKey' },
      { text: this.getApplicantName(app, structuredFields), style: 'summaryValue' },
      { text: 'Payment Status', style: 'summaryKey' },
      { text: this.titleCase(app?.payment_status), style: 'summaryValue' },
    ],
    [
      { text: 'Target Days', style: 'summaryKey' },
      { text: this.safeText(app?.service?.target_days), style: 'summaryValue' },
      { text: 'Max Processing Date', style: 'summaryKey' },
      { text: this.formatPdfDate(app?.max_processing_date), style: 'summaryValue' },
    ],
    [
      { text: 'Paid Amount', style: 'summaryKey' },
      { text: this.safeText(app?.paid_amount), style: 'summaryValue' },
      { text: 'Total Fee', style: 'summaryKey' },
      { text: this.safeText(app?.total_fee), style: 'summaryValue' },
    ],
    [
      { text: 'Payment Count', style: 'summaryKey' },
      { text: this.safeText(paymentDetails.length), style: 'summaryValue' },
      { text: 'Current Step', style: 'summaryKey' },
      { text: this.safeText(app?.current_step_number), style: 'summaryValue' },
    ],
  ];
}

private buildFieldsTable(fields: any[]): any[] {
  const body: any[] = [
    [
      { text: 'SL', style: 'tableHead' },
      { text: 'FIELD / QUESTION', style: 'tableHead' },
      { text: 'ANSWER / DOCUMENT', style: 'tableHead' },
    ],
  ];

  fields.forEach((f: any, index: number) => {
    const q = this.safeText(f?.question || `Field ${f?.id ?? index + 1}`);
    const answerText = f?.isFile
      ? f?.fileUrl
        ? {
            text: f?.fileName || this.fileNameFromUrl(f?.fileUrl),
            link: this.resolveFileUrl(f?.fileUrl),
            color: '#1d4ed8',
            decoration: 'underline',
            noWrap: false,
          }
        : { text: '—', style: 'text' }
      : { text: this.safeText(f?.answer), style: 'text' };

    body.push([
      { text: String(index + 1), style: 'text' },
      { text: q, style: 'text' },
      answerText,
    ]);
  });

  if (fields.length === 0) {
    body.push([
      { text: '—', style: 'text' },
      { text: 'No fields found', colSpan: 2, style: 'text' },
      {},
    ]);
  }

  return body;
}

private buildDocumentsTable(files: Array<{ question: string; fileUrl: string; fileName: string }>): any[] {
  const body: any[] = [
    [
      { text: 'SL', style: 'tableHead' },
      { text: 'DOCUMENT NAME', style: 'tableHead' },
      { text: 'FILE LINK', style: 'tableHead' },
    ],
  ];

  files.forEach((file, index) => {
    body.push([
      { text: String(index + 1), style: 'text' },
      { text: this.safeText(file.question), style: 'text' },
      {
        text: file.fileName,
        link: file.fileUrl,
        color: '#1d4ed8',
        decoration: 'underline',
        style: 'text',
      },
    ]);
  });

  if (files.length === 0) {
    body.push([
      { text: '—', style: 'text' },
      { text: 'No uploaded documents found', colSpan: 2, style: 'text' },
      {},
    ]);
  }

  return body;
}

private buildPaymentTable(paymentDetails: any[]): any[] {
  const body: any[] = [
    [
      { text: 'SL', style: 'tableHead' },
      { text: 'PAYMENT AMOUNT', style: 'tableHead' },
      { text: 'STATUS', style: 'tableHead' },
      { text: 'GATEWAY', style: 'tableHead' },
      { text: 'TRANSACTION ID', style: 'tableHead' },
      { text: 'GRN NUMBER', style: 'tableHead' },
      { text: 'PAYMENT DATE/TIME', style: 'tableHead' },
    ],
  ];

  paymentDetails.forEach((p: any, index: number) => {
    body.push([
      { text: String(index + 1), style: 'text' },
      { text: this.safeText(p?.payment_amount), style: 'text' },
      { text: this.titleCase(p?.payment_status), style: 'text' },
      { text: this.safeText(p?.gateway), style: 'text' },
      { text: this.safeText(p?.transaction_id), style: 'text' },
      { text: this.safeText(p?.GRN_number), style: 'text' },
      { text: this.formatPdfDate(p?.payment_datetime || p?.created_at), style: 'text' },
    ]);
  });

  if (paymentDetails.length === 0) {
    body.push([
      { text: '—', style: 'text' },
      { text: 'No payment records found', colSpan: 6, style: 'text' },
      {},
      {},
      {},
      {},
      {},
    ]);
  }

  return body;
}

private buildWorkflowTable(history: any[]): any[] {
  const body: any[] = [
    [
      { text: 'SL', style: 'tableHead' },
      { text: 'STEP', style: 'tableHead' },
      { text: 'TYPE', style: 'tableHead' },
      { text: 'STATUS', style: 'tableHead' },
      { text: 'REMARKS', style: 'tableHead' },
      { text: 'ACTION AT', style: 'tableHead' },
      { text: 'STATUS FILE', style: 'tableHead' },
    ],
  ];

  history.forEach((h: any, index: number) => {
    const fileUrl = h?.status_file ? this.resolveFileUrl(h.status_file) : null;
    body.push([
      { text: String(index + 1), style: 'text' },
      { text: this.safeText(h?.step_number), style: 'text' },
      { text: this.titleCase(h?.step_type), style: 'text' },
      { text: this.titleCase(h?.status), style: 'text' },
      { text: this.safeText(h?.remarks), style: 'text' },
      { text: this.formatPdfDate(h?.action_taken_at), style: 'text' },
      fileUrl
        ? {
            text: this.fileNameFromUrl(fileUrl),
            link: fileUrl,
            color: '#1d4ed8',
            decoration: 'underline',
            style: 'text',
          }
        : { text: '—', style: 'text' },
    ]);
  });

  if (history.length === 0) {
    body.push([
      { text: '—', style: 'text' },
      { text: '—', style: 'text' },
      { text: '—', style: 'text' },
      { text: '—', style: 'text' },
      { text: 'No workflow history found', colSpan: 3, style: 'text' },
      {},
      {},
    ]);
  }

  return body;
}

private buildRenewalRows(app: any): any[][] {
  const renewal = app?.renewal_details || {};
  return [
    [
      { text: 'Renewal Cycle ID', style: 'summaryKey' },
      { text: this.safeText(app?.renewal_cycle_id), style: 'summaryValue' },
      { text: 'Renewal Status', style: 'summaryKey' },
      { text: this.safeText(app?.renewal), style: 'summaryValue' },
    ],
    [
      { text: 'Renewal Year', style: 'summaryKey' },
      { text: this.safeText(app?.renewalYear), style: 'summaryValue' },
      { text: 'Expiry Date', style: 'summaryKey' },
      { text: this.formatPdfDateOnly(renewal?.expiry_date || app?.NOC_expiry_date), style: 'summaryValue' },
    ],
    [
      { text: 'NOC Date', style: 'summaryKey' },
      { text: this.formatPdfDateOnly(app?.NOC_application_date), style: 'summaryValue' },
      { text: 'NOC Generation Date', style: 'summaryKey' },
      { text: this.formatPdfDateOnly(app?.NOC_generationDate), style: 'summaryValue' },
    ],
    [
      { text: 'NOC Letter No.', style: 'summaryKey' },
      { text: this.safeText(app?.NOC_letter_number), style: 'summaryValue' },
      { text: 'NOC Letter Date', style: 'summaryKey' },
      { text: this.formatPdfDateOnly(app?.NOC_letter_date), style: 'summaryValue' },
    ],
  ];
}

private buildPdfDefinition(app: any): any {
  const structuredFields = this.normalizeApplicationData(app?.application_data || app?.application_data_structured || this.applicationData);
  const paymentDetails = Array.isArray(app?.payment_details) ? app.payment_details : [];
  const history = Array.isArray(app?.history_data) ? app.history_data : [];
  const files = this.collectFileDocuments(structuredFields);

  const applicantName = this.getApplicantName(app, structuredFields);
  const applicationNo = this.getApplicationNumber(app);
  const serviceName = this.safeText(app?.service_name || app?.service?.service_title_or_description);

  const summaryBody = this.buildSummaryRows(app, structuredFields);
  const fieldsBody = this.buildFieldsTable(structuredFields);
  const docsBody = this.buildDocumentsTable(files);
  const paymentBody = this.buildPaymentTable(paymentDetails);
  const workflowBody = this.buildWorkflowTable(history);
  const renewalBody = this.buildRenewalRows(app);

  return {
    info: {
      title: `${applicantName} - ${applicationNo}`,
      author: 'Government of Tripura',
      subject: serviceName,
    },
    pageSize: 'A4',
    pageMargins: [28, 90, 28, 60],
    defaultStyle: {
      fontSize: 9,
      lineHeight: 1.2,
    },
    styles: {
      topGov: { fontSize: 12, bold: true, color: '#0f172a', alignment: 'center' },
      dept: { fontSize: 10, bold: true, color: '#334155', alignment: 'center' },
      title: { fontSize: 15, bold: true, color: '#0b3166', alignment: 'center' },
      subtitle: { fontSize: 9, color: '#475569', alignment: 'center' },
      section: { fontSize: 11, bold: true, color: '#0b3166', margin: [0, 6, 0, 6] },
      summaryKey: { bold: true, color: '#0f172a', fontSize: 9 },
      summaryValue: { color: '#111827', fontSize: 9 },
      tableHead: { bold: true, color: '#0f172a', fontSize: 9 },
      text: { color: '#111827', fontSize: 9 },
      link: { color: '#1d4ed8', decoration: 'underline', fontSize: 9 },
      small: { color: '#475569', fontSize: 8 },
    },
    header: () => ({
      margin: [28, 18, 28, 0],
      stack: [
        { text: 'GOVERNMENT OF TRIPURA', style: 'topGov' },
        { text: 'TOURISM DEPARTMENT', style: 'dept' },
        { text: 'APPLICATION PRINT / PREVIEW', style: 'title' },
        {
          text: `${serviceName}  |  ${applicationNo}`,
          style: 'subtitle',
          margin: [0, 2, 0, 0],
        },
      ],
    }),
    footer: (currentPage: number, pageCount: number) => ({
      margin: [28, 0, 28, 18],
      columns: [
        {
          text: `Printed On: ${this.formatPdfDate(new Date())}`,
          style: 'small',
          alignment: 'left',
        },
        {
          text: `Page ${currentPage} of ${pageCount}`,
          style: 'small',
          alignment: 'right',
        },
      ],
    }),
    content: [
      {
        table: {
          widths: ['25%', '25%', '25%', '25%'],
          body: summaryBody,
        },
        layout: {
          fillColor: (rowIndex: number) => (rowIndex % 2 === 0 ? '#F8FAFC' : '#FFFFFF'),
          hLineColor: () => '#D9E2F0',
          vLineColor: () => '#D9E2F0',
          paddingLeft: () => 6,
          paddingRight: () => 6,
          paddingTop: () => 5,
          paddingBottom: () => 5,
        },
        margin: [0, 2, 0, 10],
      },

      { text: 'Applicant / Service Details', style: 'section' },
      {
        table: {
          widths: ['40%', '60%'],
          body: [
            [{ text: 'Applicant Name', style: 'summaryKey' }, { text: applicantName, style: 'summaryValue' }],
            [{ text: 'Application No.', style: 'summaryKey' }, { text: applicationNo, style: 'summaryValue' }],
            [{ text: 'Service Name', style: 'summaryKey' }, { text: serviceName, style: 'summaryValue' }],
            [{ text: 'Application Status', style: 'summaryKey' }, { text: this.titleCase(app?.status), style: 'summaryValue' }],
            [{ text: 'Payment Status', style: 'summaryKey' }, { text: this.titleCase(app?.payment_status), style: 'summaryValue' }],
            [{ text: 'Created At', style: 'summaryKey' }, { text: this.formatPdfDate(app?.created_at), style: 'summaryValue' }],
            [{ text: 'Updated At', style: 'summaryKey' }, { text: this.formatPdfDate(app?.updated_at), style: 'summaryValue' }],
          ],
        },
        layout: 'lightHorizontalLines',
        margin: [0, 0, 0, 10],
      },

      { text: 'All Form Fields', style: 'section' },
      {
        table: {
          headerRows: 1,
          widths: [22, '38%', '*'],
          body: fieldsBody,
        },
        layout: {
          fillColor: (rowIndex: number) => (rowIndex === 0 ? '#EAF1FB' : null),
          hLineColor: () => '#D9E2F0',
          vLineColor: () => '#D9E2F0',
          paddingLeft: () => 5,
          paddingRight: () => 5,
          paddingTop: () => 4,
          paddingBottom: () => 4,
        },
        margin: [0, 0, 0, 10],
      },

      { text: 'Uploaded Documents', style: 'section' },
      {
        table: {
          headerRows: 1,
          widths: [22, '46%', '*'],
          body: docsBody,
        },
        layout: {
          fillColor: (rowIndex: number) => (rowIndex === 0 ? '#EAF1FB' : null),
          hLineColor: () => '#D9E2F0',
          vLineColor: () => '#D9E2F0',
          paddingLeft: () => 5,
          paddingRight: () => 5,
          paddingTop: () => 4,
          paddingBottom: () => 4,
        },
        margin: [0, 0, 0, 10],
      },

      { text: 'Payment Details', style: 'section' },
      {
        table: {
          headerRows: 1,
          widths: [20, 60, 50, 45, 65, 55, '*'],
          body: paymentBody,
        },
        layout: {
          fillColor: (rowIndex: number) => (rowIndex === 0 ? '#EAF1FB' : null),
          hLineColor: () => '#D9E2F0',
          vLineColor: () => '#D9E2F0',
          paddingLeft: () => 4,
          paddingRight: () => 4,
          paddingTop: () => 4,
          paddingBottom: () => 4,
        },
        margin: [0, 0, 0, 10],
      },

      { text: 'Renewal / NOC Details', style: 'section' },
      {
        table: {
          widths: ['25%', '25%', '25%', '25%'],
          body: renewalBody,
        },
        layout: 'lightHorizontalLines',
        margin: [0, 0, 0, 10],
      },

      { text: 'Workflow / History', style: 'section' },
      {
        table: {
          headerRows: 1,
          widths: [20, 34, 55, 55, '*', 62, 90],
          body: workflowBody,
        },
        layout: {
          fillColor: (rowIndex: number) => (rowIndex === 0 ? '#EAF1FB' : null),
          hLineColor: () => '#D9E2F0',
          vLineColor: () => '#D9E2F0',
          paddingLeft: () => 4,
          paddingRight: () => 4,
          paddingTop: () => 4,
          paddingBottom: () => 4,
        },
        margin: [0, 0, 0, 10],
      },

      {
        margin: [0, 8, 0, 0],
        table: {
          widths: ['*', 180],
          body: [
            [
              {
                text:
                  'This is a computer-generated printout prepared from the application data received from the portal.',
                style: 'small',
                italics: true,
              },
              {
                text: 'Authorized Signatory',
                alignment: 'right',
                style: 'text',
                margin: [0, 24, 0, 0],
              },
            ],
          ],
        },
        layout: 'noBorders',
      },
    ],
  };
}

private preparePdf(app: any, openPreview = true): void {
  (pdfMake as any).vfs = (pdfFonts as any)?.vfs || (pdfFonts as any);
  const documentDefinition = this.buildPdfDefinition(app);
  this.lastPdfDefinition = documentDefinition;

  const pdfDocGenerator = pdfMake.createPdf(documentDefinition);
  pdfDocGenerator.getBlob((blob: Blob) => {
    try {
      if (this.pdfBlobUrl) URL.revokeObjectURL(this.pdfBlobUrl);
    } catch {}

    const url = URL.createObjectURL(blob);
    this.pdfBlobUrl = url;
    this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    this.pdfZoom = 1;
    this.showPdfPreview = openPreview;
  });
}

printApplication(): void {
  const app = this.application || this.applicationData;
  if (!app) {
    this.apiService.openSnackBar('No application loaded to print.', 'error');
    return;
  }
  this.preparePdf(app, true);
}

downloadPdf(): void {
  const app = this.application || this.applicationData;
  if (!app) {
    this.apiService.openSnackBar('No application loaded to download.', 'error');
    return;
  }

  const applicantName = this.getApplicantName(app, this.normalizeApplicationData(app?.application_data || app?.application_data_structured));
  const applicationNo = this.getApplicationNumber(app);
  const fileName = `${applicantName} - ${applicationNo}.pdf`
    .replace(/[\\/:*?"<>|]+/g, '_')
    .replace(/\s+/g, ' ')
    .trim();

  (pdfMake as any).vfs = (pdfFonts as any)?.vfs || (pdfFonts as any);
  const documentDefinition = this.lastPdfDefinition || this.buildPdfDefinition(app);

  const pdfDocGenerator = pdfMake.createPdf(documentDefinition);
  pdfDocGenerator.download(fileName);
}

openPdfInNewTab(): void {
  const app = this.application || this.applicationData;
  if (!app) return;

  if (this.pdfBlobUrl) {
    window.open(this.pdfBlobUrl, '_blank', 'noopener,noreferrer');
    return;
  }

  (pdfMake as any).vfs = (pdfFonts as any)?.vfs || (pdfFonts as any);
  const documentDefinition = this.lastPdfDefinition || this.buildPdfDefinition(app);
  pdfMake.createPdf(documentDefinition).open();
}

closePdfPreview(): void {
  this.showPdfPreview = false;
}

zoomIn(): void {
  this.pdfZoom = Math.min(2.5, +(this.pdfZoom + 0.1).toFixed(1));
}

zoomOut(): void {
  this.pdfZoom = Math.max(0.6, +(this.pdfZoom - 0.1).toFixed(1));
}

fitToWidth(): void {
  this.pdfZoom = 1;
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

        if (res?.status !== 1 || !res?.data || typeof res.data !== 'object') {
          this.error = res?.message || 'No application details found.';
          return;
        }

        const appData = res.data || {};
        const rawAppData = res.application_data || appData.application_data || {};
        const structuredData = this.normalizeApplicationData(rawAppData);

        const filteredData = structuredData.filter((qa) => {
          if (qa.answer == null) return false;
          if (qa.answer === '') return false;
          if (Array.isArray(qa.answer) && qa.answer.length === 0) return false;
          return true;
        });

        this.transactionDetails = Array.isArray(res.payment_details)
          ? res.payment_details.map((item: any) => ({
              transaction_id: item?.transaction_id,
              GRN_number: item?.GRN_number,
              gateway: item?.gateway,
              payment_datetime: item?.payment_datetime,
              payment_amount: item?.payment_amount,
              payment_status: item?.payment_status,
            }))
          : [];

        this.serviceName = res?.service_name || appData?.service_name || '';

        this.application = {
          ...appData,
          service_name: res?.service_name || appData?.service_name || '',
          application_data: rawAppData,
          application_data_structured: filteredData,
          payment_details: Array.isArray(res.payment_details) ? res.payment_details : [],
          history_data: Array.isArray(res.history_data) ? res.history_data : [],
          renewal_details: res.renewal_details || {},
        };

        this.applicationData = this.application;

        this.historyDetails = (res.history_data || []).map((h: any) => ({
          step_number: h?.step_number,
          step_type: h?.step_type || '—',
          status: h?.status || '—',
          remarks: h?.remarks || '—',
          action_taken_at: this.formatDate(h?.action_taken_at),
          status_file: h?.status_file,
        }));

        this.checkDownloadUrlAvailability();
      },
      error: (err) => {
        this.isLoading = false;
        this.error = 'Failed to load application. Please try again later.';
        console.error('API Error:', err);
      },
    });
}

printPage(): void {
  this.printApplication();
}

}
