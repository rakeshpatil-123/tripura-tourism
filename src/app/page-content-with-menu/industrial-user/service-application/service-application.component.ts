import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { GenericService } from '../../../_service/generic/generic.service';
import { IlogiInputComponent } from '../../../customInputComponents/ilogi-input/ilogi-input.component';
import { IlogiRadioComponent } from '../../../customInputComponents/ilogi-radio/ilogi-radio.component';
import {
  IlogiSelectComponent,
  SelectOption,
} from '../../../customInputComponents/ilogi-select/ilogi-select.component';
import { CommonModule } from '@angular/common';
import { IlogiFileUploadComponent } from '../../../customInputComponents/ilogi-file-upload/ilogi-file-upload.component';
import { IlogiInputDateComponent } from '../../../customInputComponents/ilogi-input-date/ilogi-input-date.component';
import { IlogiCheckboxComponent } from '../../../customInputComponents/ilogi-checkbox/ilogi-checkbox.component';

interface ValidationRule {
  type: string;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  errorMessage?: string;
}

interface ServiceQuestion {
  id: number;
  service_id: number;
  question_label: string;
  question_type:
    | 'text'
    | 'number'
    | 'email'
    | 'radio'
    | 'select'
    | 'checkbox'
    | 'textarea'
    | 'date'
    | 'file';
  is_required: 'yes' | 'no';
  options: string | null;
  default_value: string | null;
  default_source_table: string | null;
  default_source_column: string | null;
  display_order: number;
  group_label: string;
  display_width: string;
  validation_required: 'yes' | 'no';
  validation_rule: ValidationRule | null;
  status: number;
  parsedOptions?: { value: string; name: string }[];
}

@Component({
  selector: 'app-service-application',
  imports: [
    IlogiInputComponent,
    IlogiRadioComponent,
    IlogiSelectComponent,
    ReactiveFormsModule,
    CommonModule,
    IlogiFileUploadComponent,
    IlogiInputDateComponent,
    IlogiCheckboxComponent,
  ],
  templateUrl: './service-application.component.html',
  styleUrl: './service-application.component.scss',
  standalone: true,
})
export class ServiceApplicationComponent implements OnInit {
  public Object = Object;
  serviceForm!: FormGroup;
  questions: ServiceQuestion[] = [];
  groupedQuestions: { [group: string]: ServiceQuestion[] } = {};
  serviceId!: number;
  loading = true;
  // Store which fields should be readonly
  readonlyFields: { [key: number]: boolean } = {};

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private apiService: GenericService,
      private cdr: ChangeDetectorRef 
  ) {}

  ngOnInit(): void {
    this.serviceId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.serviceId) {
      this.loadServiceDetails();
    } else {
      this.apiService.openSnackBar('Invalid service ID.', 'error');
      this.loading = false;
    }
  }

  loadServiceDetails(): void {
    const payload = { service_id: this.serviceId };

    this.apiService
      .getByConditions(payload, 'api/service-questionnaire-view')
      .subscribe({
        next: (res: any) => {
          console.log('API Response:', res);

          if (res?.status === 1 && Array.isArray(res.data)) {
            this.questions = res.data
              .filter((q: ServiceQuestion) => q.status === 1)
              .map((q: any) => ({
                ...q,
                parsedOptions: this.parseOptions(q.options),
              }));

            this.groupQuestions();
            this.buildForm();
            // Load default values after form is built
            this.loadDefaultValues();
          } else {
            this.apiService.openSnackBar('No form data found.', 'error');
          }
          this.loading = false;
        },
        error: (err) => {
          console.error('Failed to load service details:', err);
          this.apiService.openSnackBar('Could not load form.', 'error');
          this.loading = false;
        },
      });
  }

