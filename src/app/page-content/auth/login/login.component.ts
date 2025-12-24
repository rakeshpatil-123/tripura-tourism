import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IlogiInputComponent } from '../../../customInputComponents/ilogi-input/ilogi-input.component';
import { GenericService } from '../../../_service/generic/generic.service';
import { Router } from '@angular/router';
import { MatIconModule } from "@angular/material/icon";
import { LoaderService } from '../../../_service/loader/loader.service';
import { finalize } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IlogiInputComponent, MatIconModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit, AfterViewInit, OnDestroy {
  loginForm: FormGroup;
  // images: string[] = [
  //   // '../../../../assets/images/First_Department-list.png',
  //   // '../../../../assets/images/Second_Department-list.png',
  //   '../../../../assets/images/Login_ Page_ Banner.png'
  // ];
  images: string[] = [
    'assets/images/Login_ Page_ Banner.png'
  ];
  currentImageIndex = 0;
  previousImageIndex = 0;
  private intervalId: any;

  @ViewChild('captchaCanvas') captchaCanvas!: ElementRef<HTMLCanvasElement>;
  captchaCode: string = '';
  length: number = 6; // standard captcha length
  characters: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  captchaValid: boolean = false;
  basePath: string = '';

  constructor(
    private fb: FormBuilder,
    private genericService: GenericService,
    private loaderService : LoaderService,
    private router: Router,
    private _matSnackBar: MatSnackBar,
  ) {
    this.loginForm = this.fb.group({
      user_name: ['', Validators.required],
      password: ['', Validators.required],
      captchaInput: ['',]
    });
  }

  ngOnInit(): void {
    this.basePath = this.getBasePath();
    this.images = this.images.map(src => encodeURI(src));
    this.images.forEach(src => {
      const img = new Image();
      img.src = src;
    });
    this.startCarousel();
  }
   ngAfterViewInit(): void {
    this.generateCaptcha();
  }
  ngOnDestroy(): void {
    if (this.intervalId) clearInterval(this.intervalId);
  }

  startCarousel(): void {
    this.intervalId = setInterval(() => {
      this.previousImageIndex = this.currentImageIndex;
      this.currentImageIndex = (this.currentImageIndex + 1) % this.images.length;
    }, 5000);
  }

  onSubmit(): void {
    // small inline escape helper to avoid needing a separate class method
    const escapeHtmlInline = (unsafe: string | null | undefined): string => {
      const s = (unsafe || '').toString();
      return s
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    };

    // --- CAPTCHA check (unchanged logic) ---
    if (!this.captchaValid) {
      this.genericService.openSnackBar('Please enter the correct CAPTCHA!', 'Error');
      return;
    }

    // validate form (unchanged logic)
    if (this.loginForm.valid) {
      const payload = this.loginForm.value;
      this.loaderService.showLoader();

      // call login API, hide loader after observable completes
      this.genericService.loginUser(payload)
        .pipe(finalize(() => this.loaderService.hideLoader()))
        .subscribe({
          next: (response) => {
            // preserve existing behaviour exactly: token + session storage
            if (response?.token) {
              localStorage.setItem('token', response.token);
            }

            // storeSessionData now returns array of missing profile fields
            const missing = this.genericService.storeSessionData(response, payload.rememberMe || false);

            // still keep other local storage items (if required)
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
            // ...any other items you keep...

            // friendly success feedback (keeps original snackbar call)
            this.genericService.openSnackBar('Login successful!', 'Success');
            this.genericService.setLoginStatus(true);

            // reset form + captcha (unchanged)
            this.loginForm.reset();
            this.captchaValid = false;
            this.generateCaptcha();

            // Decide next navigation:
            // If user is an 'individual' and there are missing profile fields -> show popup and redirect to profile page
            const isIndividual = String(response?.data?.user_type || '').toLowerCase() === 'individual';
            const missingForIndividual = isIndividual ? missing : [];

            // ---------- Stylish, animated, responsive SweetAlert2 modal ----------
            // We'll inject a small stylesheet (once) to give the modal a professional non-black background, animations and responsive layout.
            const STYLE_ID = 'swal-custom-professional-styles';
            if (!document.getElementById(STYLE_ID)) {
              const style = document.createElement('style');
              style.id = STYLE_ID;
              style.innerHTML = `
              /* Professional color palette (NOT pure black background) */
              :root{
                --swal-bg: linear-gradient(180deg, #f8fafc 0%, #eef2f6 100%); /* soft light slate gradient */
                --swal-accent: #0ea5a4; /* teal/cyan accent */
                --swal-accent-2: #6d28d9; /* purple accent for subtle gradient */
                --swal-text: #0b1220; /* deep text color for contrast on light bg */
                --swal-muted: #475569; /* muted slate text */
                --swal-success: #10b981;
                --swal-error: #ef4444;
                --swal-border: rgba(11,18,32,0.06);
                --swal-radius: 12px;
                --swal-shadow: 0 10px 40px rgba(11,18,32,0.08);
              }

              /* popup base */
              .swal2-popup.custom-professional-popup {
                background: var(--swal-bg) !important;
                color: var(--swal-text) !important;
                border-radius: var(--swal-radius) !important;
                border: 1px solid var(--swal-border) !important;
                box-shadow: var(--swal-shadow) !important;
                font-family: Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
                max-width: 680px !important;
                padding: 18px !important;
                overflow-wrap: break-word;
                transform-origin: center center;
              }

              /* header */
              .swal2-title.custom-professional-title {
                font-size: 1.25rem !important;
                margin-bottom: 6px !important;
                letter-spacing: -0.2px;
                font-weight: 700 !important;
                color: var(--swal-text) !important;
              }

              .swal2-html-container.custom-professional-content {
                font-size: 0.97rem;
                color: var(--swal-muted);
                text-align: left;
                line-height: 1.6;
              }

              /* make missing fields list perfectly aligned one-below-one */
              .custom-missing-list {
                list-style: disc;
                margin: 10px 0 0 0;
                padding-left: 1.25rem;
              }
              .custom-missing-list li {
                margin-bottom: 8px;
                color: var(--swal-text);
                font-weight: 600;
                display: list-item;
                list-style-position: outside;
              }
              .custom-missing-list li small {
                display: block;
                color: var(--swal-muted);
                font-weight: 500;
                font-size: 0.86rem;
              }

              /* buttons */
              .swal2-actions.custom-professional-actions {
                display: flex;
                gap: 10px;
                margin-top: 16px;
                justify-content: flex-end;
                flex-wrap: wrap;
              }

              .swal2-confirm.custom-professional-confirm {
                background: linear-gradient(90deg, var(--swal-accent), var(--swal-accent-2)) !important;
                border: none !important;
                color: #ffffff !important;
                font-weight: 700 !important;
                padding: 10px 16px !important;
                border-radius: 10px !important;
                box-shadow: 0 6px 18px rgba(13, 60, 86, 0.08) !important;
                min-width: 140px;
                transition: transform .18s ease, box-shadow .18s ease;
              }
              .swal2-confirm.custom-professional-confirm:hover{ transform: translateY(-3px); }

              .swal2-cancel.custom-professional-cancel {
                background: transparent !important;
                color: var(--swal-text) !important;
                border: 1px solid rgba(11,18,32,0.06) !important;
                padding: 9px 14px !important;
                border-radius: 10px !important;
                min-width: 120px;
                backdrop-filter: blur(2px);
              }

              /* subtle gradient stripe at top (soft) */
              .swal2-popup.custom-professional-popup::before{
                content: "";
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                height: 6px;
                border-top-left-radius: calc(var(--swal-radius) - 1px);
                border-top-right-radius: calc(var(--swal-radius) - 1px);
                background: linear-gradient(90deg, rgba(14,165,164,1), rgba(109,40,217,1));
                box-shadow: 0 4px 18px rgba(109,40,217,0.03);
              }

              /* entrance animation - pop + slide */
              @keyframes swal-slide-pop {
                0% { opacity: 0; transform: translateY(18px) scale(0.985); }
                60% { opacity: 1; transform: translateY(-6px) scale(1.02); }
                100% { opacity: 1; transform: translateY(0) scale(1); }
              }
              .swal2-popup.custom-professional-popup.show-swal-animate {
                animation: swal-slide-pop .42s cubic-bezier(.2,.9,.2,1);
              }

              /* responsive tweaks */
              @media (max-width: 520px) {
                .swal2-popup.custom-professional-popup { margin: 12px; padding: 14px !important; max-width: 92% !important; }
                .swal2-actions.custom-professional-actions { justify-content: stretch; }
                .swal2-confirm.custom-professional-confirm, .swal2-cancel.custom-professional-cancel { width: 100% !important; min-width: 0; }
                .swal2-title.custom-professional-title { font-size: 1.05rem !important; text-align: center; }
                .swal2-html-container.custom-professional-content { text-align: center; }
                .custom-missing-list { padding-left: 1rem; }
              }
            `;
              document.head.appendChild(style);
            }

            // Build nice human-friendly list string and html (one item per line, with bullet)
            const humanList = (missingForIndividual || []).map(f => this.humanizeMissingField(f));
            const listHtml = humanList.length
              ? `<ul class="custom-missing-list">${humanList.map(h => `<li>${escapeHtmlInline(h)}</li>`).join('')}</ul>`
              : '';


            // If there are missing fields, show the bespoke, animated SweetAlert2 modal.
            if (missingForIndividual && missingForIndividual.length > 0) {
              Swal.fire({
                title: '<span style="display:block">Profile update required</span>',
                html:
                  `<div class="custom-professional-content" style="display:flex; gap:12px; align-items:flex-start;">
                    <div aria-hidden="true" style="flex:0 0 46px; display:flex; align-items:center; justify-content:center;">
                      <div style="width:46px; height:46px; border-radius:10px; display:flex; align-items:center; justify-content:center;
                                  background:linear-gradient(180deg, rgba(255,255,255,0.6), rgba(255,255,255,0.35));
                                  box-shadow: inset 0 1px rgba(13,18,32,0.02); color:var(--swal-accent);">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                          <path d="M12 2v6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
                          <path d="M6.2 9.7L11 14.5 17.8 7.7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                      </div>
                    </div>
                    <div style="flex:1;">
                      <p style="margin:0 0 8px 0; color:var(--swal-text); font-weight:600;">
                        The following profile fields are missing and must be updated before continuing:
                      </p>
                      ${listHtml}
                
                    </div>
                  </div>`,
                showCancelButton: true,
                showCloseButton: false,
                focusConfirm: true,
                confirmButtonText: 'Update Profile',
                cancelButtonText: 'Later',
                allowOutsideClick: false,
                allowEscapeKey: false,
                customClass: {
                  popup: 'custom-professional-popup show-swal-animate',
                  title: 'custom-professional-title',
                  actions: 'custom-professional-actions',
                  confirmButton: 'custom-professional-confirm',
                  cancelButton: 'custom-professional-cancel'
                },
                willOpen: () => {
                  const confirmBtn = document.querySelector('.swal2-confirm') as HTMLElement | null;
                  const cancelBtn = document.querySelector('.swal2-cancel') as HTMLElement | null;
                  if (confirmBtn) { confirmBtn.setAttribute('aria-label', 'Update Profile'); }
                  if (cancelBtn) { cancelBtn.setAttribute('aria-label', 'Later, update dashboard home'); }
                }
              }).then(result => {
                const { origin, pathname } = window.location;
                const basePath = pathname.startsWith('/new') ? '/new' : '';
                const profileUrl = origin + basePath + '/dashboard/user-profile';
                const homeUrl = origin + basePath + '/dashboard/home';

                if (result.isConfirmed) {
                  // User clicked "Update Profile" -> redirect to profile page
                  window.location.href = profileUrl;
                } else {
                  // User clicked "Later" -> redirect to dashboard/home (as requested)
                  window.location.href = homeUrl;
                }
              });
            } else {
              // nothing missing -> go to dashboard/home (unchanged navigation)
              this.router.navigate(['dashboard/home']);
              // show an elegant success toast
              Swal.mixin({
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 2200,
                timerProgressBar: true,
                customClass: { popup: 'custom-professional-popup' }
              }).fire({
                icon: 'success',
                title: 'Welcome back — redirecting to your dashboard'
              });
            }
          },
          error: (err) => {
            // === Preserve your exact "invalid credentials" behavior first (unchanged) ===
            const isInvalidCredentials =
              !!err &&
              !!err.error &&
              err.error.status === 0 &&
              String(err.error.message || '').trim().toLowerCase() === 'invalid credentials';

            if (isInvalidCredentials) {
              const snackRef = this._matSnackBar.open(
                'Invalid credentials — Forgot password?',
                'Forgot password',
                {
                  duration: 3000,
                  horizontalPosition: 'center',
                  verticalPosition: 'top',
                }
              );
              snackRef.onAction().subscribe(() => {
                const { origin, pathname } = window.location;
                const basePath = pathname.startsWith('/new') ? '/new' : '';
                const forgotPasswordPath = `${basePath}/page/forgot-password`;
                window.location.href = origin + forgotPasswordPath;
              });
              return;
            }

            // keep original snack behaviour
            this.genericService.openSnackBar(
              'Login failed. Please check your credentials.',
              'X'
            );

            if (err && err.error && err.error.status === 0) {
              this.genericService.openSnackBar(err.error.message, 'X');
            }
            if (err === 401 || err?.status === 401 || err?.status === 400) {
              this.loginForm.get('user_name')?.setErrors({ invalid: true });
              this.loginForm.get('password')?.setErrors({ invalid: true });
            }

            // === Then show an enhanced, animated, professional error modal (keeps parity with snackbar) ===
            const message = (err && err.error && err.error.message) ? err.error.message : (err?.message || 'Login failed. Please try again later.');
            const escaped = escapeHtmlInline(message);

            Swal.fire({
              title: 'Login failed',
              html: `<p style="color:var(--swal-muted); margin-bottom:6px;">${escaped}</p>
                   <p style="color:var(--swal-muted); font-size:0.9rem; margin-top:8px;">If the problem persists, contact support.</p>`,
              icon: 'error',
              confirmButtonText: 'OK',
              customClass: {
                popup: 'custom-professional-popup show-swal-animate',
                confirmButton: 'custom-professional-confirm'
              }
            });

            // also call your existing service-based snackbar (keeps parity)
            this.genericService.openSnackBar(message, 'Error');
          },
        });
    } else {
      // unchanged: show snackbar for invalid form
      this.genericService.openSnackBar(
        'Please fill in all fields correctly.',
        'Error'
      );
    }
  }


  // Add this helper method inside the same component class (e.g. LoginComponent)
  private escapeHtml(unsafe: string | null | undefined): string {
    const s = (unsafe || '').toString();
    return s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  private humanizeMissingField(key: string): string {
    if (!key) return '';
    return key
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
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

    ctx.clearRect(0, 0, width, height);

    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, width, height);

    for (let i = 0; i < 6; i++) {
      ctx.strokeStyle = this.randomColor();
      ctx.beginPath();
      ctx.moveTo(Math.random() * width, Math.random() * height);
      ctx.lineTo(Math.random() * width, Math.random() * height);
      ctx.stroke();
    }

    for (let i = 0; i < this.captchaCode.length; i++) {
      const fontSize = 22 + Math.floor(Math.random() * 10);
      ctx.font = `${fontSize}px Arial`;
      ctx.fillStyle = this.randomColor();
      const x = 15 + i * 20 + Math.random() * 5;
      const y = 25 + Math.random() * 10;
      const angle = Math.random() * 0.4 - 0.2;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.fillText(this.captchaCode[i], 0, 0);
      ctx.restore();
    }

    for (let i = 0; i < 30; i++) {
      ctx.fillStyle = this.randomColor();
      ctx.beginPath();
      ctx.arc(Math.random() * width, Math.random() * height, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  randomColor(): string {
    const r = Math.floor(Math.random() * 150);
    const g = Math.floor(Math.random() * 150);
    const b = Math.floor(Math.random() * 150);
    return `rgb(${r},${g},${b})`;
  }

  reloadCaptcha(): void {
    this.generateCaptcha();
  }

  checkCaptcha(): void {
    const input = this.loginForm.get('captchaInput')?.value || '';
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
