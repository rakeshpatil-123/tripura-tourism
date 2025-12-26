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
      identifier: ['', [Validators.required, this.panOrMobileValidator.bind(this)]],
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
  get identifierControl() {
    return this.form.get('identifier');
  }
  panOrMobileValidator(control: import('@angular/forms').AbstractControl) {
    const val = (control.value ?? '').toString().trim();
    if (!val) return { required: true };

    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i;
    const mobileRegex = /^[6-9]\d{9}$/;
    if (panRegex.test(val) || mobileRegex.test(val)) {
      return null;
    }
    return { invalidIdentifier: true };
  }
  getIdentifierErrorMessage(): string {
    return 'Please enter a valid PAN (e.g. ABCDE1234F) or a 10-digit mobile number.';
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
    if (this.identifierControl?.invalid) {
      this.identifierControl?.markAsTouched();
      this.infoMessage = 'Please enter a valid PAN or mobile number.';
      return;
    }

    const identifier = (this.identifierControl?.value ?? '').toString().trim();
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i;
    const mobileRegex = /^[6-9]\d{9}$/;

    const payload: any = {};
    if (panRegex.test(identifier)) {
      payload.phone_or_pan = identifier;
    } else if (mobileRegex.test(identifier)) {
      payload.phone_or_pan = identifier;
    }

    const selectedApi = this.SEND_OTP_API;

    this.showLoaderLocal();
    this.infoMessage = 'Sending OTP to your registered mobile...';

    this.genericService.getByConditions(payload, selectedApi)
      .pipe(finalize(() => this.hideLoaderLocal()))
      .subscribe({
        next: (res: any) => {
          this.step = 'verify';
          this.serverMobileNumber = res?.mobile_no || (mobileRegex.test(identifier) ? identifier : '');
          this.primaryLabel = 'Verify OTP';
          this.sentToMasked = this.maskMobile(this.serverMobileNumber);
          this.infoMessage = `OTP sent to ${this.sentToMasked || 'your registered mobile'}. Enter the ${this.otpLength}-digit code.`;
          this.startOtpTimer(120);
          this.form.get('otp')?.setValidators([Validators.required, Validators.minLength(this.otpLength), Validators.maxLength(this.otpLength)]);
          this.form.get('otp')?.updateValueAndValidity();

          Swal.fire({
            icon: 'success',
            title: 'OTP Sent',
            text: `OTP successfully sent to ${this.sentToMasked || 'your registered mobile'}.`,
            timer: 1800,
            showConfirmButton: false,
            toast: true,
            position: 'top-end'
          });
        },
        error: (err) => {
          this.infoMessage = err?.error?.message || 'Failed to send OTP. Please try again.';
          Swal.fire({
            icon: 'error',
            title: 'Send Failed',
            text: err?.error?.message || 'Unable to send OTP.',
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

    const identifier = (this.identifierControl?.value ?? '').toString().trim();
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i;
    const mobileRegex = /^[6-9]\d{9}$/;

    const payload: any = {
      otp_code: this.form.value.otp,
    };
    if (panRegex.test(identifier)) payload.phone_or_pan = identifier;
    else if (mobileRegex.test(identifier)) payload.phone_or_pan = identifier;

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

    const identifier = (this.identifierControl?.value ?? '').toString().trim();
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i;
    const mobileRegex = /^[6-9]\d{9}$/;

    const payload: any = { resend: true };
    if (panRegex.test(identifier)) payload.phone_or_pan = identifier;
    else if (mobileRegex.test(identifier)) payload.phone_or_pan = identifier;

    const selectedApi = this.SEND_OTP_API;

    this.showLoaderLocal();
    this.infoMessage = 'Resending OTP...';

    this.genericService.getByConditions(payload, selectedApi)
      .pipe(finalize(() => this.hideLoaderLocal()))
      .subscribe({
        next: (res: any) => {
          this.startOtpTimer(120);
          const mobileToShow = res?.mobile_no || (mobileRegex.test(identifier) ? identifier : '');
          this.infoMessage = `OTP resent to ${this.maskMobile(mobileToShow)}.`;
          Swal.fire({
            icon: 'success',
            title: 'Resent',
            text: `OTP resent to ${this.maskMobile(mobileToShow)}.`,
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

    const identifier = (this.identifierControl?.value ?? '').toString().trim();
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i;
    const mobileRegex = /^[6-9]\d{9}$/;

    const payload: any = {
      new_password_confirmation: cp,
      new_password: np
    };
    if (panRegex.test(identifier)) payload.phone_or_pan = identifier;
    else if (mobileRegex.test(identifier)) payload.phone_or_pan = identifier;

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
    try {
      this.router.navigate(['/page/login']);
    } catch {
      window.location.href = this.getRedirectUrl('/page/login');
    }
  }
  private getRedirectUrl(path: string): string {
    const { origin, pathname } = window.location;
    const basePath = pathname.startsWith('/new') ? '/new' : '';
    const normalized = path.startsWith('/') ? path : `/${path}`;
    return `${origin}${basePath}${normalized}`;
  }
}
