import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { SHARED_IMPORTS } from '../../shared/shared-imports';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { LoaderService } from '../../_service/loader/loader.service';
import { GenericService } from '../../_service/generic/generic.service'; // Updated import path
import { CdkDrag } from '@angular/cdk/drag-drop';
import { IlogiInputComponent } from '../../customInputComponents/ilogi-input/ilogi-input.component';
import { IlogiInputDateComponent } from '../../customInputComponents/ilogi-input-date/ilogi-input-date.component';
import { IlogiSelectComponent } from '../../customInputComponents/ilogi-select/ilogi-select.component';
import { Router, NavigationEnd } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-external-services-redirection-tracking',
  standalone: true,

  imports: [SHARED_IMPORTS, IlogiInputComponent, IlogiInputDateComponent, IlogiSelectComponent],
  templateUrl: './external-services-redirection-tracking.component.html',
  styleUrls: ['./external-services-redirection-tracking.component.scss']
})
export class ExternalServicesRedirectionTrackingComponent implements OnInit {
  form = new FormGroup({
    registrationCertificateNo: new FormControl<string>('', [Validators.required]),
    district: new FormControl<string>('', [Validators.required]),
    subDivision: new FormControl<string>('', [Validators.required]),
    block: new FormControl<string>('', [Validators.required]),
    pinCode: new FormControl<string>('', [Validators.required, Validators.pattern(/^\d{6}$/)]),
    address: new FormControl<string>('', [Validators.required]),
    name_of_deceased_worker: new FormControl<string>('', [Validators.required]),
    present_address: new FormControl<string>('', [Validators.required]),
    isMarried: new FormControl<string>('', [Validators.required]),
    type_beneficiary: new FormControl<string>('', [Validators.required]),
    dependent_beneficiary: new FormControl<string | null>(null),
    other_beneficiary_name: new FormControl<string | null>(null),
    date_of_death: new FormControl<Date | null>(null, [
      Validators.required,
      (control) => {
        if (control.value && control.value instanceof Date && control.value < new Date()) {
          return null;
        }
        return { custom: { status: true, message: 'Date of death must be in the past' } };
      }
    ]),
    mother_name: new FormControl<string>('', [Validators.required]),
    guardian_name: new FormControl<string>('', [Validators.required]),
    bankName: new FormControl<string>('', [Validators.required]),
    ifscCode: new FormControl<string>('', [Validators.required]),
    accountNumber: new FormControl<string>('', [Validators.required]),
    nameOnPassbook: new FormControl<string>('', [Validators.required]),
    death_certificate_number: new FormControl<string>('', [Validators.required]),
    nature_of_death: new FormControl<string>('', [Validators.required])
  });

  submitted = false;
  isViewMode = false;
  today = new Date();
  commonApplicationFormContractLabourDetails: any = {};
  typeOptions = [
    { id: '', name: 'Select' },
    { id: 'Married', name: 'Married' },
    { id: 'Unmarried', name: 'Unmarried' }
  ];
  typeOptionsNatureOfDeath = [
    { id: '', name: 'Select' },
    { id: 'Natural', name: 'Natural' },
    { id: 'Accidental', name: 'Accidental' }
  ];
  typeBeneficiaryOptions = [
    { id: '', name: 'Select' },
    { id: 'Dependent', name: 'Dependent' },
    { id: 'Other', name: 'Other' }
  ];

