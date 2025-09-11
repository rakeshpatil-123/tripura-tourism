// management.component.ts
import { Component, ChangeDetectorRef, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
// Import your custom components
import { IlogiInputComponent } from '../../../../customInputComponents/ilogi-input/ilogi-input.component';
import { IlogiFileUploadComponent } from '../../../../customInputComponents/ilogi-file-upload/ilogi-file-upload.component';
import { IlogiInputDateComponent } from '../../../../customInputComponents/ilogi-input-date/ilogi-input-date.component';
import { IlogiSelectComponent } from '../../../../customInputComponents/ilogi-select/ilogi-select.component';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { GenericService } from '../../../../_service/generic/generic.service';

@Component({
  selector: 'app-management',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IlogiInputComponent,
    IlogiInputDateComponent,
    IlogiFileUploadComponent,
    IlogiSelectComponent,
  ],
  templateUrl: './management.component.html',
  styleUrls: ['./management.component.scss'],
})
export class ManagementComponent implements OnInit, OnDestroy {
  ownerPhotoPreview: string | null = null;
  managerPhotoPreview: string | null = null;
  signatureOwnerPreview: string | null = null;
  signatureOccupierPreview: string | null = null;
  signatureManagerPreview: string | null = null;

  private blobUrls: Map<File, string> = new Map();
  form: FormGroup;

  statusOfPersonOptions = [
    { id: 'Owner', name: 'Owner' },
    { id: 'Managing Director', name: 'Managing Director' },
    { id: 'CEO', name: 'CEO' },
    { id: 'Chairman', name: 'Chairman' },
    { id: 'Partner', name: 'Partner' },
    { id: 'COO', name: 'COO' },
    { id: 'CFO', name: 'CFO' },
    { id: 'Director', name: 'Director' },
    { id: 'VP', name: 'VP' },
    { id: 'Chief Operating Officer', name: 'Chief Operating Officer' },
    { id: 'Chief Financial Officer', name: 'Chief Financial Officer' },
    { id: 'Chief Executive Officer', name: 'Chief Executive Officer' },
    { id: 'Vice President', name: 'Vice President' },
    { id: 'President', name: 'President' },
  ];

  socialStatusOptions = [
    { id: 'General', name: 'General' },
    { id: 'SC', name: 'SC' },
    { id: 'ST', name: 'ST' },
    { id: 'OBC', name: 'OBC' },
  ];

