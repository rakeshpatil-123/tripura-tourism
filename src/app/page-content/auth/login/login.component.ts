import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  HttpClient,
  HttpClientModule,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

interface LoginResponse {
  token: string;
  user: any;
}

@Component({
  imports: [
    CommonModule,
    RouterLink,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  isLoading = false;
  showPassword = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      user_name: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false],
    });
  }

  onSubmit() {
    console.log('Form submitted');

    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const loginData = {
        user_name: this.loginForm.get('user_name')?.value,
        password: this.loginForm.get('password')?.value,
      };

      // Simulate API call
      this.http
        .post<LoginResponse>(
          'http://swaagatstaging.tripura.cloud/api/user/login',
          loginData
        )
        .pipe(
          catchError((error: HttpErrorResponse) => {
            this.isLoading = false;
            this.errorMessage = error.error.message;
            return throwError(error);
          })
        )
        .subscribe(
          (response) => {
            console.log(response);
          },
          (error) => {
            this.isLoading = false;
            this.errorMessage = error.error.message;
          }
        );
    } else {
      console.log('Form is invalid');
      Object.keys(this.loginForm.controls).forEach((key) => {
        this.loginForm.get(key)?.markAsTouched();
      });
    }
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  get user_name() {
    return this.loginForm.get('user_name');
  }
  get password() {
    return this.loginForm.get('password');
  }
}
