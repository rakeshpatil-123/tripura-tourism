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
  isCertificatePreview: any = null;
  sampleFilePreview : any = null;
  isLoading: boolean = false;
  isFinalApproval: boolean = false;
  justBeforeApproval: boolean = false;
  isCerfitificateGenerated: boolean = false;
  infoData: any[] = [];
  infoColumns: TableColumn[] = [];

  workflowColumns: TableColumn[] = [];
  workflowData: any[] = [];

  applicationQATableData: any[] = [];
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

  fetchApplicationDetails(): void {
    this.apiService
      .getByConditions({}, `api/department/applications/${this.applicationId}`)
      .subscribe({
        next: (res: any) => {
          this.isLoading = false;

          if (res?.status === 1 && res.data) {
            this.applicationData = res.data;
            this.isCertificatePreview = true;
            if (res?.data?.history_data?.status_file) {
              this.sampleFilePreview = res?.data?.history_data?.status_file || null;
            }
            this.isFinalApproval = res.data.is_finally_approved;
            this.justBeforeApproval = res.data.just_before_final_step;
            this.isCerfitificateGenerated = res.data.is_certificate_generated;

            console.log('Application Data:', this.applicationData.application_data);
            this.processDataForDisplay();
          } else {
            this.apiService.openSnackBar(
              res?.message || 'Failed to load application details.',
              'Close'
            );
            this.router.navigate(['/departmental-services']);
          }
        },
        error: (err) => {
          this.isLoading = false;
          console.error('API Error:', err);
          this.apiService.openSnackBar('Could not load application.', 'Close');
          this.router.navigate(['/departmental-services']);
        },
      });
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
    if (['workflow', 'application_data', 'applied_fee', 'approved_fee', 'service_id', 'id', 'just_before_final_step', 'history_data', 'is_finally_approved', 'application_id'].includes(key)) {
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

    // Case 1: Simple question object (numeric keys like "0", "1")
    if (typeof value === 'object' && !Array.isArray(value) && value.question && value.answer !== undefined) {
      const { formattedAnswer, isFile, fileUrl, fileName } = this.processAnswer(value.answer, value.type);
      
      qaData.push({
        question: this.sanitizeHtmlTags(value.question || '—'),
        answer: formattedAnswer,
        isFile,
        fileUrl,
        fileName,
      });
    }
    // Case 2: Grouped questions (string keys like "TestSection")
    else if (Array.isArray(value)) {
      // Add section header with sanitized text
      qaData.push({
        question: this.sanitizeHtmlTags(key),
        answer: '',
        isSection: true,
      });

      // Process nested items in the array
      for (const itemGroup of value) {
        if (Array.isArray(itemGroup)) {
          for (const item of itemGroup) {
            if (typeof item === 'object' && item.question && item.answer !== undefined) {
              const { formattedAnswer, isFile, fileUrl, fileName } = this.processAnswer(item.answer);
              
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
        step_type: step.step_type,
        department: step.department,
        status: step.status,
        action_taken_by: step.action_taken_by || '—',
        action_taken_at: step.action_taken_at || '—',
        remarks: step.remarks || '—',
        workflowIndex: index,
      }));

      this.workflowColumns = [
        { key: 'step_number', label: 'Step', type: 'number' },
        { key: 'step_type', label: 'Type', type: 'text' },
        { key: 'department', label: 'Department', type: 'text' },
        { key: 'status', label: 'Status', type: 'status' },
        { key: 'action_taken_by', label: 'Action By', type: 'text' },
        { key: 'action_taken_at', label: 'Action At', type: 'text' },
        { key: 'remarks', label: 'Remarks', type: 'text' },
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
   * Detects if a string is a file URL based on extension
   * Returns the URL if it's a file, null otherwise
   */
  private detectFileFromString(ansStr: string): string | null {
    if (!ansStr || typeof ansStr !== 'string') return null;
    const urlRegex = /^https?:\/\//i;
    const fileExtRegex = /\.(pdf|docx?|xlsx?|xls|png|jpe?g|gif|txt|csv)(\?.*)?$/i;
    if (urlRegex.test(ansStr) && fileExtRegex.test(ansStr)) {
      return ansStr;
    }
    return null;
  }

  /**
   * Processes answer field and returns formatted answer with file detection
   * Handles string, array, and object types
   * Also handles date formatting based on type field
   */
  private processAnswer(answer: any, type?: string): { formattedAnswer: string; isFile: boolean; fileUrl?: string; fileName?: string } {
    let formattedAnswer = '—';
    let isFile = false;
    let fileUrl: string | undefined;
    let fileName: string | undefined;

    if (Array.isArray(answer)) {
      if (answer.length === 0) {
        formattedAnswer = '—';
      } else {
        const allValues: string[] = [];
        for (const ans of answer) {
          if (ans === null || ans === undefined) continue;
          if (typeof ans === 'string') {
            if (ans.trim()) allValues.push(ans);
          } else if (typeof ans === 'object') {
            for (const k in ans) {
              if (ans.hasOwnProperty(k)) {
                const v = ans[k];
                if (v !== null && v !== undefined && v !== '') {
                  allValues.push(String(v));
                }
              }
            }
          }
        }
        if (allValues.length > 0) {
          // If single value and it is a file URL, mark as file
          if (allValues.length === 1) {
            const maybe = this.detectFileFromString(allValues[0]);
            if (maybe) {
              isFile = true;
              fileUrl = maybe;
              fileName = maybe.split('/').pop() || maybe;
              formattedAnswer = '';
            } else {
              // Apply date formatting if type is date-related
              const isDateType = type && type.toLowerCase().includes('date');
              formattedAnswer = isDateType ? this.formatDateByType(allValues[0], type) : allValues[0];
            }
          } else {
            formattedAnswer = allValues.join(', ');
          }
        } else {
          formattedAnswer = '—';
        }
      }
    } else if (typeof answer === 'string' && answer.trim()) {
      const maybeFile = this.detectFileFromString(answer);
      if (maybeFile) {
        isFile = true;
        fileUrl = maybeFile;
        fileName = maybeFile.split('/').pop() || maybeFile;
        formattedAnswer = '';
      } else {
        // Apply date formatting if type is date-related
        const isDateType = type && type.toLowerCase().includes('date');
        formattedAnswer = isDateType ? this.formatDateByType(answer, type) : answer;
      }
    }

    return { formattedAnswer, isFile, fileUrl, fileName };
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
    const baseUrl = 'http://swaagatstaging.tripura.cloud/';
    this.apiService.downloadServiceCertificate(this.applicationId).subscribe({
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

}
