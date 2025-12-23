// bank-details.component.ts
import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IlogiInputComponent } from '../../../../customInputComponents/ilogi-input/ilogi-input.component';
import { IlogiSelectComponent } from '../../../../customInputComponents/ilogi-select/ilogi-select.component';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { GenericService } from '../../../../_service/generic/generic.service';

@Component({
  selector: 'app-bank-details',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IlogiInputComponent, IlogiSelectComponent],
  templateUrl: './bank-details.component.html',
  styleUrls: ['./bank-details.component.scss'],
})
export class BankDetailsComponent implements OnInit, OnDestroy {
  @Input() parentForm?: FormGroup; // Optional: if used inside a parent form

  bankDetailsForm!: FormGroup;

  AccountTypes = [
    { id: 'Saving', name: 'Saving' },
    { id: 'Current', name: 'Current' },
  ];

  constructor(private fb: FormBuilder, private apiService: GenericService) {}

  ngOnInit(): void {
    this.initForm();
    this.loadExistingData();
  }

  initForm(): void {
    this.bankDetailsForm = this.fb.group({
      accountHolderName: ['', [Validators.required]],
      accountNumber: ['', [Validators.required]],
      bankName: ['', [Validators.required]],
      branchName: ['', [Validators.required]],
      ifscCode: ['', [Validators.required, Validators.pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/)]],
      accountType: ['', [Validators.required]],
    });

    // Optional: Attach to parent form
    if (this.parentForm) {
      this.parentForm.addControl('bankDetails', this.bankDetailsForm);
    }
  }

loadExistingData(): void {
  this.apiService.getByConditions({}, 'api/caf/bank-detail-view').subscribe({
    next: (res: any) => {
      if (res && res.status === 1 && res.data) {
        this.bankDetailsForm.patchValue({
          accountHolderName: res.data.account_holder_name || '',
          accountNumber: res.data.account_number || '',
          bankName: res.data.bank_name || '',
          branchName: res.data.branch_name || '',
          ifscCode: res.data.ifsc_code || '',
          accountType: res.data.account_type || '',
        });
      }
    },
    error: (err) => {
      this.apiService.openSnackBar(`${err.error.message}`, 'error');
    }
  });
}
  // --- Build JSON Payload ---
  buildPayload(isDraft: boolean = false): any {
    const raw = this.bankDetailsForm.getRawValue();

    const payload:{[key: string]: any} = {
      bank_name: raw.bankName,
      branch_name: raw.branchName,
      account_type: raw.accountType,
      account_holder_name: raw.accountHolderName,
      account_number: raw.accountNumber,
      ifsc_code: raw.ifscCode,
    };

    if (isDraft) {
      payload['save_data'] = '1';
    }

    return payload;
  }

  // --- Save as Draft ---
  saveAsDraft(): void {
    const payload = this.buildPayload(true);
    this.submitForm(payload, true);
  }

  // --- Submit ---
  onSubmit(): void {
    if (this.bankDetailsForm.invalid) {
      this.bankDetailsForm.markAllAsTouched();
      this.apiService.openSnackBar('Please fill all required fields.', 'error');
      return;
    }

    const payload = this.buildPayload(false);
    this.submitForm(payload, false);
  }

  // --- Submit to API ---
  private submitForm(payload: any, isDraft: boolean): void {
    this.apiService.getByConditions(payload, 'api/caf/bank-detail-store').subscribe({
      next: (res) => {
        console.log('Success:', res);
        const message = isDraft
          ? 'Bank details saved as draft!'
          : 'Bank details submitted successfully!';
        this.apiService.openSnackBar(message, 'success');
      },
       error: (err: any) => {
          console.error('API Error:', err);

          const errorResponse = err?.error; 
          if (errorResponse?.errors) {
            const allErrors: string[] = [];

            Object.keys(errorResponse.errors).forEach((key) => {
              const fieldErrors = errorResponse.errors[key];
              if (Array.isArray(fieldErrors)) {
                allErrors.push(...fieldErrors);
              }
            });

            allErrors.forEach((msg, index) => {
              setTimeout(() => {
                this.apiService.openSnackBar(msg, 'error');
              }, index * 1200); 
            });
          } else {
            this.apiService.openSnackBar(
              errorResponse?.message || 'Something went wrong!',
              'error'
            );
          }
        },
    });
  }

  get f() {
    return this.bankDetailsForm.controls;
  }

  ngOnDestroy(): void {
    if (this.parentForm && this.parentForm.contains('bankDetails')) {
      this.parentForm.removeControl('bankDetails');
    }
  }
}