import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { IlogiSelectComponent } from '../../../../customInputComponents/ilogi-select/ilogi-select.component';
import { IlogiInputComponent } from '../../../../customInputComponents/ilogi-input/ilogi-input.component';
import { IlogiInputDateComponent } from '../../../../customInputComponents/ilogi-input-date/ilogi-input-date.component';
import { GenericService } from '../../../../_service/generic/generic.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-enterprise-form',
  templateUrl: './enterprise-details.component.html',
  styleUrls: ['./enterprise-details.component.scss'],
  imports: [
    IlogiSelectComponent,
    IlogiInputComponent,
    IlogiInputDateComponent,
    ReactiveFormsModule,
    CommonModule,
  ],
})
export class EnterpriseDetailsComponent implements OnInit {
  enterpriseForm!: FormGroup;
  submitted = false;

  constitutionOptions = [
    { id: 'Pvt. Ltd', name: 'Pvt. Ltd' },
    { id: 'LLP', name: 'LLP' },
    { id: 'Partnership', name: 'Partnership' },
    { id: 'Proprietorship', name: 'Proprietorship' },
  ];

  proposalOptions = [
    { id: 'New Unit', name: 'New Unit' },
    { id: 'Existing Unit', name: 'Existing Unit' },
  ];

  constructor(private fb: FormBuilder, private apiService: GenericService) {}

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
      commissioningDate: ['', Validators.required],
    });
    this.loadEnterpriseDetails();
  }

  // loadEnterpriseDetails(): void {
  //   this.apiService
  //     .getByConditions({}, 'api/caf/core-application-show-enterprise-detail')
  //     .subscribe({
  //       next: (res: any) => {
  //         if (res && res.data) {
  //           const data = res.data;

  //           this.enterpriseForm = this.fb.group({
  //             constitution: [
  //               data.constitution_of_enterprise || '',
  //               Validators.required,
  //             ],
  //             enterpriseName: [data.enterprise_name || '', Validators.required],
  //             businessPan: [data.business_pan_no || '', Validators.required],

  //             registeredAddress: [data.enterprise_address || ''],
  //             habitation: [data.habitation_area_building || ''],
  //             pin: [
  //               data.pin || '',
  //               [Validators.required, Validators.pattern(/^[0-9]{6}$/)],
  //             ],
  //             postOffice: [data.post_office || '', Validators.required],
  //             policeStation: [data.police_station || '', Validators.required],

  //             repName: [
  //               data.authorized_representative_name || '',
  //               Validators.required,
  //             ],
  //             designation: [data.authorized_representative_designation || ''],
  //             aadhar: [
  //               data.authorized_representative_aadhar_no || '',
  //               [Validators.required, Validators.pattern(/^[0-9]{12}$/)],
  //             ],
  //             mobile: [
  //               data.authorized_representative_mobile_no || '',
  //               [Validators.required, Validators.pattern(/^[0-9]{10}$/)],
  //             ],
  //             phone: [data.authorized_representative_phone_no || ''],
  //             email: [
  //               data.authorized_representative_email_id || '',
  //               [Validators.required, Validators.email],
  //             ],
  //             altMobile: [
  //               data.authorized_representative_alternate_mobile_no || '',
  //             ],
  //             proposalFor: [data.proposal_for || '', Validators.required],
  //             commissioningDate: [
  //               data.proposed_date_of_commissioning
  //                 ? new Date(data.proposed_date_of_commissioning)
  //                 : '',
  //               Validators.required,
  //             ],
  //           });
  //         }
  //       },
  //       error: (err: any) => {
  //         console.error('Failed to load enterprise details:', err);
  //       },
  //     });
  // }

  loadEnterpriseDetails(): void {
  this.apiService
    .getByConditions({}, 'api/caf/core-application-show-enterprise-detail')
    .subscribe({
      next: (res: any) => {
        if (res && res.data) {
          const data = res.data;

          this.enterpriseForm.patchValue({
            constitution: data.constitution_of_enterprise || '',
            enterpriseName: data.enterprise_name || '',
            businessPan: data.business_pan_no || '',
            registeredAddress: data.enterprise_address || '',
            habitation: data.habitation_area_building || '',
            pin: data.pin || '',
            postOffice: data.post_office || '',
            policeStation: data.police_station || '',
            repName: data.authorized_representative_name || '',
            designation: data.authorized_representative_designation || '',
            aadhar: data.authorized_representative_aadhar_no || '',
            mobile: data.authorized_representative_mobile_no || '',
            phone: data.authorized_representative_phone_no || '',
            email: data.authorized_representative_email_id || '',
            altMobile: data.authorized_representative_alternate_mobile_no || '',
            proposalFor: data.proposal_for || '',
            commissioningDate: data.proposed_date_of_commissioning
              ? new Date(data.proposed_date_of_commissioning)
              : '',
          });
        }
      },
      error: (err: any) => {
        console.error('Failed to load enterprise details:', err);
      },
    });
}

  onSave(isDraft: boolean = false): void {
    this.submitted = true;

    Object.keys(this.enterpriseForm.controls).forEach((key) => {
      const control = this.enterpriseForm.get(key);
      control?.markAsTouched();
    });

    // if (this.enterpriseForm.invalid) {
    //   this.apiService.openSnackBar(
    //     'Please correct the errors in the form.',
    //     'error'
    //   );
    //   return;
    // }
    // if (this.enterpriseForm.valid) {
    const formValue = this.enterpriseForm.value;

    const payload: any = {
      constitution_of_enterprise: formValue.constitution,
      enterprise_name: formValue.enterpriseName,
      business_pan_no: formValue.businessPan,
      enterprise_address: formValue.registeredAddress,
      enterprises_registered_address: formValue.registeredAddress,
      habitation_area_building: formValue.habitation,
      pin: formValue.pin,
      post_office: formValue.postOffice,
      police_station: formValue.policeStation,
      authorized_representative_name: formValue.repName,
      authorized_representative_designation: formValue.designation,
      authorized_representative_aadhar_no: formValue.aadhar,
      authorized_representative_mobile_no: formValue.mobile,
      authorized_representative_email_id: formValue.email,
      authorized_representative_alternate_mobile_no: formValue.altMobile,
      authorized_representative_phone_no: formValue.phone,
      proposal_for: formValue.proposalFor,
      proposed_date_of_commissioning: formValue.commissioningDate,
    };

    if (isDraft) {
      payload.save_data = 1;
    }

    // console.log('Final Payload:', payload);

    this.apiService
      .getByConditions(
        payload,
        'api/caf/core-application-store-enterprise-detail'
      )
      .subscribe({
        next: (res: any) => {
          // console.log('API Success:', res);
          // this.genericService.openSnackBar('Something went wrong while saving unit details', 'Error');
          if (isDraft) {
            this.apiService.openSnackBar(
              'Draft saved successfully!',
              'success'
            );
          } else {
            this.apiService.openSnackBar(
              'Enterprise details submitted successfully!',
              'success'
            );
          }
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
    // } else {
    //   console.warn('Form Invalid');
    // }
  }

  // Add this helper method
  // getErrorMessage(fieldName: string): string {
  //   const control = this.enterpriseForm.get(fieldName);
  //   if (control?.errors && (control.touched || this.submitted)) {
  //     if (control.errors['required']) {
  //       return `${this.getFieldLabel(fieldName)} is required`;
  //     }
  //     if (control.errors['pattern']) {
  //       switch (fieldName) {
  //         case 'pin':
  //           return 'Pin must be 6 digits';
  //         case 'aadhar':
  //           return 'Aadhar must be 12 digits';
  //         case 'mobile':
  //           return 'Mobile must be 10 digits';
  //         default:
  //           return 'Invalid format';
  //       }
  //     }
  //     if (control.errors['email']) {
  //       return 'Please enter a valid email';
  //     }
  //   }
  //   return '';
  // }

  getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      pin: 'Pin',
      email: 'Email',
      mobile: 'Mobile',
      aadhar: 'Aadhar',
      enterpriseName: 'Enterprise Name',
      // Add more field labels as needed
    };
    return labels[fieldName] || fieldName;
  }
}
