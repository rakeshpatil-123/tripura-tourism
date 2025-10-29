import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { GenericService } from '../../_service/generic/generic.service';
import { finalize } from 'rxjs/operators';
import { LoaderService } from '../../_service/loader/loader.service';
import { MatIconModule } from '@angular/material/icon';
import { IlogiFileUploadComponent } from "../../customInputComponents/ilogi-file-upload/ilogi-file-upload.component";
import { IlogiInputComponent } from "../../customInputComponents/ilogi-input/ilogi-input.component";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-incentive-application-details',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, IlogiFileUploadComponent, IlogiInputComponent, ReactiveFormsModule],
  templateUrl: './incentive-application-details.component.html',
  styleUrls: ['./incentive-application-details.component.scss'],
})
export class IncentiveApplicationDetailsComponent implements OnInit {
  applicationId!: number;
  details: any = null;
  can_update_status: any;
  loaded = false;
  isSubmitting: boolean = false;
  approvedForm!: FormGroup;
  currentUserRole: 'Dealing Assistant' | 'General Manager' | 'State Level Committee' | '' = 'Dealing Assistant';
  statusForm!: FormGroup;
  fileUrl: string | null = null;
  isLoading = false;
  formAnswers: any[] = [];
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private genericService: GenericService,
    private loaderService: LoaderService,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    const designation = localStorage.getItem('designation') || '';
    this.currentUserRole = this.mapDesignationToRole(designation);
    this.applicationId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.applicationId) {
      this.fetchApplicationDetails();
    } else {
      this.goBack();
    }
  }

  initializeForms(): void {
    const approvedControls: any = {};
    this.subsidyItems.forEach((item: any) => {
      approvedControls[item.question_id] = this.fb.control(item.approved ?? '');
    });
    this.approvedForm = this.fb.group(approvedControls);

    const existingStatus = this.details?.workflow_status || '';
    const existingRemarks = this.details?.remarks || '';

    const rawFileUrl = this.details?.review_file || null;
    this.fileUrl = rawFileUrl ? rawFileUrl.replace(/\\/g, '') : null;

    let fileName = '';
    if (this.fileUrl) {
      const parts = this.fileUrl.split('/');
      fileName = parts[parts.length - 1];
    }

    const mappedStatus = this.mapAction(existingStatus);
    this.statusForm = this.fb.group({
      new_status: [mappedStatus || '', Validators.required],
      remarks: [existingRemarks || '', [Validators.required]],
      review_file: [this.fileUrl ? { name: fileName, url: this.fileUrl } : null],
    });
  }

  submitReview(): void {
    if (this.statusForm.invalid) {
      this.statusForm.markAllAsTouched();
      return;
    }

    const payload = new FormData();
    payload.append('application_id', String(this.details?.id ?? ''));
    const selectedStatus = this.statusForm.value.new_status;
    const finalStatus = this.getWorkflowStatus(
      this.currentUserRole,
      selectedStatus
    );
    payload.append('new_status', finalStatus);

    payload.append('remarks', this.statusForm.value.remarks || '');

    const file = this.statusForm.value.review_file;
    if (file) payload.append('review_file', file);

    this.subsidyItems.forEach((item: any) => {
      const value = this.approvedForm.value[item.question_id];
      if (value !== null && value !== '' && !isNaN(value)) {
        payload.append(`approved_items[${item.question_id}]`, String(value));
      }
    });

    this.isSubmitting = true;
    this.loaderService.showLoader();

    this.genericService.changeIncentiveStatus(payload).subscribe({
      next: (res: any) => {
        console.log('Status Updated:', res);
        this.loaderService.hideLoader();
        this.isSubmitting = false;

        Swal.fire({
          icon: 'success',
          title: 'Status Updated',
          text: res?.message || 'The status has been updated successfully.',
          confirmButtonText: 'OK',
        }).then(() => {
          this.fetchApplicationDetails();
        });
      },
      error: (err: any) => {
        console.error('Error updating status:', err);
        this.loaderService.hideLoader();
        this.isSubmitting = false;
        Swal.fire({
          icon: 'error',
          title: 'Update Failed',
          text: err?.error?.message || 'Something went wrong while updating the status.',
          confirmButtonText: 'Retry',
        });
      },
    });
  }


  private mapAction(status: string): string {
    if (!status) return '';
    if (status.includes('approved')) return 'approved';
    if (status.includes('rejected')) return 'rejected';
    if (status.includes('sent_back')) return 'send_back';
    return status;
  }

  private mapDesignationToRole(designation: string): 'Dealing Assistant' | 'General Manager' | 'State Level Committee' | '' {
    if (!designation) return '';
    const d = designation.toLowerCase();
    if (d.includes('dealing')) return 'Dealing Assistant';
    if (d.includes('general')) return 'General Manager';
    if (d.includes('state') || d.includes('committee') || d.includes('slc')) return 'State Level Committee';
    return '';
  }

  private getWorkflowStatus(
    userRole: 'Dealing Assistant' | 'General Manager' | 'State Level Committee' | '',
    action: string
  ): string {
    const map: any = {
      'Dealing Assistant': {
        approved: 'approved_by_da',
        rejected: 'rejected_by_da',
        sent_back: 'sent_back_by_da',
      },
      'General Manager': {
        approved: 'approved_by_gm',
        rejected: 'rejected_by_gm',
        sent_back: 'sent_back_by_gm',
      },
      'State Level Committee': {
        approved: 'approved_by_slc',
        rejected: 'rejected_by_slc',
        sent_back: 'sent_back_by_slc',
      },
    };
    return map[userRole]?.[action] || action;
  }
  fetchApplicationDetails(): void {
    this.isLoading = true;
    this.loaderService.showLoader();
    this.genericService
      .getViewDetailsOfIncentive(this.applicationId)
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.loaderService.hideLoader();
        })
      )
      .subscribe({
        next: (res: any) => {
          if (res && res.status === 1) {
            this.details = res.data || null;
            this.can_update_status = res.data.can_update_status;
            this.formAnswers = this.transformFormAnswers(this.details?.form_answers_json);
            this.initializeForms();
            setTimeout(() => (this.loaded = true), 60);
          } else {
            this.details = null;
          }
        },
        error: () => {
          this.details = null;
        },
      });
  }
  transformFormAnswers(formAnswersJson: any): any[] {
    if (!Array.isArray(formAnswersJson)) return [];

    return formAnswersJson.map((item: any, index: number) => ({
      id: item.question_id || index + 1,
      label: item.question || `Question ${index + 1}`,
      answer: item.answer ?? null,
      files: item.files || [],
    }));
  }

  getFileType(mime: string): 'image' | 'pdf' | 'other' {
    if (!mime) return 'other';
    if (mime.startsWith('image/')) return 'image';
    if (mime === 'application/pdf') return 'pdf';
    return 'other';
  }


  goBack(): void {
    this.router.navigate(['/dashboard/incentive-applications']);
  }

  get subsidyItems(): any[] {
    return this.details?.subsidy_report?.subsidy_items || [];
  }

  numberOrDash(v: any): string {
    if (v === null || v === undefined || v === '') return '-';
    return v;
  }
  getReadableStatus(status: string): string {
    if (!status) return '-';

    const map: Record<string, string> = {
      submitted: 'Submitted',
      sent_back_by_da: 'Sent Back By Dealing Assistant',
      rejected_by_da: 'Rejected By Dealing Assistant',
      approved_by_da: 'Approved By Dealing Assistant',
      approved_by_gm: 'Approved By General Manager',
      sent_back_by_gm: 'Sent Back By General Manager',
      rejected_by_gm: 'Rejected By General Manager',
      sent_back_by_slc: 'Sent Back By State Level Committee',
      rejected_by_slc: 'Rejected By State Level Committee',
      approved_by_slc: 'Approved By State Level Committee',
      pending: 'Pending',
      approved: 'Approved',
    };

    return map[status.toLowerCase()] || this.titleCase(status.replace(/_/g, ' '));
  }

  titleCase(str: string): string {
    return str
      .toLowerCase()
      .split(' ')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }
  formatStatus(status: string): string {
    if (!status) return 'No Status';

    const words = status.split('_').map(word => word.toLowerCase());

    const formatted = words.map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    );

    const byIndex = formatted.findIndex(w => w.toLowerCase() === 'by');
    if (byIndex !== -1 && formatted[byIndex + 1]) {
      formatted[byIndex + 1] = formatted[byIndex + 1].toUpperCase();
    }

    return formatted.join(' ');
  }


  getStatusClass(status: string): string {
    if (!status) return '';
    const s = status.toLowerCase();
    if (s.includes('approved')) return 'status-approved';
    if (s.includes('rejected')) return 'status-rejected';
    if (s.includes('sent_back')) return 'status-sent-back';
    if (s.includes('pending') || s.includes('under_review')) return 'status-pending';
    return 'status-default';
  }
}
