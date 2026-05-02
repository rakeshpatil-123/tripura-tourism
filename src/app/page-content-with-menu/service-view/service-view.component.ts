import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GenericService } from '../../_service/generic/generic.service';
import {
  DynamicTableComponent,
  TableColumn,
  ColumnType,
} from '../../shared/component/table/table.component';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IlogiInputComponent } from '../../customInputComponents/ilogi-input/ilogi-input.component';
import { MatIcon } from '@angular/material/icon';
import Swal from 'sweetalert2';
import { IlogiFileUploadComponent } from '../../customInputComponents/ilogi-file-upload/ilogi-file-upload.component';
import { MatButton } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { InspectionReportComponent } from '../inspection-report/inspection-report.component';
import { EditableCertificateGenerationComponent } from '../editable-certificate-generation/editable-certificate-generation.component';
import { LoaderService } from '../../_service/loader/loader.service';
import { finalize } from 'rxjs';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

// MAKE SURE THIS RUNS ONCE
(pdfMake as any).vfs = (pdfFonts as any).vfs || (pdfFonts as any);

// OPTIONAL TYPE HELPERS
interface PdfFileDoc {
  question: string;
  fileUrl: string;
  fileName: string;
}

interface StatusActionModal {
  visible: boolean;
  applicationId: number;
  action: 'approved' | 'send_back' | 'rejected' | 'raise_extra_payment';
  title: string;
}

@Component({
  selector: 'app-service-view',
  imports: [CommonModule, DynamicTableComponent, IlogiInputComponent, ReactiveFormsModule, MatIcon, IlogiFileUploadComponent, MatButton],
  templateUrl: './service-view.component.html',
  styleUrl: './service-view.component.scss',
  standalone: true,
})
export class ServiceViewComponent implements OnInit {
  applicationId: number | null = null;
  applicationData: any = null;
isCertificatePreview: boolean = false;  sampleFilePreview : any = null;
  isLoading: boolean = false;
  isFinalApproval: boolean = false;
  justBeforeApproval: boolean = false;
  isCertificateGenerated: boolean = false;
  infoData: any[] = [];
  application: any = null;
  infoColumns: TableColumn[] = [];
  expandedInfoIndex: number | null = null;
  workflowColumns: TableColumn[] = [];
  workflowData: any[] = [];
  approvedWorkflowPercent: string = '0%';
  approvedWorkflowCount: number = 0;
  totalWorkflowCount: number = 0;
  applicationQATableData: any[] = [];
  serviceName: string = '';
  transactionDetails: any = null;
   pdfBlobUrl: string | null = null;
  showPdfPreview = false;
  now: Date = new Date();
  pdfZoom = 1;
  historyDetails: any[] = [];
  showUploadDialog = false;
  dialogWidth = '1200px';
  pdfUrl: SafeResourceUrl | null = null;
  applicationQAColumns: TableColumn[] = [];
  isFinallyApproved: boolean = false;
  statusModal: StatusActionModal = {
    visible: false,
    applicationId: 0,
    action: 'approved',
    title: '',
  };

  remarkForm: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: GenericService,
    private fb: FormBuilder,
    private sanitizer: DomSanitizer,
    public dialog: MatDialog,
    private loaderService : LoaderService,
    private cdr: ChangeDetectorRef
  ) {
    this.remarkForm = this.fb.group({
      extraAmount: [null],
      remarks: ['', [Validators.required, Validators.minLength(2)]],
      attachment: [null],
    });
  }

  private readonly fileBaseUrl = 'http://tripuratourism.gov.in/onlineservices/storage/';

