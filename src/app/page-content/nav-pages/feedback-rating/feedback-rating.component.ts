import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-feedback-rating',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './feedback-rating.component.html',
  styleUrl: './feedback-rating.component.scss'
})
export class FeedbackRatingComponent {
  // Form data model
  feedbackForm = {
    username: '',
    email: '',
    department: '',
    satisfaction: '',
    feedback: '',
    suggestions: ''
  };

  // Character counts
  feedbackCharCount = 0;
  suggestionsCharCount = 0;

  // UI state
  showSuccessMessage = false;
  formErrors: { [key: string]: boolean } = {};
  ratingBorderError = false;

  // Department options
  departments = [
    { value: '', label: 'Select Department' },
    { value: 'directorate_labour', label: 'Directorate of Labour' },
    { value: 'factories_organisation', label: 'Factories Organisation' },
    { value: 'boilers_organisation', label: 'Boilers Organisation' },
    { value: 'legal_metrology', label: 'Legal Metrology' },
    { value: 'pwd_drinking_water', label: 'PWD (Drinking Water and Sanitation)' },
    { value: 'pollution_control', label: 'Tripura State Pollution Control Board' },
    { value: 'drugs_control', label: 'Drugs Control Administration' },
    { value: 'electrical_inspectorate', label: 'Electrical Inspectorate' },
    { value: 'fire_services', label: 'Directorate of Fire Services' },
    { value: 'excise_department', label: 'Excise Department' },
    { value: 'profession_tax', label: 'Profession Tax' },
    { value: 'tidcl', label: 'TIDCL' },
    { value: 'urban_development', label: 'Urban Development Department' },
    { value: 'co_operation', label: 'Department of Co-operation' },
    { value: 'partnership_firm', label: 'Partnership Firm Registration (I & C)' },
    { value: 'incentive_ic', label: 'Incentive (I & C)' },
    { value: 'levies_taxes', label: 'Levies and Local Taxes' },
    { value: 'rd_panchayat', label: 'RD (Panchayat Department)' },
    { value: 'pwd_water_resources', label: 'PWD (Water Resources)' },
    { value: 'other', label: 'Other' }
  ];

  // Rating options
  ratingOptions = [
    { value: '1', label: 'Poor' },
    { value: '2', label: 'Fair' },
    { value: '3', label: 'Good' },
    { value: '4', label: 'Very Good' },
    { value: '5', label: 'Excellent' }
  ];

  constructor() {}

  // Update character count for textareas
  onFeedbackInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    this.feedbackCharCount = target.value.length;
    this.feedbackForm.feedback = target.value;
    this.clearFieldError('feedback');
  }

  onSuggestionsInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    this.suggestionsCharCount = target.value.length;
    this.feedbackForm.suggestions = target.value;
  }

  // Clear field error when user starts typing
  clearFieldError(fieldName: string): void {
    this.formErrors[fieldName] = false;
  }

  // Clear rating error when user selects a rating
  onRatingChange(): void {
    this.ratingBorderError = false;
  }

  // Validate form
  validateForm(): boolean {
    let isValid = true;
    this.formErrors = {};

    // Validate required fields
    const requiredFields = ['username', 'email', 'department', 'feedback'];
    requiredFields.forEach(field => {
      if (!this.feedbackForm[field as keyof typeof this.feedbackForm]?.trim()) {
        this.formErrors[field] = true;
        isValid = false;
      }
    });

    // Validate email format
    if (this.feedbackForm.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(this.feedbackForm.email)) {
        this.formErrors['email'] = true;
        isValid = false;
      }
    }

    // Validate rating selection
    if (!this.feedbackForm.satisfaction) {
      this.ratingBorderError = true;
      isValid = false;
    }

    return isValid;
  }

  // Handle form submission
  onSubmit(): void {
    if (this.validateForm()) {
      this.showSuccessMessage = true;
      
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Reset form after 3 seconds
      setTimeout(() => {
        this.resetForm();
      }, 3000);

      console.log('Form submitted successfully', this.feedbackForm);
    } else {
      // Scroll to first error
      setTimeout(() => {
        const firstError = document.querySelector('.error');
        if (firstError) {
          firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  }

  // Reset form
  resetForm(): void {
    this.feedbackForm = {
      username: '',
      email: '',
      department: '',
      satisfaction: '',
      feedback: '',
      suggestions: ''
    };
    this.feedbackCharCount = 0;
    this.suggestionsCharCount = 0;
    this.showSuccessMessage = false;
    this.formErrors = {};
    this.ratingBorderError = false;
  }

  // Get star rating for display
  getStarRating(starIndex: number): boolean {
    const selectedRating = Number(this.feedbackForm.satisfaction || '0');
    return starIndex <= selectedRating;
  }

  // Helper method for parsing integers in template
  parseNumber(value: string): number {
    return Number(value);
  }
}