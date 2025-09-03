import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-incentive-calculator',
  templateUrl: './incentive-calculator.component.html',
  styleUrls: ['./incentive-calculator.component.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule]
})
export class IncentiveCalculatorComponent implements OnInit {
  investorForm: FormGroup;
  captchaError = false;

  constructor(private fb: FormBuilder) {
    this.investorForm = this.fb.group({
      topic: ['', Validators.required],
      cname: ['', Validators.required],
      caddress: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      activities: [''],
      interest: [''],
      sector: [''],
      aname: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      mobile: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      summary: ['', Validators.required],
      details: ['', Validators.required],
      file: [null],
      ref: ['']
    });
  }

  ngOnInit(): void {}

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.investorForm.patchValue({ file: input.files[0] });
    }
  }

  onSubmit(): void {
    // Reset CAPTCHA error
    this.captchaError = false;

    // Mock CAPTCHA validation (replace with actual reCAPTCHA logic)
    // const captchaResponse = grecaptcha.getResponse();
    // if (!captchaResponse) {
    //   this.captchaError = true;
    //   return;
    // }

    if (this.investorForm.valid) {
      // Mock submission (replace with actual API call)
      console.log('Form Data:', this.investorForm.value);
      alert(`Form submitted successfully! A confirmation email will be sent to ${this.investorForm.get('email')?.value}`);
      this.resetForm();
    }
  }

  resetForm(): void {
    this.investorForm.reset();
    this.captchaError = false;
  }
}