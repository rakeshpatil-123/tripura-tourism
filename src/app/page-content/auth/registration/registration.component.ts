import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IlogiInputComponent } from '../../../customInputComponents/ilogi-input/ilogi-input.component';
import { IlogiSelectComponent } from '../../../customInputComponents/ilogi-select/ilogi-select.component';
import { Router } from '@angular/router';
import { GenericService } from '../../../_service/generic/generic.service';

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IlogiInputComponent,
    IlogiSelectComponent
  ],
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss']
})
export class RegistrationComponent {
  registrationForm: FormGroup;

  userTypeOptions = [
    { value: 'individual', name: 'Individual', id: 'individual' }
  ];

  constructor(
    private fb: FormBuilder,
    private genericService: GenericService,  
    private router: Router
  ) {
    this.registrationForm = this.fb.group({
      name_of_enterprise: ['', []],
      authorized_person_name: ['', []],
      email_id: ['', []],
      mobile_no: ['', []],
      user_name: ['', []],
      registered_enterprise_address: ['', []],
      registered_enterprise_city: ['', []],
      user_type: ['Individual', []], 
      password: ['', []],
      confirmPassword: ['', []]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  onSubmit(): void {
    if (this.registrationForm.valid) {
      const { confirmPassword, ...payload } = this.registrationForm.value;

      this.genericService.registerUser(payload).subscribe({
        next: (res : any) => {
          console.log('Registration Success:', res);
          this.genericService.openSnackBar('Registration successful!', 'Success');
          this.router.navigate(['auth/login']);
          this.registrationForm.reset();
        },
        error: (err : any) => {
          console.error('Registration Failed:', err);
          this.genericService.openSnackBar('Registration failed. Try again.', 'Error');
        }
      });
    } else {
      this.genericService.openSnackBar('Please fill all required fields', 'Error');
    }
  }
}