  errorMessages = {
    registrationCertificateNo: { required: 'Registration No. is required' },
    district: { required: 'District is required' },
    subDivision: { required: 'Sub Division is required' },
    block: { required: 'Block is required' },
    pinCode: { required: 'Pin Code is required', pattern: 'Please provide a valid 6-digit pin code' },
    address: { required: 'Address is required' },
    name_of_deceased_worker: { required: 'Name of deceased worker is required' },
    present_address: { required: 'Present address is required' },
    isMarried: { required: 'Please select marital status' },
    type_beneficiary: { required: 'Please select beneficiary type' },
    dependent_beneficiary: { required: 'Dependent beneficiary is required' },
    other_beneficiary_name: { required: 'Other beneficiary name is required' },
    date_of_death: { required: 'Date of death is required', custom: 'Date of death must be in the past' },
    mother_name: { required: 'Mother name is required' },
    guardian_name: { required: 'Guardian name is required' },
    bankName: { required: 'Bank name is required' },
    ifscCode: { required: 'IFSC code is required' },
    accountNumber: { required: 'Account number is required' },
    nameOnPassbook: { required: 'Name on passbook is required' },
    death_certificate_number: { required: 'Death certificate number is required' },
    nature_of_death: { required: 'Nature of death is required' }
  };

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private loaderService: LoaderService,
    private cdr: ChangeDetectorRef,
    private genericService: GenericService,
    private location: Location
  ) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const urlArr = event.url.replace(/^\/|\/$/g, '').split('/');
        if (urlArr[0] + '/' + urlArr[1] === 'other-services/view-labour-marriage-scheme') {
          this.isViewMode = true;
        }
      }
    });
  }

  ngOnInit(): void {
    this.loaderService.showLoader();
    setTimeout(() => {
      this.loaderService.hideLoader();
      this.cdr.detectChanges();
    }, 2000);

    // Subscribe to type_beneficiary changes
    this.form.get('type_beneficiary')?.valueChanges.subscribe(value => {
      const dependentControl = this.form.get('dependent_beneficiary');
      const otherControl = this.form.get('other_beneficiary_name');

      if (value === 'Dependent') {
        dependentControl?.setValidators([Validators.required]);
        otherControl?.clearValidators();
        otherControl?.setValue('');
      } else if (value === 'Other') {
        otherControl?.setValidators([Validators.required]);
        dependentControl?.clearValidators();
        dependentControl?.setValue('');
      } else {
        dependentControl?.clearValidators();
        otherControl?.clearValidators();
        dependentControl?.setValue('');
        otherControl?.setValue('');
      }
      dependentControl?.updateValueAndValidity();
      otherControl?.updateValueAndValidity();
      this.cdr.detectChanges();
    });
    this.getSavedData1();
    this.getSavedData();

  }

  getSavedData1(): void {
    this.loaderService.showLoader();
    this.genericService.getByConditions({}, 'api/get-static-content').subscribe({
      next: (res) => {
        if (res['status_code'] === 1) {
          this.commonApplicationFormContractLabourDetails = res['result'] || {};
          this.patchFormData();
        }
        this.loaderService.hideLoader();
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.loaderService.hideLoader();
        this.genericService.removeSessionAndReturn(error);
        this.cdr.detectChanges();
      }
    });
  }


  getSavedData() {
    // Simulate fetching data (replace with actual service call)
    this.commonApplicationFormContractLabourDetails = {
      scheme_specific_section_beneficiary_registration_number: 'REG123',
      address_section_district: '123~District Name',
      address_section_sub_division: '456~Sub Division Name',
      address_section_block: '789~Block Name',
      address_section_pin_code: '123456',
      present_address_of_the_applicant: '123 Main St',
      scheme_specific_section_name_of_deceased_worker: 'John Doe',
      date_of_death: '2023-09-15',



    };
    this.patchFormData();
  }

  patchFormData() {
    this.form.patchValue({
      registrationCertificateNo: this.commonApplicationFormContractLabourDetails.scheme_specific_section_beneficiary_registration_number || '',
      district: this.commonApplicationFormContractLabourDetails.address_section_district?.split('~')[1] || '',
      subDivision: this.commonApplicationFormContractLabourDetails.address_section_sub_division?.split('~')[1] || '',
      block: this.commonApplicationFormContractLabourDetails.address_section_block?.split('~')[1] || '',
      pinCode: this.commonApplicationFormContractLabourDetails.address_section_pin_code || '',
      address: this.commonApplicationFormContractLabourDetails.present_address_of_the_applicant || '',
      name_of_deceased_worker: this.commonApplicationFormContractLabourDetails.scheme_specific_section_name_of_deceased_worker || '',
      present_address: this.commonApplicationFormContractLabourDetails.present_address_of_the_applicant || '',
      date_of_death: this.commonApplicationFormContractLabourDetails.date_of_death ? new Date(this.commonApplicationFormContractLabourDetails.date_of_death) : null,
    });
  }

  // Getters for errors
  get registrationCertificateNoErrors() { return this.form.get('registrationCertificateNo')?.errors || null; }
  get districtErrors() { return this.form.get('district')?.errors || null; }
  get subDivisionErrors() { return this.form.get('subDivision')?.errors || null; }
  get blockErrors() { return this.form.get('block')?.errors || null; }
  get pinCodeErrors() { return this.form.get('pinCode')?.errors || null; }
  get addressErrors() { return this.form.get('address')?.errors || null; }
  get nameOfDeceasedWorkerErrors() { return this.form.get('name_of_deceased_worker')?.errors || null; }
  get presentAddressErrors() { return this.form.get('present_address')?.errors || null; }
  get isMarriedErrors() { return this.form.get('isMarried')?.errors || null; }
  get typeBeneficiaryErrors() { return this.form.get('type_beneficiary')?.errors || null; }
  get dependentBeneficiaryErrors() { return this.form.get('dependent_beneficiary')?.errors || null; }
  get otherBeneficiaryNameErrors() { return this.form.get('other_beneficiary_name')?.errors || null; }
  get dateOfDeathErrors() { return this.form.get('date_of_death')?.errors || null; }
  get motherNameErrors() { return this.form.get('mother_name')?.errors || null; }
  get guardianNameErrors() { return this.form.get('guardian_name')?.errors || null; }
  get bankNameErrors() { return this.form.get('bankName')?.errors || null; }
  get ifscCodeErrors() { return this.form.get('ifscCode')?.errors || null; }
  get accountNumberErrors() { return this.form.get('accountNumber')?.errors || null; }
  get nameOnPassbookErrors() { return this.form.get('nameOnPassbook')?.errors || null; }
  get deathCertificateNumberErrors() { return this.form.get('death_certificate_number')?.errors || null; }
  get natureOfDeathErrors() { return this.form.get('nature_of_death')?.errors || null; }

  onSubmit() {
    this.submitted = true;
    this.cdr.detectChanges();
    if (this.form.valid) {
      console.log('Form submitted with value:', this.form.value);
    } else {
      console.log('Form is invalid');
    }
  }

  backClicked() {
    this.location.back();
  }
}