loadDefaultValues(): void {
  const userId = this.apiService.getDecryptedUserId();
  if (!userId) {
    console.warn('User ID not found, skipping default value loading');
    return;
  }

  // Find questions that need default values
  const questionsWithDefaults = this.questions.filter(
    q => q.default_source_table && q.default_source_column
  );

  console.log('Questions with defaults:', questionsWithDefaults);

  if (questionsWithDefaults.length === 0) {
    console.log('No questions need default values');
    return;
  }

  // Process each question that needs default value
  questionsWithDefaults.forEach(question => {
    const columnKey = question.default_source_column;
    
    if (!columnKey) {
      console.warn(`No default_source_column for question ${question.id}`);
      return;
    }

    const payload = {
      user_id: userId,
      default_source_table: question.default_source_table,
      default_source_column: columnKey
    };

    console.log(`Making API call for question ${question.id}:`, payload);

    this.apiService
      .getByConditions(payload, 'api/get-default-source')
      .subscribe({
        next: (res: any) => {
          console.log(` API Response for question ${question.id}:`, res);

          if (res && (res.hasOwnProperty('value') || res.hasOwnProperty(columnKey))) {
            // Get the default value
            let defaultValue: any = null;
            
            if (res.hasOwnProperty('value')) {
              defaultValue = res.value;
            } else if (res.hasOwnProperty(columnKey)) {
              defaultValue = res[columnKey];
            }
            
            console.log(`Extracted defaultValue:`, defaultValue);

            if (defaultValue !== undefined && defaultValue !== null && defaultValue !== '') {
              const controlName = question.id.toString();
              const control = this.serviceForm.get(controlName);
              
              console.log(`Form control ${controlName}:`, control);
              
              if (control) {
                control.setValue(defaultValue);
                this.readonlyFields[question.id] = true;
                console.log(` Successfully set default value for question ${question.id}:`, defaultValue);
                
                // Force change detection
                this.cdr?.detectChanges();
              } else {
                console.warn(` Form control not found for question ${question.id}`);
              }
            }
          } 
          else if (res?.status === 1 && res.data && res.data.length > 0) {
            let defaultValue: any = null;
            
            if (res.data[0].hasOwnProperty('value')) {
              defaultValue = res.data[0].value;
            } else if (res.data[0].hasOwnProperty(columnKey)) {
              defaultValue = res.data[0][columnKey];
            }
            
            if (defaultValue !== undefined && defaultValue !== null && defaultValue !== '') {
              const controlName = question.id.toString();
              const control = this.serviceForm.get(controlName);
              
              if (control) {
                control.setValue(defaultValue);
                this.readonlyFields[question.id] = true;
                console.log(`✅ Successfully set default value for question ${question.id}:`, defaultValue);
                this.cdr?.detectChanges();
              }
            }
          } else {
            console.log(`No valid data returned for question ${question.id}`);
          }
        },
        error: (err) => {
          console.error(` Failed to load default value for question ${question.id}:`, err);
        }
      });
  });
}

  groupQuestions(): void {
    this.groupedQuestions = {};
    this.questions.forEach((q) => {
      const group = q.group_label || 'General';
      if (!this.groupedQuestions[group]) {
        this.groupedQuestions[group] = [];
      }
      this.groupedQuestions[group].push(q);
    });
  }

  buildForm(): void {
    const group: any = {};

    this.questions.forEach((q) => {
      const validators = [];

      // Required validation
      if (q.is_required === 'yes') {
        validators.push(Validators.required);
      }

      // Dynamic validation rules
      if (q.validation_required === 'yes' && q.validation_rule) {
        const rule = q.validation_rule;

        if (rule.minLength) {
          // For checkbox, minLength means at least N options must be selected
          if (q.question_type === 'checkbox') {
            validators.push(Validators.minLength(rule.minLength));
          } else {
            validators.push(Validators.minLength(rule.minLength));
          }
        }
        if (rule.maxLength) {
          // For checkbox, maxLength means at most N options can be selected
          if (q.question_type === 'checkbox') {
            validators.push(Validators.maxLength(rule.maxLength));
          } else {
            validators.push(Validators.maxLength(rule.maxLength));
          }
        }

        if (
          rule.pattern &&
          !['radio', 'select', 'file', 'checkbox'].includes(q.question_type)
        ) {
          try {
            validators.push(Validators.pattern(new RegExp(rule.pattern)));
          } catch (e) {
            console.warn(
              `Invalid regex pattern for question ${q.id}:`,
              rule.pattern
            );
          }
        }
      }

      // Default value
      let defaultValue: any = q.default_value || '';

      // Handle default for date
      if (q.question_type === 'date' && defaultValue) {
        const date = new Date(defaultValue);
        defaultValue = isNaN(date.getTime()) ? null : date;
      }

      // File should default to null
      if (q.question_type === 'file') {
        defaultValue = null;
      }

      // Checkbox should default to empty array
      if (q.question_type === 'checkbox') {
        defaultValue = [];
      }

      group[q.id] = [defaultValue, validators];
    });

    this.serviceForm = this.fb.group(group);
  }

  parseOptions(options: string | null): { value: string; name: string }[] {
    if (!options || !options.trim()) {
      return [];
    }

    return options.split(',').map((option) => ({
      value: option.trim(),
      name: option.trim(),
    }));
  }

  convertToSelectOptionFormat(
    options: { value: string; name: string }[]
  ): SelectOption[] {
    return options.map((opt) => ({
      id: opt.value,
      name: opt.name,
    }));
  }