  yesNoOptions = [
    { id: 'YES', name: 'Yes' },
    { id: 'NO', name: 'No' },
  ];
  womenEntrepreneurOptions = [
    { id: 'YES', name: 'Yes' },
    { id: 'NO', name: 'No' },
  ];
  submitted = false;
  constructor(
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private apiService: GenericService,
    private sanitizer: DomSanitizer
  ) {
    this.form = this.fb.group({
      // Owner Details
      ownerDetailsName: ['', Validators.required],
      ownerDetailsFathersName: ['', Validators.required],
      ownerDetailsResidentialAddress: ['', Validators.required],
      ownerDetailsPoliceStation: ['', Validators.required],
     ownerDetailsPin: ['', [Validators.required, Validators.pattern(/^[0-9]{6}$/)]], 
    ownerDetailsMobile: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]], 
    ownerDetailsAlternateMobile: ['', Validators.pattern(/^[0-9]{10}$/)],
    ownerDetailsAadharNo: ['', [Validators.required, Validators.pattern(/^[0-9]{12}$/)]], 
      ownerDetailsStatus: ['', Validators.required],
      ownerDetailsEmail: ['', [Validators.required, Validators.email]],
      ownerDetailsDob: ['', Validators.required],
      ownerDetailsSocialStatus: ['', Validators.required],
      ownerDetailsIsDifferentlyAbled: ['', Validators.required],
      ownerDetailsIsWomenEntrepreneur: ['', Validators.required],
      ownerDetailsIsMinority: ['', Validators.required],
      ownerDetailsPhoto: ['', Validators.required],
      // Manager Details
      managerDetailsName: ['', Validators.required],
      managerDetailsFathersName: ['', Validators.required],
      managerDetailsResidentialAddress: ['', Validators.required],
      managerDetailsPoliceStation: ['', Validators.required],
      managerDetailsPin: ['', [Validators.required, Validators.pattern(/^[0-9]{6}$/)]], 
    managerDetailsMobile: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]], 
    managerDetailsAadharNo: ['', [Validators.required, Validators.pattern(/^[0-9]{12}$/)]], 
      managerDetailsDob: [''],
      managerDetailsPhoto: [null, Validators.required],

      // Signatures
      signatureAuthorizationOfOwner: [null, Validators.required],
      factoryOccupiersSignature: [null, Validators.required],
      factoryManagersSignature: [null, Validators.required],

      // Arrays
      partnerDetails: this.fb.array([]),
      boardOfDirectors: this.fb.array([]),
      chiefAdministrativeHead: this.fb.array([]),
    });
  }

  ngOnInit(): void {
    this.loadExistingData();
  }

  loadExistingData(): void {
    this.apiService
      .getByConditions({}, 'api/caf/management-details-view')
      .subscribe({
        next: (res: any) => {
          if (res && res.status === 1) {
            this.patchFormWithData(res);
          } else {
            console.warn('Invalid or empty response:', res);
          }
        },
        error: (err) => {
          console.error('Error fetching management details:', err);
        },
      });
  }

  patchFormWithData(data: any): void {
    if (!data || !data.management_details) {
      console.warn('No data or management_details found to patch.');
      return;
    }

    const management = data.management_details;

    this.ownerPhotoPreview = management.owner_details_photo || null;
    this.managerPhotoPreview = management.manager_details_photo || null;
    this.signatureOwnerPreview =
      management.signature_authorization_of_owner || null;
    this.signatureOccupierPreview =
      management.factory_occupiers_signature || null;
    this.signatureManagerPreview =
      management.factory_managers_signature || null;

    this.form.patchValue({
      ownerDetailsName: management.owner_details_name || '',
      ownerDetailsFathersName: management.owner_details_fathers_name || '',
      ownerDetailsResidentialAddress:
        management.owner_details_residential_address || '',
      ownerDetailsPoliceStation: management.owner_details_police_station || '',
      ownerDetailsPin: management.owner_details_pin || '',
      ownerDetailsMobile: management.owner_details_mobile || '',
      ownerDetailsAlternateMobile:
        management.owner_details_alternate_mobile || '',
      ownerDetailsAadharNo: management.owner_aadhar_no || '',
      ownerDetailsStatus: management.owner_details_status || '',
      ownerDetailsEmail: management.owner_details_email || '',
      ownerDetailsDob: management.owner_details_dob
        ? new Date(management.owner_details_dob)
        : null,
      ownerDetailsSocialStatus: management.owner_details_social_status || '',
      ownerDetailsIsDifferentlyAbled:
        management.owner_details_is_differently_abled || 'NO',
      ownerDetailsIsWomenEntrepreneur:
        management.owner_details_is_women_entrepreneur || 'NO',
      ownerDetailsIsMinority: management.owner_details_is_minority || 'NO',

      managerDetailsName: management.manager_details_name || '',
      managerDetailsFathersName: management.manager_details_fathers_name || '',
      managerDetailsResidentialAddress:
        management.manager_details_residential_address || '',
      managerDetailsPoliceStation:
        management.manager_details_police_station || '',
      managerDetailsPin: management.manager_details_pin || '',
      managerDetailsMobile: management.manager_details_mobile || '',
      managerDetailsAadharNo: management.manager_details_aadhar_no || '',
      managerDetailsDob: management.manager_details_dob
        ? new Date(management.manager_details_dob)
        : null,
    });

    this.partnerDetails.clear();
    if (data.partner_details && Array.isArray(data.partner_details)) {
      data.partner_details.forEach((p: any) => this.addPartner(p));
    }

    this.boardOfDirectors.clear();
    if (data.board_of_directors && Array.isArray(data.board_of_directors)) {
      data.board_of_directors.forEach((d: any) => this.addDirector(d));
    }

    this.chiefAdministrativeHead.clear();
    if (
      data.chief_administrative_heads &&
      Array.isArray(data.chief_administrative_heads)
    ) {
      data.chief_administrative_heads.forEach((c: any) =>
        this.addChiefAdministrativeHead(c)
      );
    }

    this.cdr.markForCheck();
  }

  onOwnerPhotoSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.ownerPhotoPreview = e.target.result;
        this.form.get('ownerDetailsPhoto')?.setValue(file);
      };
      reader.readAsDataURL(file);
    }
  }
  onManagerPhotoSelected(event: any) {
    const file = event.target?.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.managerPhotoPreview = e.target.result;
        this.form.get('managerDetailsPhoto')?.setValue(file);
        this.cdr.markForCheck();
      };
      reader.onerror = (err) => {
        console.error('Error reading manager photo file', err);
      };
      reader.readAsDataURL(file);
    }
  }

  buildFormData(isDraft: boolean = false): FormData {
    const formData = new FormData();
    const raw = this.form.getRawValue();

    if (isDraft) {
      formData.append('save_data', '1');
    }

    // Owner Details
    formData.append('owner_details_name', raw.ownerDetailsName);
    formData.append('owner_details_fathers_name', raw.ownerDetailsFathersName);
    formData.append(
      'owner_details_residential_address',
      raw.ownerDetailsResidentialAddress
    );
    formData.append(
      'owner_details_police_station',
      raw.ownerDetailsPoliceStation
    );
    formData.append('owner_details_pin', raw.ownerDetailsPin);
    formData.append('owner_details_mobile', raw.ownerDetailsMobile);
    formData.append(
      'owner_details_alternate_mobile',
      raw.ownerDetailsAlternateMobile || ''
    );
    formData.append('owner_aadhar_no', raw.ownerDetailsAadharNo);
    formData.append('owner_details_status', raw.ownerDetailsStatus);
    formData.append(
      'owner_details_email',
      (raw.ownerDetailsEmail || '').trim()
    );
    formData.append('owner_details_dob', this.formatDate(raw.ownerDetailsDob));
    formData.append(
      'owner_details_social_status',
      raw.ownerDetailsSocialStatus
    );
    formData.append(
      'owner_details_is_differently_abled',
      raw.ownerDetailsIsDifferentlyAbled
    );
    formData.append(
      'owner_details_is_women_entrepreneur',
      raw.ownerDetailsIsWomenEntrepreneur || 'NO'
    );
    formData.append('owner_details_is_minority', raw.ownerDetailsIsMinority);

    if (raw.ownerDetailsPhoto) {
      formData.append('owner_details_photo', raw.ownerDetailsPhoto);
    }

    // Manager Details
    formData.append('manager_details_name', raw.managerDetailsName);
    formData.append(
      'manager_details_fathers_name',
      raw.managerDetailsFathersName
    );
    formData.append(
      'manager_details_residential_address',
      raw.managerDetailsResidentialAddress
    );
    formData.append(
      'manager_details_police_station',
      raw.managerDetailsPoliceStation
    );
    formData.append('manager_details_pin', raw.managerDetailsPin);
    formData.append('manager_details_mobile', raw.managerDetailsMobile);
    formData.append('manager_details_aadhar_no', raw.managerDetailsAadharNo);
    formData.append(
      'manager_details_dob',
      this.formatDate(raw.managerDetailsDob)
    );

    if (raw.managerDetailsPhoto) {
      formData.append('manager_details_photo', raw.managerDetailsPhoto);
    }

    // Signature Files
    if (raw.signatureAuthorizationOfOwner) {
      formData.append(
        'signature_authorization_of_owner',
        raw.signatureAuthorizationOfOwner
      );
    }
    if (raw.factoryOccupiersSignature) {
      formData.append(
        'factory_occupiers_signature',
        raw.factoryOccupiersSignature
      );
    }
    if (raw.factoryManagersSignature) {
      formData.append(
        'factory_managers_signature',
        raw.factoryManagersSignature
      );
    }

    // Partner Details
    raw.partnerDetails.forEach((p: any, i: number) => {
      formData.append(`partner_details[${i}][name]`, p.name);
      formData.append(
        `partner_details[${i}][fathers_name]`,
        p.fatherName || ''
      );
      formData.append(`partner_details[${i}][age]`, p.age || '');
      formData.append(`partner_details[${i}][sex]`, p.sex || '');
      formData.append(
        `partner_details[${i}][social_status]`,
        p.socialStatus || ''
      );
      formData.append(`partner_details[${i}][profession]`, p.profession || '');
      formData.append(
        `partner_details[${i}][permanent_address]`,
        p.permanentAddress || ''
      );
      formData.append(`partner_details[${i}][mobile_no]`, p.mobile || '');
      formData.append(
        `partner_details[${i}][date_of_birth]`,
        this.formatDate(p.dob)
      );
      formData.append(
        `partner_details[${i}][date_of_joining]`,
        this.formatDate(p.dateOfJoining)
      );
      if (p.idProof)
        formData.append(`partner_details[${i}][id_proof]`, p.idProof);
      if (p.signature)
        formData.append(`partner_details[${i}][signature]`, p.signature);
    });

    // Board of Directors
    raw.boardOfDirectors.forEach((d: any, i: number) => {
      formData.append(`board_of_directors[${i}][name]`, d.name);
      formData.append(
        `board_of_directors[${i}][permanent_address]`,
        d.permanentAddress || ''
      );
      formData.append(
        `board_of_directors[${i}][mobile_number]`,
        d.mobile || ''
      );
    });

    // Chief Administrative Heads
    raw.chiefAdministrativeHead.forEach((c: any, i: number) => {
      formData.append(`chief_administrative_heads[${i}][name]`, c.name);
      formData.append(
        `chief_administrative_heads[${i}][permanent_address]`,
        c.permanentAddress || ''
      );
      formData.append(
        `chief_administrative_heads[${i}][mobile_number]`,
        c.mobile || ''
      );
    });

    return formData;
  }

  private formatDate(date: any): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0]; // YYYY-MM-DD
  }

  saveAsDraft(): void {
     this.submitted = true;
    const payload = this.buildFormData(true);
    this.submitForm(payload, true);
  }

  onSubmit(): void {
    // if (this.form.invalid) {
    //   this.form.markAllAsTouched();
    //   this.apiService.openSnackBar('Please fix all errors in the form.', 'error');
    //   return;
    // }
 this.submitted = true;
  
  this.markFormGroupTouched(this.form);
    const payload = this.buildFormData(false);
    this.submitForm(payload, false);
  }

   submitForm(payload: FormData, isDraft: boolean): void {
     console.log('Submitting form with payload:', payload);
    this.apiService
      .getByConditions(payload, 'api/caf/management-details-store')
      .subscribe({
        next: (res) => {
          console.log('API Success:', res);
          const message = isDraft
            ? 'Draft saved successfully!'
            : 'Management details submitted successfully!';
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

  // --- Form Array Getters ---
  get partnerDetails(): FormArray {
    return this.form.get('partnerDetails') as FormArray;
  }

  get boardOfDirectors(): FormArray {
    return this.form.get('boardOfDirectors') as FormArray;
  }

  get chiefAdministrativeHead(): FormArray {
    return this.form.get('chiefAdministrativeHead') as FormArray;
  }

  // --- Array Methods ---
  addPartner(data?: any): void {
    const group = this.fb.group({
      name: [data?.name || '', Validators.required],
      fatherName: [data?.fathers_name || ''],
      age: [data?.age || ''],
      sex: [data?.sex || ''],
      socialStatus: [data?.social_status || ''],
      profession: [data?.profession || ''],
      permanentAddress: [data?.permanent_address || ''],
      mobile: [data?.mobile_no || '', Validators.required],
      dob: [data?.date_of_birth ? new Date(data.date_of_birth) : ''],
      dateOfJoining: [
        data?.date_of_joining ? new Date(data.date_of_joining) : '',
      ],
      idProof: [
        data?.id_proof
          ? this.createFileFromUrl(data.id_proof, 'id_proof.png')
          : null,
      ],
      signature: [
        data?.signature
          ? this.createFileFromUrl(data.signature, 'signature.png')
          : null,
      ],
    });
    this.partnerDetails.push(group);
    this.cdr.markForCheck();
  }

  addDirector(data?: any): void {
    this.boardOfDirectors.push(
      this.fb.group({
        name: [data?.name || '', Validators.required],
        permanentAddress: [data?.permanent_address || ''],
        mobile: [data?.mobile_number || '', Validators.required],
      })
    );
    this.cdr.markForCheck();
  }

  addChiefAdministrativeHead(data?: any): void {
    this.chiefAdministrativeHead.push(
      this.fb.group({
        name: [data?.name || '', Validators.required],
        permanentAddress: [data?.permanent_address || '', Validators.required],
        mobile: [data?.mobile_number || '', Validators.required],
      })
    );
    this.cdr.markForCheck();
  }

  removePartner(index: number): void {
    this.partnerDetails.removeAt(index);
    this.cdr.markForCheck();
  }

  removeDirector(index: number): void {
    this.boardOfDirectors.removeAt(index);
    this.cdr.markForCheck();
  }

  removeChiefAdministrativeHead(index: number): void {
    this.chiefAdministrativeHead.removeAt(index);
    this.cdr.markForCheck();
  }

  removeFile(fieldName: string): void {
    this.form.get(fieldName)?.reset();
    this.cdr.markForCheck();
  }

  getImageUrl(photo: string): SafeUrl {
    return this.sanitizer.bypassSecurityTrustUrl(photo);
  }

  private async createFileFromUrl(
    url: string,
    filename: string
  ): Promise<File | null> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        console.error('Failed to fetch file from URL:', response.statusText);
        return null;
      }

      const blob = await response.blob();
      // You can set type as blob.type or force specific MIME type
      const file = new File([blob], filename, { type: blob.type });
      return file;
    } catch (error) {
      console.error('Error converting URL to File:', error);
      return null;
    }
  }

  ngOnDestroy(): void {
    this.blobUrls.forEach((url) => URL.revokeObjectURL(url));
    this.blobUrls.clear();
  }
  getFileName(file: File | string | null): string {
    if (!file) return '';
    if (file instanceof File) return file.name;
    return file.split('/').pop() || 'file';
  }

  onImageError(event: any): void {
    event.target.src = 'assets/img/profile-picture.jpg';
  }

  private markFormGroupTouched(formGroup: FormGroup | FormArray): void {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      if (control instanceof FormGroup || control instanceof FormArray) {
        this.markFormGroupTouched(control);
      } else {
        control?.markAsTouched();
      }
    });
  }

  // Fix your error message method
  // getErrorMessage(fieldName: string): string {
  //   const control = this.form.get(fieldName);
  //   if (control?.errors && (control.touched || this.submitted)) {
  //     if (control.errors['required']) {
  //       return `${this.getFieldLabel(fieldName)} is required`;
  //     }
  //     if (control.errors['pattern']) {
  //       switch (fieldName) {
  //         case 'ownerDetailsPin':
  //         case 'managerDetailsPin':
  //           return 'Pin must be 6 digits';
  //         case 'ownerDetailsMobile':
  //         case 'ownerDetailsAlternateMobile':
  //         case 'managerDetailsMobile':
  //           return 'Mobile must be 10 digits';
  //         case 'ownerDetailsAadharNo':
  //         case 'managerDetailsAadharNo':
  //           return 'Aadhar must be 12 digits';
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

  // getFieldLabel(fieldName: string): string {
  //   const labels: { [key: string]: string } = {
  //     // Owner Details
  //     ownerDetailsName: 'Owner Name',
  //     ownerDetailsFathersName: "Owner Father's Name",
  //     ownerDetailsResidentialAddress: 'Owner Address',
  //     ownerDetailsPoliceStation: 'Owner Police Station',
  //     ownerDetailsPin: 'Owner Pin',
  //     ownerDetailsMobile: 'Owner Mobile',
  //     ownerDetailsAlternateMobile: 'Owner Alternate Mobile',
  //     ownerDetailsAadharNo: 'Owner Aadhar',
  //     ownerDetailsStatus: 'Owner Status',
  //     ownerDetailsEmail: 'Owner Email',
  //     ownerDetailsDob: 'Owner Date of Birth',
  //     ownerDetailsSocialStatus: 'Owner Social Status',
  //     ownerDetailsIsDifferentlyAbled: 'Differently Abled Status',
  //     ownerDetailsIsWomenEntrepreneur: 'Women Entrepreneur Status',
  //     ownerDetailsIsMinority: 'Minority Status',
  //     ownerDetailsPhoto: 'Owner Photo',

  //     // Manager Details
  //     managerDetailsName: 'Manager Name',
  //     managerDetailsFathersName: "Manager Father's Name",
  //     managerDetailsResidentialAddress: 'Manager Address',
  //     managerDetailsPoliceStation: 'Manager Police Station',
  //     managerDetailsPin: 'Manager Pin',
  //     managerDetailsMobile: 'Manager Mobile',
  //     managerDetailsAadharNo: 'Manager Aadhar',
  //     managerDetailsDob: 'Manager Date of Birth',
  //     managerDetailsPhoto: 'Manager Photo',

  //     // Signatures
  //     signatureAuthorizationOfOwner: 'Owner Authorization Signature',
  //     factoryOccupiersSignature: 'Factory Occupier Signature',
  //     factoryManagersSignature: 'Factory Manager Signature',
  //   };

  //   return labels[fieldName] || fieldName;
  // }
}
