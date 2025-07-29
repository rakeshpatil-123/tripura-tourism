import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatCardModule} from '@angular/material/card';

import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ButtonComponent } from "../../../shared/component/button-component/button.component";

interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'textarea' | 'radio' | 'select';
  required: boolean;
  validators?: any[];
  placeholder?: string;
  options?: { value: string; label: string }[];
  rows?: number;
  errorMessages?: { [key: string]: string };
}

@Component({
  imports: [CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatRadioModule,
    MatSnackBarModule,
    MatSelectModule,
    MatDatepickerModule,
    MatCardModule,
    MatNativeDateModule, MatProgressSpinnerModule, ButtonComponent],
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss']
})
export class RegistrationComponent implements OnInit {
  registrationForm: FormGroup;
  isSubmitting = false;

  
  formFields: FormField[] = [
    {
      name: 'enterpriseName',
      label: 'Name of Enterprise',
      type: 'text',
      required: true,
      validators: [Validators.required, Validators.minLength(2)],
      placeholder: 'Enter enterprise name',
      errorMessages: {
        required: 'Enterprise name is required',
        minlength: 'Enterprise name must be at least 2 characters'
      }
    },
    {
      name: 'authPersonName',
      label: 'Authorize Person Name',
      type: 'text',
      required: true,
      validators: [Validators.required, Validators.minLength(2)],
      placeholder: 'Enter authorized person name',
      errorMessages: {
        required: 'Authorized person name is required',
        minlength: 'Name must be at least 2 characters'
      }
    },
    {
      name: 'authPersonEmail',
      label: 'Authorize Person Email Id',
      type: 'email',
      required: true,
      validators: [Validators.required, Validators.email],
      placeholder: 'Enter email address',
      errorMessages: {
        required: 'Email is required',
        email: 'Please enter a valid email address'
      }
    },
    {
      name: 'authPersonPan',
      label: 'Authorize Person PAN',
      type: 'text',
      required: false,
      validators: [Validators.pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)],
      placeholder: 'Enter PAN number',
      errorMessages: {
        pattern: 'Please enter a valid PAN number (e.g., ABCDE1234F)'
      }
    },
    {
      name: 'authPersonMobile',
      label: 'Authorize Person Mobile No.',
      type: 'tel',
      required: true,
      validators: [Validators.required, Validators.pattern(/^[0-9]{10}$/)],
      placeholder: 'Enter mobile number',
      errorMessages: {
        required: 'Mobile number is required',
        pattern: 'Please enter a valid 10-digit mobile number'
      }
    },
    {
      name: 'loginUserName',
      label: 'Login User Name',
      type: 'text',
      required: true,
      validators: [Validators.required, Validators.minLength(3)],
      placeholder: 'Enter username',
      errorMessages: {
        required: 'Username is required',
        minlength: 'Username must be at least 3 characters'
      }
    },
    {
      name: 'activityOfEnterprise',
      label: 'Activity of Enterprise',
      type: 'radio',
      required: true,
      validators: [Validators.required],
      options: [
        { value: 'manufacturing', label: 'Manufacturing' },
        { value: 'services', label: 'Services' }
      ],
      errorMessages: {
        required: 'Please select an activity type'
      }
    },
    {
      name: 'registeredEnterpriseAddress',
      label: 'Registered Enterprise Address',
      type: 'textarea',
      required: true,
      validators: [Validators.required, Validators.minLength(10)],
      placeholder: 'Enter complete address',
      rows: 3,
      errorMessages: {
        required: 'Address is required',
        minlength: 'Address must be at least 10 characters'
      }
    },
    {
      name: 'registeredEnterpriseCity',
      label: 'Registered Enterprise City',
      type: 'text',
      required: true,
      validators: [Validators.required],
      placeholder: 'Enter city',
      errorMessages: {
        required: 'City is required'
      }
    },
    {
      name: 'registeredEnterprisePin',
      label: 'Registered Enterprise PIN',
      type: 'text',
      required: true,
      validators: [Validators.required, Validators.pattern(/^[0-9]{6}$/)],
      placeholder: 'Enter PIN code',
      errorMessages: {
        required: 'PIN code is required',
        pattern: 'Please enter a valid 6-digit PIN code'
      }
    }
  ];

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.registrationForm = this.createForm();
  }

  ngOnInit(): void {
    
  }

  
  private createForm(): FormGroup {
    const formControls: { [key: string]: any } = {};

    this.formFields.forEach(field => {
      const validators = field.validators || [];
      formControls[field.name] = ['', validators];
    });

    return this.fb.group(formControls);
  }

  
  getFormControl(fieldName: string): AbstractControl {
    return this.registrationForm.get(fieldName)!;
  }

  
  hasError(fieldName: string, errorType?: string): boolean {
    const control = this.getFormControl(fieldName);
    if (errorType) {
      return control.hasError(errorType) && (control.dirty || control.touched);
    }
    return control.invalid && (control.dirty || control.touched);
  }

  
  getErrorMessage(field: FormField): string {
    const control = this.getFormControl(field.name);
    
    if (control.errors && field.errorMessages) {
      const errorType = Object.keys(control.errors)[0];
      return field.errorMessages[errorType] || `${field.label} is invalid`;
    }
    
    return '';
  }

  
  isFieldRequired(fieldName: string): boolean {
    const field = this.formFields.find(f => f.name === fieldName);
    return field?.required || false;
  }

  
  onSubmit(): void {
    if (this.registrationForm.valid) {
      this.isSubmitting = true;
      
      
      setTimeout(() => {
        console.log('Form Data:', this.registrationForm.value);
        this.snackBar.open('Registration submitted successfully!', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.isSubmitting = false;
        
        
      }, 2000);
    } else {
      this.markFormGroupTouched();
      this.snackBar.open('Please fill in all required fields correctly.', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
    }
  }

  
  private markFormGroupTouched(): void {
    Object.keys(this.registrationForm.controls).forEach(key => {
      this.registrationForm.get(key)?.markAsTouched();
    });
  }

  
  onReset(): void {
    this.registrationForm.reset();
    Object.keys(this.registrationForm.controls).forEach(key => {
      this.registrationForm.get(key)?.setErrors(null);
    });
  }
}