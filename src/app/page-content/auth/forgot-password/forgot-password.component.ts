import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IlogiInputComponent } from '../../../customInputComponents/ilogi-input/ilogi-input.component';
import { GenericService } from '../../../_service/generic/generic.service';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { LoaderService } from '../../../_service/loader/loader.service';
import { finalize } from 'rxjs/operators';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IlogiInputComponent, MatIconModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
})
export class ForgotPasswordComponent implements OnInit, AfterViewInit, OnDestroy {
  form!: FormGroup;

  // step state: enter -> verify -> reset
  step: 'enter' | 'verify' | 'reset' = 'enter';

  // UI labels/state
  primaryLabel = 'Send OTP';
  isLoading = false;

  // OTP timer
  otpTimerSeconds = 0;
  private otpTimerInterval: any = null;
  otpLength = 6;

  // For display
  sentToMasked = '';
  infoMessage = '';

  // Dummy API identifiers - replace with your real API identifiers if needed
  readonly SEND_OTP_API = 'api/user/forgot-password-send-otp';
  readonly VERIFY_OTP_API = 'api/user/forgot-password-verify-otp';
  readonly RESET_PASSWORD_API = 'api/user/forgot-password-reset';

  images: string[] = [
    // '../../../../assets/images/First_Department-list.png',
    // '../../../../assets/images/Second_Department-list.png',
    '../../../../assets/images/Login_ Page_ Banner.png'
  ];
  currentImageIndex = 0;
  previousImageIndex = 0;
  private intervalId: any;
  serverMobileNumber: string = '';

