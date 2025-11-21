import { Component } from '@angular/core';
import {
  FormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';

import { FaIconLibrary, FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faUser, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { IlogiInputComponent } from '../../../customInputComponents/ilogi-input/ilogi-input.component';
import { IlogiSelectComponent } from '../../../customInputComponents/ilogi-select/ilogi-select.component';

interface Department {
  id: number;
  name: string;
  details: string;
}

@Component({
  selector: 'app-query-feedback',
  standalone: true,
  imports: [
  CommonModule, FormsModule, FontAwesomeModule, IlogiInputComponent, IlogiSelectComponent
  ],
  templateUrl: './query-feedback.component.html',
  styleUrls: ['./query-feedback.component.scss'],
})
export class QueryFeedbackFormComponent {
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
   isSubmitting = false;
   hoveredRating: number | null = null; // Track the currently hovered star
 
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
 
   // Font Awesome icons
   faUser = faUser;
   faEnvelope = faEnvelope;
 
   constructor(library: FaIconLibrary) {
     library.addIcons(faUser, faEnvelope);
   }
 
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
 
   // Handle star hover
   onStarHover(value: string): void {
     this.hoveredRating = Number(value);
   }
 
   // Handle mouse leaving star
   onStarLeave(): void {
     this.hoveredRating = null;
   }
 
   // Determine if a star should be highlighted (selected or hovered)
   isStarHovered(starIndex: number): boolean {
     if (this.hoveredRating !== null) {
       return starIndex <= this.hoveredRating;
     }
     return false;
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
       this.isSubmitting = true;
       this.showSuccessMessage = true;
       
       window.scrollTo({ top: 0, behavior: 'smooth' });
 
       setTimeout(() => {
         this.resetForm();
         this.isSubmitting = false;
       }, 3000);
 
       console.log('Form submitted successfully', this.feedbackForm);
     } else {
       setTimeout(() => {
         const firstError = document.querySelector('.error, .rating-section.rating-error');
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
     this.hoveredRating = null;
   }
 
   // Get star rating for display (selected state)
   getStarRating(starIndex: number): boolean {
     const selectedRating = Number(this.feedbackForm.satisfaction || '0');
     return starIndex <= selectedRating;
   }
 
   // Helper method for parsing integers in template
   parseNumber(value: string): number {
     return Number(value);
   }
}
