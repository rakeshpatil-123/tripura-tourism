import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IlogiInputComponent } from '../../../customInputComponents/ilogi-input/ilogi-input.component';
import { GenericService } from '../../../_service/generic/generic.service';
import { Router } from '@angular/router';
import { MatIconModule } from "@angular/material/icon";
import { LoaderService } from '../../../_service/loader/loader.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IlogiInputComponent, MatIconModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit, AfterViewInit, OnDestroy {
  loginForm: FormGroup;
  images: string[] = [
    '../../../../assets/images/First_Department-list.png',
    '../../../../assets/images/Second_Department-list.png'
  ];
  currentImageIndex = 0;
  previousImageIndex = 0;
  private intervalId: any;

  @ViewChild('captchaCanvas') captchaCanvas!: ElementRef<HTMLCanvasElement>;
  captchaCode: string = '';
  length: number = 6; // standard captcha length
  characters: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  captchaValid: boolean = false;

  constructor(
    private fb: FormBuilder,
    private genericService: GenericService,
    private loaderService : LoaderService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      user_name: ['', Validators.required],
      password: ['', Validators.required],
      captchaInput: ['',]
    });
  }

  ngOnInit(): void {
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
    if (!this.captchaValid) {
      this.genericService.openSnackBar('Please enter the correct CAPTCHA!', 'Error');
      return;
    }

    if (this.loginForm.valid) {
      const payload = this.loginForm.value;
      this.loaderService.showLoader();
      this.genericService.loginUser(payload).pipe(finalize(()=>this.loaderService.hideLoader())).subscribe({
        next: (response) => {
          if (response?.token) {
            localStorage.setItem('token', response.token);
          }

          this.genericService.storeSessionData(response, payload.rememberMe || false);
          localStorage.setItem('userName', response.data.authorized_person_name);

          localStorage.setItem('userRole', response.data.user_type);
          localStorage.setItem('email_id', response.data.email_id);
          localStorage.setItem('deptId', response.data.department_id || '');
          localStorage.setItem('deptName', response.data.department_name || '');
          localStorage.setItem('email_id', response.data.email_id);
          localStorage.setItem('hierarchy', response.data.hierarchy || '');
          localStorage.setItem('designation', response.data.designation || '');
          localStorage.setItem('district', response.data.district || '');
          localStorage.setItem('subdivision', response.data.subdivision || '');
          localStorage.setItem('ulb', response.data.ulb || '');
          localStorage.setItem('ward', response.data.ward || '');
          localStorage.setItem('userId', response.data.id || '');
          localStorage.setItem('bin', response.data.bin || '');
          localStorage.setItem('deptId', response.data.department_id || '');
          this.genericService.openSnackBar('Login successful!', 'Success');
          this.genericService.setLoginStatus(true);
          this.loginForm.reset();
          this.captchaValid = false;
          this.generateCaptcha();
        },
        error: (err) => {
          this.genericService.openSnackBar(
            'Login failed. Please check your credentials.',
            'Error'
          );
          if (err.status === 401 || err.status === 400) {
            this.loginForm.get('user_name')?.setErrors({ invalid: true });
            this.loginForm.get('password')?.setErrors({ invalid: true });
          }
        },
      });
    } else {
      this.genericService.openSnackBar(
        'Please fill in all fields correctly.',
        'Error'
      );
    }
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
}
