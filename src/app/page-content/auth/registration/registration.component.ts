// registration.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatCard } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

// Angular Material Modules
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { RegistrationService } from './registration.service';
import { ButtonComponent } from '../../../shared/component/button-component/button.component';
import { MatRadioButton } from '@angular/material/radio';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss'],
  imports: [
    MatCard,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatIconModule,
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule,
    ButtonComponent,
    MatRadioButton,
  ],
})
export class RegistrationComponent implements OnInit {
  registrationForm: FormGroup = new FormGroup({});
  states: string[] = [
    'Andhra Pradesh',
    'Arunachal Pradesh',
    'Assam',
    'Bihar',
    'Chhattisgarh',
    'Goa',
    'Gujarat',
    'Haryana',
    'Himachal Pradesh',
    'Jharkhand',
    'Karnataka',
    'Kerala',
    'Madhya Pradesh',
    'Maharashtra',
    'Manipur',
    'Meghalaya',
    'Mizoram',
    'Nagaland',
    'Odisha',
    'Punjab',
    'Rajasthan',
    'Sikkim',
    'Tamil Nadu',
    'Telangana',
    'Tripura',
    'Uttar Pradesh',
    'Uttarakhand',
    'West Bengal',
    'Andaman and Nicobar Islands',
    'Chandigarh',
    'Dadra and Nagar Haveli',
    'Daman and Diu',
    'Delhi',
    'Lakshadweep',
    'Puducherry',
  ];
  userTypes: string[] = ['department', 'enterprise', 'individual'];
  isSubmitting = false;
  hidePassword = true;

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  constructor(
    private fb: FormBuilder,
    private registrationService: RegistrationService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm(): void {
    this.registrationForm = this.fb.group({
      name_of_enterprise: ['', [Validators.required, Validators.minLength(2)]],
      authorized_person_name: [
        '',
        [Validators.required, Validators.minLength(2)],
      ],
      email_id: ['', [Validators.required, Validators.email]],
      mobile_no: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      user_name: ['', [Validators.required, Validators.minLength(3)]],
      registered_enterprise_address: [
        '',
        [Validators.required, Validators.minLength(5)],
      ],
      registered_enterprise_city: [
        '',
        [Validators.required, Validators.minLength(2)],
      ],
      state: ['', Validators.required],
      user_type: ['department', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onSubmit(): void {
    if (this.registrationForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      const formData = this.registrationForm.value;

      this.registrationService.registerUser(formData).subscribe({
        next: (response) => {
          this.isSubmitting = false;
          this.snackBar.open('Registration successful!', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar'],
          });
          this.registrationForm.reset();
          this.initializeForm();
        },
        error: (error) => {
          this.isSubmitting = false;
          this.snackBar.open(
            'Registration failed. Please try again.',
            'Close',
            {
              duration: 5000,
              panelClass: ['error-snackbar'],
            }
          );
          console.error('Registration error:', error);
        },
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.registrationForm.controls).forEach((key) => {
      const control = this.registrationForm.get(key);
      control?.markAsTouched();
    });
  }

  getErrorMessage(fieldName: string): string {
    const control = this.registrationForm.get(fieldName);
    if (control?.hasError('required')) {
      return `${fieldName.replace(/_/g, ' ')} is required`;
    }
    if (control?.hasError('email')) {
      return 'Please enter a valid email';
    }
    if (control?.hasError('minlength')) {
      return `${fieldName.replace(/_/g, ' ')} is too short`;
    }
    if (control?.hasError('pattern')) {
      return 'Please enter a valid format';
    }
    return '';
  }
}
