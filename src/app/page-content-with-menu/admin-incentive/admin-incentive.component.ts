import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';

import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { ToolbarModule } from 'primeng/toolbar';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { AbstractControl, ValidationErrors } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { MenuModule } from 'primeng/menu';
import { BadgeModule } from 'primeng/badge';
import { Router } from '@angular/router';
import { TooltipModule } from 'primeng/tooltip';
import Swal from 'sweetalert2';
import { GenericService } from '../../_service/generic/generic.service';
import { TableColumn, DynamicTableComponent } from '../../shared/component/table/table.component';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from "@angular/material/datepicker";
import { DatePickerModule } from 'primeng/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from "@angular/material/input";
import { SelectModule } from 'primeng/select';
import { LoaderService } from '../../_service/loader/loader.service';
import { finalize } from 'rxjs';

interface Scheme {
  id: string;
  title: string;
  period: string;
  proformaCount?: number;
  createdOn?: string;
  status?: string;
  raw?: any;
}

interface Proforma {
  id: string;
  title: string;
  code?: string;
  schemaId?: string | null;
  raw?: any;
}
interface ProformaForm {
  code: string;
  title: string;
  policy_start_date: string;
  policy_end_date: string;
  status: boolean;
}

@Component({
  selector: 'app-admin-incentive',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    TableModule,
    ToolbarModule,
    DialogModule,
    InputTextModule,
    CardModule,
    MenuModule,
    BadgeModule,
    TooltipModule,
    SelectModule,
    MatNativeDateModule,
    DynamicTableComponent, MatMenuModule, MatButtonModule, MatIconModule,
    MatDatepickerModule,
    MatInputModule,
    DatePickerModule,

  ],
  templateUrl: './admin-incentive.component.html',
  styleUrls: ['./admin-incentive.component.scss'],
  providers: [MessageService]
})
export class AdminIncentiveComponent implements OnInit {
  private fb = inject(FormBuilder);
  private msg = inject(MessageService);
  startDate: Date | null = null;
  endDate: Date | null = null;
  selectedStatus: any = null;
  statusTouched = false;
  isEditMode = false;
  editingSchemeId: string | null = null;

  onStartDateChange(): void {
    const startCtrlValue = this.addSchemeForm.get('policy_start_date')?.value;
    this.startDate = startCtrlValue ? (new Date(startCtrlValue) as Date) : null;

    const endCtrl = this.addSchemeForm.get('policy_end_date');
    if (endCtrl?.value && this.startDate && new Date(endCtrl.value).getTime() < this.startDate.getTime()) {
      endCtrl.setValue(null);
    }
    endCtrl?.updateValueAndValidity();
  }
  editRow(row: Scheme): void {
    this.isEditMode = true;
    this.editingSchemeId = row.id;
    const statusBool = row.status === 'Active' ? true : false;
    this.addSchemeForm.patchValue({
      code: row.raw?.code ?? '',
      title: row.title ?? '',
      policy_start_date: row.raw?.policy_start_date ? new Date(row.raw.policy_start_date) : null,
      policy_end_date: row.raw?.policy_end_date ? new Date(row.raw.policy_end_date) : null,
      status: statusBool
    });
    this.showAddSchemeDialog = true;
  }

  schemeColumns: TableColumn[] = [
    {key: 'sr_no', label: 'S.No', type: 'number'},
    { key: 'id', label: 'ID', type: 'number', sortable: true },
    { key: 'title', label: 'Scheme Title', type: 'text', sortable: true },
    { key: 'period', label: 'Period', type: 'text' },
    { key: 'proformaCount', label: 'Proformas', type: 'number' },
    { key: 'createdOn', label: 'Created On', type: 'date' },
    { key: 'status', label: 'Status', type: 'status' },
    {
      key: 'actions',
      label: 'Actions',
      type: 'action',
      actions: [
        {
          label: 'View',
          onClick: (row) => this.viewSchemeDetails(row)
        },
        {
          label: 'Edit',
          onClick: (row) => this.editRow(row)
        },
        {
          label: 'Delete',
          color: 'warn',
          onClick: (row) => this.deleteRow(row)
        },
        {
          label: 'Go to Proformas',
          onClick: (row) => this.goToProforma(row)
        }
      ]
    }

  ];
  statusOptions = [
    { name: 'Active', value: true },
    { name: 'Inactive', value: false }
  ];

