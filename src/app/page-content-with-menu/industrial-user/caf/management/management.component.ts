import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDividerModule } from '@angular/material/divider';
import { MatStepperModule } from '@angular/material/stepper';

export interface PartnerDetails {
  name: string;
  fatherName: string;
  age: string;
  sex: string;
  socialStatus: string;
  profession: string;
  permanentAddress: string;
  mobileNo: string;
  dateOfBirth: Date | null;
  dateOfJoining: Date | null;
  idProof: File | null;
  signature: File | null;
}

export interface BoardDirector {
  name: string;
  permanentAddress: string;
  mobileNo: string;
}

export interface ChiefAdminHead {
  name: string;
  permanentAddress: string;
  mobileNo: string;
}

@Component({
  selector: 'app-management',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTableModule,
    MatSnackBarModule,
    MatDialogModule,
    MatToolbarModule,
    MatDividerModule,
    MatStepperModule,
  ],
  templateUrl: './management.component.html',
  styleUrls: ['./management.component.scss'],
})
export class ManagementComponent implements OnInit {
  managementForm!: FormGroup;

  // Dropdown options
  statusPersonOptions = [
    'Owner',
    'Partner',
    'Director',
    'Manager',
    'Authorized Signatory',
  ];

  sexOptions = ['Male', 'Female', 'Other'];

  socialStatusOptions = ['General', 'OBC', 'SC', 'ST', 'EWS'];

  yesNoOptions = ['Yes', 'No'];

  // Table columns
  partnerColumns: string[] = [
    'name',
    'fatherName',
    'age',
    'sex',
    'socialStatus',
    'profession',
    'permanentAddress',
    'mobileNo',
    'dateOfBirth',
    'dateOfJoining',
    'idProof',
    'signature',
    'actions',
  ];

  boardColumns: string[] = ['name', 'permanentAddress', 'mobileNo', 'actions'];
  adminColumns: string[] = ['name', 'permanentAddress', 'mobileNo', 'actions'];

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm(): void {
    this.managementForm = this.fb.group({
      // Owner Details
      ownerDetails: this.fb.group({
        name: ['', [Validators.required]],
        residentialAddress: ['', [Validators.required]],
        fatherName: ['', [Validators.required]],
        policeStation: ['', [Validators.required]],
        photograph: [null],
        pin: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
        aadharNo: ['', [Validators.pattern(/^\d{12}$/)]],
        mobile: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
        statusOfPerson: ['', [Validators.required]],
        alternateMobile: ['', [Validators.pattern(/^\d{10}$/)]],
        email: ['', [Validators.required, Validators.email]],
        dateOfBirth: ['', [Validators.required]],
        womenEntrepreneur: ['', [Validators.required]],
        socialStatus: [''],
        minority: ['', [Validators.required]],
        differentlyAbled: ['', [Validators.required]],
      }),

      // Manager Details
      managerDetails: this.fb.group({
        name: [''],
        residentialAddress: [''],
        fatherName: [''],
        policeStation: [''],
        photograph: [null],
        pin: ['', [Validators.pattern(/^\d{6}$/)]],
        dateOfBirth: [''],
        mobile: ['', [Validators.pattern(/^\d{10}$/)]],
        aadharNo: ['', [Validators.pattern(/^\d{12}$/)]],
      }),

      // Signature Uploads
      signatures: this.fb.group({
        ownerSignature: [null, [Validators.required]],
        occupierSignature: [null],
        managerSignature: [null],
      }),

      // Dynamic Arrays
      partnerDetails: this.fb.array([]),
      boardDirectors: this.fb.array([]),
      chiefAdminHeads: this.fb.array([]),
    });
  }

  // Getter methods for FormArrays
  get partnerDetailsArray(): FormArray {
    return this.managementForm.get('partnerDetails') as FormArray;
  }

  get boardDirectorsArray(): FormArray {
    return this.managementForm.get('boardDirectors') as FormArray;
  }

  get chiefAdminHeadsArray(): FormArray {
    return this.managementForm.get('chiefAdminHeads') as FormArray;
  }

