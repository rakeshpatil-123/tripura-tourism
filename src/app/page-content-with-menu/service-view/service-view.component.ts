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
import Swal from 'sweetalert2';

interface StatusActionModal {
  visible: boolean;
  applicationId: number;
  action: 'approved' | 'send_back' | 'rejected' | 'raise_extra_payment';
  title: string;
}

@Component({
  selector: 'app-service-view',
  imports: [CommonModule, DynamicTableComponent, IlogiInputComponent, ReactiveFormsModule],
  templateUrl: './service-view.component.html',
  styleUrl: './service-view.component.scss',
  standalone: true,
})
export class ServiceViewComponent implements OnInit {
  applicationId: number | null = null;
  applicationData: any = null;
  isLoading: boolean = false;

  // Application Info Table
  infoData: any[] = [];
  infoColumns: TableColumn[] = [];

  // Workflow Table
  workflowColumns: TableColumn[] = [];
  workflowData: any[] = [];

  // Application Q&A Table
  applicationQATableData: any[] = [];
  applicationQAColumns: TableColumn[] = [];

  // Modal state
  statusModal: StatusActionModal = {
    visible: false,
    applicationId: 0,
    action: 'approved',
    title: '',
  };

  // Form for remarks
  remarkForm: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: GenericService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.remarkForm = this.fb.group({
      extraAmount: [null],
      remarks: ['', [Validators.required, Validators.minLength(5)]],
    });
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

            // ❌ Remove JSON.parse — it's already an object/array
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

    // Define field mapping for readable labels
    const fieldMap: Record<string, string> = {
      'application_id': 'Application ID',
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
    if (['workflow', 'application_data', 'applied_fee', 'approved_fee', 'service_id', 'id'].includes(key)) {
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
    if (Array.isArray(data.application_data) && data.application_data.length > 0) {
      this.applicationQATableData = data.application_data.map((item: any) => ({
        question: item.question || '—',
        answer: item.answer || '—',
      }));

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
              label: 'Approve',
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

  closeModal(): void {
    this.statusModal.visible = false;
    this.remarkForm.reset();
  }

  onSubmitStatus(): void {
  if (this.remarkForm.invalid) {
    this.remarkForm.markAllAsTouched();
    return;
  }

  const { remarks, extraAmount } = this.remarkForm.value;
  const { applicationId, action } = this.statusModal;

    const payload: any = {
      status: action === 'raise_extra_payment' ? 'extra_payment' : action,
      remarks,
    };

    if (action === 'raise_extra_payment') {
      payload.extra_payment = extraAmount;
    }

  this.updateApplicationStatus(applicationId, payload);
  this.closeModal();
}

 updateApplicationStatus(applicationId: number, payload: any): void {
  this.apiService
    .getByConditions(payload, `api/department/applications/${applicationId}/status`)
    .subscribe({
      next: (res: any) => {
        if (res?.status === 1) {
          Swal.fire({
            title: 'Success!',
            text: `Application step ${payload.status.replace('_', ' ').toUpperCase()} successfully.`,
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
}