private lastPdfDefinition: any = null;
  // Opens a file URL in a new tab (used by QA view button)
  openFile(url?: string): void {
    if (!url) return;
    try {
      window.open(url, '_blank');
    } catch (e) {
      console.error('Failed to open file URL', e);
    }
  }

  ngOnInit(): void {
    this.loadApplication();
  }

  loadApplication(): void {
    this.isLoading = true;

    this.route.params.subscribe(params => {
      const id = +params['applicationId'];

      if (isNaN(id)) {
        this.apiService.openSnackBar('Invalid application ID.', 'Close');
        this.router.navigate(['/departmental-services']);
        return;
      }

      this.applicationId = id;
      this.fetchApplicationDetails();
    });
  }

  // fetchApplicationDetails(): void {
  //   this.apiService
  //     .getByConditions({}, `api/department/applications/${this.applicationId}`)
  //     .subscribe({
  //       next: (res: any) => {
  //         this.isLoading = false;

  //         if (res?.status === 1 && res.data) {
  //           this.applicationData = res.data;
  //           this.isCertificatePreview = true;
  //           if (res?.data?.history_data?.status_file) {
  //             this.sampleFilePreview = res?.data?.history_data?.status_file || null;
  //           }
  //           this.isFinalApproval = res.data.is_finally_approved;
  //           this.justBeforeApproval = res.data.just_before_final_step;
  //           this.isCertificateGenerated = res.data.is_certificate_generated;
  //           this.serviceName = res.data.service_name;

  //           console.log('Application Data:', this.applicationData.application_data);
  //           this.processDataForDisplay();
  //         } else {
  //           this.apiService.openSnackBar(
  //             res?.message || 'Failed to load application details.',
  //             'Close'
  //           );
  //           this.router.navigate(['/departmental-services']);
  //         }
  //       },
  //       error: (err) => {
  //         this.isLoading = false;
  //         console.error('API Error:', err);
  //         this.apiService.openSnackBar('Could not load application.', 'Close');
  //         this.router.navigate(['/departmental-services']);
  //       },
  //     });
  // }
  goBack() {
    window.history.back();
  }
  processDataForDisplay(): void {
    const data = this.applicationData;
    this.justBeforeApproval = data.just_before_final_step;
    // Define field mapping for readable labels
    const fieldMap: Record<string, string> = {
      'application_id': 'Application ID',
      'application_number': 'Application Number',
      'service_name': 'Service Name',
      'status': 'Status',
      'application_fee': 'Application Fee',
      'extra_payment': 'Extra payment raised by departmental user',
      'total_fee': 'Total Fee',
      'payment_status': 'Payment Status',
      'user.name': 'Name',
      'user.phone': 'Phone No.',
      'user.email': 'Email ID',
      'step_number': 'Step Number',
      'step_type': 'Step Type',
      'department': 'Department',
      'action_taken_by': 'Action Taken By ',
      'action_taken_at': 'Action Taken At',
      'remarks': 'Remarks'
    };

    const flatEntries: { key: string; value: string }[] = [];

    const flatten = (obj: any, prefix = '') => {
  for (const key in obj) {
    if (!obj.hasOwnProperty(key)) continue;

    // Skip workflow, application_data, applied_fee, approved_fee
    if (['workflow', 'application_data', 'applied_fee', 'approved_fee', 'service_id', 'id', 'just_before_final_step', 'history_data', 'is_finally_approved', 'application_id', 'is_certificate_generated', 'application_data_structured', 'payment_details'].includes(key)) {
      continue;
    }

        const value = obj[key];
        const formattedKey = prefix ? `${prefix}.${key}` : key;
        const displayKey = fieldMap[formattedKey] || formattedKey;

        if (value === null || value === undefined) {
          flatEntries.push({ key: displayKey, value: '—' });
        } else if (typeof value === 'object' && !Array.isArray(value)) {
          flatten(value, formattedKey);
        } else if (Array.isArray(value)) {
          flatEntries.push({
            key: displayKey,
            value: `[Array: ${value.length} item(s)]`,
          });
        } else {
          flatEntries.push({
            key: displayKey,
            value: String(value),
          });
        }
      }
    };

    flatten(data);

    // Populate Info Table (excluding workflow & application_data)
    this.infoData = flatEntries;
    this.infoColumns = [
      { key: 'key', label: 'Field', type: 'text', sortable: true },
      { key: 'value', label: 'Value', type: 'text', sortable: true },
    ];

// ➤ Process Application Q&A
if (data.application_data && typeof data.application_data === 'object') {
  const qaData: any[] = [];

  // Iterate through all keys in application_data
  for (const key in data.application_data) {
    if (!data.application_data.hasOwnProperty(key)) continue;

    const value = data.application_data[key];

    if (typeof value === 'object' && !Array.isArray(value) && value.question && value.answer !== undefined) {
     const { formattedAnswer, isFile, fileUrl, fileName, fileUrls, fileNames } =
  this.processAnswer(value.answer, value.type);
qaData.push({
  question: this.sanitizeHtmlTags(value.question || '—'),
  answer: formattedAnswer,
  isFile,
  fileUrl,
  fileName,
  fileUrls,
  fileNames,
});
    }
    else if (Array.isArray(value) && key === 'fields') {
      for (const field of value) {
        if (field && typeof field === 'object' && field.question && field.answer !== undefined) {
         const { formattedAnswer, isFile, fileUrl, fileName, fileUrls, fileNames } =
  this.processAnswer(field.answer, field.type);

qaData.push({
  question: this.sanitizeHtmlTags(field.question || '—'),
  answer: formattedAnswer,
  isFile,
  fileUrl,
  fileName,
  fileUrls,
  fileNames,
});
        }
      }
    }
    else if (Array.isArray(value)) {
      // Add section header with sanitized text
      qaData.push({
        question: this.sanitizeHtmlTags(key),
        answer: '',
        isSection: true,
      });

      for (const itemGroup of value) {
        if (Array.isArray(itemGroup)) {
          for (const item of itemGroup) {
            if (item && typeof item === 'object' && item.question && item.answer !== undefined) {
              const { formattedAnswer, isFile, fileUrl, fileName } = this.processAnswer(item.answer, item.type);
              qaData.push({
                question: this.sanitizeHtmlTags(item.question || '—'),
                answer: formattedAnswer,
                isFile,
                fileUrl,
                fileName,
              });
            }
          }
        }
        else if (itemGroup && typeof itemGroup === 'object' && itemGroup.question && itemGroup.answer !== undefined) {
          const { formattedAnswer, isFile, fileUrl, fileName } = this.processAnswer(itemGroup.answer, itemGroup.type);
          qaData.push({
            question: this.sanitizeHtmlTags(itemGroup.question || '—'),
            answer: formattedAnswer,
            isFile,
            fileUrl,
            fileName,
          });
        }
      }
    }
  }

  this.applicationQATableData = qaData;
  this.applicationQAColumns = [
    { key: 'question', label: 'Question', type: 'text' },
    { key: 'answer', label: 'Answer', type: 'text' },
  ];
} else {
  this.applicationQATableData = [];
  this.applicationQAColumns = [];
}

    // ➤ Process Workflow
    if (Array.isArray(data.workflow)) {
      this.workflowData = data.workflow.map((step: any, index: number) => ({
        ...step,
        step_number: step.step_number,
        step_type: this.toTitleCase(step.step_type || ''),
        department: step.department,
        status: step.status,
        action_taken_by: step.action_taken_by || '—',
        action_taken_at: step.action_taken_at || '—',
        remarks: step.remarks || '—',
        status_file: step.status_file,
        workflowIndex: index,
      }));
      this.totalWorkflowCount = Array.isArray(this.workflowData) ? this.workflowData.length : 0;
      this.approvedWorkflowCount = Array.isArray(this.workflowData)
        ? this.workflowData.filter(function (step: any) { return step && step.status === 'approved'; }).length
        : 0;
      if (this.totalWorkflowCount > 0) {
        const pct = (this.approvedWorkflowCount / this.totalWorkflowCount) * 100;
        this.approvedWorkflowPercent = `${Math.round(pct * 10) / 10}%`;
      } else {
        this.approvedWorkflowPercent = '0%';
      }

      this.workflowColumns = [
        { key: 'step_number', label: 'Step', type: 'number' },
        { key: 'step_type', label: 'Type', type: 'text' },
        { key: 'department', label: 'Department', type: 'text' },
        { key: 'status', label: 'Status', type: 'status' },
        { key: 'action_taken_by', label: 'Action By', type: 'text' },
        { key: 'action_taken_at', label: 'Action At', type: 'text' },
        { key: 'remarks', label: 'Remarks', type: 'text' },
        { key: 'status_file', label: 'Status File', type: 'view-link', viewLinkText: 'View', },
      ];

      const hasPendingSteps = data.workflow.some((step: any) => step.status === 'pending');
      if (hasPendingSteps) {
        this.workflowColumns.push({
          key: 'actions',
          label: 'Actions',
          type: 'action',
          width: '200px',
          actions: [
            {
              label: (this.justBeforeApproval === true) ? 'Final Approve' : 'Approve/Forward',
              color: 'success',
              visible: (row: any) => row.status === 'pending',
              onClick: (row: any) => {
                this.openStatusModal('approved', 'Approve Step');
              },
            },
            {
              label: 'Send Back',
              color: 'warn',
              visible: (row: any) => row.status === 'pending',
              onClick: (row: any) => {
                this.openStatusModal('send_back', 'Send Back Step');
              },
            },
            {
              label: 'Reject',
              color: 'danger',
              visible: (row: any) => row.status === 'pending',
              onClick: (row: any) => {
                this.openStatusModal('rejected', 'Reject Step');
              },
            },
            {
              label: 'Raise Extra Payment',
              color: 'danger',
              visible: (row: any) => row.status === 'pending',
              onClick: (row: any) => {
                this.openStatusModal('raise_extra_payment', 'Raise Extra Payment');
              },
            },
          ],
        });
      }
    } else {
      this.workflowData = [];
      this.workflowColumns = [];
    }
  }

  toggleInfo(index: number): void {
    this.expandedInfoIndex = this.expandedInfoIndex === index ? null : index;
  }
  copyToClipboard(text?: string): void {
    const payload = String(text ?? '');
    if (!payload) {
      this.apiService.openSnackBar('Nothing to copy', 'Close');
      return;
    }
    if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(payload).then(
        () => this.apiService.openSnackBar('Copied to clipboard', 'Close'),
        () => this.apiService.openSnackBar('Unable to copy', 'Close')
      );
    } else {
      // fallback: create temporary textarea
      try {
        const ta = document.createElement('textarea');
        ta.value = payload;
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        this.apiService.openSnackBar('Copied to clipboard', 'Close');
      } catch {
        this.apiService.openSnackBar('Unable to copy', 'Close');
      }
    }
  }

  openStatusModal(
    action: 'approved' | 'send_back' | 'rejected' | 'raise_extra_payment',
    title: string
  ): void {
    this.statusModal.visible = true;
    this.statusModal.applicationId = this.applicationId || 0;
    this.statusModal.action = action;
    this.statusModal.title = title;
    this.remarkForm.reset();
    if (action === 'raise_extra_payment') {
      this.remarkForm.get('extraAmount')?.setValidators([Validators.required, Validators.min(1)]);
    } else {
      this.remarkForm.get('extraAmount')?.clearValidators();
    }
    this.remarkForm.get('extraAmount')?.updateValueAndValidity();
    this.cdr.detectChanges();
  }

    /**
   * Sanitizes HTML tags from a string while preserving text content
   * Removes tags like <b>, </b>, <i>, <span>, etc. but keeps the inner text
   */
  private sanitizeHtmlTags(text: string): string {
    if (!text || typeof text !== 'string') return text;
    // Remove all HTML tags while preserving the text content
    return text.replace(/<[^>]*>/g, '');
  }

  /**
   * Formats date based on type field
   * Handles: date_mmdd, date_yyyymmdd, date, datetime, timestamp, iso
   */
  private formatDateByType(value: string, type?: string): string {
    if (!value || typeof value !== 'string') return value;

    const val = value.trim();

    try {
      switch (type?.toLowerCase()) {
        // Format: MMDD -> MM/DD
        case 'date_mmdd': {
          if (val.length === 4 && /^\d{4}$/.test(val)) {
            const month = val.substring(0, 2);
            const day = val.substring(2, 4);
            const validMonth = parseInt(month) >= 1 && parseInt(month) <= 12;
            const validDay = parseInt(day) >= 1 && parseInt(day) <= 31;
            if (validMonth && validDay) {
              return `${month}/${day}`;
            }
          }
          return val;
        }

        // Format: YYYYMMDD -> YYYY-MM-DD
        case 'date_yyyymmdd': {
          if (val.length === 8 && /^\d{8}$/.test(val)) {
            const year = val.substring(0, 4);
            const month = val.substring(4, 6);
            const day = val.substring(6, 8);
            const validYear = parseInt(year) >= 1900 && parseInt(year) <= 2100;
            const validMonth = parseInt(month) >= 1 && parseInt(month) <= 12;
            const validDay = parseInt(day) >= 1 && parseInt(day) <= 31;
            if (validYear && validMonth && validDay) {
              return `${day}/${month}/${year}`;
            }
          }
          return val;
        }

        // Format: DDMMYYYY -> DD/MM/YYYY
        case 'date_ddmmyyyy': {
          if (val.length === 8 && /^\d{8}$/.test(val)) {
            const day = val.substring(0, 2);
            const month = val.substring(2, 4);
            const year = val.substring(4, 8);
            const validDay = parseInt(day) >= 1 && parseInt(day) <= 31;
            const validMonth = parseInt(month) >= 1 && parseInt(month) <= 12;
            const validYear = parseInt(year) >= 1900 && parseInt(year) <= 2100;
            if (validDay && validMonth && validYear) {
              return `${day}/${month}/${year}`;
            }
          }
          return val;
        }

        // ISO Format or standard date string -> parse and format as DD/MM/YYYY
        case 'date':
        case 'datetime':
        case 'timestamp':
        case 'iso': {
          const date = new Date(val);
          if (!isNaN(date.getTime())) {
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');

            if (type?.toLowerCase() === 'datetime' || type?.toLowerCase() === 'timestamp') {
              return `${day}/${month}/${year} ${hours}:${minutes}`;
            }
            return `${day}/${month}/${year}`;
          }
          return val;
        }

        // Default: return as is
        default:
          return val;
      }
    } catch (e) {
      console.warn(`Error formatting date: ${val}`, e);
      return val;
    }
  }