  constructor(
    private fb: FormBuilder,
    private genericService: GenericService,
    private loaderService: LoaderService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      pan: ['', [Validators.required, Validators.pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i)]],
      mobile: ['',],
      otp: ['', []],
      newPassword: ['', []],
      confirmPassword: ['', []],
    });
    this.images.forEach(src => {
      const img = new Image();
      img.src = src;
    });
    this.startCarousel();

    this.primaryLabel = 'Send OTP';
  }

  ngAfterViewInit(): void {
    // nothing visual to init beyond CSS animation
  }

  ngOnDestroy(): void {
    this.clearOtpTimer();
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  startCarousel(): void {
    this.intervalId = setInterval(() => {
      this.previousImageIndex = this.currentImageIndex;
      this.currentImageIndex = (this.currentImageIndex + 1) % this.images.length;
    }, 5000);
  }

  // ---------- Helpers ----------
  private showLoaderLocal() {
    this.isLoading = true;
    try { this.loaderService.showLoader(); } catch { /* ignore if loader service differs */ }
  }
  private hideLoaderLocal() {
    this.isLoading = false;
    try { this.loaderService.hideLoader(); } catch { /* ignore if loader service differs */ }
  }

  private maskMobile(m: string) {
    if (!m) return m;
    const len = m.length;
    // If too short to mask (7 or fewer chars), return as-is
    if (len <= 7) return m;
    const start = m.slice(0, 3);
    const end = m.slice(-4);
    const middleMask = '*'.repeat(len - 7);
    return start + middleMask + end;
  }

  private startOtpTimer(seconds = 120) {
    this.clearOtpTimer();
    this.otpTimerSeconds = seconds;
    this.otpTimerInterval = setInterval(() => {
      this.otpTimerSeconds = Math.max(0, this.otpTimerSeconds - 1);
      if (this.otpTimerSeconds === 0) this.clearOtpTimer();
    }, 1000);
  }

  private clearOtpTimer() {
    if (this.otpTimerInterval) {
      clearInterval(this.otpTimerInterval);
      this.otpTimerInterval = null;
    }
  }

  get otpTimerDisplay(): string {
    const mm = Math.floor(this.otpTimerSeconds / 60).toString().padStart(2, '0');
    const ss = (this.otpTimerSeconds % 60).toString().padStart(2, '0');
    return `${mm}:${ss}`;
  }

  get isResendEnabled(): boolean {
    return this.step === 'verify' && this.otpTimerSeconds === 0 && !this.isLoading;
  }

  // ---------- Flow actions ----------
  // 1) Send OTP
  sendOtp(): void {
    if (this.step !== 'enter') return;

    // validate
    if (this.form.get('pan')?.invalid || this.form.get('mobile')?.invalid) {
      this.form.get('pan')?.markAsTouched();
      this.form.get('mobile')?.markAsTouched();
      this.infoMessage = 'Please fill PAN and Mobile correctly.';
      return;
    }

    const payload = {
      pan_no: this.form.value.pan,
      // mobile_no: this.form.value.mobile,
    };
    const selectedApi = this.SEND_OTP_API;

    this.showLoaderLocal();
    this.infoMessage = 'Sending OTP to your registered mobile...';

    this.genericService.getByConditions(payload, selectedApi)
      .pipe(finalize(() => this.hideLoaderLocal()))
      .subscribe({
        next: (res: any) => {
          // Success behaviour
          this.step = 'verify';
          this.serverMobileNumber = res.mobile_no || '';
          this.primaryLabel = 'Verify OTP';
          this.sentToMasked = this.maskMobile(this.serverMobileNumber);
          this.infoMessage = `OTP sent to ${this.sentToMasked}. Enter the ${this.otpLength}-digit code.`;
          this.startOtpTimer(120);
          // set validators for OTP
          this.form.get('otp')?.setValidators([Validators.required, Validators.minLength(this.otpLength), Validators.maxLength(this.otpLength)]);
          this.form.get('otp')?.updateValueAndValidity();

          Swal.fire({
            icon: 'success',
            title: 'OTP Sent',
            text: `OTP successfully sent to ${this.sentToMasked}.`,
            timer: 1800,
            showConfirmButton: false,
            toast: true,
            position: 'top-end'
          });
        },
        error: (err) => {
          this.infoMessage = 'Failed to send OTP. Please try again.';
          Swal.fire({
            icon: 'error',
            title: 'Send Failed',
            text: err?.error.message || 'Unable to send OTP.',
          });
        }
      });
  }

  // 2) Verify OTP
  verifyOtp(): void {
    if (this.step !== 'verify') return;

    if (this.form.get('otp')?.invalid) {
      this.form.get('otp')?.markAsTouched();
      this.infoMessage = 'Enter a valid OTP.';
      return;
    }

    const payload = {
      pan_no: this.form.value.pan,
      // mobile_no: this.form.value.mobile,
      otp_code: this.form.value.otp,
    };
    const selectedApi = this.VERIFY_OTP_API;

    this.showLoaderLocal();
    this.infoMessage = 'Verifying OTP...';

    this.genericService.getByConditions(payload, selectedApi)
      .pipe(finalize(() => this.hideLoaderLocal()))
      .subscribe({
        next: (res: any) => {
          this.step = 'reset';
          this.primaryLabel = 'Reset Password';
          this.infoMessage = 'OTP verified — enter a new password below.';

          // set validators for passwords
          this.form.get('newPassword')?.setValidators([Validators.required, Validators.minLength(6)]);
          this.form.get('confirmPassword')?.setValidators([Validators.required]);
          this.form.get('newPassword')?.updateValueAndValidity();
          this.form.get('confirmPassword')?.updateValueAndValidity();

          Swal.fire({
            icon: 'success',
            title: 'Verified',
            text: 'OTP verified successfully.',
            timer: 1500,
            showConfirmButton: false,
            toast: true,
            position: 'top-end'
          });
        },
        error: (err) => {
          this.infoMessage = 'Invalid OTP. Please try again.';
          Swal.fire({
            icon: 'error',
            title: 'OTP Invalid',
            text: err?.error.message || 'OTP verification failed.',
          });
        }
      });
  }

  // 3) Resend OTP
  resendOtp(): void {
    if (!this.isResendEnabled) return;

    const payload = {
      pan_no: this.form.value.pan,
      // mobile: this.form.value.mobile,
      resend: true
    };
    const selectedApi = this.SEND_OTP_API;

    this.showLoaderLocal();
    this.infoMessage = 'Resending OTP...';

    this.genericService.getByConditions(payload, selectedApi)
      .pipe(finalize(() => this.hideLoaderLocal()))
      .subscribe({
        next: (res: any) => {
          this.startOtpTimer(120);
          this.infoMessage = `OTP resent to ${this.maskMobile(this.form.value.mobile)}.`;
          Swal.fire({
            icon: 'success',
            title: 'Resent',
            text: `OTP resent to ${this.maskMobile(this.form.value.mobile)}.`,
            timer: 1500,
            showConfirmButton: false,
            toast: true,
            position: 'top-end'
          });
        },
        error: (err) => {
          this.infoMessage = 'Failed to resend OTP. Try again later.';
          Swal.fire({
            icon: 'error',
            title: 'Resend Failed',
            text: err?.error.message || 'Unable to resend OTP.',
          });
        }
      });
  }

  // 4) Reset password
  resetPassword(): void {
    if (this.step !== 'reset') return;

    const np = this.form.value.newPassword;
    const cp = this.form.value.confirmPassword;
    if (!np || np.length < 6) {
      Swal.fire({ icon: 'warning', title: 'Weak Password', text: 'Password must be at least 6 characters.' });
      return;
    }
    if (np !== cp) {
      Swal.fire({ icon: 'warning', title: 'Mismatch', text: 'New password and confirmation do not match.' });
      return;
    }

    const payload = {
      pan_no: this.form.value.pan,
      // mobile: this.form.value.mobile,
      new_password_confirmation: cp,
      new_password: np
    };
    const selectedApi = this.RESET_PASSWORD_API;

    this.showLoaderLocal();
    this.infoMessage = 'Resetting password...';

    this.genericService.getByConditions(payload, selectedApi)
      .pipe(finalize(() => this.hideLoaderLocal()))
      .subscribe({
        next: (res: any) => {
          Swal.fire({
            icon: 'success',
            title: 'Password Reset',
            html: '<strong>Password reset successful!</strong><br/>Redirecting to login...',
            showConfirmButton: false,
            timer: 2000,
            willClose: () => {
              this.router.navigate(['/page/login']);
            }
          });
        },
        error: (err) => {
          this.infoMessage = 'Password reset failed. Try again later.';
          Swal.fire({
            icon: 'error',
            title: 'Reset Failed',
            text: err?.error.message || 'Unable to reset password.',
          });
        }
      });
  }

  // Unified primary button click handler
  onPrimaryClick(): void {
    if (this.isLoading) return;

    if (this.step === 'enter') {
      this.sendOtp();
    } else if (this.step === 'verify') {
      this.verifyOtp();
    } else if (this.step === 'reset') {
      this.resetPassword();
    }
  }

  // Back to login
  backToLogin() {
    this.router.navigate(['/page/login']);
  }
}