isFieldReadonly(questionId: number): boolean {
  // Only log once to avoid spam
  const isReadonly = !!this.readonlyFields[questionId];
  return isReadonly;
}

 onSubmit(): void {
  this.serviceForm.markAllAsTouched();

  if (this.serviceForm.invalid) {
    const invalidControlKey = Object.keys(this.serviceForm.controls).find(
      (key) => {
        const control = this.serviceForm.get(key);
        return control?.invalid && (control.touched || control.dirty);
      }
    );

    if (invalidControlKey) {
      const question = this.questions.find(
        (q) => q.id.toString() === invalidControlKey
      );
      let errorMessage = 'Please fix errors.';

      if (question) {
        const label = question.question_label;
        const control = this.serviceForm.get(invalidControlKey);

        // Use backend error message if available
        if (question.validation_rule?.errorMessage) {
          const backendMsg = question.validation_rule.errorMessage;

          if (backendMsg.includes(label)) {
            errorMessage = backendMsg;
          } else {
            errorMessage = `${label}: ${backendMsg}`;
          }
        }
        // Handle required field errors FIRST
        else if (control?.hasError('required')) {
          if (question.question_type === 'radio') {
            errorMessage = `Please select ${label}`;
          } else if (question.question_type === 'select') {
            errorMessage = `Please select a ${label}.`;
          } else if (question.question_type === 'file') {
            errorMessage = `Please upload a ${label}.`;
          } else if (question.question_type === 'date') {
            errorMessage = `Please select a ${label}.`;
          } else if (question.question_type === 'checkbox') {
            errorMessage = `Please select at least one ${label}.`;
          } else {
            errorMessage = `${label} is required.`;
          }
        }
        // Handle minlength for checkbox
        else if (control?.hasError('minlength')) {
          const requiredLength =
            control.errors?.['minlength']?.requiredLength;
          if (question.question_type === 'checkbox') {
            errorMessage = `Please select at least ${requiredLength} ${label}.`;
          } else {
            errorMessage = `${label} must be at least ${requiredLength} characters.`;
          }
        }
        // Handle maxlength for checkbox
        else if (control?.hasError('maxlength')) {
          const requiredLength =
            control.errors?.['maxlength']?.requiredLength;
          if (question.question_type === 'checkbox') {
            errorMessage = `You can select at most ${requiredLength} ${label}.`;
          } else {
            errorMessage = `${label} must be at most ${requiredLength} characters.`;
          }
        }
      }

      this.apiService.openSnackBar(errorMessage, 'error');
      return;
    }
  }

  const userId = this.apiService.getDecryptedUserId();
  
  if (!userId) {
    this.apiService.openSnackBar('User not authenticated.', 'error');
    return;
  }

  // Build application_data object
  const applicationData: { [key: string]: any } = {};
  
  const raw = this.serviceForm.getRawValue();
  
  Object.keys(raw).forEach((key) => {
    const question = this.questions.find((q) => q.id.toString() === key);
    if (question) {
      let value = raw[key];

      // Format date for submission
      if (question.question_type === 'date' && value instanceof Date) {
        value = value.toISOString().split('T')[0]; // YYYY-MM-DD
      }

      // File: send as null or filename
      if (question.question_type === 'file') {
        value = value ? value.name : null;
      }

      // Checkbox: send as comma-separated string
      if (question.question_type === 'checkbox') {
        value = Array.isArray(value) ? value.join(', ') : value;
      }

      // Add to application data with question ID as key
      applicationData[key] = value;
    }
  });

  const payload = {
    user_id: Number(userId), // Convert to number if needed
    service_id: this.serviceId,
    application_data: applicationData
  };

  // console.log(' Submission Payload:', payload);

  this.apiService
    .getByConditions(payload, 'api/user/service-application-store')
    .subscribe({
      next: (res) => {
        if (res?.status === 1) {
          this.apiService.openSnackBar(
            'Application submitted successfully!',
            'success'
          );
        } else {
          this.apiService.openSnackBar(
            res?.message || 'Submission failed.',
            'error'
          );
        }
      },
      error: (err) => {
        console.error('Submission error:', err);
        this.apiService.openSnackBar(
          err?.error?.message || 'Submission failed. Please try again.',
          'error'
        );
      },
    });
}
}