/**
 * Detects if a string is a file URL or file path based on extension
 * Returns the resolved URL if it's a file, null otherwise
 */
private detectFileFromString(ansStr: string): string | null {
  if (!ansStr || typeof ansStr !== 'string') return null;
  const trimmed = ansStr.trim();
  const fileExtRegex = /\.(pdf|docx?|xlsx?|xls|png|jpe?g|gif|txt|csv)(\?.*)?$/i;
  const looksLikeFile =
    /^https?:\/\//i.test(trimmed) ||
    /^uploads\//i.test(trimmed) ||
    fileExtRegex.test(trimmed);

  if (!looksLikeFile) return null;

  return this.resolveFileUrl(trimmed);
}

/**
 * Processes answer field and returns formatted answer with file detection
 * Handles string, array, and object types
 * Supports multiple files and relative uploads/ paths
 * Also handles date formatting based on type field
 */
private processAnswer(
  answer: any,
  type?: string
): {
  formattedAnswer: string;
  isFile: boolean;
  fileUrl?: string;
  fileName?: string;
  fileUrls?: string[];
  fileNames?: string[];
} {
  let formattedAnswer = '—';
  let isFile = false;
  let fileUrl: string | undefined;
  let fileName: string | undefined;
  const fileUrls: string[] = [];
  const fileNames: string[] = [];
  const textValues: string[] = [];

  const pushTextValue = (val: any) => {
    if (val === null || val === undefined) return;
    const text = String(val).trim();
    if (!text) return;

    const maybeFile = this.detectFileFromString(text);
    if (maybeFile) {
      isFile = true;
      fileUrls.push(maybeFile);
      fileNames.push(decodeURIComponent(maybeFile.split('/').pop() || maybeFile));
    } else {
      textValues.push(type && type.toLowerCase().includes('date') ? this.formatDateByType(text, type) : text);
    }
  };

  const collectValues = (val: any): void => {
    if (val === null || val === undefined) return;

    if (Array.isArray(val)) {
      val.forEach(collectValues);
      return;
    }

    if (typeof val === 'object') {
      Object.keys(val).forEach((k) => collectValues(val[k]));
      return;
    }

    pushTextValue(val);
  };

  collectValues(answer);

  if (fileUrls.length > 0) {
    fileUrl = fileUrls[0];
    fileName = fileNames[0];
    formattedAnswer = fileNames.join(', ');
  } else if (textValues.length > 0) {
    formattedAnswer = textValues.join(', ');
  }

  return { formattedAnswer, isFile, fileUrl, fileName, fileUrls, fileNames };
}

