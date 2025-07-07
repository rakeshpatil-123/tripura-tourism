import { Component, OnInit } from '@angular/core';
import { FormConfig, FormFieldConfig } from '../../shared/models/form.models';
import { DynamicFormComponent } from "../../shared/component/dynamic-form/dynamic-form.component";
import { ButtonComponent } from "../../shared/component/button-component/button.component";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-example-form',
  template: `
    <div class="form-container">
      <div class="form-wrapper">
        <div class="form-header">
          <h1>Dynamic Form Example</h1>
          <p>A scalable form component with validation and custom fields</p>
        </div>
        
        <app-dynamic-form  row=2
          [config]="formConfig"
          class="fade-in">
        </app-dynamic-form>
        
        <div class="form-actions-demo">
          <app-button 
            [type]="'secondary'" 
            [size]="'medium'"
            (click)="addField()">
            Add Field
          </app-button>
          
          <app-button 
            [type]="'outline'" 
            [size]="'medium'"
            (click)="removeLastField()">
            Remove Last Field
          </app-button>
          
          <app-button 
            [type]="'ghost'" 
            [size]="'medium'"
            (click)="resetForm()">
            Reset Form
          </app-button>
        </div>
        
        <div class="form-data-preview" *ngIf="formData">
          <h3>Form Data Preview:</h3>
          <pre>{{ formData | json }}</pre>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./example-form.component.scss'],
  imports: [DynamicFormComponent, ButtonComponent , CommonModule]
})
export class ExampleFormComponent implements OnInit  {
  ngOnInit(): void {
    this.addField()
  }
  formData: any = null;
  private fieldCounter = 0;
  
  formConfig: FormConfig = {
    fields: [
      {
        id: 'name',
        type: 'text',
        label: 'Full Name',
        placeholder: 'Enter your full name',
        mandatory: true,
        priority: 5, // Highest priority
        validations: [
          {
            type: 'required',
            message: 'Name is required'
          },
          {
            type: 'minLength',
            value: 2,
            message: 'Name must be at least 2 characters long'
          }
        ]
      },
      {
        id: 'email',
        type: 'email',
        label: 'Email Address',
        placeholder: 'Enter your email address',
        mandatory: true,
        priority: 4, // Second priority
        validations: [
          {
            type: 'required',
            message: 'Email is required'
          },
          {
            type: 'email',
            message: 'Please enter a valid email address'
          }
        ]
      },
      {
        id: 'birthDate',
        type: 'date',
        label: 'Date of Birth',
        mandatory: true,
        priority: 3, // Third priority
        validations: [
          {
            type: 'required',
            message: 'Date of birth is required'
          },
          {
            type: 'custom',
            message: 'You must be at least 18 years old',
            customValidator: (value: string) => {
              if (!value) return true;
              const today = new Date();
              const birthDate = new Date(value);
              const age = today.getFullYear() - birthDate.getFullYear();
              return age >= 18;
            }
          }
        ]
      },
      {
        id: 'father-number',
        type: 'text',
        label: 'Father Phone Number',
        placeholder: 'Enter your father phone number',
        mandatory: true,
        priority: 2, // Fourth priority
        validations: [
          {
            type: 'pattern',
            value: /^\+?[\d\s\-()]+$/,
            message: 'Please enter a valid phone number',
            customValidator: (value: string) => {
              if (!value) return true;
              return /^\+?[\d\s\-()]+$/.test(value);
            }
          }
        ]
      },
      {
        id: 'phone',
        type: 'text',
        label: 'Phone Number',
        placeholder: 'Enter your phone number',
        mandatory: false,
        priority: 1, // Fifth priority
        validations: [
          {
            type: 'pattern',
            value: /^\+?[\d\s\-()]+$/,
            message: 'Please enter a valid phone number'
          }
        ]
      },
      {
        id: 'sdfj',
        type: 'text',
        label: 'Full Name',
        placeholder: 'Enter your fulsdfsfdl name',
        mandatory: true,
        priority: 6, // Sixth priority
        validations: [
          {
            type: 'required',
            message: 'Name is required'
          },
          {
            type: 'minLength',
            value: 2,
            message: 'Name must be at least 2 characters long'
          }
        ]
      }
    ],
    submitButtonText: 'Submit Form',
    submitButtonType: 'primary',
    submitButtonSize: 'medium',
    onSubmit: (data: any) => {
      console.log('Form submitted:', data);
      this.formData = data;
      this.showSuccessMessage();
    },
    onValidationChange: (isValid: boolean) => {
      console.log('Form validation state:', isValid);
    }
  };

  private dynamicFormRef: any; // Reference to the dynamic form component

  showSuccessMessage() {
    // You can implement a toast notification here
    alert('Form submitted successfully!');
  }

  addField() {
    this.fieldCounter++;
    const newField: FormFieldConfig = {
      id: `dynamic_field_${this.fieldCounter}`,
      type: 'text',
      label: `Dynamic Field ${this.fieldCounter}`,
      placeholder: `Enter value for field ${this.fieldCounter}`,
      mandatory: false,
      priority: this.getNextPriority() // Auto-assign next priority
    };
    
    this.formConfig.fields.push(newField);
    // Sort fields by priority after adding
    this.sortFieldsByPriority();
  }

  removeLastField() {
    if (this.formConfig.fields.length > 4) { // Keep the original 4 fields
      this.formConfig.fields.pop();
    }
  }

  resetForm() {
    this.formData = null;
    // If you have a reference to the dynamic form component, you can call resetForm method
    // this.dynamicFormRef.resetForm();
  }

  // Helper method to get the next priority number
  private getNextPriority(): number {
    const maxPriority = Math.max(...this.formConfig.fields.map(f => f.priority || 0));
    return maxPriority + 1;
  }

  // Helper method to sort fields by priority
  private sortFieldsByPriority(): void {
    this.formConfig.fields.sort((a, b) => {
      const priorityA = a.priority || Number.MAX_SAFE_INTEGER;
      const priorityB = b.priority || Number.MAX_SAFE_INTEGER;
      return priorityA - priorityB;
    });
  }
}