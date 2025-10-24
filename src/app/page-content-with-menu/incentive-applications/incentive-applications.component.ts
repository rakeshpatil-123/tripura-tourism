import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TableColumn, DynamicTableComponent } from '../../shared/component/table/table.component';
import { LoaderService } from '../../_service/loader/loader.service';
import { GenericService } from '../../_service/generic/generic.service';
import { finalize, Subscription } from 'rxjs';
import { IlogiFileUploadComponent } from "../../customInputComponents/ilogi-file-upload/ilogi-file-upload.component";
import { IlogiInputComponent } from "../../customInputComponents/ilogi-input/ilogi-input.component";
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-incentive-applications',
  standalone: true,
  imports: [
    CommonModule,
    DynamicTableComponent,
    ReactiveFormsModule,
    IlogiInputComponent,
    IlogiFileUploadComponent
  ],
  templateUrl: './incentive-applications.component.html',
  styleUrl: './incentive-applications.component.scss'
})
export class IncentiveApplicationsComponent implements OnInit, OnDestroy {

  incentiveApplications: TableColumn[] = [];
  applications: any[] = [];
  subscriptions: Subscription;
  currentUserRole: 'DA' | 'GM' = 'DA';
  remarkForm!: FormGroup;
  statusModal = {
    visible: false,
    title: '',
    action: '',
    applicationId: 0
  };

  isCertificatePreview = false;

  constructor(
    private loaderService: LoaderService,
    private genericService: GenericService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.subscriptions = new Subscription();
  }

  ngOnInit(): void {
    this.initForm();
    const incentiveApplicationSubs = this.getAllIncentiveApplications();
    this.subscriptions.add(incentiveApplicationSubs);
  }

  private initForm(): void {
    this.remarkForm = this.fb.group({
      remarks: ['', [Validators.required, Validators.minLength(5)]],
      extraAmount: [null],
      attachment: [null]
    });
  }

  getAllIncentiveApplications(): void {
    this.loaderService.showLoader();

    this.genericService.getAllIncentiveApplications()
      .pipe(finalize(() => this.loaderService.hideLoader()))
      .subscribe((res: any) => {
        const data = res?.data || [];

        this.applications = data.map((item: any, index: number) => ({
          sno: index + 1,
          application_id: item.application_id,
          application_no: item.application_no || 'N/A',
          applicant_name: this.toTitleCase(item.applicant_name),
          application_type: this.toTitleCase(item.application_type),
          workflow_status: this.formatStatus(item.workflow_status),
          submitted_at: this.formatDate(item.submitted_at)
        }));

        this.incentiveApplications = [
          { key: 'sno', label: 'S.No', type: 'number', width: '70px' },
          { key: 'application_no', label: 'Application No', type: 'text' },
          { key: 'applicant_name', label: 'Applicant Name', type: 'text' },
          { key: 'application_type', label: 'Application Type', type: 'text' },
          { key: 'workflow_status', label: 'Workflow Status', type: 'text' },
          { key: 'submitted_at', label: 'Submitted At', type: 'text' },
          {
            key: 'actions',
            label: 'Actions',
            type: 'action',
            width: '220px',
            actions: [
              {
                label: 'Approve',
                color: 'success',
                visible: (row: any) => row.workflow_status === 'Pending',
                onClick: (row: any) => this.openStatusModal('approved', 'Approve Application', row)
              },
              {
                label: 'Send Back',
                color: 'warn',
                visible: (row: any) => row.workflow_status === 'Pending',
                onClick: (row: any) => this.openStatusModal('send_back', 'Send Back Application', row)
              },
              {
                label: 'Reject',
                color: 'danger',
                visible: (row: any) => row.workflow_status === 'Pending',
                onClick: (row: any) => this.openStatusModal('rejected', 'Reject Application', row)
              },
              // {
              //   label: 'Raise Extra Payment',
              //   icon: 'attach_money',
              //   color: 'primary',
              //   visible: (row: any) => row.workflow_status === 'Pending',
              //   onClick: (row: any) => this.openStatusModal('raise_extra_payment', 'Raise Extra Payment', row)
              // }
            ]
          }
        ];

        this.cdr.detectChanges();
      });
  }

  /** Open modal */
  openStatusModal(
    action: 'approved' | 'send_back' | 'rejected' | 'raise_extra_payment',
    title: string,
    row?: any
  ): void {
    this.statusModal.visible = true;
    this.statusModal.title = title;
    this.statusModal.action = action;
    this.statusModal.applicationId = row?.application_id || 0;
    this.remarkForm.reset();

    if (action === 'raise_extra_payment') {
      this.remarkForm.get('extraAmount')?.setValidators([Validators.required, Validators.min(1)]);
    } else {
      this.remarkForm.get('extraAmount')?.clearValidators();
    }
    this.remarkForm.get('extraAmount')?.updateValueAndValidity();

    this.cdr.detectChanges();
  }

  closeModal(): void {
    this.statusModal.visible = false;
    this.remarkForm.reset();
    this.remarkForm.get('attachment')?.setValue(null);
    this.cdr.detectChanges();
  }

  onSubmitStatus(): void {
    if (this.remarkForm.invalid) {
      this.remarkForm.markAllAsTouched();
      return;
    }

    const { remarks, extraAmount, attachment } = this.remarkForm.value;
    const { applicationId, action } = this.statusModal;
    const displayAction = action.replace('_', ' ').toUpperCase();

    const workflowStatus = this.getWorkflowStatus(this.currentUserRole, action);

    const payload = {
      application_id: applicationId,
      department: this.currentUserRole,
      new_status: workflowStatus,
      workflow_status: workflowStatus,
      remarks: remarks,
      extra_payment: extraAmount || null
    };

    this.loaderService.showLoader();

    this.genericService.changeIncentiveStatus(payload)
      .pipe(finalize(() => this.loaderService.hideLoader()))
      .subscribe({
        next: (res: any) => {
          if (res.status === 1) {
            Swal.fire({
              title: 'Success!',
              text: `${displayAction} successfully!`,
              icon: 'success',
              timer: 2000,
              showConfirmButton: false
            });
            this.closeModal();
            this.getAllIncentiveApplications();
          } else {
            Swal.fire('Error', res.message || 'Something went wrong', 'error');
          }
        },
        error: () => {
          Swal.fire('Error', 'Something went wrong while updating status.', 'error');
        }
      });
  }

  private getWorkflowStatus(userRole: 'DA' | 'GM', action: string): string {
    const statusMap: any = {
      DA: {
        approved: 'approved_by_da',
        rejected: 'rejected_by_da',
        send_back: 'sent_back_by_da',
      },
      GM: {
        approved: 'approved_by_gm',
        rejected: 'rejected_by_gm',
        send_back: 'sent_back_by_gm',
      }
    };
    return statusMap[userRole]?.[action] || action;
  }

  toTitleCase(text: string): string {
    if (!text) return '';
    return text.toLowerCase().split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  formatStatus(status: string): string {
    if (!status) return 'Pending';
    return status.replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  previewCertificate(): void { }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
