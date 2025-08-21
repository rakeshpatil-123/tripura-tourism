// management.component.ts
import { Component, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';

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


export class ManagementComponent implements OnDestroy{

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
    { id: '1', name: 'Yes' },
    { id: '0', name: 'No' },
  ];

  

  constructor(private fb: FormBuilder, private cdr: ChangeDetectorRef, private apiService : GenericService) {

    
    this.form = this.fb.group({
      // Owner Details
      name: ['', Validators.required],
      fatherName: ['', Validators.required],
      residentialAddress: ['', Validators.required],
      policeStation: ['', Validators.required],
      pin: ['', Validators.required],
      mobile: ['', Validators.required],
      alternateMobileNo: [''],
      dob: ['', Validators.required],
      statusOfPerson: ['', Validators.required],
      socialStatus: ['', Validators.required],
      minority: ['', Validators.required],
      differentlyAbled: ['', Validators.required],
      aadharNo: ['', Validators.required],
      employerPhoto: [null, Validators.required],

      // Manager Details
      managerName: ['', Validators.required],
      managerFatherName: ['', Validators.required],
      managerResidentialAddress: ['', Validators.required],
      managerPoliceStation: ['', Validators.required],
      managerPin: ['', Validators.required],
      managerMobile: ['', Validators.required],
      managerAadharNo: ['', Validators.required],
      managerDOB: ['', Validators.required],
      managerEmployerPhoto: [null, Validators.required],

      signedAuthorizationDocument: [null, Validators.required],
      signatureOfOccupierOfFactory: [null, Validators.required],
      signatureOfManagerOfFactory: [null, Validators.required],

      // Arrays
      partnerDetails: this.fb.array([]),
      boardOfDirectors: this.fb.array([]),
      chiefAdministrativeHead: this.fb.array([]),
    });
  }

  buildFormData(isDraft: boolean = false): FormData {
  const formData = new FormData();
  const raw = this.form.getRawValue();

  if (isDraft) {
      formData.append('save_data', '1'); // 👈 only for draft
    }


  // Owner details
  formData.append("owner_details_name", raw.name);
  formData.append("owner_details_fathers_name", raw.fatherName);
  formData.append("owner_details_residential_address", raw.residentialAddress);
  formData.append("owner_details_police_station", raw.policeStation);
  formData.append("owner_details_pin", raw.pin);
  formData.append("owner_details_mobile", raw.mobile);
  formData.append("owner_details_alternate_mobile", raw.alternateMobileNo || '');
  formData.append("owner_details_aadhar_no", raw.aadharNo);
  formData.append("owner_details_status", raw.statusOfPerson);
  formData.append("owner_details_email", raw.email || '');
  formData.append("owner_details_dob", this.formatDate(raw.dob));
  formData.append("owner_details_social_status", raw.socialStatus);
  formData.append("owner_details_is_differently_abled", raw.differentlyAbled);
  formData.append("owner_details_is_women_entrepreneur", raw.womenEntrepreneur || 'NO');
  formData.append("owner_details_is_minority", raw.minority);

  if (raw.employerPhoto) {
    formData.append("owner_details_photo", raw.employerPhoto);
  }

  // Manager details
  formData.append("manager_details_name", raw.managerName);
  formData.append("manager_details_fathers_name", raw.managerFatherName);
  formData.append("manager_details_residential_address", raw.managerResidentialAddress);
  formData.append("manager_details_police_station", raw.managerPoliceStation);
  formData.append("manager_details_pin", raw.managerPin);
  formData.append("manager_details_mobile", raw.managerMobile);
  formData.append("manager_details_aadhar_no", raw.managerAadharNo);
  formData.append("manager_details_dob", this.formatDate(raw.managerDOB));
  
  if (raw.managerEmployerPhoto) {
    formData.append("manager_details_photo", raw.managerEmployerPhoto);
  }

  // Files
  if (raw.signedAuthorizationDocument) {
    formData.append("signature_authorization_of_owner", raw.signedAuthorizationDocument);
  }
  if (raw.signatureOfOccupierOfFactory) {
    formData.append("factory_occupiers_signature", raw.signatureOfOccupierOfFactory);
  }
  if (raw.signatureOfManagerOfFactory) {
    formData.append("factory_managers_signature", raw.signatureOfManagerOfFactory);
  }

  // Partner details array
  raw.partnerDetails.forEach((p: any, i: number) => {
    formData.append(`partner_details[${i}][name]`, p.name);
    formData.append(`partner_details[${i}][fathers_name]`, p.fatherName);
    formData.append(`partner_details[${i}][age]`, p.age || '');
    formData.append(`partner_details[${i}][sex]`, p.sex || '');
    formData.append(`partner_details[${i}][social_status]`, p.socialStatus || '');
    formData.append(`partner_details[${i}][profession]`, p.profession || '');
    formData.append(`partner_details[${i}][permanent_address]`, p.permanentAddress || '');
    formData.append(`partner_details[${i}][mobile_no]`, p.mobile);
    formData.append(`partner_details[${i}][date_of_birth]`, this.formatDate(p.dob));
    formData.append(`partner_details[${i}][date_of_joining]`, this.formatDate(p.dateOfJoining));
    if (p.idProof) formData.append(`partner_details[${i}][id_proof]`, p.idProof);
    if (p.signature) formData.append(`partner_details[${i}][signature]`, p.signature);
  });

  // Directors
  raw.boardOfDirectors.forEach((d: any, i: number) => {
    formData.append(`board_of_directors[${i}][name]`, d.name);
    formData.append(`board_of_directors[${i}][permanent_address]`, d.permanentAddress || '');
    formData.append(`board_of_directors[${i}][mobile_number]`, d.mobile);
  });

  // Chief Administrative Heads
  raw.chiefAdministrativeHead.forEach((c: any, i: number) => {
    formData.append(`chief_administrative_heads[${i}][name]`, c.name);
    formData.append(`chief_administrative_heads[${i}][permanent_address]`, c.permanentAddress);
    formData.append(`chief_administrative_heads[${i}][mobile_number]`, c.mobile);
  });

  return formData;
}

private formatDate(date: any): string {
  if (!date) return '';
  const d = new Date(date);
  return d.toISOString().split('T')[0]; // YYYY-MM-DD
}
  saveAsDraft(): void {
    // if (this.form.invalid) {
    //   this.form.markAllAsTouched();
    //   return;
    // }
    const payload = this.buildFormData(true);
    this.apiService.getByConditions(payload, 'api/caf/management-details-store' ).subscribe({
      next: (res) => {
        console.log('Draft Saved:', res);
        alert('Form saved as draft successfully!');
      },
      error: (err) => console.error('Error saving draft:', err),
    });
  }

onSubmit(): void {
  console.log('Submit clicked');

  // if (this.form.invalid) {
  //   console.log('Form is invalid', this.form.errors, this.form);
  //   // this.form.markAllAsTouched();

  //   // Add this: check which controls are invalid
  //   Object.keys(this.form.controls).forEach(key => {
  //     const ctrl = this.form.get(key);
  //     if (ctrl?.invalid) {
  //       console.log(`Invalid control: ${key}`, ctrl.errors, ctrl.value);
  //     }
  //   });

  //   return;
  // }

  console.log('Form is valid, submitting...');
  const payload = this.buildFormData(false);
  console.log('Payload:', payload); // Check if FormData has data

  this.apiService.getByConditions(payload, 'api/caf/management-details-store').subscribe({
    next: (res: any) => {
      console.log('Form Submitted:', res);
      alert('Form submitted successfully!');
    },
    error: (err: any) => {
      console.error('Error submitting form:', err);
      alert('Submission failed. Check console.');
    },
  });
}
  // ngOnInit(): void {
  //   this.form.patchValue({
  //     name: 'Deeptanu Bhowmik',
  //     fatherName: 'Rabindra Bhowmik',
  //     residentialAddress: 'Joynagar',
  //     policeStation: 'West P.S',
  //     pin: '799001',
  //     mobile: '7085542194',
  //     dob: new Date('2001-01-01'),
  //     statusOfPerson: 'Managing Director',
  //     minority: '0',
  //     differentlyAbled: '0',
  //     aadharNo: '654376544321',

  //     managerName: 'Moumita Sinha',
  //     managerFatherName: 'Surajit Sinha',
  //     managerResidentialAddress: 'Behind Hindi H. S School',
  //     managerPoliceStation: 'West P.S',
  //     managerPin: '799005',
  //     managerMobile: '9233108616',
  //     managerAadharNo: '552303161494',
  //     managerDOB: new Date('1999-01-08'),
  //   });

  //   this.addChiefAdministrativeHead();
  //   this.addChiefAdministrativeHead();
  // }

  get partnerDetails(): FormArray {
    return this.form.get('partnerDetails') as FormArray;
  }

  get boardOfDirectors(): FormArray {
    return this.form.get('boardOfDirectors') as FormArray;
  }

  get chiefAdministrativeHead(): FormArray {
    return this.form.get('chiefAdministrativeHead') as FormArray;
  }

  addPartner(): void {
    this.partnerDetails.push(
      this.fb.group({
        name: ['', Validators.required],
        fatherName: ['', Validators.required],
        age: [''],
        sex: [''],
        socialStatus: [''],
        profession: [''],
        permanentAddress: [''],
        mobile: ['', Validators.required],
        dob: ['', Validators.required],
        dateOfJoining: [''],
        idProof: [null],
        signature: [null],
      })
    );
    this.cdr.markForCheck();
  }

  removePartner(index: number): void {
    this.partnerDetails.removeAt(index);
    this.cdr.markForCheck();
  }

  addDirector(): void {
    this.boardOfDirectors.push(
      this.fb.group({
        name: ['', Validators.required],
        permanentAddress: [''],
        mobile: ['', Validators.required],
      })
    );
    this.cdr.markForCheck();
  }

  removeDirector(index: number): void {
    this.boardOfDirectors.removeAt(index);
    this.cdr.markForCheck();
  }

  addChiefAdministrativeHead(): void {
    this.chiefAdministrativeHead.push(
      this.fb.group({
        name: ['', Validators.required],
        permanentAddress: ['', Validators.required],
        mobile: ['', Validators.required],
      })
    );
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

getImageUrl(file: File | string | null): string {
    if (!file) return 'assets/img/profile-picture.jpg';

    if (file instanceof File) {
      if (this.blobUrls.has(file)) {
        return this.blobUrls.get(file)!;
      }
      const url = URL.createObjectURL(file);
      this.blobUrls.set(file, url);
      return url;
    }

    return file;
  }

    ngOnDestroy(): void {
    this.blobUrls.forEach(url => URL.revokeObjectURL(url));
    this.blobUrls.clear();
  }
}
