import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { finalize } from 'rxjs/operators';
import { GenericService } from '../../_service/generic/generic.service';

@Component({
  selector: 'app-add-renewal-fee-rule',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatInputModule,
    MatDividerModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './add-renewal-fee-rule.component.html',
  styleUrls: ['./add-renewal-fee-rule.component.scss'],
})
export class AddRenewalFeeRuleComponent implements OnInit {
  feeRuleForm!: FormGroup;
  renewalCycles: any[] = [
    { id: 1, name: 'Annual Renewal' },
    { id: 2, name: '3-Year Renewal' }
  ];
  serviceQuestions: any[] = [];
  isSubmitting = false;
  loading = false;
  serverError: string | null = null;

  constructor(
    private fb: FormBuilder,
    private genericService: GenericService,
    private dialogRef: MatDialogRef<AddRenewalFeeRuleComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { service: any; mode: 'add' | 'edit' }
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.loadRenewalCycles();
    this.loadQuestions();
    if (this.data.mode === 'edit' && this.data.service) {
      const svc = this.data.service;
      this.feeRuleForm.patchValue({
        id: svc.id,
        service_id: svc.service_id ?? svc.id,
        renewal_cycle_id: svc.renewal_cycle_id ?? '',
        fee_type: svc.fee_type ?? 'calculated',
        fixed_fee: svc.fixed_fee && svc.fixed_fee !== 'null' ? svc.fixed_fee : null,
        question_id: svc.question_id ?? null,
        condition_operator: svc.condition_operator ?? '',
        condition_value_start: svc.condition_value_start && svc.condition_value_start !== 'null' && svc.condition_value_start !== 'Invalid Date' ? svc.condition_value_start : null,
        condition_value_end: svc.condition_value_end && svc.condition_value_end !== 'null' && svc.condition_value_end !== 'Invalid Date' ? svc.condition_value_end : null,
        fixed_calculated_fee: svc.fixed_calculated_fee && svc.fixed_calculated_fee !== 'null' ? svc.fixed_calculated_fee : null,
        per_unit_fee: svc.per_unit_fee && svc.per_unit_fee !== 'null' ? svc.per_unit_fee : null,
        priority: svc.priority ?? 1,
        status: svc.status ?? 1,
      });
    }
  }

  initForm() {
    this.feeRuleForm = this.fb.group({
      service_id: [this.data.service?.id || ''],
      renewal_cycle_id: [''],
      fee_type: ['calculated'],
      fixed_fee: [null],
      question_id: [null],
      condition_operator: [''],
      condition_value_start: [null],
      condition_value_end: [null],
      fixed_calculated_fee: [null],
      per_unit_fee: [null],
      priority: [1],
      status: [1],
    });
  }

  loadRenewalCycles(): void {
    const sid = this.data.mode === 'edit' ? this.data.service?.service_id : this.data.service?.id;
    if (!sid) return;
    this.loading = true;
    this.genericService
      .getRenewalCycle(sid)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (res: any) => {
          if (res?.status) this.renewalCycles = Array.isArray(res.data) ? res.data : [{ id: 1, name: 'Annual Renewal' }, { id: 2, name: '3-Year Renewal' }];
        },
      });
  }

  loadQuestions(): void {
    const sid = this.data.mode === 'edit' ? this.data.service?.service_id : this.data.service?.id;
    if (!sid) return;
    this.genericService.getServiceQuestionnaires?.(sid)?.subscribe?.({
      next: (res: any) => {
        if (res?.status) this.serviceQuestions = res.data || [];
      },
    });
  }

  saveFeeRule(): void {
    this.serverError = null;

    this.isSubmitting = true;
    const form = this.feeRuleForm.value;
    const ruleObj: any = {
      service_id: String(form.service_id),
      renewal_cycle_id: String(form.renewal_cycle_id),
      fee_type: form.fee_type,
      fixed_fee: form.fixed_fee ? String(form.fixed_fee) : null,
      question_id: form.question_id ? String(form.question_id) : null,
      condition_operator: form.condition_operator,
      condition_value_start: form.condition_value_start && form.condition_value_start !== 'null' && form.condition_value_start !== 'Invalid Date' ? String(form.condition_value_start) : null,
      condition_value_end: form.condition_value_end && form.condition_value_end !== 'null' && form.condition_value_end !== 'Invalid Date' ? String(form.condition_value_end) : null,
      fixed_calculated_fee: form.fixed_calculated_fee ? String(form.fixed_calculated_fee) : null,
      per_unit_fee: form.per_unit_fee ? String(form.per_unit_fee) : null,
      priority: String(form.priority ?? 1),
      status: Number(form.status) === 1 ? 1 : 0,
    };

    if (this.data.mode === 'edit' && this.data.service?.id) {
      ruleObj.id = String(this.data.service.id);
    }

    const payload = { rules: [ruleObj] };
    if (this.data.mode === 'edit') {
      payload.rules[0].id = this.data.service.id;
    }
    const api$ =
      this.data.mode === 'edit'
        ? this.genericService.updateRenewalFeeRule(payload)
        : this.genericService.addRenewalFeeRule(payload);

    api$.pipe(finalize(() => (this.isSubmitting = false))).subscribe({
      next: (res: any) => {
        if (res?.success || res?.status === 1) {
          this.genericService.openSnackBar(res.message || 'Fee rule saved successfully', 'Success');
          this.dialogRef.close(this.data.mode === 'add' ? 'created' : 'updated');
        } else {
          this.genericService.openSnackBar(res?.message || 'Failed to save fee rule', 'Error');
          this.serverError = res?.message || 'Failed to save fee rule';
        }
      },
      error: (err) => {
        this.genericService.openSnackBar('Something went wrong while saving', 'Error');
        this.serverError = err?.error?.message || err?.message || 'Something went wrong while saving';
      },
    });
  }

  close() {
    this.dialogRef.close();
  }
}
