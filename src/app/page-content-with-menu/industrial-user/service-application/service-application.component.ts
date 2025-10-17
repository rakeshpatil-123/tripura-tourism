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
  existingFileUrls: { [questionId: number]: string } = {};
  public Object = Object;
  applicationId: number | null = null;
  appId2: number | null = null;
  serviceForm!: FormGroup;
  questions: ServiceQuestion[] = [];
  groupedQuestions: { [group: string]: ServiceQuestion[] } = {};
  sectionGroups: SectionGroup[] = [];
  serviceId!: number;
  loading = true;
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

  // ngOnInit(): void {
  //   this.serviceId = Number(this.route.snapshot.paramMap.get('id'));
  //   const queryParams = this.route.snapshot.queryParams;
  //   const appIdParam = queryParams['application_id'];
  //   this.applicationId = appIdParam ? Number(appIdParam) : null;
  //   if (this.serviceId) {
  //     this.loadServiceDetails();
  //   } else {
  //     this.apiService.openSnackBar('Invalid service ID.', 'error');
  //     this.loading = false;
  //   }
  // }

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

  // loadServiceDetails(): void {
  //   const payload = { service_id: this.serviceId };

  //   this.apiService
  //     .getByConditions(payload, 'api/service-questionnaire-view')
  //     .subscribe({
  //       next: (res: any) => {
  //         if (res?.status === 1 && Array.isArray(res.data)) {
  //           this.questions = res.data
  //             .filter((q: ServiceQuestion) => q.status === 1)
  //             .map((q: any) => ({
  //               ...q,
  //               parsedOptions: this.parseOptions(q.options),
  //             }));

  //           this.processSections();
  //           this.groupQuestions();
  //           this.buildForm();
  //           this.loadDefaultValues();
  //         } else {
  //           this.apiService.openSnackBar('No form data found.', 'error');
  //         }
  //         this.loading = false;
  //       },
  //       error: (err) => {
  //         console.error('Failed to load service details:', err);
  //         this.apiService.openSnackBar('No form data found', 'error');
  //         this.loading = false;
  //       },
  //     });
  // }

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

  // loadDefaultValues(): void {
  //   const userId = this.apiService.getDecryptedUserId();
  //   if (!userId) {
  //     console.warn('User ID not found, skipping default value loading');
  //     return;
  //   }

  //   const questionsWithDefaults = this.questions.filter(
  //     (q) => q.default_source_table && q.default_source_column
  //   );

  //   if (questionsWithDefaults.length === 0) {
  //     return;
  //   }

  //   questionsWithDefaults.forEach((question) => {
  //     const columnKey = question.default_source_column;
  //     if (!columnKey) return;

  //     const payload = {
  //       user_id: userId,
  //       default_source_table: question.default_source_table,
  //       default_source_column: columnKey,
  //     };

  //     this.apiService
  //       .getByConditions(payload, 'api/get-default-source')
  //       .subscribe({
  //         next: (res: any) => {
  //           let defaultValue: any = null;

  //           if (
  //             res &&
  //             (res.hasOwnProperty('value') || res.hasOwnProperty(columnKey))
  //           ) {
  //             defaultValue = res.value || res[columnKey];
  //           } else if (res?.status === 1 && res.data && res.data.length > 0) {
  //             defaultValue = res.data[0].value || res.data[0][columnKey];
  //           }

  //           if (
  //             defaultValue !== undefined &&
  //             defaultValue !== null &&
  //             defaultValue !== ''
  //           ) {
  //             const controlName = question.id.toString();
  //             const control = this.serviceForm.get(controlName);
  //             if (control) {
  //               control.setValue(defaultValue);
  //               this.readonlyFields[question.id] = true;
  //               this.cdr?.detectChanges();
  //             }
  //           }
  //         },
  //         error: (err) => {
  //           console.error(
  //             `Failed to load default value for question ${question.id}:`,
  //             err
  //           );
  //         },
  //       });
  //   });
  // }

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

            if (
              res &&
              (res.hasOwnProperty('value') || res.hasOwnProperty(columnKey))
            ) {
              defaultValue = res.value || res[columnKey];
            } else if (res?.status === 1 && res.data && res.data.length > 0) {
              defaultValue = res.data[0].value || res.data[0][columnKey];
            }

            if (
              defaultValue !== undefined &&
              defaultValue !== null &&
              defaultValue !== ''
            ) {
              const controlName = question.id.toString();
              const control = this.serviceForm.get(controlName);
              if (control) {
                if (question.question_type === 'file') {
                  const url = defaultValue;
                  const fileName = decodeURIComponent(
                    url.split('/').pop() || 'file.pdf'
                  );

                  const fakeFile = new File([], fileName, {
                    type: this.getFileMimeType(fileName),
                  });

                  control.setValue(fakeFile);
                  this.readonlyFields[question.id] = true;
                } else {
                  control.setValue(defaultValue);
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

  onSubmit(): void {
    // if (this.serviceForm.invalid) {
    //   console.log('Form errors:', this.serviceForm);
    //   Object.keys(this.serviceForm.controls).forEach((key) => {
    //     const control = this.serviceForm.get(key);
    //     if (control?.invalid) {
    //       console.log('Invalid control:', key, control.errors);
    //     }
    //   });
    // }
    this.serviceForm.markAllAsTouched();

    const userId = this.apiService.getDecryptedUserId();
    if (!userId) {
      this.apiService.openSnackBar('User not authenticated.', 'error');
      return;
    }

    const raw = this.serviceForm.getRawValue();

    let hasFileToUpload = false;

    this.questions.forEach((q) => {
      if (q.question_type === 'file') {
        const value = raw[q.id.toString()];
        if (value instanceof File) {
          hasFileToUpload = true;
        }
      }
    });

    if (!hasFileToUpload) {
      this.sectionGroups.forEach((section) => {
        const sectionData = raw[section.sectionName] || [];
        sectionData.forEach((row: any) => {
          section.questions.forEach((q) => {
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

  private getSubmissionEndpoint(): string {
    return this.applicationId !== null
      ? 'api/user/service-application-update'
      : 'api/user/service-application-store';
  }

  private submitAsJson(userId: string, raw: any): void {
    const applicationData: { [key: string]: any } = {};

    // Process regular fields
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

      if (
        question.is_required === 'yes' ||
        (value !== null && value !== '' && value !== undefined)
      ) {
        applicationData[key] = value;
      }
    });

    // Add existing file URLs
    Object.keys(this.existingFileUrls).forEach((idStr) => {
      const questionId = Number(idStr);
      const question = this.questions.find((q) => q.id === questionId);
      if (!question) return;

      const currentVal = raw[questionId];
      if (
        !(currentVal instanceof File) &&
        applicationData[questionId] === undefined
      ) {
        applicationData[questionId] = this.existingFileUrls[questionId];
      }
    });

    // Process section fields
    this.sectionGroups.forEach((section) => {
      const sectionData = raw[section.sectionName] || [];
      const validRows = sectionData.filter((row: any) =>
        section.questions.some((q) => {
          const val = row[q.id];
          return val !== null && val !== '' && val !== undefined;
        })
      );

      if (validRows.length > 0) {
        const processedRows: any[] = [];
        validRows.forEach((row: any) => {
          const processedRow: any = {};
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
              processedRow[q.id] = value;
            }
          });
          if (Object.keys(processedRow).length > 0) {
            processedRows.push(processedRow);
          }
        });
        if (processedRows.length > 0) {
          applicationData[section.sectionName] = processedRows;
        }
      }
    });

    const payload: any = {
      user_id: Number(userId),
      service_id: this.serviceId,
      application_data: applicationData,
    };

    if (this.applicationId !== null) {
      payload.id = this.applicationId;
    }

    this.apiService
      .getByConditions(payload, this.getSubmissionEndpoint())
      .subscribe({
        next: (res) => {
          if (res?.status === 1) {
            this.apiService.openSnackBar(
              'Application saved successfully!',
              'success'
            );
            this.router.navigate(['/dashboard/services']);
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

  private submitWithFiles(userId: string, raw: any): void {
    const formData = new FormData();
    formData.append('user_id', userId);
    formData.append('service_id', this.serviceId.toString());

    if (this.applicationId !== null) {
      formData.append('id', this.applicationId.toString());
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
      const sectionData = raw[section.sectionName] || [];
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
      .getByConditions(formData, this.getSubmissionEndpoint())
      .subscribe({
        next: (res) => {
          if (res?.status === 1) {
            this.apiService.openSnackBar(
              'Application saved successfully!',
              'success'
            );
            this.router.navigate(['/dashboard/services']);
          } else {
            this.apiService.openSnackBar(
              res?.message || 'Submission failed.',
              'error'
            );
          }
        },
        error: (err) => {
          console.error('File submission error:', err);
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

  getDefaultFileUrl(questionId: number): string | null {
    const question = this.questions.find((q) => q.id === questionId);
    if (question?.default_value && !this.readonlyFields[questionId]) {
    }

    const currentValue = this.serviceForm.get(questionId.toString())?.value;
    return typeof currentValue === 'string' ? currentValue : null;
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
  // private patchFormWithExistingData(applicationData: any): void {
  //   Object.keys(applicationData).forEach((key) => {
  //     if (Array.isArray(applicationData[key])) {
  //       const question = this.questions.find((q) => q.id.toString() === key);
  //       if (question) {
  //         let value = applicationData[key];

  //         if (question.question_type === 'checkbox') {
  //         } else if (question.question_type === 'file') {
  //           if (value.length > 0 && typeof value[0] === 'string') {
  //             this.existingFileUrls[question.id] = value[0];
  //             const fileName = decodeURIComponent(
  //               value[0].split('/').pop() || 'file.pdf'
  //             );
  //             const fakeFile = new File([], fileName, {
  //               type: this.getFileMimeType(fileName),
  //             });
  //             this.serviceForm.get(key)?.setValue(fakeFile);
  //           }
  //         } else {
  //           value = value.length > 0 ? value[0] : '';
  //           this.serviceForm.get(key)?.setValue(value);
  //         }
  //       }
  //     } else if (
  //       typeof applicationData[key] === 'object' &&
  //       !Array.isArray(applicationData[key])
  //     ) {
  //     }
  //   });

  //   this.sectionGroups.forEach((section) => {
  //     const sectionData = applicationData[section.sectionName];

  //     if (Array.isArray(sectionData) && sectionData.length > 0) {
  //       while (section.formArray.length > 1) {
  //         section.formArray.removeAt(0);
  //       }

  //       sectionData.forEach((row: any, index: number) => {
  //         if (index === 0) {
  //           const rowGroup = section.formArray.at(0) as FormGroup;
  //           section.questions.forEach((q) => {
  //             const value = row[q.id] ?? '';
  //             rowGroup.get(q.id.toString())?.setValue(value);
  //           });
  //         } else {
  //           const newRow = this.createSectionRow(section.questions);
  //           section.questions.forEach((q) => {
  //             const value = row[q.id] ?? '';
  //             newRow.get(q.id.toString())?.setValue(value);
  //           });
  //           section.formArray.push(newRow);
  //         }
  //       });
  //     }
  //   });

  //   this.cdr.detectChanges();
  // }

  private patchFormWithExistingData(applicationData: any): void {
  Object.keys(applicationData).forEach(key => {
    const value = applicationData[key];
    
    // Handle section fields (objects/arrays of objects)
    if (this.sectionGroups.some(section => section.sectionName === key)) {
      if (Array.isArray(value) && value.length > 0) {
        const section = this.sectionGroups.find(s => s.sectionName === key);
        if (section) {
          // Clear extra rows
          while (section.formArray.length > 1) {
            section.formArray.removeAt(0);
          }
          
          // Patch rows
          value.forEach((row: any, index: number) => {
            if (index === 0) {
              const rowGroup = section.formArray.at(0) as FormGroup;
              section.questions.forEach(q => {
                const rowValue = row[q.id] ?? '';
                rowGroup.get(q.id.toString())?.setValue(rowValue);
              });
            } else {
              const newRow = this.createSectionRow(section.questions);
              section.questions.forEach(q => {
                const rowValue = row[q.id] ?? '';
                newRow.get(q.id.toString())?.setValue(rowValue);
              });
              section.formArray.push(newRow);
            }
          });
        }
      }
      return;
    }

    const question = this.questions.find(q => q.id.toString() === key);
    if (!question) return;

    let formValue: any;

    if (Array.isArray(value)) {
      if (question.question_type === 'checkbox') {
        formValue = value;
      } else if (question.question_type === 'file') {
        if (value.length > 0 && typeof value[0] === 'string') {
          this.existingFileUrls[question.id] = value[0];
          const fileName = decodeURIComponent(value[0].split('/').pop() || 'file.pdf');
          formValue = new File([], fileName, { type: this.getFileMimeType(fileName) });
        } else {
          formValue = null;
        }
      } else {
        formValue = value.length > 0 ? value[0] : '';
      }
    } else if (typeof value === 'string' || typeof value === 'number' || value === null) {
      formValue = value;
    } else {
      formValue = '';
    }

    this.serviceForm.get(key)?.setValue(formValue);
  });

  this.cdr.detectChanges();
}
}
