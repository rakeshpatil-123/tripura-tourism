import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { SHARED_IMPORTS } from '../../shared/shared-imports';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { LoaderService } from '../../_service/loader/loader.service';
import { GenericService } from '../../_service/generic/generic.service';
import { IlogiInputComponent } from '../../customInputComponents/ilogi-input/ilogi-input.component';
import { IlogiInputDateComponent } from '../../customInputComponents/ilogi-input-date/ilogi-input-date.component';
import { IlogiSelectComponent } from '../../customInputComponents/ilogi-select/ilogi-select.component';
import { Router, NavigationEnd } from '@angular/router';
import { Location } from '@angular/common';

interface FieldConfig {
  key: string;
  type: 'text' | 'textarea' | 'select' | 'date';
  label: string;
  placeholder: string;
  maxlength?: number;
  rows?: number;
  mandatory: boolean;
  validators: any[];
  errorMessages: { [key: string]: string };
  options?: { id: string; name: string }[];
  conditionalMandatory?: string;
  conditionalValue?: string;
  dateConfig?: {
    monthsRange?: number;
    pastDateErrorMessage?: string;
  };
}

@Component({
  selector: 'app-external-services-redirection-tracking',
  standalone: true,
  imports: [SHARED_IMPORTS, IlogiInputComponent, IlogiInputDateComponent, IlogiSelectComponent],
  templateUrl: './external-services-redirection-tracking.component.html',
  styleUrls: ['./external-services-redirection-tracking.component.scss']
})
export class ExternalServicesRedirectionTrackingComponent implements OnInit {
  form!: FormGroup;
  submitted = false;
  isViewMode = false;
  today = new Date();
  commonApplicationFormContractLabourDetails: any = {};

