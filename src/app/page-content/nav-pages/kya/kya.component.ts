import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GenericService } from '../../../_service/generic/generic.service';

interface Question {
  id: number;
  question: string;
  answer?: boolean;
  serial_no?: number;
  department?: string;
  approval_name?: string;
  stage_of_business?: string;
  sla_days?: string;
  risk_category?: string;
}

interface UtilityQuestion {
  id?: number;
  question: string;
  answer?: boolean;
}

interface ApprovalDetail {
  [key: string]: any;
}

@Component({
  selector: 'app-kya',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './kya.component.html',
  styleUrl: './kya.component.scss'
})
export class KYAComponent implements OnInit {
  sectors: string[] = [];
  industrySectors: string[] = [];
  industryQuestions: Question[] = [];
  utilityQuestions: UtilityQuestion[] = [];
  riskCategory: string = '';
  approvalDetails: ApprovalDetail[] = [];
  utilitiesData: any[] = [];
  
  selectedSector: string = '';
  selectedIndustry: string = '';
  
  loading: boolean = false;
  showApprovalDetails: boolean = false;

  constructor(private apiService: GenericService) {}

  ngOnInit(): void {
    this.getSectors();
  }

  getSectors(): void {
    this.loading = true;
    this.apiService.postPublicApi({}, 'api/kya/sectors').subscribe({
      next: (response) => {
        if (response.status && response.sectors) {
          this.sectors = response.sectors;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching sectors:', error);
        this.loading = false;
      }
    });
  }

  onSectorChange(): void {
    if (!this.selectedSector) {
      this.industrySectors = [];
      this.industryQuestions = [];
      this.utilityQuestions = [];
      this.riskCategory = '';
      this.showApprovalDetails = false;
      return;
    }

    this.loading = true;
    this.selectedIndustry = '';
    this.industryQuestions = [];
    this.utilityQuestions = [];
    this.riskCategory = '';
    this.showApprovalDetails = false;

    this.apiService.postPublicApi({ sector: this.selectedSector }, 'api/kya/industry-sectors').subscribe({
      next: (response) => {
        if (response.status && response.industry_sectors) {
          this.industrySectors = response.industry_sectors;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching industry sectors:', error);
        this.loading = false;
      }
    });
  }

  onIndustryChange(): void {
    if (!this.selectedIndustry) {
      this.industryQuestions = [];
      this.utilityQuestions = [];
      this.riskCategory = '';
      this.showApprovalDetails = false;
      return;
    }

    this.loading = true;
    this.showApprovalDetails = false;

    this.apiService.postPublicApi({ industry: this.selectedIndustry }, 'api/kya/questions').subscribe({
      next: (response) => {
        if (response.status) {
          // Set risk category
          this.riskCategory = response.risk_category || '';
          
          // Set industry questions
          this.industryQuestions = response.industry || [];
          
          // Set utility questions - they are now objects with id, question, etc.
          if (response.utility && Array.isArray(response.utility)) {
            this.utilityQuestions = response.utility.map((utilityItem: any) => ({
              id: utilityItem.id,
              question: utilityItem.question,
              answer: undefined
            }));
          }
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching questions:', error);
        this.loading = false;
      }
    });
  }

  onAnswerChange(question: Question | UtilityQuestion, answer: boolean): void {
    question.answer = answer;
  }

  showApplicationInformation(): void {
    const selectedIds: number[] = [];
    const selectedUtilityIds: number[] = [];
    
    // Collect industry question IDs where answer is Yes
    this.industryQuestions.forEach(question => {
      if (question.answer === true) {
        selectedIds.push(question.id);
      }
    });

    // Collect utility question IDs where answer is Yes
    this.utilityQuestions.forEach(question => {
      if (question.answer === true && question.id) {
        selectedUtilityIds.push(question.id);
      }
    });

    if (selectedIds.length === 0 && selectedUtilityIds.length === 0) {
      alert('Please select at least one "Yes" answer before proceeding.');
      return;
    }

    this.loading = true;

    const payload = {
      ids: selectedIds,
      utility_ids: selectedUtilityIds
    };

    this.apiService.postPublicApi(payload, 'api/kya/approval-details').subscribe({
      next: (response) => {
        if (response.status) {
          this.approvalDetails = response.records || [];
          this.utilitiesData = response.utilities_data || [];
          this.showApprovalDetails = true;
          
          // Scroll to top
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching approval details:', error);
        this.loading = false;
      }
    });
  }

  resetForm(): void {
    this.selectedSector = '';
    this.selectedIndustry = '';
    this.sectors = [];
    this.industrySectors = [];
    this.industryQuestions = [];
    this.utilityQuestions = [];
    this.riskCategory = '';
    this.approvalDetails = [];
    this.utilitiesData = [];
    this.showApprovalDetails = false;
    this.getSectors();
  }

  backToQuestions(): void {
    this.showApprovalDetails = false;
    this.approvalDetails = [];
    this.utilitiesData = [];
  }

  getObjectKeys(obj: any): string[] {
    return Object.keys(obj);
  }

  formatKey(key: string): string {
    return key.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
  }
}