  // Partner Details Methods
  createPartnerFormGroup(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required]],
      fatherName: ['', [Validators.required]],
      age: ['', [Validators.min(18), Validators.max(100)]],
      sex: [''],
      socialStatus: [''],
      profession: [''],
      permanentAddress: [''],
      mobileNo: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      dateOfBirth: ['', [Validators.required]],
      dateOfJoining: [''],
      idProof: [null],
      signature: [null],
    });
  }

  addPartner(): void {
    this.partnerDetailsArray.push(this.createPartnerFormGroup());
  }

  removePartner(index: number): void {
    this.partnerDetailsArray.removeAt(index);
    this.showSnackBar('Partner removed successfully');
  }

  editPartner(index: number): void {
    // Logic for editing partner (could open a dialog)
    this.showSnackBar('Edit functionality to be implemented');
  }

  // Board Directors Methods
  createBoardDirectorFormGroup(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required]],
      permanentAddress: [''],
      mobileNo: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
    });
  }

  addBoardDirector(): void {
    this.boardDirectorsArray.push(this.createBoardDirectorFormGroup());
  }

  removeBoardDirector(index: number): void {
    this.boardDirectorsArray.removeAt(index);
    this.showSnackBar('Board Director removed successfully');
  }

  editBoardDirector(index: number): void {
    this.showSnackBar('Edit functionality to be implemented');
  }

  // Chief Admin Head Methods
  createChiefAdminFormGroup(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required]],
      permanentAddress: [''],
      mobileNo: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
    });
  }

  addChiefAdminHead(): void {
    this.chiefAdminHeadsArray.push(this.createChiefAdminFormGroup());
  }

  removeChiefAdminHead(index: number): void {
    this.chiefAdminHeadsArray.removeAt(index);
    this.showSnackBar('Chief Administrative Head removed successfully');
  }

  editChiefAdminHead(index: number): void {
    this.showSnackBar('Edit functionality to be implemented');
  }

  // File Upload Methods
  onFileSelected(
    event: any,
    controlName: string,
    formGroupName?: string,
    index?: number
  ): void {
    const file = event.target.files[0];
    if (file) {
      if (formGroupName && index !== undefined) {
        // For dynamic arrays
        const formArray = this.managementForm.get(formGroupName) as FormArray;
        formArray.at(index).get(controlName)?.setValue(file);
      } else if (formGroupName) {
        // For nested form groups
        this.managementForm
          .get(formGroupName)
          ?.get(controlName)
          ?.setValue(file);
      } else {
        // For top-level controls
        this.managementForm.get(controlName)?.setValue(file);
      }
      this.showSnackBar(`File uploaded: ${file.name}`);
    }
  }

  // Utility Methods
  showSnackBar(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
    });
  }

  onSubmit(): void {
    if (this.managementForm.valid) {
      console.log('Form Data:', this.managementForm.value);
      this.showSnackBar('Management details saved successfully!');
    } else {
      this.showSnackBar('Please fill all required fields correctly');
      this.markFormGroupTouched(this.managementForm);
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else if (control instanceof FormArray) {
        control.controls.forEach((arrayControl) => {
          if (arrayControl instanceof FormGroup) {
            this.markFormGroupTouched(arrayControl);
          }
        });
      } else {
        control?.markAsTouched();
      }
    });
  }

  resetForm(): void {
    this.managementForm.reset();
    this.initializeForm();
    this.showSnackBar('Form reset successfully');
  }

  // Helper method to get error messages
  getErrorMessage(controlName: string, formGroupName?: string): string {
    let control;
    if (formGroupName) {
      control = this.managementForm.get(formGroupName)?.get(controlName);
    } else {
      control = this.managementForm.get(controlName);
    }

    if (control?.hasError('required')) {
      return 'This field is required';
    }
    if (control?.hasError('email')) {
      return 'Please enter a valid email';
    }
    if (control?.hasError('pattern')) {
      if (controlName.includes('mobile') || controlName.includes('Mobile')) {
        return 'Please enter a valid 10-digit mobile number';
      }
      if (controlName === 'pin') {
        return 'Please enter a valid 6-digit PIN';
      }
      if (controlName === 'aadharNo') {
        return 'Please enter a valid 12-digit Aadhar number';
      }
    }
    if (control?.hasError('min')) {
      return 'Age must be at least 18';
    }
    if (control?.hasError('max')) {
      return 'Age cannot exceed 100';
    }
    return '';
  }
}
