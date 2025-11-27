import { Component, OnInit } from '@angular/core';
import { GenericService } from '../../../_service/generic/generic.service';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

interface FeedbackItem {
  id: number;
  user_name: string;
  created_at: string;
  rating: string; 
  feedback: string;
  suggestions: string;
}

interface FeedbackSummary {
  department_id: number;
  department_name: string;
  avg_rating: number;
  ratings_count: number;
}

@Component({
  selector: 'app-feedback-details',
  templateUrl: './feedback-details.component.html',
  imports: [CommonModule],
  styleUrls: ['./feedback-details.component.scss'],
})
export class FeedbackDetailsComponent implements OnInit {
  depId: number | null = null;
  summary: FeedbackSummary | null = null;
  allFeedbacks: FeedbackItem[] = [];
  
  currentPage = 1;
  itemsPerPage = 5; 
  totalPages = 0;

  constructor(
    private apiService: GenericService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const department_id = this.route.snapshot.paramMap.get('id');
    if (department_id) {
      this.depId = +department_id;
      this.getDetails();
    }
  }

  getDetails(): void {
    if (this.depId !== null) {
      this.apiService
        .postPublicApi({ department_id: this.depId }, 'api/user-feedback-details')
        .subscribe({
          next: (response: any) => {
            if (response?.status === 1) {
              this.summary = response.summary;
              this.allFeedbacks = response.data || [];
              this.currentPage = 1;
              this.calculateTotalPages();
            }
          },
          error: (err) => {
            console.error('Error fetching feedback details:', err);
          }
        });
    }
  }

  calculateTotalPages(): void {
    this.totalPages = Math.ceil(this.allFeedbacks.length / this.itemsPerPage);
  }

  get paginatedFeedbacks(): FeedbackItem[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.allFeedbacks.slice(startIndex, startIndex + this.itemsPerPage);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  prevPage(): void {
    if (this.currentPage > 1) this.currentPage--;
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  getRatingDisplay(rating: string): string {
    const num = parseInt(rating, 10);
    return `${num}/5`;
  }
}