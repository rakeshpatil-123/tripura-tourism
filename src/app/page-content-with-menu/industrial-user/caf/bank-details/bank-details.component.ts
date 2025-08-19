import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IlogiInputComponent } from '../../../../customInputComponents/ilogi-input/ilogi-input.component';
import { IlogiSelectComponent } from '../../../../customInputComponents/ilogi-select/ilogi-select.component';

@Component({
  selector: 'app-bank-details',
  templateUrl: './bank-details.component.html',
  styleUrls: ['./bank-details.component.scss'],
  imports: [IlogiInputComponent, IlogiSelectComponent, ReactiveFormsModule]
})
export class BankDetailsComponent implements OnInit {
  @Input() parentForm!: FormGroup; // if you’re embedding into a bigger form
  bankDetailsForm!: FormGroup;
  AccountTypes = [
    { id: 'Savings', name: 'Savings' },
    { id: 'Current', name: 'Current' }
  ];


  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.bankDetailsForm = this.fb.group({
      accountHolderName: ['', [Validators.required]],
      accountNumber: ['', [Validators.required]],
      bankName: ['', [Validators.required]],
      branchName: ['', [Validators.required]],
      ifscCode: ['', [Validators.required, Validators.pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/)]],
      accountType: ['', [Validators.required]]
    });

    // attach to parent if available
    if (this.parentForm) {
      this.parentForm.addControl('bankDetails', this.bankDetailsForm);
    }
  }

  // helper getters (optional, for template validation display)
  get f() {
    return this.bankDetailsForm.controls;
  }
}
