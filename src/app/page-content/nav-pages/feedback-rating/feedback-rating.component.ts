import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faUser, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IlogiInputComponent } from '../../../customInputComponents/ilogi-input/ilogi-input.component';
import { IlogiSelectComponent, SelectOption } from '../../../customInputComponents/ilogi-select/ilogi-select.component';
import { MatButtonModule } from '@angular/material/button';
import { GenericService } from '../../../_service/generic/generic.service';

interface Department {
  id: number;
  name: string;
  details: string;
}

@Component({
  selector: 'app-feedback-rating',
  standalone: true,
  imports: [ CommonModule,
    ReactiveFormsModule,
    IlogiInputComponent,
    IlogiSelectComponent,
    MatButtonModule,],
  templateUrl: './feedback-rating.component.html',
  styleUrls: ['./feedback-rating.component.scss']
})
export class FeedbackRatingComponent {
 
 feedbackForm!: FormGroup;
  departments: SelectOption[] = [];
  isSubmitting = false;

  satisfactionOptions: SelectOption[] = [
    { id: 5, name: 'Very Satisfied (5)' },
    { id: 4, name: 'Satisfied (4)' },
    { id: 3, name: 'Neutral (3)' },
    { id: 2, name: 'Dissatisfied (2)' },
    { id: 1, name: 'Very Dissatisfied (1)' },
  ];

  constructor(private fb: FormBuilder, private apiService: GenericService) {
    this.feedbackForm = this.fb.group({
      user_name: ['', [Validators.required, Validators.maxLength(255)]],
      email: [
        '',
        [Validators.required, Validators.email, Validators.maxLength(255)],
      ],
      department_id: ['', Validators.required],
      satisfaction: ['', Validators.required],
      feedback: ['', [Validators.required, Validators.maxLength(1000)]],
      suggestions: ['', [Validators.maxLength(1000)]],
    });
  }

  ngOnInit(): void {
    this.loadDepartments();
  }

  loadDepartments(): void {
    this.apiService
      .postPublicApi({}, 'api/department-get-all-departments')
      .subscribe({
        next: (res) => {
          if (res?.status === 1 && Array.isArray(res.data)) {
            this.departments = res.data.map((dept: Department) => ({
              id: dept.id,
              name: dept.name,
            }));
          }
        },
        error: (err) => {
          console.error('Failed to load departments:', err);
        },
      });
  }

  submitFeedback(): void {
    if (this.feedbackForm.invalid) {
      this.feedbackForm.markAllAsTouched();
      return;
    }

    if (this.isSubmitting) return;
    this.isSubmitting = true;

    const payload = {
      user_name: this.feedbackForm.get('user_name')?.value,
      email: this.feedbackForm.get('email')?.value,
      department_id: this.feedbackForm.get('department_id')?.value,
      satisfaction: this.feedbackForm.get('satisfaction')?.value,
      feedback: this.feedbackForm.get('feedback')?.value,
      suggestions: this.feedbackForm.get('suggestions')?.value,
    };

    this.apiService
      .postPublicApi(payload, 'api/user-feedback-store')
      .subscribe({
        next: (res) => {
          this.isSubmitting = false;
          if (res?.status === 1) {
            this.apiService.openSnackBar(
              res.message ||
              'Thank you for your feedback!', 'success'
            );
            this.feedbackForm.reset();
          } else {
            this.apiService.openSnackBar(
              res.message ||
              'Kindly Check your Username and Emali', 'error'
            );
          }
        },
        error: (err) => {
          this.isSubmitting = false;
          console.error('Feedback submission error:', err);
          this.apiService.openSnackBar(
              err.error.message ||
              'Kindly Check your Username and Emali', 'error'
            );
        },
      });
  }

  get f() {
    return this.feedbackForm.controls;
  }
}

