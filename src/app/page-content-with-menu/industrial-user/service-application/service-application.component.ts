import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormArray,
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
  display_order: number | null;
  group_label: string | null;
  display_width: string | null;
  validation_required: 'yes' | 'no';
  validation_rule: ValidationRule | null;
  status: number;
  parsedOptions?: { value: string; name: string }[];
  sample_format: string | null;
  is_section: string | null;
  section_name: string | null;
}

interface SectionGroup {
  sectionName: string;
  questions: ServiceQuestion[];
  formArray: FormArray;
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
  sectionGroups: SectionGroup[] = [];
  serviceId!: number;
  loading = true;
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
          if (res?.status === 1 && Array.isArray(res.data)) {
            this.questions = res.data
              .filter((q: ServiceQuestion) => q.status === 1)
              .map((q: any) => ({
                ...q,
                parsedOptions: this.parseOptions(q.options),
              }));

            this.processSections();
            this.groupQuestions();
            this.buildForm();
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

  processSections(): void {
    this.sectionGroups = [];
    
    // Group questions by section_name (only where is_section === "yes" AND section_name is not null/empty)
    const sectionMap = new Map<string, ServiceQuestion[]>();
    
    this.questions.forEach(question => {
      if (question.is_section === 'yes' && question.section_name && question.section_name.trim() !== '') {
        if (!sectionMap.has(question.section_name)) {
          sectionMap.set(question.section_name, []);
        }
        sectionMap.get(question.section_name)?.push(question);
      }
    });

    // Create section groups
    sectionMap.forEach((questions, sectionName) => {
      const sortedQuestions = [...questions].sort((a, b) => 
        (a.display_order || 0) - (b.display_order || 0)
      );
      
      this.sectionGroups.push({
        sectionName,
        questions: sortedQuestions,
        formArray: this.fb.array([])
      });
    });

    // Keep only non-section questions in the main array
    this.questions = this.questions.filter(q => 
      !(q.is_section === 'yes' && q.section_name && q.section_name.trim() !== '')
    );
  }

  loadDefaultValues(): void {
    const userId = this.apiService.getDecryptedUserId();
    if (!userId) {
      console.warn('User ID not found, skipping default value loading');
      return;
    }

    const questionsWithDefaults = this.questions.filter(
      (q) => q.default_source_table && q.default_source_column
    );

    if (questionsWithDefaults.length === 0) {
      return;
    }

    questionsWithDefaults.forEach((question) => {
      const columnKey = question.default_source_column;
      if (!columnKey) return;

      const payload = {
        user_id: userId,
        default_source_table: question.default_source_table,
        default_source_column: columnKey,
      };

      this.apiService
        .getByConditions(payload, 'api/get-default-source')
        .subscribe({
          next: (res: any) => {
            let defaultValue: any = null;
            
            if (res && (res.hasOwnProperty('value') || res.hasOwnProperty(columnKey))) {
              defaultValue = res.value || res[columnKey];
            } else if (res?.status === 1 && res.data && res.data.length > 0) {
              defaultValue = res.data[0].value || res.data[0][columnKey];
            }

            if (defaultValue !== undefined && defaultValue !== null && defaultValue !== '') {
              const controlName = question.id.toString();
              const control = this.serviceForm.get(controlName);
              if (control) {
                control.setValue(defaultValue);
                this.readonlyFields[question.id] = true;
                this.cdr?.detectChanges();
              }
            }
          },
          error: (err) => {
            console.error(`Failed to load default value for question ${question.id}:`, err);
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

    // Build form for regular questions
    this.questions.forEach((q) => {
      const validators = [];

      if (q.is_required === 'yes') {
        validators.push(Validators.required);
      }

      if (q.validation_required === 'yes' && q.validation_rule) {
        const rule = q.validation_rule;

        if (rule.minLength !== undefined) {
          validators.push(Validators.minLength(rule.minLength));
        }
        if (rule.maxLength !== undefined) {
          validators.push(Validators.maxLength(rule.maxLength));
        }

        if (
          rule.pattern &&
          rule.pattern.trim() !== '' &&
          !['radio', 'select', 'file', 'checkbox'].includes(q.question_type)
        ) {
          try {
            validators.push(Validators.pattern(new RegExp(rule.pattern)));
          } catch (e) {
            console.warn(`Invalid regex pattern for question ${q.id}:`, rule.pattern);
          }
        }
      }

      let defaultValue: any = q.default_value || '';

      if (q.question_type === 'date' && defaultValue) {
        const date = new Date(defaultValue);
        defaultValue = isNaN(date.getTime()) ? null : date;
      }

      if (q.question_type === 'file') {
        defaultValue = null;
      }

      if (q.question_type === 'checkbox') {
        defaultValue = [];
      }

      group[q.id] = [defaultValue, validators];
    });

    // Build form arrays for sections
    this.sectionGroups.forEach(sectionGroup => {
      const initialRow = this.createSectionRow(sectionGroup.questions);
      sectionGroup.formArray.push(initialRow);
    });

    this.serviceForm = this.fb.group({
      ...group,
      ...this.sectionGroups.reduce((acc, section) => {
        acc[section.sectionName] = section.formArray;
        return acc;
      }, {} as any)
    });
  }

  createSectionRow(questions: ServiceQuestion[]): FormGroup {
    const rowGroup: any = {};
    
    questions.forEach(q => {
      const validators = [];
      
      if (q.is_required === 'yes') {
        validators.push(Validators.required);
      }

      if (q.validation_required === 'yes' && q.validation_rule) {
        const rule = q.validation_rule;
        
        if (rule.minLength !== undefined) {
          validators.push(Validators.minLength(rule.minLength));
        }
        if (rule.maxLength !== undefined) {
          validators.push(Validators.maxLength(rule.maxLength));
        }
      }

      let defaultValue: any = q.default_value || '';

      if (q.question_type === 'date' && defaultValue) {
        const date = new Date(defaultValue);
        defaultValue = isNaN(date.getTime()) ? null : date;
      }

      if (q.question_type === 'file') {
        defaultValue = null;
      }

      if (q.question_type === 'checkbox') {
        defaultValue = [];
      }

      rowGroup[q.id] = [defaultValue, validators];
    });

    return this.fb.group(rowGroup);
  }

  addSectionRow(sectionName: string): void {
    const sectionGroup = this.sectionGroups.find(s => s.sectionName === sectionName);
    if (sectionGroup) {
      const newRow = this.createSectionRow(sectionGroup.questions);
      sectionGroup.formArray.push(newRow);
    }
  }

  removeSectionRow(sectionName: string, index: number): void {
    const sectionGroup = this.sectionGroups.find(s => s.sectionName === sectionName);
    if (sectionGroup && sectionGroup.formArray.length > 1) {
      sectionGroup.formArray.removeAt(index);
    }
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
    return !!this.readonlyFields[questionId];
  }

  getSectionFormArray(sectionName: string): FormArray {
    return this.serviceForm.get(sectionName) as FormArray;
  }

  onSubmit(): void {
    this.serviceForm.markAllAsTouched();

    if (this.serviceForm.invalid) {
      // Your existing validation error handling
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

          if (question.validation_rule?.errorMessage) {
            const backendMsg = question.validation_rule.errorMessage;
            if (backendMsg.includes(label)) {
              errorMessage = backendMsg;
            } else {
              errorMessage = `${label}: ${backendMsg}`;
            }
          } else if (control?.hasError('required')) {
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
          } else if (control?.hasError('minlength')) {
            const requiredLength = control.errors?.['minlength']?.requiredLength;
            if (question.question_type === 'checkbox') {
              errorMessage = `Please select at least ${requiredLength} ${label}.`;
            } else {
              errorMessage = `${label} must be at least ${requiredLength} characters.`;
            }
          } else if (control?.hasError('maxlength')) {
            const requiredLength = control.errors?.['maxlength']?.requiredLength;
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

    const raw = this.serviceForm.getRawValue();

    // Check if any file exists (regular or section fields)
    let hasFileToUpload = false;

    // Check regular file fields
    hasFileToUpload = this.questions.some(q => {
      const key = q.id.toString();
      const value = raw[key];
      return q.question_type === 'file' && value instanceof File;
    });

    // Check section file fields
    if (!hasFileToUpload) {
      this.sectionGroups.forEach(section => {
        const sectionData = raw[section.sectionName] || [];
        sectionData.forEach((row: any) => {
          section.questions.forEach(q => {
            if (q.question_type === 'file' && row[q.id] instanceof File) {
              hasFileToUpload = true;
            }
          });
        });
      });
    }

    if (hasFileToUpload) {
      this.submitWithFiles(userId, raw);
    } else {
      this.submitAsJson(userId, raw);
    }
  }

  // ✅ KEY CHANGE: Store section data by question ID, not by section
  private submitAsJson(userId: string, raw: any): void {
    const applicationData: { [key: string]: any } = {};

    // Regular fields
    Object.keys(raw).forEach(key => {
      if (this.sectionGroups.some(s => s.sectionName === key)) {
        return; // Skip section arrays for now
      }

      const question = this.questions.find(q => q.id.toString() === key);
      if (!question) return;

      let value = raw[key];

      if (question.question_type === 'date' && value instanceof Date) {
        value = value.toISOString().split('T')[0];
      }

      if (question.question_type === 'checkbox') {
        value = Array.isArray(value) ? value.join(', ') : value;
      }

      if (question.question_type === 'file') {
        value = null;
      }

      applicationData[key] = value;
    });

    // ✅ SECTION FIELDS: Store by question ID with array values
    this.sectionGroups.forEach(section => {
      const sectionData = raw[section.sectionName] || [];
      
      section.questions.forEach(q => {
        const questionId = q.id.toString();
        const values: any[] = [];
        
        sectionData.forEach((row: any) => {
          let value = row[q.id];
          
          if (q.question_type === 'date' && value instanceof Date) {
            value = value.toISOString().split('T')[0];
          }
          
          if (q.question_type === 'checkbox') {
            value = Array.isArray(value) ? value.join(', ') : value;
          }
          
          if (q.question_type === 'file') {
            value = null; // Files handled separately in FormData
          }
          
          values.push(value);
        });
        
        applicationData[questionId] = values;
      });
    });

    const payload = {
      user_id: Number(userId),
      service_id: this.serviceId,
      application: applicationData,
    };

    this.apiService.getByConditions(payload, 'api/user/service-application-store')
      .subscribe({
        next: (res) => {
          if (res?.status === 1) {
            this.apiService.openSnackBar('Application submitted successfully!', 'success');
          } else {
            this.apiService.openSnackBar(res?.message || 'Submission failed.', 'error');
          }
        },
        error: (err) => {
          console.error('Submission error:', err);
          this.apiService.openSnackBar(
            err?.error?.message || 'Submission failed. Please try again.',
            'error'
          );
        }
      });
  }

  private submitWithFiles(userId: string, raw: any): void {
    const formData = new FormData();
    formData.append('user_id', userId);
    formData.append('service_id', this.serviceId.toString());

    // Regular fields
    Object.keys(raw).forEach(key => {
      if (this.sectionGroups.some(s => s.sectionName === key)) {
        return;
      }

      const question = this.questions.find(q => q.id.toString() === key);
      if (!question) return;

      let value = raw[key];

      if (question.question_type === 'date' && value instanceof Date) {
        value = value.toISOString().split('T')[0];
      }

      if (question.question_type === 'checkbox') {
        value = Array.isArray(value) ? value.join(', ') : value;
      }

      if (question.question_type === 'file' && value instanceof File) {
        formData.append(`application_data[${key}]`, value, value.name);
      } else {
        formData.append(`application_data[${key}]`, value ?? '');
      }
    });

    // ✅ SECTION FIELDS: Store files by question ID with array indexing
    this.sectionGroups.forEach(section => {
      const sectionData = raw[section.sectionName] || [];
      
      section.questions.forEach(q => {
        const questionId = q.id.toString();
        sectionData.forEach((row: any, rowIndex: number) => {
          let value = row[q.id];

          if (q.question_type === 'date' && value instanceof Date) {
            value = value.toISOString().split('T')[0];
          }

          if (q.question_type === 'checkbox') {
            value = Array.isArray(value) ? value.join(', ') : value;
          }

          if (q.question_type === 'file' && value instanceof File) {
            // Store as application_data[questionId][rowIndex]
            formData.append(`application_data[${questionId}][${rowIndex}]`, value, value.name);
          } else {
            formData.append(`application_data[${questionId}][${rowIndex}]`, value ?? '');
          }
        });
      });
    });

    this.apiService.getByConditions(formData, 'api/user/service-application-store')
      .subscribe({
        next: (res) => {
          if (res?.status === 1) {
            this.apiService.openSnackBar('Application submitted successfully!', 'success');
          } else {
            this.apiService.openSnackBar(res?.message || 'Submission failed.', 'error');
          }
        },
        error: (err) => {
          console.error('File submission error:', err);
          this.apiService.openSnackBar(
            err?.error?.message || 'Submission failed. Please try again.',
            'error'
          );
        }
      });
  }

  downloadSample(sampleUrl: string): void {
    if (!sampleUrl || sampleUrl.trim() === '') {
      this.apiService.openSnackBar('No sample file available.', 'error');
      return;
    }
    window.open(sampleUrl, '_blank');
  }
}