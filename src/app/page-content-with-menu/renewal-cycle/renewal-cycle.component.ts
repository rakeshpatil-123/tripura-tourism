import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatMomentDateModule, provideMomentDateAdapter } from '@angular/material-moment-adapter';
import { GenericService } from '../../_service/generic/generic.service';
import moment, { Moment } from 'moment';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from "@angular/material/icon";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-renewal-cycle',
  templateUrl: './renewal-cycle.component.html',
  styleUrls: ['./renewal-cycle.component.scss'],
  standalone: true,
  imports: [
    MatCheckboxModule,
    MatInputModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatDatepickerModule,
    MatMomentDateModule,
    MatButtonModule,
    MatIconModule,
    CommonModule
  ],
  providers: [provideMomentDateAdapter()],
})
export class RenewalCycleComponent implements OnInit {
  renewalForm!: FormGroup;
  isSubmitting = false;
  today: Moment = moment();
  showLateFeeFields = false;


  constructor(
    private fb: FormBuilder,
    private genericService: GenericService,
    private dialogRef: MatDialogRef<RenewalCycleComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { service: any; mode: 'add' | 'edit'; rules: any }
  ) { }

  ngOnInit(): void {
    this.renewalForm = this.fb.group({
      service_id: [this.data.service?.service_id || this.data.service?.id, Validators.required],
      renewal_title: ['', Validators.required],
      renewal_period: ['custom'],
      renewal_period_custom: [null],
      renewal_target_days: [0, [Validators.min(0)]],
      renewal_window_days: [0, [Validators.min(0)]],
      fixed_renewal_start_date: [this.today],
      fixed_renewal_end_date: [this.today],
      late_fee_applicable: ['no'],
      late_fee_calculation_dynamic: ['no'],
      late_fee_fixed_amount: ['0'],
      late_fee_calculated_amount: ['0'],
      allow_renewal_input_form: ['yes'],
      is_active: ['1'],
    });

    if (this.data.mode === 'edit' && this.data.service) {
      const cycle = this.data.service;
      this.renewalForm.patchValue({
        ...cycle,
        fixed_renewal_start_date: cycle.fixed_renewal_start_date
          ? moment(cycle.fixed_renewal_start_date)
          : this.today,
        fixed_renewal_end_date: cycle.fixed_renewal_end_date
          ? moment(cycle.fixed_renewal_end_date)
          : this.today,
      });

      this.showLateFeeFields = cycle.late_fee_applicable === 'yes';
    }
  }
  submit(): void {
    if (this.renewalForm.invalid) {
      this.renewalForm.markAllAsTouched();
      this.genericService.openSnackBar('Please fill all required fields', 'Error');
      return;
    }

    const startDate = moment(this.renewalForm.value.fixed_renewal_start_date);
    const endDate = moment(this.renewalForm.value.fixed_renewal_end_date);

    if (startDate.isBefore(this.today, 'day')) {
      this.genericService.openSnackBar('Start date cannot be earlier than today', 'Error');
      return;
    }

    if (endDate.isBefore(startDate, 'day')) {
      this.genericService.openSnackBar('End date cannot be earlier than start date', 'Error');
      return;
    }

    this.isSubmitting = true;

    const formValue = this.renewalForm.value;
    const renewalData = {
      ...Object.fromEntries(
        Object.entries(this.renewalForm.value).map(([key, val]) => {
          if (moment.isMoment(val)) return [key, val.format('YYYY-MM-DD')];
          return [key, val === null ? null : String(val)];
        })
      ),
      id: this.data.service.id,
    };

    const payload = {
      renewals: [renewalData],
    };

    const api$ =
      this.data.mode === 'edit'
        ? this.genericService.updateRenewalCycle(payload)
        : this.genericService.addRenewalCycle(payload);

    api$.subscribe({
      next: (res: any) => {
        this.isSubmitting = false;
        if (res.status || res.success) {
          this.genericService.openSnackBar(res.message || 'Saved successfully', 'Success');
          this.dialogRef.close(res.data?.[0] || this.renewalForm.value);
        } else {
          this.genericService.openSnackBar('Failed to save renewal cycle', 'Error');
        }
      },
      error: () => {
        this.isSubmitting = false;
        this.genericService.openSnackBar('Something went wrong', 'Error');
      },
    });
  }

  cancel(): void {
    this.dialogRef.close();
  }

  close(): void {
    this.dialogRef.close();
  }

  onLateFeeChange(value: string) {
    this.showLateFeeFields = value === 'yes';
    if (!this.showLateFeeFields) {
      this.renewalForm.patchValue({
        late_fee_fixed_amount: '0',
        late_fee_calculated_amount: '0',
      });
    }
  }
}
