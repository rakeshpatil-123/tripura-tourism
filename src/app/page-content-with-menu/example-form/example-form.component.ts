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
        
        <app-dynamic-form 
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
        id: 'phone',
        type: 'text',
        label: 'Phone Number',
        placeholder: 'Enter your phone number',
        mandatory: false,
        validations: [
          {
            type: 'pattern',
            value: /^\+?[\d\s\-()]+$/,
            message: 'Please enter a valid phone number'
          }
        ]
      },
      {
        id: 'father-number',
        type: 'text',
        label: 'Father Phone Number',
        placeholder: 'Enter your father phone number',
        mandatory: true,
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
        id: 'birthDate',
        type: 'date',
        label: 'Date of Birth',
        mandatory: true,
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
      mandatory: false
    };
    
    this.formConfig.fields.push(newField);
    // If you have a reference to the dynamic form component, you can call addField method
    // this.dynamicFormRef.addField(newField);
  }

  removeLastField() {
    if (this.formConfig.fields.length > 4) { // Keep the original 4 fields
      this.formConfig.fields.pop();
      // If you have a reference to the dynamic form component, you can call removeField method
      // this.dynamicFormRef.removeField(fieldId);
    }
  }

  resetForm() {
    this.formData = null;
    // If you have a reference to the dynamic form component, you can call resetForm method
    // this.dynamicFormRef.resetForm();
  }
}