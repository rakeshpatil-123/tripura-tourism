import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { IlogiInputComponent } from '../../../customInputComponents/ilogi-input/ilogi-input.component';
import { GenericService } from '../../../_service/generic/generic.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [ReactiveFormsModule, IlogiInputComponent, CommonModule],
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.scss']
})
export class AdminLoginComponent {
  adminLoginForm: FormGroup;
  loading = false;
  captchaCode: string = '';
  captchaError: string = '';

  constructor(private fb: FormBuilder, private genericService: GenericService) {
    this.adminLoginForm = this.fb.group({
      user_name: ['', [Validators.required]],
      password: ['', [Validators.required]],
      captchaInput: ['', [Validators.required]]   // captcha input
    });

    this.generateCaptcha();
  }

  // Generate random 6-digit captcha
  generateCaptcha() {
    this.captchaCode = Math.floor(100000 + Math.random() * 900000).toString();
    this.adminLoginForm.patchValue({ captchaInput: '' });
    this.captchaError = '';
  }

  onSubmit() {
    if (this.adminLoginForm.invalid) {
      this.genericService.openSnackBar(
        'Please fill in all fields correctly.',
        'Error'
      );
      return;
    }

    // Check captcha validation
    if (this.adminLoginForm.value.captchaInput !== this.captchaCode) {
      this.captchaError = 'Invalid captcha';
      this.genericService.openSnackBar('Captcha does not match!', 'Error');
      this.generateCaptcha();
      return;
    }

    this.loading = true;
    const payload = {
      user_name: this.adminLoginForm.value.user_name,
      password: this.adminLoginForm.value.password,
    };

    this.genericService.loginAdmin(payload).subscribe({
      next: (response) => {
        this.loading = false;
        this.genericService.storeSessionData(response, true);

        this.genericService.openSnackBar('Admin login successful!', 'Success');
        this.genericService.setLoginStatus(true);

        console.log('Admin logged in:', response);

        this.adminLoginForm.reset();
        this.generateCaptcha();
      },
      error: (error) => {
        this.loading = false;
        console.error('Admin login failed:', error);
        const errorMessage =
          error?.error?.message || 'Invalid credentials, please try again.';
        this.genericService.openSnackBar(errorMessage, 'Error');
        this.generateCaptcha();
      },
    });
  }
}