  // DRY: Single configuration object for all fields
  fieldConfigs: FieldConfig[] = [
    {
      key: 'registrationCertificateNo',
      type: 'text',
      label: 'Registration No.',
      placeholder: 'Enter',
      maxlength: 255,
      mandatory: true,
      validators: [Validators.required],
      errorMessages: { required: 'Registration No. is required' }
    },
    {
      key: 'district',
      type: 'text',
      label: 'District',
      placeholder: 'Enter',
      maxlength: 255,
      mandatory: true,
      validators: [Validators.required],
      errorMessages: { required: 'District is required' }
    },
    {
      key: 'subDivision',
      type: 'text',
      label: 'Sub Division',
      placeholder: 'Enter',
      maxlength: 255,
      mandatory: true,
      validators: [Validators.required],
      errorMessages: { required: 'Sub Division is required' }
    },
    {
      key: 'block',
      type: 'text',
      label: 'Block',
      placeholder: 'Enter',
      maxlength: 255,
      mandatory: true,
      validators: [Validators.required],
      errorMessages: { required: 'Block is required' }
    },
    {
      key: 'pinCode',
      type: 'text',
      label: 'Pin Code',
      placeholder: 'Enter',
      maxlength: 6,
      mandatory: true,
      validators: [Validators.required, Validators.pattern(/^\d{6}$/)],
      errorMessages: { 
        required: 'Pin Code is required', 
        pattern: 'Please provide a valid 6-digit pin code' 
      }
    },
    {
      key: 'address',
      type: 'textarea',
      label: 'Address',
      placeholder: 'Enter',
      rows: 4,
      mandatory: true,
      validators: [Validators.required],
      errorMessages: { required: 'Address is required' }
    },
    {
      key: 'name_of_deceased_worker',
      type: 'text',
      label: 'Name of Deceased Worker',
      placeholder: 'Enter',
      maxlength: 255,
      mandatory: true,
      validators: [Validators.required],
      errorMessages: { required: 'Name of deceased worker is required' }
    },
    {
      key: 'present_address',
      type: 'textarea',
      label: 'Present Address',
      placeholder: 'Enter',
      rows: 4,
      mandatory: true,
      validators: [Validators.required],
      errorMessages: { required: 'Present address is required' }
    },
    {
      key: 'isMarried',
      type: 'select',
      label: 'Whether the worker is married',
      placeholder: 'Select',
      mandatory: true,
      validators: [Validators.required],
      errorMessages: { required: 'Please select marital status' },
      options: [
        { id: '', name: 'Select' },
        { id: 'Married', name: 'Married' },
        { id: 'Unmarried', name: 'Unmarried' }
      ]
    },
    {
      key: 'type_beneficiary',
      type: 'select',
      label: 'Type of Beneficiary',
      placeholder: 'Select',
      mandatory: true,
      validators: [Validators.required],
      errorMessages: { required: 'Please select beneficiary type' },
      options: [
        { id: '', name: 'Select' },
        { id: 'Dependent', name: 'Dependent' },
        { id: 'Other', name: 'Other' }
      ]
    },
    {
      key: 'dependent_beneficiary',
      type: 'text',
      label: 'Dependent Beneficiary',
      placeholder: 'Enter',
      maxlength: 255,
      mandatory: false,
      validators: [],
      errorMessages: { required: 'Dependent beneficiary is required' },
      conditionalMandatory: 'type_beneficiary',
      conditionalValue: 'Dependent'
    },
    {
      key: 'other_beneficiary_name',
      type: 'text',
      label: 'Other Beneficiary Name',
      placeholder: 'Enter',
      maxlength: 255,
      mandatory: false,
      validators: [],
      errorMessages: { required: 'Other beneficiary name is required' },
      conditionalMandatory: 'type_beneficiary',
      conditionalValue: 'Other'
    },
    {
      key: 'date_of_death',
      type: 'date',
      label: 'Date of Death',
      placeholder: 'DD-MM-YYYY',
      mandatory: true,
      validators: [
        Validators.required,
        (control: any) => {
          if (control.value && control.value instanceof Date && control.value < new Date()) {
            return null;
          }
          return { custom: { status: true, message: 'Date of death must be in the past' } };
        }
      ],
      errorMessages: { 
        required: 'Date of death is required', 
        custom: 'Date of death must be in the past' 
      },
      dateConfig: {
        monthsRange: 6,
        pastDateErrorMessage: 'Date of death must be within the last 6 months.'
      }
    },
    {
      key: 'mother_name',
      type: 'text',
      label: 'Mother Name',
      placeholder: 'Enter',
      maxlength: 255,
      mandatory: true,
      validators: [Validators.required],
      errorMessages: { required: 'Mother name is required' }
    },
    {
      key: 'guardian_name',
      type: 'text',
      label: 'Guardian Name',
      placeholder: 'Enter',
      maxlength: 255,
      mandatory: true,
      validators: [Validators.required],
      errorMessages: { required: 'Guardian name is required' }
    },
    {
      key: 'bankName',
      type: 'text',
      label: 'Bank Name',
      placeholder: 'Enter',
      maxlength: 255,
      mandatory: true,
      validators: [Validators.required],
      errorMessages: { required: 'Bank name is required' }
    },
    {
      key: 'ifscCode',
      type: 'text',
      label: 'IFSC Code',
      placeholder: 'Enter',
      maxlength: 11,
      mandatory: true,
      validators: [Validators.required],
      errorMessages: { required: 'IFSC code is required' }
    },
    {
      key: 'accountNumber',
      type: 'text',
      label: 'Account Number',
      placeholder: 'Enter',
      maxlength: 20,
      mandatory: true,
      validators: [Validators.required],
      errorMessages: { required: 'Account number is required' }
    },
    {
      key: 'nameOnPassbook',
      type: 'text',
      label: 'Name on Passbook',
      placeholder: 'Enter',
      maxlength: 255,
      mandatory: true,
      validators: [Validators.required],
      errorMessages: { required: 'Name on passbook is required' }
    },
    {
      key: 'death_certificate_number',
      type: 'text',
      label: 'Death Certificate Number',
      placeholder: 'Enter',
      maxlength: 255,
      mandatory: true,
      validators: [Validators.required],
      errorMessages: { required: 'Death certificate number is required' }
    },
    {
      key: 'nature_of_death',
      type: 'select',
      label: 'Nature of Death',
      placeholder: 'Select',
      mandatory: true,
      validators: [Validators.required],
      errorMessages: { required: 'Nature of death is required' },
      options: [
        { id: '', name: 'Select' },
        { id: 'Natural', name: 'Natural' },
        { id: 'Accidental', name: 'Accidental' }
      ]
    }
  ];

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
    this.initializeForm();
    this.setupConditionalValidation();
    this.loadData();
  }

  // DRY: Dynamic form initialization
  private initializeForm(): void {
    const formControls: { [key: string]: FormControl } = {};
    
    this.fieldConfigs.forEach(config => {
      const initialValue = config.type === 'date' ? null : '';
      formControls[config.key] = new FormControl(initialValue, config.validators);
    });

    this.form = new FormGroup(formControls);
  }

  // DRY: Setup conditional validation
  private setupConditionalValidation(): void {
    this.fieldConfigs.forEach(config => {
      if (config.conditionalMandatory) {
        this.form.get(config.conditionalMandatory)?.valueChanges.subscribe(value => {
          const control = this.form.get(config.key);
          if (value === config.conditionalValue) {
            control?.setValidators([Validators.required]);
          } else {
            control?.clearValidators();
            control?.setValue('');
          }
          control?.updateValueAndValidity();
          this.cdr.detectChanges();
        });
      }
    });
  }

  private loadData(): void {
    this.loaderService.showLoader();
    setTimeout(() => {
      this.loaderService.hideLoader();
      this.cdr.detectChanges();
    }, 2000);

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
    const data = this.commonApplicationFormContractLabourDetails;
    this.form.patchValue({
      registrationCertificateNo: data.scheme_specific_section_beneficiary_registration_number || '',
      district: data.address_section_district?.split('~')[1] || '',
      subDivision: data.address_section_sub_division?.split('~')[1] || '',
      block: data.address_section_block?.split('~')[1] || '',
      pinCode: data.address_section_pin_code || '',
      address: data.present_address_of_the_applicant || '',
      name_of_deceased_worker: data.scheme_specific_section_name_of_deceased_worker || '',
      present_address: data.present_address_of_the_applicant || '',
      date_of_death: data.date_of_death ? new Date(data.date_of_death) : null,
    });
  }

  // DRY: Generic error getter
  getFieldErrors(fieldKey: string): any {
    return this.form.get(fieldKey)?.errors || null;
  }

  // DRY: Check if field is conditionally mandatory
  isConditionallyMandatory(config: FieldConfig): boolean {
    if (!config.conditionalMandatory) return config.mandatory;
    return this.form.get(config.conditionalMandatory)?.value === config.conditionalValue;
  }

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