private resolveFileUrl(url: any): string {
  const raw = this.safeText(url);
  if (raw === '—') return '—';
  if (/^https?:\/\//i.test(raw)) return raw;

  const baseUrl =
    ((this as any).fileBaseUrl || 'http://tripuratourism.gov.in/onlineservices/storage/')
      .toString()
      .replace(/\/?$/, '/');
  return `${baseUrl}${raw.replace(/^\/+/, '')}`;
}

private fileNameFromUrl(url: any): string {
  const resolved = this.resolveFileUrl(url);
  if (resolved === '—') return 'View File';
  return decodeURIComponent(resolved.split('/').pop() || 'View File');
}


  closeModal(): void {
      this.statusModal.visible = false;
      this.remarkForm.reset();
      this.remarkForm.get('attachment')?.setValue(null);
    }


onSubmitStatus(): void {
  if (this.remarkForm.invalid) {
    this.remarkForm.markAllAsTouched();
    return;
  }

  const { remarks, extraAmount, attachment } = this.remarkForm.value;
  const { applicationId, action } = this.statusModal;

  const statusValue = action === 'raise_extra_payment' ? 'extra_payment' : action;
  const displayAction = statusValue.replace('_', ' ').toUpperCase();

  const formData = new FormData();
  formData.append('status', statusValue);
  formData.append('remarks', remarks);

  if (action === 'raise_extra_payment' && extraAmount != null) {
    formData.append('extra_payment', extraAmount.toString());
  }

  if (attachment) {
    formData.append('status_file', attachment);
  }

  this.updateApplicationStatus(applicationId, formData, displayAction);
  this.closeModal();
}
updateApplicationStatus(applicationId: number, payload: any, displayAction: string = 'updated'): void {
  this.loaderService.showLoader();
  this.apiService
    .getByConditions(payload, `api/department/applications/${applicationId}/status`).pipe(finalize(()=> this.loaderService.hideLoader()))
    .subscribe({
      next: (res: any) => {
        if (res?.status === 1) {
          Swal.fire({
            title: 'Success!',
            text: `Application step ${displayAction} successfully.`,
            icon: 'success',
            showConfirmButton: false,
            timer: 2000,
            customClass: {
              popup: 'swal2-popup'
            }
          });
          this.fetchApplicationDetails();
        } else {
          Swal.fire('Error', res?.message || 'Failed to update status.', 'error');
        }
      },
      error: (err) => {
        Swal.fire('Error', err.error?.message || 'Update failed.', 'error');
      }
    });
}
  navigateToCAF(): void {
    if ( this.applicationData.user.id) {
      const userId = this.applicationData.user.id;
      this.router.navigate([`dashboard/user-caf-view/${userId}`]);
    } else {
      this.apiService.openSnackBar('User ID not found.', 'Close');
    }
  }
  downloadCertificate(): void {
    // const baseUrl = 'http://swaagatstaging.tripura.cloud/';
    this.apiService.downloadServiceCertificate(this.applicationId).subscribe({
      next: (res: any) => {
        if (res?.download_url) {
          const openPdf = res.download_url;
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
      error: (err: any) => {
        Swal.fire({
          icon: 'error',
          title: 'Download Failed',
          text: `${err.error.message || 'Something went wrong while fetching the certificate.'}`,
          confirmButtonText: 'Retry'
        });
      }
    });
  }
  previewCertificate(): void {
    const payload = {
      is_preview: "yes",
      application_id: this.applicationId
    };
    this.loaderService.showLoader();
    this.apiService.previewCertificate(payload).pipe(finalize(()=> this.loaderService.hideLoader())).subscribe({
      next: async (res: any) => {
        let blob: Blob | null = null;
        try {
          if (res instanceof Blob) {
            blob = res;
          } else if (res?.body instanceof Blob) {
            blob = res.body;
          } else if (res?.data instanceof Blob) {
            blob = res.data;
          } else if (res instanceof ArrayBuffer) {
            blob = new Blob([res], { type: 'application/pdf' });
          } else if (res?.body instanceof ArrayBuffer) {
            blob = new Blob([res.body], { type: 'application/pdf' });
          } else if (res?.blob && typeof res.blob === 'function') {
            const maybe = await res.blob();
            if (maybe instanceof Blob) blob = maybe;
          } else if (typeof res === 'object' && res !== null && (res.data || res.body)) {
            const candidate = res.data ?? res.body;
            if (typeof candidate === 'string') {
              const dataUriMatch = candidate.match(/^data:(.+);base64,(.*)$/);
              if (dataUriMatch) {
                const mime = dataUriMatch[1];
                const b64 = dataUriMatch[2];
                blob = this.base64ToBlob(b64, mime);
              } else {
                const possibleB64 = candidate.replace(/\s/g, '');
                if (/^[A-Za-z0-9+/=]+$/.test(possibleB64) && possibleB64.length % 4 === 0) {
                  blob = this.base64ToBlob(possibleB64, 'application/pdf');
                }
              }
            }
          } else if (typeof res === 'string') {
            const dataUriMatch = res.match(/^data:(.+);base64,(.*)$/);
            if (dataUriMatch) {
              const mime = dataUriMatch[1];
              const b64 = dataUriMatch[2];
              blob = this.base64ToBlob(b64, mime);
            } else {
            }
          } else if (typeof res === 'object' && res !== null) {
            try {
              blob = new Blob([JSON.stringify(res)], { type: 'application/pdf' });
            } catch (e) {
              blob = null;
            }
          }
        } catch (ex) {
          console.warn('Error while trying to normalize response to Blob', ex);
          blob = null;
        }
        if (blob && blob.size > 0) {
          const isPdf = blob.type?.includes('pdf') || blob.size > 200;
          if (!isPdf) {
            try {
              const text = await blob.text();
              try {
                const parsed = JSON.parse(text);
                const message = parsed?.message || parsed?.error || text;
                Swal.fire({
                  icon: 'error',
                  title: 'Error',
                  text: typeof message === 'string' ? message : 'Failed to retrieve certificate. Please try again.',
                  confirmButtonText: 'OK'
                });
                return;
              } catch {
                const lower = text.slice(0, 300).toLowerCase();
                if (lower.includes('error') || lower.includes('exception') || lower.includes('not found')) {
                  Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: text.slice(0, 300),
                    confirmButtonText: 'OK'
                  });
                  return;
                }
              }
            } catch (readErr) {
              console.warn('Could not read blob text', readErr);
            }
          }
        }
        if (!blob || blob.size === 0) {
          const errMsg =
            (res && typeof res === 'object' && (res.message || res.error)) ? (res.message || res.error) :
              'Failed to retrieve certificate. Please try again.';
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: errMsg,
            confirmButtonText: 'OK'
          });
          return;
          }
          const blobUrl = URL.createObjectURL(blob);
          const htmlContent = `
    <p style="margin-bottom: 16px; font-size: 14px;">
      Your certificate preview is ready. Click the button below to open it in a new tab.
    </p>
    <button id="preview-cert-link"
      style="padding: 10px 24px; background-color: #2563eb; color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 14px;">
      📄 View Certificate
    </button>
  `;
          Swal.fire({
          title: 'Certificate Preview',
          html: htmlContent,
          icon: 'success',
          confirmButtonText: 'Close',
          didOpen: () => {
            const link = document.getElementById('preview-cert-link');
            if (link) {
              link.addEventListener('click', () => {
                this.openBlobInNewTab(blob!, blobUrl);
              });
            }
          },
          willClose: () => {
            try { URL.revokeObjectURL(blobUrl); } catch (e) { /* ignore */ }
          }
        });
      },
      error: (err: any) => {
        if (err?.error instanceof Blob) {
          err.error.text().then((text: string) => {
            let message = text;
            try {
              const parsed = JSON.parse(text);
              message = parsed?.message || parsed?.error || text;
            } catch { }
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: message || 'Something went wrong while fetching the certificate. Please try again.',
              confirmButtonText: 'OK'
            });
          }).catch(() => {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Something went wrong while fetching the certificate. Please try again.',
              confirmButtonText: 'OK'
            });
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: (err?.message) ? err.message : 'Something went wrong while fetching the certificate. Please try again.',
            confirmButtonText: 'OK'
          });
        }
      }
    });
  }
  private openBlobInNewTab(blob: Blob, suggestedFilename?: string): boolean {
    try {
      const url = URL.createObjectURL(blob);
      const newTab = window.open(url, '_blank');
      if (!newTab) {
        URL.revokeObjectURL(url);
        return false;
      }
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
      return true;
    } catch (e) {
      console.error('openBlobInNewTab error', e);
      return false;
    }
  }
  private base64ToBlob(base64: string, contentType = 'application/pdf'): Blob {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: contentType });
  }

  editCertificateGeneration(): void {
    const dialogRef = this.dialog.open(EditableCertificateGenerationComponent, {
      width: '80vw',
      height: '90vh',
      maxWidth: '1200px',
      panelClass: 'custom-dialog',
      enterAnimationDuration: '400ms',
      exitAnimationDuration: '400ms',
      hasBackdrop: true,
      backdropClass: 'dialog-backdrop',
      data: this.applicationData,
      disableClose: false,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'generated') {
        console.log('Certificate is generated!');
      } else {
        console.log('Dialog closed without generation.');
      }
    });
  }
  previewSampleFile(): void {
    if (this.sampleFilePreview) {
      window.open(this.sampleFilePreview, '_blank');
    } else {
      Swal.fire('Error', 'No sample file available to preview.', 'error');
    }
  }
  formatStatusLabel(status?: string | null): string {
    if (!status) return '—';
    const s = String(status).trim().toLowerCase();

    const map: Record<string, string> = {
      'under_review': 'Under Review',
      'under-review': 'Under Review',
      'pending': 'Pending',
      'approved': 'Approved',
      'rejected': 'Rejected',
      'send_back': 'Sent Back',
      'send-back': 'Sent Back',
      'extra_payment': 'Extra Payment',
      'extra-payment': 'Extra Payment',
      'in_progress': 'In Progress'
    };

    if (map[s]) return map[s];
    return this.toTitleCase(s.replace(/_|-/g, ' '));
  }

  statusClass(status?: string | null): string {
    if (!status) return 'status-unknown';
    const s = String(status).toLowerCase();
    if (s.includes('approved')) return 'status-approved';
    if (s.includes('under') || s.includes('review') || s.includes('in progress')) return 'status-under-review';
    if (s.includes('pending')) return 'status-pending';
    if (s.includes('reject')) return 'status-rejected';
    if (s.includes('extra')) return 'status-extra';
    if (s.includes('send') || s.includes('back')) return 'status-pending';
    return 'status-unknown';
  }
  formatPaymentLabel(paymentStatus?: string | null): string {
    if (!paymentStatus) return 'Pending';
    const p = String(paymentStatus).trim().toLowerCase();
    const map: Record<string, string> = {
      'paid': 'Paid',
      'success': 'Paid',
      'completed': 'Paid',
      'pending': 'Pending',
      'failed': 'Failed'
    };
    return map[p] || this.toTitleCase(p.replace(/_|-/g, ' '));
  }

  paymentClass(paymentStatus?: string | null): string {
    if (!paymentStatus) return 'payment-pending';
    const p = String(paymentStatus).toLowerCase();
    if (p.includes('paid') || p.includes('success') || p.includes('completed')) return 'payment-paid';
    if (p.includes('pending')) return 'payment-pending';
    return 'payment-unknown';
  }
  private toTitleCase(text: string): string {
    return text.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
  }
  printPage(): void {
  this.printApplication();
}
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
  const text = this.safeText(value);
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


