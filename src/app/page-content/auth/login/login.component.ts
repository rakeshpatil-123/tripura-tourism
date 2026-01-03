// login.component.ts
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IlogiInputComponent } from '../../../customInputComponents/ilogi-input/ilogi-input.component';
import { GenericService } from '../../../_service/generic/generic.service';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { LoaderService } from '../../../_service/loader/loader.service';
import { finalize } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IlogiInputComponent,
    MatIconModule,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit, AfterViewInit, OnDestroy {
  loginForm: FormGroup;
  images: string[] = ['assets/images/Login_ Page_ Banner.png'];
  currentImageIndex = 0;
  previousImageIndex = 0;
  private intervalId: any;
  goToForgetPassword: boolean = false;

  @ViewChild('captchaCanvas') captchaCanvas!: ElementRef<HTMLCanvasElement>;
  captchaCode: string = '';
  length: number = 6;
  characters: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  captchaValid: boolean = false;
  basePath: string = '';

  constructor(
    private fb: FormBuilder,
    private genericService: GenericService,
    private loaderService: LoaderService,
    private router: Router,
    private _matSnackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      user_name: ['', Validators.required],
      password: ['', Validators.required],
      captchaInput: [''],
    });
  }

  ngOnInit(): void {
    this.basePath = this.getBasePath();
    // ensure URIs are encoded and images are preloaded
    this.images = this.images.map((src) => encodeURI(src));
    this.images.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
    this.startCarousel();
  }

  ngAfterViewInit(): void {
    // slight delay helps when canvas isn't immediately attached in some rendering flows
    setTimeout(() => this.generateCaptcha(), 80);
  }

  ngOnDestroy(): void {
    if (this.intervalId) clearInterval(this.intervalId);
  }

  startCarousel(): void {
    if (this.images.length <= 1) return;
    this.intervalId = setInterval(() => {
      this.previousImageIndex = this.currentImageIndex;
      this.currentImageIndex = (this.currentImageIndex + 1) % this.images.length;
    }, 4500);
  }

  goTo() {
    // navigate to forgot password route
    void this.router.navigate(['page/forgot-password']);
  }

  onSubmit(): void {
    const escapeHtmlInline = (unsafe: string | null | undefined): string => {
      const s = (unsafe || '').toString();
      return s
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    };

    if (!this.captchaValid) {
      this.genericService.openSnackBar('Please enter the correct CAPTCHA!', 'Error');
      return;
    }

    if (this.loginForm.valid) {
      const payload = this.loginForm.value;
      this.loaderService.showLoader();

      this.genericService
        .loginUser(payload)
        .pipe(finalize(() => this.loaderService.hideLoader()))
        .subscribe({
          next: (response) => {
            if (response.status === 0 && response.password_reset_required === true) {
              this.goToForgetPassword = true;
              return;
            }
            if (response?.token) {
              this.goToForgetPassword = false;
              localStorage.setItem('token', response.token);
            }

            // preserve your session-store behaviour
            const missing = this.genericService.storeSessionData(response, payload.rememberMe || false);

            localStorage.setItem('userName', response.data.authorized_person_name || '');
            localStorage.setItem('userRole', response.data.user_type || '');
            localStorage.setItem('email_id', response.data.email_id || '');
            localStorage.setItem('deptId', response.data.department_id || '');
            localStorage.setItem('deptName', response.data.department_name || '');
            localStorage.setItem('hierarchy', response.data.hierarchy || '');
            localStorage.setItem('designation', response.data.designation || '');
            localStorage.setItem('district', response.data.district || '');
            localStorage.setItem('subdivision', response.data.subdivision || '');
            localStorage.setItem('ulb', response.data.ulb || '');
            localStorage.setItem('ward', response.data.ward || '');
            localStorage.setItem('userId', response.data.id || '');
            localStorage.setItem('bin', response.data.bin || '');

            this.genericService.openSnackBar('Login successful!', 'Success');
            this.genericService.setLoginStatus(true);

            this.loginForm.reset();
            this.captchaValid = false;
            this.generateCaptcha();
          },
          error: (err) => {
            const isInvalidCredentials =
              !!err &&
              !!err.error &&
              err.error.status === 0 &&
              String(err.error.message || '').trim().toLowerCase() === 'invalid credentials';

            if (isInvalidCredentials) {
              const snackRef = this._matSnackBar.open(
                'Invalid Credentials. Pls Re-try. Or reset your password.',
                'Forgot password',
                { duration: 3000, horizontalPosition: 'center', verticalPosition: 'top' }
              );
              snackRef.onAction().subscribe(() => {
                const { origin, pathname } = window.location;
                const basePath = pathname.startsWith('/new') ? '/new' : '';
                const forgotPasswordPath = `${basePath}/page/forgot-password`;
                window.location.href = origin + forgotPasswordPath;
              });
              return;
            }

            this.genericService.openSnackBar('Login failed. Please check your credentials.', 'X');

            if (err && err.error && err.error.status === 0) {
              this.genericService.openSnackBar(err.error.message, 'X');
            }
            if (err === 401 || err?.status === 401 || err?.status === 400) {
              this.loginForm.get('user_name')?.setErrors({ invalid: true });
              this.loginForm.get('password')?.setErrors({ invalid: true });
            }

            const message = err && err.error && err.error.message ? err.error.message : err?.message || 'Login failed. Please try again later.';
            const escaped = escapeHtmlInline(message);

            Swal.fire({
              title: 'Login failed',
              html: `<p style="color:var(--swal-muted); margin-bottom:6px;">${escaped}</p>
                     <p style="color:var(--swal-muted); font-size:0.9rem; margin-top:8px;">If the problem persists, contact support.</p>`,
              icon: 'error',
              confirmButtonText: 'OK',
              customClass: {
                popup: 'custom-professional-popup show-swal-animate',
                confirmButton: 'custom-professional-confirm',
              },
            });

            this.genericService.openSnackBar(message, 'Error');
          },
        });
    } else {
      this.genericService.openSnackBar('Please fill in all fields correctly.', 'Error');
    }
  }

  private escapeHtml(unsafe: string | null | undefined): string {
    const s = (unsafe || '').toString();
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }

  generateCaptcha(): void {
    let code = '';
    for (let i = 0; i < this.length; i++) {
      const index = Math.floor(Math.random() * this.characters.length);
      code += this.characters[index];
    }
    this.captchaCode = code;
    this.drawCaptcha();
    this.loginForm.get('captchaInput')?.reset();
    this.captchaValid = false;
  }

  drawCaptcha(): void {
    if (!this.captchaCanvas) return;
    const canvas = this.captchaCanvas.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // background
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#f7fafc';
    ctx.fillRect(0, 0, width, height);

    // noise lines
    for (let i = 0; i < 6; i++) {
      ctx.strokeStyle = this.randomColor();
      ctx.beginPath();
      ctx.moveTo(Math.random() * width, Math.random() * height);
      ctx.lineTo(Math.random() * width, Math.random() * height);
      ctx.lineWidth = 1 + Math.random() * 1.2;
      ctx.stroke();
    }

    // text
    for (let i = 0; i < this.captchaCode.length; i++) {
      const fontSize = 20 + Math.floor(Math.random() * 10);
      ctx.font = `${fontSize}px "Arial"`;
      ctx.fillStyle = this.randomColor();
      const x = 12 + i * 22 + Math.random() * 6;
      const y = 26 + Math.random() * 16;
      const angle = Math.random() * 0.6 - 0.3;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.fillText(this.captchaCode[i], 0, 0);
      ctx.restore();
    }

    // dots
    for (let i = 0; i < 40; i++) {
      ctx.fillStyle = this.randomColor();
      ctx.beginPath();
      ctx.arc(Math.random() * width, Math.random() * height, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  randomColor(): string {
    const r = Math.floor(60 + Math.random() * 160);
    const g = Math.floor(60 + Math.random() * 160);
    const b = Math.floor(60 + Math.random() * 160);
    return `rgb(${r},${g},${b})`;
  }

  reloadCaptcha(): void {
    this.generateCaptcha();
  }

  checkCaptcha(): void {
    const input = (this.loginForm.get('captchaInput')?.value || '').toString().trim().toUpperCase();
    if (input.length === this.length) {
      if (input === this.captchaCode) {
        this.captchaValid = true;
        this.loginForm.get('captchaInput')?.setErrors(null);
      } else {
        this.captchaValid = false;
        this.loginForm.get('captchaInput')?.setErrors({ invalidCaptcha: true });
      }
    } else {
      this.loginForm.get('captchaInput')?.setErrors(null);
    }
  }

  private getBasePath(): string {
    if (typeof window === 'undefined') return '';
    const anyWin = window as any;
    if (typeof anyWin.__BASE_PATH__ === 'string') {
      return anyWin.__BASE_PATH__.replace(/\/$/, '');
    }
    const { pathname } = window.location;
    return pathname.startsWith('/new') ? '/new' : '';
  }

  resolvePath(path: string): string {
    if (!path) return path;
    if (/^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(path)) return path;
    const p = path.startsWith('/') ? path : '/' + path;
    const base = this.basePath || '';
    if (!base) return p;
    if (p === base) return p;
    if (p.startsWith(base + '/')) return p;
    return base + p;
  }
}