  schemes = [];

  workflowData: Scheme[] = [];

  showAddSchemeDialog = false;
  showProformasDialog = false;
  showAddProformaDialog = false;
  showFormDialog = false;
  showSchemeDetailsDialog: boolean = false;


  addSchemeForm = this.fb.group({
    code: ['', Validators.required],
    title: ['', Validators.required],
    policy_start_date: [null as Date | null, Validators.required],
    policy_end_date: [null as Date | null, [Validators.required, this.validateEndDate.bind(this)]],
    status: [true]
  });


  addProformaForm = this.fb.group({
    title: ['', Validators.required],
    code: ['', Validators.required],
    type: ['ELIGIBILITY', Validators.required]
  });
  selectedScheme: any | null = null;
  proformas: Proforma[] = [];
  selectedProforma: Proforma | null = null;
  selectedSchema: any | null = null;
  loading = false;

  constructor(private genericService: GenericService, private loaderService: LoaderService, private router: Router) { }

  ngOnInit(): void {
    this.loadSchemes();
  }
  deleteRow(row: any): void {
    Swal.fire({
      title: 'Are you sure?',
      text: `Do you really want to delete "${row.title}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
      showClass: {
        popup: 'animate__animated animate__fadeInDown'
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOutUp'
      },
      customClass: {
        confirmButton: 'swal2-confirm-btn',
        cancelButton: 'swal2-cancel-btn'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.loaderService.showLoader();

        this.genericService.deleteIncentiveScheme(row.id).pipe(finalize(() => this.loaderService.hideLoader())).subscribe({
          next: (res) => {
            Swal.fire({
              title: 'Deleted!',
              text: `"${row.title}" has been deleted successfully.`,
              icon: 'success',
              confirmButtonText: 'OK',
              showClass: {
                popup: 'animate__animated animate__fadeInDown'
              },
              hideClass: {
                popup: 'animate__animated animate__fadeOutUp'
              }
            });
            this.loadSchemes();
            this.workflowData = this.workflowData.filter((s) => s.id !== row.id);
          },
          error: (err) => {
            this.loaderService.hideLoader();

            Swal.fire({
              title: 'Error!',
              text: `Failed to delete "${row.title}". Please try again.`,
              icon: 'error',
              confirmButtonText: 'OK'
            });
            console.error(err);
          }
        });
      }
    });
  }

  goToProforma(row: any): void {
    if (!row?.id) {
      return;
    }
    this.router.navigate(['/dashboard/admin-incentive', row.id, 'proformas'], {
      state: { schemeTitle: row.title }
    });
  }

  private formatDateToYYYYMMDD(d: Date | string | null): string | null {
    if (!d) return null;
    if (typeof d === 'string') return d;
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return null;
    return dt.toISOString().slice(0, 10);
  }

  onRowAction(event: { action: string; row: any }) {
    switch (event.action) {
      case 'View':
        this.openProformas(event.row);
        break;
      case 'Add Eligibility/Claim':
        this.openProformas(event.row);
        this.showAddProformaDialog = true;
        break;
      case 'Open Proforma':
        this.openProformas(event.row);
        break;
    }
  }

  loadSchemes() {
    this.loading = true;
    this.loaderService.showLoader();
    this.genericService.getIncentivesScheme().pipe(finalize(() => this.loaderService.hideLoader())).subscribe({
      next: (res: any) => {
        if (res?.status === 1 && Array.isArray(res.data)) {
          this.workflowData = res.data.map((r: any, index: number) => ({
            sr_no: index+1,
            id: r.id,
            title: r.title, 
            period: `${r.policy_start_date?.slice(0, 10)} → ${r.policy_end_date?.slice(0, 10)}`,
            proformaCount: r.proformas_count ?? 0,
            createdOn: r.created_at?.slice(0, 10),
            status: r.status ? 'Active' : 'Inactive',
            raw: r
          }));
        } else {
          this.workflowData = [];
        }
        this.loading = false;
      },
      error: () => {
        this.workflowData = [];
        this.loading = false;
      }
    });
  }

  openProformas(scheme: Scheme) {
    this.selectedScheme = scheme;
    this.showProformasDialog = true;
    this.proformas = this.sampleProformas(scheme);
  }

  openProformaForm(proforma: Proforma) {
    this.selectedProforma = proforma;
    this.showFormDialog = true;
    this.selectedSchema = this.sampleSchema(proforma);
  }

  validateEndDate(control: AbstractControl): ValidationErrors | null {
    const start = this.addSchemeForm?.get('policy_start_date')?.value;
    const end = control.value;

    if (start && end && new Date(end).getTime() < new Date(start).getTime()) {
      return { endBeforeStart: true };
    }
    return null;
  }
  onAddScheme() {
    if (this.addSchemeForm.invalid) {
      this.addSchemeForm.markAllAsTouched();
      return;
    }

    const fv = this.addSchemeForm.value;

    const formattedStartDate = fv.policy_start_date
      ? this.formatDateToYYYYMMDD(fv.policy_start_date as Date)
      : '';
    const formattedEndDate = fv.policy_end_date
      ? this.formatDateToYYYYMMDD(fv.policy_end_date as Date)
      : '';

    const payload = {
      scheme_id: this.isEditMode ? this.editingSchemeId : undefined,
      code: fv.code ?? '',
      title: fv.title ?? '',
      policy_start_date: formattedStartDate,
      policy_end_date: formattedEndDate,
      status: fv.status ? 1 : 0
    };

    this.loaderService.showLoader();

    const apiCall = this.isEditMode && this.editingSchemeId
      ? this.genericService.updateIncentiveScheme(payload)
      : this.genericService.createIncentiveScheme(payload);

    apiCall.pipe(finalize(() => this.loaderService.hideLoader())).subscribe({
      next: (res) => {
        const title = this.isEditMode ? 'Updated!' : 'Created!';
        const message = res?.message || (this.isEditMode ? 'Scheme updated successfully.' : 'New scheme added successfully.');

        Swal.fire({
          title,
          text: message,
          icon: 'success',
          confirmButtonText: 'OK',
          showClass: { popup: 'animate__animated animate__fadeInDown' },
          hideClass: { popup: 'animate__animated animate__fadeOutUp' }
        });

        this.loadSchemes();

        if (this.isEditMode && this.editingSchemeId) {
          this.workflowData = this.workflowData.map((s) =>
            s.id === this.editingSchemeId
              ? {
                ...s,
                title: fv.title ?? '',
                period: `${formattedStartDate} → ${formattedEndDate}`,
                status: fv.status ? 'Active' : 'Inactive',
                raw: { ...s.raw, ...payload }
              }
              : s
          );
        } else {
          const newScheme: Scheme = {
            id: res?.id ?? `SC-${Math.floor(Math.random() * 90000)}`,
            title: fv.title ?? '',
            period: `${formattedStartDate} → ${formattedEndDate}`,
            proformaCount: 0,
            createdOn: new Date().toISOString(),
            status: fv.status ? 'Active' : 'Inactive',
            raw: fv
          };
          this.workflowData = [newScheme, ...this.workflowData];
        }

        this.resetSchemeForm();
      },
      error: (err: any) => {
        const serverErrs = err?.error?.errors || err?.errors;
        if (serverErrs) {
          this.handleServerValidationErrors(serverErrs);
          return;
        }
        const msg = err?.error?.message || err?.message || 'Failed to save scheme. Please try again.';
        this.genericService.openSnackBar(msg, 'error');
        Swal.fire({
          title: 'Error!',
          text: msg,
          icon: 'error',
          confirmButtonText: 'OK',
          showClass: { popup: 'animate__animated animate__fadeInDown' },
          hideClass: { popup: 'animate__animated animate__fadeOutUp' }
        });
      }
    });
  }

  private handleServerValidationErrors(serverErrors: any) {
    serverErrors = serverErrors || {};
    Object.keys(this.addSchemeForm.controls).forEach((key) => {
      const ctrl = this.addSchemeForm.get(key);
      if (ctrl?.errors && ctrl.errors['serverError']) {
        const { serverError, ...remainingErrors } = ctrl.errors;
        const hasOtherErrors = Object.keys(remainingErrors).length > 0;
        ctrl.setErrors(hasOtherErrors ? remainingErrors : null);
      }
    });
    let mappedAny = false;
    const otherMessages: string[] = [];

    for (const key in serverErrors) {
      if (!Object.prototype.hasOwnProperty.call(serverErrors, key)) continue;
      const raw = serverErrors[key];
      const msg = Array.isArray(raw) ? raw[0] : raw;

      if (this.addSchemeForm.contains(key)) {
        const ctrl = this.addSchemeForm.get(key);
        ctrl?.setErrors({ ...(ctrl.errors || {}), serverError: msg });
        ctrl?.markAsTouched();
        mappedAny = true;
      } else {
        otherMessages.push(msg);
      }
    }
    const inlineMessages = Object.values(serverErrors)
      .map(v => Array.isArray(v) ? v.join(', ') : String(v))
      .join('<br/>');

    const snackbarMessage = inlineMessages || otherMessages.join(', ') || 'Validation failed.';
    if (this.genericService && typeof this.genericService.openSnackBar === 'function') {
      this.genericService.openSnackBar(snackbarMessage.replace(/<br\/>/g, '\n'), 'error');
    } else {
      this.msg.add({ severity: 'error', summary: 'Validation failed', detail: snackbarMessage.replace(/<br\/>/g, '\n') });
    }
    this.showAddSchemeDialog = true;
    if (mappedAny) {
      Object.keys(serverErrors).forEach(k => {
        if (this.addSchemeForm.contains(k)) {
          this.addSchemeForm.get(k)?.markAsTouched();
        }
      });
    }
  }

  private resetSchemeForm() {
    this.showAddSchemeDialog = false;
    this.addSchemeForm.reset({ status: true });
    this.isEditMode = false;
    this.editingSchemeId = null;
    this.statusTouched = false;
  }


  onAddProforma() {
    if (!this.selectedScheme) return;

    if (this.addProformaForm.invalid) {
      this.addProformaForm.markAllAsTouched();
      return;
    }

    const fv = this.addProformaForm.value as ProformaForm;
    const payload = {
      code: fv.code,
      title: fv.title,
      policy_start_date: fv.policy_start_date,
      policy_end_date: fv.policy_end_date,
      status: fv.status
    };

    this.genericService.createProforma(payload).subscribe({
      next: (res) => {
        this.msg.add({
          severity: 'success',
          summary: 'Proforma added',
          detail: 'New proforma added successfully.'
        });

        const newProforma: Proforma = {
          id: res?.id ?? `P-${Math.floor(Math.random() * 10000)}`,
          title: fv.title ?? '',
          code: fv.code ?? '',
          schemaId: null,
          raw: fv
        };
        this.proformas = [newProforma, ...this.proformas];

        this.showAddProformaDialog = false;
        this.addProformaForm.reset();
      },
      error: (err) => {
        this.msg.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to Add Eligibility/Claim.'
        });
      }
    });
  }

  private sampleProformas(scheme: Scheme | null): Proforma[] {
    const s = scheme?.id ?? 'SC-000';
    return [
      { id: `${s}-P-1`, title: 'Proforma 1A', code: '1A', schemaId: null, raw: null },
      { id: `${s}-P-2`, title: 'Proforma 1E', code: '1E', schemaId: null, raw: null },
    ];
  }

  private sampleSchema(proforma: Proforma) {
    return {
      id: `schema-${proforma.id}`,
      title: proforma.title,
      sections: [
        {
          id: 's1', title: 'Applicant Details', fields: [
            { key: 'applicantName', label: 'Applicant Name', type: 'text', required: true },
            { key: 'mobile', label: 'Mobile', type: 'text', required: true },
            { key: 'startDate', label: 'Start Date', type: 'date' }
          ]
        }
      ]
    };
  }
  viewSchemeDetails(row: any): void {
    this.loaderService.showLoader();
    this.genericService
      .viewSingleScheme(row.id)
      .pipe(finalize(() => this.loaderService.hideLoader()))
      .subscribe({
        next: (res) => {
          if (res?.status === 1) {
            this.selectedScheme = res.data;
            this.showSchemeDetailsDialog = true;
          }
        },
        error: (err) => {
          console.error('Error fetching scheme details:', err);
        },
      });
  }
}
