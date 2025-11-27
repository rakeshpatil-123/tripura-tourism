

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { IlogiInputComponent } from '../../../customInputComponents/ilogi-input/ilogi-input.component';
import {
  IlogiSelectComponent,
  SelectOption,
} from '../../../customInputComponents/ilogi-select/ilogi-select.component';
import { MatButtonModule } from '@angular/material/button';
import { GenericService } from '../../../_service/generic/generic.service';
import { Router } from '@angular/router';

interface Department {
  id: number;
  name: string;
  details: string;
}

interface FeedbackListItem {
  department_id: number;
  department_name: string;
  avg_rating: number;
  ratings_count: number;
}

@Component({
  selector: 'app-feedback-rating',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IlogiInputComponent,
    IlogiSelectComponent,
    MatButtonModule,
  ],
  templateUrl: './feedback-rating.component.html',
  styleUrls: ['./feedback-rating.component.scss'],
})
export class FeedbackRatingComponent {
  feedbackForm!: FormGroup;
  departments: SelectOption[] = [];
  isSubmitting = false;
  currentPage = 1;
  itemsPerPage = 5;
  totalPages = 0;
  feedbackList: FeedbackListItem[] = [];

  satisfactionOptions: SelectOption[] = [
    { id: 5, name: 'Very Satisfied (5)' },
    { id: 4, name: 'Satisfied (4)' },
    { id: 3, name: 'Neutral (3)' },
    { id: 2, name: 'Dissatisfied (2)' },
    { id: 1, name: 'Very Dissatisfied (1)' },
  ];

  constructor(private fb: FormBuilder, private apiService: GenericService, private router: Router) {
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
    this.getList();
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
              res.message || 'Thank you for your feedback!',
              'success'
            );
            this.feedbackForm.reset();
            this.getList();
          } else {
            this.apiService.openSnackBar(
              res.message || 'Kindly Check your Username and Email',
              'error'
            );
          }
        },
        error: (err) => {
          this.isSubmitting = false;
          console.error('Feedback submission error:', err);
          this.apiService.openSnackBar(
            err.error.message || 'Kindly Check your Username and Email',
            'error'
          );
        },
      });
  }

  getList(): void {
    this.apiService.postPublicApi({}, 'api/user-feedback-list').subscribe({
      next: (res: any) => {
        if (res?.status === 1 && Array.isArray(res.data)) {
          this.feedbackList = res.data;
          this.currentPage = 1; 
            this.calculateTotalPages();
        }
      },
      error: (err) => {
        console.error('Error fetching feedback list:', err);
      },
    });
  }
    calculateTotalPages(): void {
    this.totalPages = Math.ceil(this.feedbackList.length / this.itemsPerPage);
  }
   get paginatedFeedbackList(): FeedbackListItem[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.feedbackList.slice(startIndex, startIndex + this.itemsPerPage);
  }
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

   nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }
   get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  get f() {
    return this.feedbackForm.controls;
  }

  goToDetails(id: number): void {
    this.router.navigate(['/page/feedback-details', id]);
    
  }
}
