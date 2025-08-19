import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IlogiSelectComponent } from "../../../../customInputComponents/ilogi-select/ilogi-select.component";
import { IlogiInputComponent } from "../../../../customInputComponents/ilogi-input/ilogi-input.component";
import { IlogiInputDateComponent } from '../../../../customInputComponents/ilogi-input-date/ilogi-input-date.component';

@Component({
  selector: 'app-enterprise-form',
  templateUrl: './enterprise-details.component.html',
  styleUrls: ['./enterprise-details.component.scss'],
  imports: [IlogiSelectComponent, IlogiInputComponent, IlogiInputDateComponent, ReactiveFormsModule]
})
export class EnterpriseFormComponent implements OnInit {
  enterpriseForm!: FormGroup;
  submitted = false;

  constitutionOptions = [
    { id: 'pvt', name: 'Pvt. Ltd' },
    { id: 'llp', name: 'LLP' },
    { id: 'partnership', name: 'Partnership' },
    { id: 'proprietorship', name: 'Proprietorship' }
  ];

  proposalOptions = [
    { id: 'new', name: 'New Unit' },
    { id: 'existing', name: 'Existing Unit' }
  ];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.enterpriseForm = this.fb.group({
      constitution: ['', Validators.required],
      enterpriseName: ['', Validators.required],
      businessPan: ['', Validators.required],

      registeredAddress: [''],
      habitation: [''],
      pin: ['', [Validators.required, Validators.pattern(/^[0-9]{6}$/)]],
      postOffice: ['', Validators.required],
      policeStation: ['', Validators.required],

      repName: ['', Validators.required],
      designation: [''],
      aadhar: ['', [Validators.required, Validators.pattern(/^[0-9]{12}$/)]],
      mobile: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      phone: [''],
      email: ['', [Validators.required, Validators.email]],
      altMobile: [''],
      proposalFor: ['', Validators.required],
      commissioningDate: ['', Validators.required]
    });
  }

  onSave(): void {
    this.submitted = true;
    if (this.enterpriseForm.valid) {
      console.log('Form Data:', this.enterpriseForm.value);
    }
  }
}
