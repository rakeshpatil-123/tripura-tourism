import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-query-feedback',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './query-feedback.component.html',
  styleUrls: ['./query-feedback.component.scss']
})
export class QueryFeedbackFormComponent {
  queryFeedbackForm: FormGroup;
  submitted = false;
  selectedFile: File | null = null;

  departments = [
    'Co-Operative Registrar',
    'Industries & Commerce',
    'Jalboard Tripura',
    'Bidyut Bandhu',
    'Revenue Department',
    'PWD (Water & Resources)',
    'Directorate of Fire Service',
    'Drugs Control Administration',
    'Electrical Inspectorate',
    'Excise Department',
    'Factories & Boilers Organisation',
    'Industries & Commerce (Incentive)',
    'IT & Admin',
    'Directorate of Labour',
    'Land Records & Settlement',
    'Legal Methodology',
    'Partnership Firm Registration',
    'PWD (Drinking Water & Sanitation)',
    'Taxes Organization',
    'Tripura State Pollution Control Board',
    'Tripura State Electricity Corporation Ltd',
    'Tripura Industrial Development Corporation Ltd',
    'Tripura Forest Department',
    'Urban Development Department'
  ];

  types = ['Query', 'Feedback', 'Complaint'];

  constructor(private fb: FormBuilder) {
    this.queryFeedbackForm = this.fb.group({
      name: ['', Validators.required],
      department: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      mobile: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      description: ['', Validators.required],
      type: ['', Validators.required],
      subject: ['', Validators.required]
    });
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.queryFeedbackForm.valid) {
      const formData = new FormData();
      Object.keys(this.queryFeedbackForm.value).forEach(key => {
        formData.append(key, this.queryFeedbackForm.value[key]);
      });
      if (this.selectedFile) {
        formData.append('file', this.selectedFile);
      }
      // Here you would typically send formData to a backend service
      console.log('Form submitted:', formData);
      this.onReset();
    }
  }

  onReset(): void {
    this.submitted = false;
    this.queryFeedbackForm.reset();
    this.selectedFile = null;
  }
}