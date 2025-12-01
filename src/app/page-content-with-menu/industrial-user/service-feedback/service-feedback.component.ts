import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IlogiInputComponent } from '../../../customInputComponents/ilogi-input/ilogi-input.component';
import { IlogiSelectComponent, SelectOption } from '../../../customInputComponents/ilogi-select/ilogi-select.component';
import { GenericService } from '../../../_service/generic/generic.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-service-feedback',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IlogiInputComponent, IlogiSelectComponent],
  templateUrl: './service-feedback.component.html',
  styleUrl: './service-feedback.component.scss',
})
export class ServiceFeedbackComponent implements OnInit {
  applicationId: number | null = null;
  feedbackForm!: FormGroup;
  isSubmitting = false;

  satisfactionOptions: SelectOption[] = [
    { id: 5, name: 'Very Satisfied (5)' },
    { id: 4, name: 'Satisfied (4)' },
    { id: 3, name: 'Neutral (3)' },
    { id: 2, name: 'Dissatisfied (2)' },
    { id: 1, name: 'Very Dissatisfied (1)' },
  ];

  constructor(
    private fb: FormBuilder,
    private apiService: GenericService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.applicationId = idParam ? +idParam : null;

    if (this.applicationId === null) {
      this.apiService.openSnackBar('Invalid application ID.', 'error');
    }

    this.initForm();
  }

  private initForm(): void {
    this.feedbackForm = this.fb.group({
      satisfaction: ['', [Validators.required]],
      feedback: ['', [Validators.required, Validators.maxLength(1000)]],
      suggestions: ['', [Validators.maxLength(1000)]],
    });
  }

  submitFeedback(): void {
    if (this.feedbackForm.invalid || this.applicationId === null) {
      this.feedbackForm.markAllAsTouched();
      return;
    }

    if (this.isSubmitting) return;
    this.isSubmitting = true;

    const payload = {
      application_id: this.applicationId,
      satisfaction: this.feedbackForm.get('satisfaction')?.value,
      feedback: this.feedbackForm.get('feedback')?.value,
      suggestions: this.feedbackForm.get('suggestions')?.value || '', 
    };

    this.apiService
      .getByConditions(payload, 'api/user/service-feedback-store')
      .subscribe({
        next: (res: any) => {
          this.isSubmitting = false;
          if (res?.status === 1) {
            this.apiService.openSnackBar(
              res.message || 'Thank you for your feedback!',
              'success'
            );
            this.feedbackForm.reset();
          } else {
            this.apiService.openSnackBar(
              res.message || 'Failed to submit feedback. Please try again.',
              'error'
            );
          }
        },
        error: (err: any) => {
          this.isSubmitting = false;
          console.error('Service feedback error:', err);
          this.apiService.openSnackBar(
            err?.error?.message || 'Something went wrong. Please try again.',
            'error'
          );
        },
      });
  }

  get f() {
    return this.feedbackForm.controls;
  }
}