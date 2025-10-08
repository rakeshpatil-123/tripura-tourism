import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { GenericService } from '../../_service/generic/generic.service';

@Component({
  selector: 'app-service-fee-rule-dialog',
  standalone: true,
  templateUrl: './service-fee-rule-dialog.component.html',
  styleUrls: ['./service-fee-rule-dialog.component.scss'],
  imports: [
    MatInputModule,
    MatSelectModule,
    MatDialogModule,
    MatIconModule,
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatFormFieldModule,
    MatButtonModule,
  ],
})
export class ServiceFeeRuleDialogComponent implements OnInit {
  feeRuleForm: FormGroup;
  questions: any[] = [];
  apiRules: any[] = [];
  renewalCycles: any[] = [];
  displayedColumns: string[] = [
    'condition_operator',
    'condition_value_start',
    'condition_value_end',
    'fixed_fee',
    'calculated_fee',
    'fixed_calculated_fee',
    'per_unit_fee',
    'priority',
    'status',
  ];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ServiceFeeRuleDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { service: any; mode: 'add' | 'edit'; rules: any },
    private genericService: GenericService
  ) {
    this.feeRuleForm = this.fb.group({
      fee_type: ['calculated'],
      question_id: [null],
      condition_operator: [null],
      condition_value_start: [null],
      condition_value_end: [null],
      fixed_fee: [null],
      calculated_fee: [null],
      fixed_calculated_fee: [null],
      per_unit_fee: [null],
      priority: [1],
      status: ['1'],
      renewal_cycle_id: [null],
    });
  }

  ngOnInit(): void {
    this.loadRenewalCycles();
    if (this.data.mode === 'edit' && this.data.rules) {
      this.apiRules = [this.data.rules];
      const r = this.data.rules;

      this.feeRuleForm.patchValue({
        fee_type: r.fee_type ?? 'calculated',
        question_id: r.question_id ? String(r.question_id) : null,
        condition_operator: r.condition_operator ?? null,
        condition_value_start: r.condition_value_start ? String(r.condition_value_start) : null,
        condition_value_end: r.condition_value_end ? String(r.condition_value_end) : null,
        fixed_fee: r.fixed_fee && r.fixed_fee !== '-' ? String(r.fixed_fee) : null,
        calculated_fee: r.calculated_fee && r.calculated_fee !== '-' ? String(r.calculated_fee) : null,
        fixed_calculated_fee: r.fixed_calculated_fee && r.fixed_calculated_fee !== '-' ? String(r.fixed_calculated_fee) : null,
        per_unit_fee: r.per_unit_fee && r.per_unit_fee !== '-' ? String(r.per_unit_fee) : null,
        priority: r.priority ?? 1,
        status: r.status ? String(r.status) : '1',
        renewal_cycle_id: r.renewal_cycle_id ? (r.renewal_cycle_id) : null,
      });
    }

    this.applyDynamicValidations(
      this.feeRuleForm.get('fee_type')?.value,
      this.feeRuleForm.get('condition_operator')?.value
    );

    this.feeRuleForm.get('fee_type')?.valueChanges.subscribe((type) => {
      this.applyDynamicValidations(type, this.feeRuleForm.get('condition_operator')?.value);
    });

    this.feeRuleForm.get('condition_operator')?.valueChanges.subscribe((operator) => {
      this.applyDynamicValidations(this.feeRuleForm.get('fee_type')?.value, operator);
    });
    this.loadQuestions(!!this.data.service?.id ? this.data.service.id : this.data.rules.service_id);
  }

  private applyDynamicValidations(feeType: string, operator: string) {
    const fixedFee = this.feeRuleForm.get('fixed_fee');
    const questionId = this.feeRuleForm.get('question_id');
    const condStart = this.feeRuleForm.get('condition_value_start');
    const condEnd = this.feeRuleForm.get('condition_value_end');
    const calcFee = this.feeRuleForm.get('calculated_fee');
    const fixedCalcFee = this.feeRuleForm.get('fixed_calculated_fee');
    const perUnitFee = this.feeRuleForm.get('per_unit_fee');

    [fixedFee, questionId, condStart, condEnd, calcFee, fixedCalcFee, perUnitFee].forEach(c => c?.clearValidators());

    // if (feeType === 'hardcoded') {
    //   fixedFee?.setValidators([Validators.required]); 
    // } else {
    //   condStart?.setValidators([Validators.required]);
    //   if (operator === 'between') condEnd?.setValidators([Validators.required]);
    //   calcFee?.setValidators([Validators.min(0)]);
    //   fixedCalcFee?.setValidators([Validators.min(0)]);
    //   perUnitFee?.setValidators([Validators.min(0)]);
    // }

    [fixedFee, questionId, condStart, condEnd, calcFee, fixedCalcFee, perUnitFee].forEach(c => c?.updateValueAndValidity());
  }

  submit() {
    if (this.feeRuleForm.invalid) {
      this.feeRuleForm.markAllAsTouched();
      this.genericService.openSnackBar('Please fill required fields correctly', 'error');
      return;
    }

    const now = new Date();
    const created_at = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    const raw = this.feeRuleForm.value;
    const payloadRule: any = {
      id: this.data.mode === 'edit' ? this.apiRules[0].id : undefined,
      fee_type: raw.fee_type,
      question_id: raw.question_id ? String(raw.question_id) : null,
      condition_operator: raw.condition_operator ?? null,
      condition_value_start: raw.condition_value_start ? String(raw.condition_value_start) : null,
      condition_value_end: raw.condition_value_end ? String(raw.condition_value_end) : null,
      fixed_fee: raw.fixed_fee ? String(raw.fixed_fee) : null,
      calculated_fee: raw.calculated_fee ? String(raw.calculated_fee) : null,
      fixed_calculated_fee: raw.fixed_calculated_fee ? String(raw.fixed_calculated_fee) : null,
      per_unit_fee: raw.per_unit_fee ? String(raw.per_unit_fee) : null,
      priority: String(raw.priority ?? 1),
      status: String(raw.status ?? '1'),
      service_id: String(this.data?.rules?.service_id ?? this.data?.service?.id ?? raw?.service_id ?? 1),
      renewal_cycle_id: this.data.mode === 'edit' ? (this.apiRules[0].renewal_cycle_id) : (raw.renewal_cycle_id ?? null),
      rules: raw.rules ?? 'base_fee + (units * per_unit_fee)',
      created_at: this.data.mode === 'edit' ? this.apiRules[0].created_at : created_at,
    };

    const requestBody = { rules: [payloadRule] };

    if (this.data.mode === 'add') {
      this.genericService.addServiceFeeRule(requestBody).subscribe(
        (response: any) => {
          if (response?.status) {
            this.genericService.openSnackBar(response.message || 'Fee rule added successfully', 'Success');
            this.feeRuleForm.reset({
              fee_type: 'calculated',
              question_id: null,
              condition_operator: null,
              condition_value_start: null,
              condition_value_end: null,
              fixed_fee: null,
              calculated_fee: null,
              fixed_calculated_fee: null,
              per_unit_fee: null,
              priority: this.apiRules.length + 1,
              status: '1',
              renewal_cycle_id: null,
            });
          } else {
            this.genericService.openSnackBar(response?.message || 'Failed to add fee rule', 'error');
          }
        },
        () => this.genericService.openSnackBar('Failed to add fee rule', 'error')
      );
    } else {
      this.genericService.updateServiceFeeRule(requestBody).subscribe(
        (response: any) => {
          if (response?.status) {
            this.genericService.openSnackBar(response.message || 'Fee rule updated successfully', 'Success');
            this.dialogRef.close('updated');
          } else {
            this.genericService.openSnackBar(response?.message || 'Failed to update rule', 'error');
          }
        },
        () => this.genericService.openSnackBar('Failed to update rule', 'error')
      );
    }
  }
  loadRenewalCycles(): void {
    const sid = this.data.service?.id ?? this.data.service?.service_id;
    if (!sid) return;
    this.genericService
      .getRenewalCycle(sid)
      .subscribe({
        next: (res: any) => {
          if (res?.status) this.renewalCycles = Array.isArray(res.data) ? res.data : [{ id: 1, name: 'Annual Renewal' }, { id: 2, name: '3-Year Renewal' }];
        },
      });
  }

  trackByCycle(index: number, item: any): number {
    return item.id;
  }
  loadQuestions(serviceId: number): void {
    this.genericService.getServiceQuestionnaires(serviceId).subscribe({
      next: (res: any) => {
        if (res.status === 1 && res.data?.length) {
          const uniqueQuestions = res.data.filter(
            (v: any, i: number, a: any[]) => a.findIndex(q => q.id === v.id) === i
          );
          this.questions = uniqueQuestions;
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  close() {
    this.dialogRef.close();
  }
}