public getApplicationNumber(app: any): string {
  return this.safeText(
    app?.application_number ||
      app?.applicationId ||
      app?.application_id ||
      app?.id
  );
}

private getApplicantName(app: any, fields: any[] = []): string {
  const directCandidates = [
    app?.user?.name,
    app?.applicant_name,
    app?.user_name,
    app?.name,
  ];

  const fieldCandidates = [
    this.getFieldValueById(fields, 1213),
    this.getFieldValueById(fields, 1238),
    this.getFieldValueById(fields, 1250),
    this.getFieldValueById(fields, 1246),
  ];

  const found =
    [...directCandidates, ...fieldCandidates].find((v) => this.safeText(v) !== '—') ||
    'Applicant';

  return this.safeText(found);
}

private getFieldValueById(fields: any[] = [], id: number): string {
  const found = fields.find((f: any) => Number(f?.id) === Number(id));
  return this.safeText(found?.answer);
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
      (typeof answer === 'string' &&
        (/^https?:\/\/|^uploads\//i.test(answer) ||
          /\.pdf$|\.png$|\.jpg$|\.jpeg$/i.test(answer))) ||
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
              question: this.titleCase(`${key} ${idx + 1} - ${subKey}`),
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

private collectFileDocuments(fields: any[]): PdfFileDoc[] {
  return (fields || [])
    .filter((f) => f?.isFile && f?.fileUrl && f.fileUrl !== '—')
    .map((f) => ({
      question: this.safeText(f.question),
      fileUrl: this.resolveFileUrl(f.fileUrl),
      fileName: this.safeText(f.fileName || this.fileNameFromUrl(f.fileUrl)),
    }));
}

private buildSummaryRows(app: any, fields: any[]): any[][] {
  const paymentDetails = Array.isArray(app?.payment_details) ? app.payment_details : [];
  const serviceName = this.safeText(app?.service_name || app?.service?.service_title_or_description);

  return [
    [
      { text: 'Application Number', style: 'summaryKey' },
      { text: this.getApplicationNumber(app), style: 'summaryValue' },
      { text: 'Application Date', style: 'summaryKey' },
      { text: this.formatPdfDate(app?.application_date || app?.created_at), style: 'summaryValue' },
    ],
    [
      { text: 'Service Name', style: 'summaryKey' },
      { text: serviceName, style: 'summaryValue' },
      { text: 'Status', style: 'summaryKey' },
      { text: this.titleCase(app?.status), style: 'summaryValue' },
    ],
    [
      { text: 'Applicant Name', style: 'summaryKey' },
      { text: this.getApplicantName(app, fields), style: 'summaryValue' },
      { text: 'Payment Status', style: 'summaryKey' },
      { text: this.titleCase(app?.payment_status), style: 'summaryValue' },
    ],
    [
      { text: 'Mobile No.', style: 'summaryKey' },
      { text: this.safeText(app?.user?.phone), style: 'summaryValue' },
      { text: 'Email', style: 'summaryKey' },
      { text: this.safeText(app?.user?.email), style: 'summaryValue' },
    ],
    [
      { text: 'Total Fee', style: 'summaryKey' },
      { text: this.safeText(app?.total_fee), style: 'summaryValue' },
      { text: 'Paid Amount', style: 'summaryKey' },
      { text: this.safeText(app?.paid_amount), style: 'summaryValue' },
    ],
    [
      { text: 'Current Step', style: 'summaryKey' },
      { text: this.safeText(app?.current_step_number), style: 'summaryValue' },
      { text: 'Payment Records', style: 'summaryKey' },
      { text: String(paymentDetails.length), style: 'summaryValue' },
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
    const answerCell = f?.isFile
      ? f?.fileUrl && f.fileUrl !== '—'
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
      answerCell,
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

private buildDocumentsTable(files: PdfFileDoc[]): any[] {
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

private buildWorkflowTable(workflow: any[]): any[] {
  const body: any[] = [
    [
      { text: 'SL', style: 'tableHead' },
      { text: 'STEP', style: 'tableHead' },
      { text: 'TYPE', style: 'tableHead' },
      { text: 'DEPARTMENT', style: 'tableHead' },
      { text: 'STATUS', style: 'tableHead' },
      { text: 'REMARKS', style: 'tableHead' },
      { text: 'ACTION AT / FILE', style: 'tableHead' },
    ],
  ];

  workflow.forEach((w: any, index: number) => {
    const fileUrl = w?.status_file ? this.resolveFileUrl(w.status_file) : null;
    body.push([
      { text: String(index + 1), style: 'text' },
      { text: this.safeText(w?.step_number), style: 'text' },
      { text: this.titleCase(w?.step_type), style: 'text' },
      { text: this.safeText(w?.department), style: 'text' },
      { text: this.titleCase(w?.status), style: 'text' },
      { text: this.safeText(w?.remarks), style: 'text' },
      fileUrl
        ? {
            stack: [
              { text: this.formatPdfDate(w?.action_taken_at), style: 'text' },
              {
                text: this.fileNameFromUrl(fileUrl),
                link: fileUrl,
                color: '#1d4ed8',
                decoration: 'underline',
                style: 'text',
              },
            ],
          }
        : { text: this.formatPdfDate(w?.action_taken_at), style: 'text' },
    ]);
  });

  if (workflow.length === 0) {
    body.push([
      { text: '—', style: 'text' },
      { text: '—', style: 'text' },
      { text: '—', style: 'text' },
      { text: '—', style: 'text' },
      { text: '—', style: 'text' },
      { text: 'No workflow history found', colSpan: 2, style: 'text' },
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
      { text: 'NOC Application Date', style: 'summaryKey' },
      { text: this.formatPdfDateOnly(app?.NOC_application_date), style: 'summaryValue' },
      { text: 'NOC Generation Date', style: 'summaryKey' },
      { text: this.formatPdfDateOnly(app?.NOC_generationDate), style: 'summaryValue' },
    ],
  ];
}

private buildPdfDefinition(app: any): any {
  const structuredFields = this.normalizeApplicationData(app?.application_data || {});
  const paymentDetails = Array.isArray(app?.payment_details) ? app.payment_details : [];
  const workflow = Array.isArray(app?.workflow) ? app.workflow : [];
  const history = Array.isArray(app?.history_data) ? app.history_data : [];
  const files = this.collectFileDocuments(structuredFields);

  const applicantName = this.getApplicantName(app, structuredFields);
  const applicationNo = this.getApplicationNumber(app);
  const serviceName = this.safeText(app?.service_name || app?.service?.service_title_or_description);
  const printableWorkflow = workflow.length ? workflow : history;

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
          body: this.buildSummaryRows(app, structuredFields),
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
          body: this.buildFieldsTable(structuredFields),
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
          body: this.buildDocumentsTable(files),
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
          widths: [20, 60, 50, 45, 70, 55, '*'],
          body: this.buildPaymentTable(paymentDetails),
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
          body: this.buildRenewalRows(app),
        },
        layout: 'lightHorizontalLines',
        margin: [0, 0, 0, 10],
      },

      { text: 'Workflow / History', style: 'section' },
      {
        table: {
          headerRows: 1,
          widths: [20, 34, 55, 85, 45, '*', 90],
          body: this.buildWorkflowTable(printableWorkflow),
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
      if (this.pdfBlobUrl) {
        URL.revokeObjectURL(this.pdfBlobUrl);
      }
    } catch {}

    const url = URL.createObjectURL(blob);
    this.pdfBlobUrl = url;
    this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    this.pdfZoom = 1;
    this.showPdfPreview = openPreview;
  });
}

printApplication(): void {
  const app = this.applicationData;

  if (!app) {
    this.apiService.openSnackBar('No application loaded to print.', 'error');
    return;
  }

  (pdfMake as any).vfs = (pdfFonts as any)?.vfs || (pdfFonts as any);

  const documentDefinition = this.buildPdfDefinition(app);

  pdfMake.createPdf(documentDefinition).getBlob((blob: Blob) => {
    const blobUrl = URL.createObjectURL(blob);

    const printWindow = window.open(blobUrl, '_blank');

    if (!printWindow) {
      this.apiService.openSnackBar('Popup blocked. Please allow popups.', 'error');
      return;
    }

    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
    };
  });
}



downloadPdf(): void {
  const app = this.applicationData;
  if (!app) {
    this.apiService.openSnackBar('No application loaded to download.', 'error');
    return;
  }

  const fields = this.normalizeApplicationData(app?.application_data || {});
  const applicantName = this.getApplicantName(app, fields);
  const applicationNo = this.getApplicationNumber(app);
  const fileName = `${applicantName} - ${applicationNo}.pdf`
    .replace(/[\\/:*?"<>|]+/g, '_')
    .replace(/\s+/g, ' ')
    .trim();

  const documentDefinition = this.lastPdfDefinition || this.buildPdfDefinition(app);
  (pdfMake as any).vfs = (pdfFonts as any)?.vfs || (pdfFonts as any);

  pdfMake.createPdf(documentDefinition).download(fileName);
}

openPdfInNewTab(): void {
  const app = this.applicationData;
  if (!app) return;

  if (this.pdfBlobUrl) {
    window.open(this.pdfBlobUrl, '_blank', 'noopener,noreferrer');
    return;
  }

  const documentDefinition = this.lastPdfDefinition || this.buildPdfDefinition(app);
  (pdfMake as any).vfs = (pdfFonts as any)?.vfs || (pdfFonts as any);
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

  const payload = {
    application_id: this.applicationId,
  };

  this.apiService
    .getByConditions({}, `api/department/applications/${this.applicationId}`)
    .subscribe({
      next: (res: any) => {
        this.isLoading = false;

        if (res?.status !== 1 || !res?.data || typeof res.data !== 'object') {
          this.apiService.openSnackBar(
            res?.message || 'No application details found.',
            'Close'
          );
          return;
        }

        const appData = res.data || {};
        const rawAppData = appData?.application_data || res?.application_data || {};
        const structuredData = this.normalizeApplicationData(rawAppData);

        const filteredData = structuredData.filter((qa: any) => {
          if (qa.answer == null) return false;
          if (qa.answer === '') return false;
          if (Array.isArray(qa.answer) && qa.answer.length === 0) return false;
          return true;
        });

        const historyData = Array.isArray(res?.history_data)
          ? res.history_data
          : Array.isArray(appData?.history_data)
            ? appData.history_data
            : [];

        const workflowData = Array.isArray(appData?.workflow)
          ? appData.workflow
          : Array.isArray(res?.workflow)
            ? res.workflow
            : [];

        const paymentDetails = Array.isArray(res?.payment_details)
          ? res.payment_details
          : Array.isArray(appData?.payment_details)
            ? appData.payment_details
            : [];

        this.transactionDetails = paymentDetails.map((item: any) => ({
          transaction_id: item?.transaction_id || null,
          GRN_number: item?.GRN_number || null,
          gateway: item?.gateway || null,
          payment_datetime: item?.payment_datetime || null,
          payment_amount: item?.payment_amount || null,
          payment_status: item?.payment_status || null,
        }));

        this.serviceName = res?.service_name || appData?.service_name || '';

        const normalizedApp = {
          ...appData,
          service_name: res?.service_name || appData?.service_name || '',
          application_data: rawAppData,
          application_data_structured: filteredData,
          payment_details: paymentDetails,
          workflow: workflowData,
          history_data: historyData,
          renewal_details: res?.renewal_details || appData?.renewal_details || {},
        };

        this.applicationData = normalizedApp;
        this.application = normalizedApp;

        this.isCertificatePreview = true;
        this.isFinalApproval = !!normalizedApp?.is_finally_approved;
        this.justBeforeApproval = !!normalizedApp?.just_before_final_step;
        this.isCertificateGenerated = !!normalizedApp?.is_certificate_generated;

        const firstStatusFile =
          historyData.find((h: any) => !!h?.status_file)?.status_file ||
          workflowData.find((w: any) => !!w?.status_file)?.status_file ||
          null;

        this.sampleFilePreview = firstStatusFile || null;

        this.historyDetails = historyData.map((h: any) => ({
          step_number: h?.step_number,
          step_type: h?.step_type || '—',
          status: h?.status || '—',
          remarks: h?.remarks || '—',
          action_taken_at: this.formatDateTime(h?.action_taken_at),
          status_file: h?.status_file || null,
        }));

        console.log('Application Data:', this.applicationData?.application_data);

        if (typeof this.processDataForDisplay === 'function') {
          this.processDataForDisplay();
        }

        if (this.applicationData) {
          this.preparePdf(this.applicationData, false);
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('API Error:', err);
        this.apiService.openSnackBar('Could not load application.', 'Close');
      },
    });
}

// ✅ Check if file URL is valid
checkDownloadUrlAvailability(url: string): boolean {
  if (!url) return false;

  try {
    const parsed = new URL(url);
    return !!parsed;
  } catch {
    return false;
  }
}
// ✅ Format date-time (for workflow)
formatDateTime(date: string | Date): string {
  if (!date) return '—';

  const d = new Date(date);
  return d.toLocaleString('en-GB'); // DD/MM/YYYY, HH:mm
}

openPrintPreview(): void {
  if (!this.applicationData) {
    this.apiService.openSnackBar('No application loaded to preview.', 'error');
    return;
  }

  // Prepare PDF and open modal
  this.preparePdf(this.applicationData, true); // 👈 this sets showPdfPreview = true
}



}
