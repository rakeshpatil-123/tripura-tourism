// login.component.ts
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IlogiInputComponent } from '../../../customInputComponents/ilogi-input/ilogi-input.component';
import { GenericService } from '../../../_service/generic/generic.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IlogiInputComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private genericService: GenericService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      user_name: [''],
      password: [''],
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      const payload = this.loginForm.value;

      this.genericService.loginUser(payload).subscribe({
        next: (response) => {
          console.log('Login successful:', response);
          if (response?.token) {
            localStorage.setItem('token', response.token);
          }
          this.genericService.storeSessionData(
            response,
            payload.rememberMe || false
          );
          localStorage.setItem('userName', response.data.authorized_person_name);
          localStorage.setItem('userRole', response.data.user_type);
          localStorage.setItem('deptId', response.data.department_id || '');
          localStorage.setItem('deptName', response.data.department_name || '');
          this.genericService.openSnackBar('Login successful!', 'Success');
          this.genericService.setLoginStatus(true);
          this.loginForm.reset();
        },
        error: (error) => {
          console.error('Login failed:', error);
          this.genericService.openSnackBar(
            'Login failed. Please check your credentials.',
            'Error'
          );
        },
      });
    } else {
      this.genericService.openSnackBar(
        'Please fill in all fields correctly.',
        'Error'
      );
    }
  }
}
