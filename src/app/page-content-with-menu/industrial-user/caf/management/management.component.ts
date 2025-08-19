// management.component.ts
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule,  } from '@angular/forms';
import { CommonModule } from '@angular/common';

// Import your custom components
import { IlogiInputComponent } from '../../../../customInputComponents/ilogi-input/ilogi-input.component';
import { IlogiFileUploadComponent } from '../../../../customInputComponents/ilogi-file-upload/ilogi-file-upload.component';
import { IlogiInputDateComponent } from '../../../../customInputComponents/ilogi-input-date/ilogi-input-date.component';
import { IlogiSelectComponent } from '../../../../customInputComponents/ilogi-select/ilogi-select.component';

@Component({
  selector: 'app-management',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IlogiInputComponent,
    IlogiInputDateComponent,
    IlogiFileUploadComponent,
    IlogiSelectComponent
  ],
  templateUrl: './management.component.html',
  styleUrls: ['./management.component.scss'],
})
export class ManagementComponent implements OnInit {
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
  { id: 'President', name: 'President' }
];

socialStatusOptions = [
  { id: 'General', name: 'General' },
  { id: 'SC', name: 'SC' },
  { id: 'ST', name: 'ST' },
  { id: 'OBC', name: 'OBC' }
];

yesNoOptions = [
  { id: '1', name: 'Yes' },
  { id: '0', name: 'No' }
];

  constructor(private fb: FormBuilder, private cdr: ChangeDetectorRef) {
    this.form = this.fb.group({
      // --- Owner Details ---
      name: ['', Validators.required],
      fatherName: ['', Validators.required],
      residentialAddress: ['', Validators.required],
      policeStation: ['', Validators.required],
      pin: ['', Validators.required],
      mobile: ['', Validators.required],
      alternateMobileNo: [''],
      email: ['', [Validators.required, Validators.email]],
      dob: ['', Validators.required],
      statusOfPerson: ['', Validators.required],
      socialStatus: [''],
      minority: ['', Validators.required],
      differentlyAbled: ['', Validators.required],
      aadharNo: [''],
      employerPhoto: [null],

      // --- Manager Details ---
      managerName: [''],
      managerFatherName: [''],
      managerResidentialAddress: [''],
      managerPoliceStation: [''],
      managerPin: [''],
      managerMobile: [''],
      managerAadharNo: [''],
      managerDOB: [''],
      managerEmployerPhoto: [null],

      // --- Signatures ---
      signedAuthorizationDocument: [null, Validators.required],
      signatureOfOccupierOfFactory: [null],
      signatureOfManagerOfFactory: [null],

      // --- Dynamic Sections ---
      partnerDetails: this.fb.array([]),
      boardOfDirectors: this.fb.array([]),
      chiefAdministrativeHead: this.fb.array([]),
    });
  }

  ngOnInit(): void {
    this.form.patchValue({
      name: 'Deeptanu Bhowmik',
      fatherName: 'Rabindra Bhowmik',
      residentialAddress: 'Joynagar',
      policeStation: 'West P.S',
      pin: '799001',
      mobile: '7085542194',
      email: 'deeptanubhowmik462002@gmail.com',
      dob: new Date('2001-01-01'),
      statusOfPerson: 'Managing Director',
      minority: '0',
      differentlyAbled: '0',
      aadharNo: '654376544321',

      managerName: 'Moumita Sinha',
      managerFatherName: 'Surajit Sinha',
      managerResidentialAddress: 'Behind Hindi H. S School',
      managerPoliceStation: 'West P.S',
      managerPin: '799005',
      managerMobile: '9233108616',
      managerAadharNo: '552303161494',
      managerDOB: new Date('1999-01-08'),
    });

    // Add sample data
    this.addChiefAdministrativeHead();
    this.addChiefAdministrativeHead();
  }

  // --- File Handling ---

  addAdminHead(): void {
  this.chiefAdministrativeHead.push(this.fb.group({
    name: ['', Validators.required],
    permanentAddress: ['', Validators.required],
    mobile: ['', Validators.required],
  }));
  this.cdr.markForCheck();
}
  onPhotoSelected(file: File): void {
    this.form.get('employerPhoto')?.setValue(file);
    this.cdr.markForCheck();
  }

  onManagerPhotoSelected(file: File): void {
    this.form.get('managerEmployerPhoto')?.setValue(file);
    this.cdr.markForCheck();
  }

  removeFile(fieldName: string): void {
    this.form.get(fieldName)?.reset();
    this.cdr.markForCheck();
  }

  getImageUrl(file: File | string | null): string {
    if (!file) return '/assets/img/profile-picture.jpg';
    if (file instanceof File) {
      return URL.createObjectURL(file);
    }
    return file;
  }

  // --- FormArray: Partner Details ---
  get partnerDetails(): FormArray {
    return this.form.get('partnerDetails') as FormArray;
  }

  addPartner(): void {
    this.partnerDetails.push(this.fb.group({
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
    }));
    this.cdr.markForCheck();
  }

  removePartner(index: number): void {
    this.partnerDetails.removeAt(index);
    this.cdr.markForCheck();
  }

  // --- Board of Directors ---
  get boardOfDirectors(): FormArray {
    return this.form.get('boardOfDirectors') as FormArray;
  }

  addDirector(): void {
    this.boardOfDirectors.push(this.fb.group({
      name: ['', Validators.required],
      permanentAddress: [''],
      mobile: ['', Validators.required],
    }));
    this.cdr.markForCheck();
  }

  removeDirector(index: number): void {
    this.boardOfDirectors.removeAt(index);
    this.cdr.markForCheck();
  }

  // --- Chief Administrative Head ---
  get chiefAdministrativeHead(): FormArray {
    return this.form.get('chiefAdministrativeHead') as FormArray;
  }

  addChiefAdministrativeHead(): void {
    this.chiefAdministrativeHead.push(this.fb.group({
      name: ['', Validators.required],
      permanentAddress: ['', Validators.required],
      mobile: ['', Validators.required],
    }));
    this.cdr.markForCheck();
  }

  removeChiefAdministrativeHead(index: number): void {
    this.chiefAdministrativeHead.removeAt(index);
    this.cdr.markForCheck();
  }
}