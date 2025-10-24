import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
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
  minLength?: number | string;
  maxLength?: number | string;
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
  fileUrls: { [questionId: number]: string } = {};
  defaultValue: any = null;
  existingFileUrls: { [questionId: number]: string } = {};
  public Object = Object;
  calculatedFee: number | null = null;
  feeCalculating = false;
  applicationId: number | null = null;
  appId2: number | null = null;
  serviceForm!: FormGroup;
  questions: ServiceQuestion[] = [];
  groupedQuestions: { [group: string]: ServiceQuestion[] } = {};
  sectionGroups: SectionGroup[] = [];
  serviceId!: number;
  loading = true;
  visible = false;
  readonlyFields: { [key: number]: boolean } = {};
  private static digitLengthValidator(min?: number, max?: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (value == null || value === '') {
        return null;
      }
      const stringValue = String(value).replace(/[^0-9]/g, '');
      if (min !== undefined && stringValue.length < min) {
        return {
          minLength: { requiredLength: min, actualLength: stringValue.length },
        };
      }
      if (max !== undefined && stringValue.length > max) {
        return {
          maxLength: { requiredLength: max, actualLength: stringValue.length },
        };
      }
      return null;
    };
  }
  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private apiService: GenericService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.serviceId = Number(this.route.snapshot.paramMap.get('id'));
    const queryParams = this.route.snapshot.queryParams;
    const appIdParam = queryParams['application_id'];
    const appid2 = queryParams['appid2'];
    this.applicationId = appIdParam ? Number(appIdParam) : null;
    this.appId2 = appid2 ? Number(appid2) : null;

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

            if (this.applicationId !== null || this.appId2 !== null) {
              this.loadExistingApplication();
            }
          } else {
            this.apiService.openSnackBar('No form data found.', 'error');
          }
          this.loading = false;
        },
        error: (err) => {
          console.error('Failed to load service details:', err);
          this.apiService.openSnackBar('No form data found', 'error');
          this.loading = false;
        },
      });
  }

  processSections(): void {
    this.sectionGroups = [];

    const sectionMap = new Map<string, ServiceQuestion[]>();

    this.questions.forEach((question) => {
      if (
        question.is_section === 'yes' &&
        question.section_name &&
        question.section_name.trim() !== ''
      ) {
        if (!sectionMap.has(question.section_name)) {
          sectionMap.set(question.section_name, []);
        }
        sectionMap.get(question.section_name)?.push(question);
      }
    });

    sectionMap.forEach((questions, sectionName) => {
      const sortedQuestions = [...questions].sort(
        (a, b) => (a.display_order || 0) - (b.display_order || 0)
      );

      this.sectionGroups.push({
        sectionName,
        questions: sortedQuestions,
        formArray: this.fb.array([]),
      });
    });

    this.questions = this.questions.filter(
      (q) =>
        !(
          q.is_section === 'yes' &&
          q.section_name &&
          q.section_name.trim() !== ''
        )
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
            

            if (
              res &&
              (res.hasOwnProperty('value') || res.hasOwnProperty(columnKey))
            ) {
              this.defaultValue = res.value || res[columnKey];
              
            } else if (res?.status === 1 && res.data && res.data.length > 0) {
              this.defaultValue = res.data[0].value || res.data[0][columnKey];
            }

            if (
              this.defaultValue !== undefined &&
              this.defaultValue !== null &&
              this.defaultValue !== ''
            ) {
              const controlName = question.id.toString();
              const control = this.serviceForm.get(controlName);
              if (control) {
                if (question.question_type === 'file') {
                  this.fileUrls[question.id] = this.defaultValue;
                  // const url = defaultValue;
                  const fileName = decodeURIComponent(
                    this.defaultValue.split('/').pop() || 'file.pdf'
                  );

                  const fakeFile = new File([], fileName, {
                    type: this.getFileMimeType(fileName),
                  });
                  (fakeFile as any)._isFake =true;

                  control.setValue(fakeFile);
                  this.readonlyFields[question.id] = true;
                } else {
                  control.setValue(this.defaultValue);
                  this.readonlyFields[question.id] = true;
                }
                this.cdr?.detectChanges();
              }
            }
          },
          error: (err) => {
            console.error(
              `Failed to load default value for question ${question.id}:`,
              err
            );
          },
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
    Object.keys(this.groupedQuestions).forEach((group) => {
      console.log(group, 'groupqqqqqq');

      this.groupedQuestions[group].sort((a, b) => {
        const orderA = a.display_order ?? 9999;
        const orderB = b.display_order ?? 9999;
        return orderA - orderB;
      });
    });
  }

  buildForm(): void {
    const group: any = {};

    this.questions.forEach((q) => {
      const validators = [];

      if (q.is_required === 'yes') {
        validators.push(Validators.required);
      }

      if (q.validation_required === 'yes' && q.validation_rule) {
        const rule = q.validation_rule;

        if (q.question_type === 'number') {
          let min: number | undefined = undefined;
          let max: number | undefined = undefined;

          if (rule.minLength != null && rule.minLength !== '') {
            const parsed = Number(rule.minLength);
            if (!isNaN(parsed)) min = parsed;
          }

          if (rule.maxLength != null && rule.maxLength !== '') {
            const parsed = Number(rule.maxLength);
            if (!isNaN(parsed)) max = parsed;
          }

          validators.push(
            ServiceApplicationComponent.digitLengthValidator(min, max)
          );
        } else {
          if (rule.minLength != null && rule.minLength !== '') {
            const min = Number(rule.minLength);
            if (!isNaN(min)) validators.push(Validators.minLength(min));
          }
          if (rule.maxLength != null && rule.maxLength !== '') {
            const max = Number(rule.maxLength);
            if (!isNaN(max)) validators.push(Validators.maxLength(max));
          }
        }

        if (
          rule.pattern &&
          rule.pattern.trim() !== '' &&
          !['radio', 'select', 'file', 'checkbox'].includes(q.question_type)
        ) {
          try {
            validators.push(Validators.pattern(new RegExp(rule.pattern)));
          } catch (e) {
            console.warn(`Invalid regex for ${q.id}:`, rule.pattern);
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

    this.sectionGroups.forEach((sectionGroup) => {
      const initialRow = this.createSectionRow(sectionGroup.questions);
      sectionGroup.formArray.push(initialRow);
    });

    this.serviceForm = this.fb.group({
      ...group,
      ...this.sectionGroups.reduce((acc, section) => {
        acc[section.sectionName] = section.formArray;
        return acc;
      }, {} as any),
    });
  }

  createSectionRow(questions: ServiceQuestion[]): FormGroup {
    const rowGroup: any = {};

    questions.forEach((q) => {
      const validators = [];

      if (q.is_required === 'yes') {
        validators.push(Validators.required);
      }

      if (q.validation_required === 'yes' && q.validation_rule) {
        const rule = q.validation_rule;

        if (q.question_type === 'number') {
          let min: number | undefined = undefined;
          let max: number | undefined = undefined;

          if (rule.minLength != null && rule.minLength !== '') {
            const parsed = Number(rule.minLength);
            if (!isNaN(parsed)) min = parsed;
          }

          if (rule.maxLength != null && rule.maxLength !== '') {
            const parsed = Number(rule.maxLength);
            if (!isNaN(parsed)) max = parsed;
          }

          validators.push(
            ServiceApplicationComponent.digitLengthValidator(min, max)
          );
        } else {
          if (rule.minLength != null && rule.minLength !== '') {
            const min = Number(rule.minLength);
            if (!isNaN(min)) {
              validators.push(Validators.minLength(min));
            }
          }

          if (rule.maxLength != null && rule.maxLength !== '') {
            const max = Number(rule.maxLength);
            if (!isNaN(max)) {
              validators.push(Validators.maxLength(max));
            }
          }
        }

        if (
          rule.pattern &&
          rule.pattern.trim() !== '' &&
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
    const sectionGroup = this.sectionGroups.find(
      (s) => s.sectionName === sectionName
    );
    if (sectionGroup) {
      const newRow = this.createSectionRow(sectionGroup.questions);
      sectionGroup.formArray.push(newRow);
    }
  }

  removeSectionRow(sectionName: string, index: number): void {
    const sectionGroup = this.sectionGroups.find(
      (s) => s.sectionName === sectionName
    );
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

  private getFormValidationErrors(): string[] {
    const errors: string[] = [];

    // Check regular fields
    this.questions.forEach((question) => {
      const control = this.serviceForm.get(question.id.toString());
      if (control?.invalid && control.touched) {
        const label = question.question_label || `Field ${question.id}`;
        if (control.hasError('required')) {
          errors.push(`${label} is required`);
        } else if (control.hasError('minlength')) {
          const minLength = control.getError('minlength')?.requiredLength || 0;
          errors.push(`${label} must be at least ${minLength} characters`);
        } else if (control.hasError('maxlength')) {
          const maxLength = control.getError('maxlength')?.requiredLength || 0;
          errors.push(`${label} cannot exceed ${maxLength} characters`);
        } else if (control.hasError('pattern')) {
          errors.push(
            question.validation_rule?.errorMessage ||
              `${label} has invalid format`
          );
        } else if (
          control.hasError('minLength') ||
          control.hasError('maxLength')
        ) {
          const err =
            control.getError('minLength') || control.getError('maxLength');
          if (err?.requiredLength) {
            errors.push(
              `${label} must be exactly ${err.requiredLength} digits`
            );
          } else {
            errors.push(`${label} has invalid length`);
          }
        }
      }
    });

    this.sectionGroups.forEach((section) => {
      const formArray = this.getSectionFormArray(section.sectionName);
      section.questions.forEach((question) => {
        formArray.controls.forEach((rowGroup, rowIndex) => {
          const control = (rowGroup as FormGroup).get(question.id.toString());
          if (control?.invalid && control.touched) {
            const label = `${question.question_label} (Row ${rowIndex + 1})`;
            if (control.hasError('required')) {
              errors.push(`${label} is required`);
            } else if (control.hasError('minlength')) {
              const minLength =
                control.getError('minlength')?.requiredLength || 0;
              errors.push(`${label} must be at least ${minLength} characters`);
            } else if (control.hasError('maxlength')) {
              const maxLength =
                control.getError('maxlength')?.requiredLength || 0;
              errors.push(`${label} cannot exceed ${maxLength} characters`);
            } else if (control.hasError('pattern')) {
              errors.push(
                question.validation_rule?.errorMessage ||
                  `${label} has invalid format`
              );
            } else if (
              control.hasError('minLength') ||
              control.hasError('maxLength')
            ) {
              const err =
                control.getError('minLength') || control.getError('maxLength');
              if (err?.requiredLength) {
                errors.push(
                  `${label} must be exactly ${err.requiredLength} digits`
                );
              } else {
                errors.push(`${label} has invalid length`);
              }
            }
          }
        });
      });
    });

    return errors;
  }

 onSubmit(): void {
  this.serviceForm.markAllAsTouched();

  const validationErrors = this.getFormValidationErrors();
  if (validationErrors.length > 0) {
    const message = 'Please fix the following:\n• ' + validationErrors.join('\n• ');
    this.apiService.openSnackBar(message, 'error');
    return;
  }

  const userId = this.apiService.getDecryptedUserId();
  if (!userId) {
    this.apiService.openSnackBar('User not authenticated.', 'error');
    return;
  }

  const raw = this.serviceForm.getRawValue();
  const preparedRaw = this.prepareRawDataForSubmission(raw);

  this.submitWithFiles(userId, preparedRaw);
}

  private getSubmissionEndpoint(): string {
    return this.applicationId !== null
      ? 'api/user/service-application-update'
      : 'api/user/service-application-store';
  }

private prepareRawDataForSubmission(raw: any): any {
  const prepared = { ...raw };

  Object.keys(prepared).forEach(key => {
    if (this.sectionGroups.some(s => s.sectionName === key)) return;
    const question = this.questions.find(q => q.id.toString() === key);
    if (question?.question_type === 'file') {
      const currentVal = prepared[key];
      if (
        currentVal instanceof File && 
        (currentVal as any)._isFake && 
        this.fileUrls[Number(key)]
      ) {
        prepared[key] = this.fileUrls[Number(key)];
      }
    }
  });

  this.sectionGroups.forEach(section => {
    const sectionData = prepared[section.sectionName] || [];
    sectionData.forEach((row : any) => {
      section.questions.forEach(q => {
        if (q.question_type === 'file') {
          const currentVal = row[q.id];
          if (
            currentVal instanceof File && 
            (currentVal as any)._isFake && 
            this.fileUrls[q.id]
          ) {
            row[q.id] = this.fileUrls[q.id];
          }
        }
      });
    });
  });

  return prepared;
}



 private submitWithFiles(userId: string, raw: any): void {
  const formData = new FormData();
  formData.append('user_id', userId);
  formData.append('service_id', this.serviceId.toString());

  const actualAppId = this.appId2 !== null ? this.appId2 : this.applicationId;
  if (actualAppId !== null) {
    formData.append('id', actualAppId.toString());
  }

  Object.keys(raw).forEach((key) => {
    if (this.sectionGroups.some((s) => s.sectionName === key)) return;

    const question = this.questions.find((q) => q.id.toString() === key);
    if (!question) return;

    let value = raw[key];

    if (question.question_type === 'date' && value instanceof Date) {
      value = value.toISOString().split('T')[0];
    }
    if (question.question_type === 'checkbox') {
      value = Array.isArray(value) ? value.join(', ') : value;
    }

    // ✅ File logic: 
    // - If it's a real File → append as binary
    // - If it's a string (URL) → append as string
    // - If null/undefined → skip (optional field)
    if (question.question_type === 'file') {
      if (value instanceof File) {
        formData.append(`application_data[${key}]`, value, value.name);
      } else if (value != null) { // string URL
        formData.append(`application_data[${key}]`, value);
      }
    } else {
      // Non-file fields
      if (
        question.is_required === 'yes' ||
        (value !== null && value !== '' && value !== undefined)
      ) {
        formData.append(`application_data[${key}]`, value ?? '');
      }
    }
  });

  // === Section fields ===
  this.sectionGroups.forEach((section) => {
    const sectionData = raw[section.sectionName] || [];
    sectionData.forEach((row: any, rowIndex: number) => {
      section.questions.forEach((q) => {
        let value = row[q.id];

        if (q.question_type === 'date' && value instanceof Date) {
          value = value.toISOString().split('T')[0];
        }
        if (q.question_type === 'checkbox') {
          value = Array.isArray(value) ? value.join(', ') : value;
        }

        const fieldName = `application_data[${section.sectionName}][${rowIndex}][${q.id}]`;

        if (q.question_type === 'file') {
          if (value instanceof File) {
            formData.append(fieldName, value, value.name);
          } else if (value != null) {
            formData.append(fieldName, value);
          }
        } else {
          if (
            q.is_required === 'yes' ||
            (value !== null && value !== '' && value !== undefined)
          ) {
            formData.append(fieldName, value ?? '');
          }
        }
      });
    });
  });

  this.apiService
    .getByConditions(formData, this.getSubmissionEndpoint())
    .subscribe({
      next: (res) => {
        if (res?.status === 1) {
          this.apiService.openSnackBar('Application saved successfully!', 'success');
          this.router.navigate(['/dashboard/services']);
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
      },
    });
}

  downloadSample(sampleUrl: string): void {
    if (!sampleUrl || sampleUrl.trim() === '') {
      this.apiService.openSnackBar('No sample file available.', 'error');
      return;
    }
    window.open(sampleUrl, '_blank');
  }

  // getDefaultFileUrl(questionId: number): string | null {
  //   const question = this.questions.find((q) => q.id === questionId);
  //   if (question?.default_value && !this.readonlyFields[questionId]) {
  //   }

  //   const currentValue = this.serviceForm.get(questionId.toString())?.value;
  //   return typeof currentValue === 'string' ? currentValue : null;
  // }

  getDefaultFileUrl(questionId: number): string | null {
    return this.fileUrls[questionId] || null;
  }
  private getFileMimeType(fileName: string): string {
    const ext = fileName.split('.').pop()?.toLowerCase();
    const mimeMap: { [key: string]: string } = {
      pdf: 'application/pdf',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      xls: 'application/vnd.ms-excel',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      txt: 'text/plain',
    };
    return mimeMap[ext || ''] || 'application/octet-stream';
  }

  private loadExistingApplication(): void {
    const actualAppId = this.appId2 !== null ? this.appId2 : this.applicationId;

    if (actualAppId === null) return;

    const payload = {
      service_id: this.serviceId,
      application_id: actualAppId,
    };

    this.apiService
      .getByConditions(
        payload,
        'api/user/get-details-user-service-applications'
      )
      .subscribe({
        next: (res: any) => {
          if (res?.status === 1 && res.data?.application_data) {
            this.patchFormWithExistingData(res.data.application_data);
          }
        },
        error: (err) => {
          console.error('Failed to load existing application:', err);
          this.apiService.openSnackBar(
            'Could not load existing application data.',
            'error'
          );
        },
      });
  }

  private patchFormWithExistingData(applicationData: any): void {
    Object.keys(applicationData).forEach((key) => {
      const value = applicationData[key];

      if (this.sectionGroups.some((section) => section.sectionName === key)) {
        if (Array.isArray(value) && value.length > 0) {
          const section = this.sectionGroups.find((s) => s.sectionName === key);
          if (section) {
            while (section.formArray.length > 1) {
              section.formArray.removeAt(0);
            }

            value.forEach((row: any, index: number) => {
              if (index === 0) {
                const rowGroup = section.formArray.at(0) as FormGroup;
                section.questions.forEach((q) => {
                  const rowValue = row[q.id] ?? '';
                  rowGroup.get(q.id.toString())?.setValue(rowValue);
                });
              } else {
                const newRow = this.createSectionRow(section.questions);
                section.questions.forEach((q) => {
                  const rowValue = row[q.id] ?? '';

                  if (
                    q.question_type === 'file' &&
                    typeof rowValue === 'string'
                  ) {
                    this.fileUrls[q.id] = rowValue;

                    const fileName = decodeURIComponent(
                      rowValue.split('/').pop() || 'file.pdf'
                    );
                    const fakeFile = new File([], fileName, {
                      type: this.getFileMimeType(fileName),
                    });
                    newRow.get(q.id.toString())?.setValue(fakeFile);
                  } else {
                    newRow.get(q.id.toString())?.setValue(rowValue);
                  }
                });
                section.formArray.push(newRow);
              }
            });
          }
        }
        return;
      }

     const question = this.questions.find((q) => q.id.toString() === key);
if (!question) return;

if (question.question_type === 'file' && typeof value === 'string') {
  this.fileUrls[question.id] = value;
  const fileName = decodeURIComponent(value.split('/').pop() || 'file.pdf');
  const fakeFile = new File([], fileName, {
    type: this.getFileMimeType(fileName),
  });
  (fakeFile as any)._isFake = true;
  this.serviceForm.get(key)?.setValue(fakeFile);
} else {
  let formValue: any;
  if (Array.isArray(value)) {
    if (question.question_type === 'checkbox') {
      formValue = value;
    } else {
      formValue = value.length > 0 ? value[0] : '';
    }
  } else if (typeof value === 'string' || typeof value === 'number' || value === null) {
    formValue = value;
  } else {
    formValue = '';
  }
  this.serviceForm.get(key)?.setValue(formValue);
}
    });

    this.cdr.detectChanges();
  }

  calFee(): void {
  if (this.feeCalculating) return;

  this.serviceForm.markAllAsTouched();

  if (this.serviceForm.invalid) {
    this.apiService.openSnackBar(
      'Please fill in all required fields correctly.',
      'error'
    );
    return;
  }

  const userId = this.apiService.getDecryptedUserId();
  if (!userId) {
    this.apiService.openSnackBar('User not authenticated.', 'error');
    return;
  }

  this.feeCalculating = true;

  const raw = this.serviceForm.getRawValue();
  const preparedRaw = this.prepareRawDataForSubmission(raw); 

  const formData = new FormData();
  formData.append('user_id', userId);
  formData.append('service_id', this.serviceId.toString());

  Object.keys(preparedRaw).forEach((key) => {
    if (this.sectionGroups.some((s) => s.sectionName === key)) return;
    const question = this.questions.find((q) => q.id.toString() === key);
    if (!question) return;

    let value = preparedRaw[key]; 

    if (question.question_type === 'date' && value instanceof Date) {
      value = value.toISOString().split('T')[0];
    }
    if (question.question_type === 'checkbox') {
      value = Array.isArray(value) ? value.join(', ') : value;
    }

    if (
      question.is_required === 'yes' ||
      (value !== null && value !== '' && value !== undefined)
    ) {
    
      if (question.question_type === 'file' && value instanceof File) {
        formData.append(`application_data[${key}]`, value, value.name);
      } else {
        formData.append(`application_data[${key}]`, value ?? '');
      }
    }
  });

  this.sectionGroups.forEach((section) => {
    const sectionData = preparedRaw[section.sectionName] || []; 
    const validRows = sectionData.filter((row: any) =>
      section.questions.some((q) => {
        const val = row[q.id];
        return val !== null && val !== '' && val !== undefined;
      })
    );

    validRows.forEach((row: any, rowIndex: number) => {
      section.questions.forEach((q) => {
        let value = row[q.id]; 

        if (q.question_type === 'date' && value instanceof Date) {
          value = value.toISOString().split('T')[0];
        }
        if (q.question_type === 'checkbox') {
          value = Array.isArray(value) ? value.join(', ') : value;
        }

        if (
          q.is_required === 'yes' ||
          (value !== null && value !== '' && value !== undefined)
        ) {
          const fieldName = `application_data[${section.sectionName}][${rowIndex}][${q.id}]`;
          if (q.question_type === 'file' && value instanceof File) {
            formData.append(fieldName, value, value.name);
          } else {
            formData.append(fieldName, value ?? '');
          }
        }
      });
    });
  });

  this.apiService
    .getByConditions(formData, 'api/user/calculate-fee')
    .subscribe({
      next: (res: any) => {
        if (res?.status === 1) {
          this.calculatedFee = Number(res.data.final_fee);
          this.visible = true;
          this.apiService.openSnackBar('Fee calculated successfully!', 'success');
        } else {
          this.visible = false;
          this.apiService.openSnackBar(res?.message || 'Failed to calculate fee.', 'error');
        }
      },
      error: (err) => {
        console.error('Fee calculation error:', err);
        this.visible = false;
        this.apiService.openSnackBar(
          err?.error?.message || 'Fee calculation failed. Please try again.',
          'error'
        );
      },
      complete: () => {
        this.feeCalculating = false;
      },
    });
}
}
