import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
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
import { ConfirmationModalComponent } from '../../../shared/component/confirmation-modal/confirmation-modal.component';
import { LoaderComponent } from '../../../page-template/loader/loader.component';
import Swal from 'sweetalert2';

interface ValidationRule {
  type: string;
  minLength?: number | string;
  maxLength?: number | string;
  pattern?: string;
  errorMessage?: string;
  mimes?: string[];
  max_size_mb?: number | string;
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
    | 'file'
    | 'date_mmdd'
    | 'date_yyyymmdd';
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
  children_id?: number[];
  display_rule?: {
    depends_on: number;
    operator: string;
    value: string;
  };
}

interface SectionGroup {
  sectionName: string;
  questions: ServiceQuestion[];
  formArray: FormArray;
}

interface succesRes{
  message :string;
  data: any;
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
    MatDialogModule,
    MatButtonModule,
    ConfirmationModalComponent,
    LoaderComponent,
  ],
  templateUrl: './service-application.component.html',
  styleUrls: ['./service-application.component.scss'],
  standalone: true,
})
export class ServiceApplicationComponent implements OnInit {
  formModifiedAfterFeeCalculation = false;
  showConfirmModal = false;
  successRedirectUrl: string | null = null;
  modalConfig = {
    title: 'Confirm Submission',
    message: 'Are you sure you want to submit this application?',
    confirmButtonText: 'Submit',
    cancelButtonText: 'Cancel',
    confirmButtonClass: 'btn btn-success',
    cancelButtonClass: 'btn btn-outline-secondary',
  };
  questionVisibility: { [key: string]: boolean } = {};
  fileUrls: { [key: string]: string } = {};
  defaultValue: any = null;
  existingFileUrls: { [questionId: number]: string } = {};
  public Object = Object;
  isCalculated: boolean  = false;
  calculatedFee: number | null = null;
  previousPaid: number | null = null;
  effectiveFee: number | null = null;
  feeCalculating = false;
  applicationId: number | null = null;
  appId2: number | null = null;
  applicationStatus: string | null = null;
  serviceForm!: FormGroup;
  questions: ServiceQuestion[] = [];
  groupedQuestions: { [group: string]: ServiceQuestion[] } = {};
  sectionGroups: SectionGroup[] = [];
  serviceId!: number;
  loading: boolean = false;
  apiCalling: boolean = false;
  visible = false;
  readonlyFields: { [key: number]: boolean } = {};
  extraPayment: string | number | null = null;
  serviceName: string | null = null;
  successFullySubmitted: boolean = false;
  succesResponse!: succesRes;
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

private static fileTypeAndSizeValidator(
  allowedMimes: string[] = [],
  maxSizeMb?: number
): ValidatorFn {
  const normalize = (value: string) =>
    String(value || '')
      .trim()
      .toLowerCase()
      .replace(/^\./, '');

  const allowed = allowedMimes.map(normalize).filter(Boolean);

  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!(value instanceof File)) {
      return null;
    }
    if ((value as any)?._isFake) {
      return null;
    }

    if (allowed.length > 0) {
      const fileName = normalize(value.name || '');
      const extension = fileName.includes('.') ? fileName.split('.').pop() || '' : '';
      const mime = normalize(value.type || '');
      const isAllowed = allowed.some((item) => {
        if (item === 'jpg' || item === 'jpeg') {
          return extension === item || mime === 'image/jpeg';
        }
        if (item === 'png') {
          return extension === 'png' || mime === 'image/png';
        }
        if (item === 'pdf') {
          return extension === 'pdf' || mime === 'application/pdf';
        }
        return extension === item || mime.includes(item);
      });

      if (!isAllowed) {
        return {
          invalidFileType: {
            allowedTypes: allowedMimes,
          },
        };
      }
    }

    if (maxSizeMb !== undefined && !isNaN(maxSizeMb)) {
      const maxBytes = maxSizeMb * 1024 * 1024;
      if (value.size > maxBytes) {
        return {
          fileTooLarge: {
            requiredSizeMb: maxSizeMb,
            actualSizeMb: +(value.size / 1024 / 1024).toFixed(2),
          },
        };
      }
    }

    return null;
  };
}

getFileAllowedExtensions(question: ServiceQuestion): string[] {
  const mimes = question.validation_rule?.mimes;
  if (!Array.isArray(mimes)) return [];
  return mimes.map((m) => String(m).trim().toLowerCase()).filter(Boolean);
}

getFileAcceptAttribute(question: ServiceQuestion): string {
  const allowed = this.getFileAllowedExtensions(question);
  if (allowed.length === 0) return '*/*';
  return allowed.map((ext) => `.${ext}`).join(',');
}

getFileMaxBytes(question: ServiceQuestion): number {
  const maxMb = Number(question.validation_rule?.max_size_mb ?? 5);
  return !isNaN(maxMb) && maxMb > 0 ? maxMb * 1024 * 1024 : 5 * 1024 * 1024;
}

getFileHintText(question: ServiceQuestion): string {
  const allowed = this.getFileAllowedExtensions(question);
  const maxMb = question.validation_rule?.max_size_mb ?? 5;

  const parts: string[] = [];
  if (allowed.length > 0) {
    parts.push(`Allowed: ${allowed.map((ext) => `.${ext}`).join(', ')}`);
  }
  if (maxMb !== null && maxMb !== undefined && String(maxMb).trim() !== '') {
    parts.push(`Max size: ${maxMb} MB`);
  }

  return parts.join(' | ');
}
  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private apiService: GenericService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    let isThirdPartyService = null;
    let thirdPartyServiceId: any = null;
    this.route.queryParams.subscribe((params: any) => {
      isThirdPartyService = !!params['returnUrl'];
      thirdPartyServiceId = params['service_id'];
    })
    if (isThirdPartyService) {
      this.serviceId = thirdPartyServiceId;
    } else {
      this.serviceId = Number(this.route.snapshot.paramMap.get('id'));
    }
    const queryParams = this.route.snapshot.queryParams;
    const appIdParam = queryParams['application_id'];
    const appStatus = queryParams['application_status'];
    const appid2 = queryParams['appid2'];
    this.applicationStatus = appStatus ? appStatus : null;
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
    this.loading = true;
    const payload = { service_id: this.serviceId };

    this.apiService
      .getByConditions(payload, 'api/service-questionnaire-view')
      .subscribe({
        next: (res: any) => {
          if (res?.status === 1 && Array.isArray(res.data)) {
            this.serviceName = res.service_name || null;
            this.questions = res.data
              .filter((q: ServiceQuestion) => q.status === 1)
              .map((q: any) => ({
                ...q,
                parsedOptions: this.parseOptions(q.options),
              }));

            this.processSections();
            this.groupQuestions();
            this.buildForm();
            this.setupConditionalLogic();
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
                  (fakeFile as any)._isFake = true;

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
    this.questions.sort(
      (a, b) => (a.display_order ?? 9999) - (b.display_order ?? 9999)
    );
    this.groupedQuestions = {};
    this.questions.forEach((q) => {
      const group = q.group_label || 'General';
      if (!this.groupedQuestions[group]) {
        this.groupedQuestions[group] = [];
      }
      this.groupedQuestions[group].push(q);
    });
    // Object.keys(this.groupedQuestions).forEach((group) => {
    //   console.log(group, 'groupqqqqqq');

    //   this.groupedQuestions[group].sort((a, b) => {
    //     const orderA = a.display_order ?? 9999;
    //     const orderB = b.display_order ?? 9999;
    //     return orderA - orderB;
    //   });
    // });
  }

  buildForm(): void {
    this.questions.forEach((q) => {
      if (q.display_rule?.depends_on) {
        this.questionVisibility[q.id] = false;
      } else {
        this.questionVisibility[q.id] = true;
      }
    });
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
          !['radio', 'select', 'file', 'checkbox', 'date'].includes(
            q.question_type
          )
        ) {
          try {
            validators.push(Validators.pattern(new RegExp(rule.pattern)));
          } catch (e) {
            console.warn(`Invalid regex for ${q.id}:`, rule.pattern);
          }
        }

        if (q.question_type === 'file') {
          const allowedMimes = Array.isArray(rule.mimes) ? rule.mimes : [];
          const maxSizeMb =
            rule.max_size_mb != null && rule.max_size_mb !== ''
              ? Number(rule.max_size_mb)
              : undefined;

          if (allowedMimes.length > 0 || maxSizeMb !== undefined) {
            validators.push(
              ServiceApplicationComponent.fileTypeAndSizeValidator(
                allowedMimes,
                maxSizeMb
              )
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

      if (q.question_type === 'date_mmdd') {
        const today = new Date();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        defaultValue = `${month}${day}`;
      }

      if (q.question_type === 'date_yyyymmdd') {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        defaultValue = `${year}${month}${day}`;
      }

      group[q.id] = [defaultValue, validators];
    });

   this.sectionGroups.forEach((sectionGroup) => {
      const initialRow = this.createSectionRow(sectionGroup.questions);
      sectionGroup.formArray.push(initialRow);

      // initialize visibility for section-level conditional questions (hide by default)
      sectionGroup.questions.forEach((q) => {
        if (q.display_rule?.depends_on) {
          const sectionKey = `${sectionGroup.sectionName}_0_${q.id}`;
          this.questionVisibility[sectionKey] = false;
        }
      });
    });


    this.serviceForm = this.fb.group({
      ...group,
      ...this.sectionGroups.reduce((acc, section) => {
        acc[section.sectionName] = section.formArray;
        return acc;
      }, {} as any),
    });

    this.serviceForm.valueChanges.subscribe(() => {
      if (this.visible) {
        this.formModifiedAfterFeeCalculation = true;
      }
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
          !['radio', 'select', 'file', 'checkbox', 'date'].includes(
            q.question_type
          )
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
        if (q.question_type === 'file') {
          const allowedMimes = Array.isArray(rule.mimes) ? rule.mimes : [];
          const maxSizeMb =
            rule.max_size_mb != null && rule.max_size_mb !== ''
              ? Number(rule.max_size_mb)
              : undefined;

          if (allowedMimes.length > 0 || maxSizeMb !== undefined) {
            validators.push(
              ServiceApplicationComponent.fileTypeAndSizeValidator(
                allowedMimes,
                maxSizeMb
              )
            );
          }
        }
      }

      let defaultValue: any = q.default_value || '';

      if (q.question_type === 'date' && defaultValue) {
        const date = new Date(defaultValue);
        defaultValue = isNaN(date.getTime()) ? null : date;
      }

      if (q.question_type === 'date_mmdd') {
        const today = new Date();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        defaultValue = `${month}${day}`;
      }

      if (q.question_type === 'date_yyyymmdd') {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        defaultValue = `${year}${month}${day}`;
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
        } else if (control.hasError('invalidFileType')) {
          const allowed = control.getError('invalidFileType')?.allowedTypes || [];
          errors.push(
            `${label} allows only ${allowed.map((ext: string) => `.${ext}`).join(', ')} files`
          );
        } else if (control.hasError('fileTooLarge')) {
          const err = control.getError('fileTooLarge');
          errors.push(`${label} must be <= ${err.requiredSizeMb} MB`);
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
            } else if (control.hasError('invalidFileType')) {
              const allowed = control.getError('invalidFileType')?.allowedTypes || [];
              errors.push(
                `${label} allows only ${allowed.map((ext: string) => `.${ext}`).join(', ')} files`
              );
            } else if (control.hasError('fileTooLarge')) {
              const err = control.getError('fileTooLarge');
              errors.push(`${label} must be <= ${err.requiredSizeMb} MB`);
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
  showSubmitConfirmation(): void {
    this.showConfirmModal = true;
  }

  handleConfirmSubmission(): void {
    this.showConfirmModal = false;
    this.onSubmit();
  }

onSubmit(): void {
  const returnUrl = this.route.snapshot.queryParams['returnUrl'];
  const isThirdParty = !!returnUrl;
  const thirdPartyServiceId = this.route.snapshot.queryParams['service_id'];
    this.serviceForm.markAllAsTouched();
    const validationErrors = this.getFormValidationErrors();
    if (validationErrors.length > 0) {
      const message =
        'Please fix the following:\n• ' + validationErrors.join('\n• ');
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

    this.submitWithFiles(userId, preparedRaw, false, isThirdParty, returnUrl, thirdPartyServiceId);
  }

  private getSubmissionEndpoint(): string {
    return this.applicationId !== null && this.applicationStatus !== 'draft'
      ? 'api/user/service-application-update'
      : 'api/user/service-application-store';
  }

  private prepareRawDataForSubmission(raw: any): any {
    const prepared = { ...raw };

    Object.keys(prepared).forEach((key) => {
      if (this.sectionGroups.some((s) => s.sectionName === key)) return;
      const question = this.questions.find((q) => q.id.toString() === key);
      if (question?.question_type === 'file') {
        const currentVal = prepared[key];
        if (
          currentVal instanceof File &&
          (currentVal as any)._isFake
        ) {
          prepared[key] = (currentVal as any)._url || this.fileUrls[key];
        }
      }
    });

    this.sectionGroups.forEach((section) => {
      const sectionData = prepared[section.sectionName] || [];
      sectionData.forEach((row: any, rowIndex: number) => {
        section.questions.forEach((q) => {
          if (q.question_type === 'file') {
            const currentVal = row[q.id];
            const fileKey = this.getFileUrlKey(q.id, section.sectionName, rowIndex);
            if (
              currentVal instanceof File &&
              (currentVal as any)._isFake
            ) {
              row[q.id] = (currentVal as any)._url || this.fileUrls[fileKey];
            }
          }
        });
      });
    });

    return prepared;
  }

  private submitWithFiles(
    userId: string,
    raw: any,
    saveAsDraft: boolean = false,
    isThirdParty: boolean = false,
    returnUrl: string | null = null,
    thirdPartyServiceId: string | null = null
  ): void {
    const formData = new FormData();
    if (isThirdParty) {
      formData.append('is_third_party', "1");
    }
    formData.append('user_id', userId);
    if (thirdPartyServiceId && isThirdParty) {
      formData.append('service_id', thirdPartyServiceId);
    } else {
      formData.append('service_id', this.serviceId.toString());
    }
    formData.append('save_data', saveAsDraft ? '1' : '0');
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

      if (question.question_type === 'file') {
        if (value instanceof File) {
          formData.append(`application_data[${key}]`, value, value.name);
        } else if (value != null) {
          // string URL
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

          const fieldName = `application_data[${q.id}][${rowIndex}]`;

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


    this.apiCalling = true;

    this.apiService.getByConditions(formData, this.getSubmissionEndpoint())
      .subscribe({
        next: (res) => {
  if (res?.status === 1) {
    this.apiService.openSnackBar(
      'Application saved successfully!',
      'success'
    );

    this.successFullySubmitted = true;
    this.succesResponse = res;
    this.successRedirectUrl = isThirdParty && returnUrl ? returnUrl : null;
    this.apiCalling = false;
  } else {
    this.apiService.openSnackBar(
      res?.message || 'Submission failed.',
      'error'
    );
    this.apiCalling = false;
  }

  this.apiCalling = false;
},

        error: (err) => {
          // console.error('Submission error:', err);
           this.apiCalling = false;
          this.apiService.openSnackBar(
            err?.error?.message || err?.uri || 'Submission failed. Please try again.',
            'error'
          );
        },
      });
  }

  goTo() {
    if (this.successRedirectUrl) {
      window.location.href = this.successRedirectUrl;
      return;
    }

    this.router.navigate(['/dashboard/services']);
    this.successFullySubmitted = false;
  }


  draft(): void {
    const userId = this.apiService.getDecryptedUserId();
    if (!userId) {
      this.apiService.openSnackBar('User not authenticated.', 'error');
      return;
    }
    const raw = this.serviceForm.getRawValue();
    const preparedRaw = this.prepareRawDataForSubmission(raw);
    this.submitWithFiles(userId, preparedRaw, true);
  }

  downloadSample(sampleUrl: string): void {
    if (!sampleUrl || sampleUrl.trim() === '') {
      this.apiService.openSnackBar('No sample file available.', 'error');
      return;
    }
    window.open(sampleUrl, '_blank');
  }

  private getFileUrlKey(
    questionId: number,
    sectionName?: string,
    rowIndex?: number
  ): string {
    return sectionName !== undefined && rowIndex !== undefined
      ? `${sectionName}_${rowIndex}_${questionId}`
      : String(questionId);
  }
  getDefaultFileUrl(
    questionId: number,
    sectionName?: string,
    rowIndex?: number
  ): string | null {
    const key = this.getFileUrlKey(questionId, sectionName, rowIndex);
    if (sectionName !== undefined && rowIndex !== undefined) {
      return this.fileUrls[key] || null;
    }
    return this.fileUrls[key] || null;
  }
  clearDefaultFileUrl(
    questionId: number,
    sectionName?: string,
    rowIndex?: number
  ): void {
    const key = this.getFileUrlKey(questionId, sectionName, rowIndex);
    delete this.fileUrls[key];
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
          if (res?.status === 1) {
            if (res.data?.extra_payment) {
              this.extraPayment = res.data.extra_payment;
            }
            const applicationData = res.application_data ?? res.data?.application_data ?? res.data;
            if (applicationData) {
              this.patchFormWithExistingData(applicationData);
            }
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

  private normalizeExistingApplicationData(applicationData: any): any {
    const normalized: any = {};

    if (!applicationData || typeof applicationData !== 'object') {
      return normalized;
    }

    if (Array.isArray(applicationData.fields)) {
      applicationData.fields.forEach((field: any) => {
        if (!field || field.id == null) {
          return;
        }

        const key = String(field.id);
        let answer = field.answer;

        if (field.type === 'checkbox') {
          if (Array.isArray(answer)) {
            normalized[key] = answer;
          } else if (typeof answer === 'string') {
            normalized[key] = answer
              .split(',')
              .map((item: string) => item.trim())
              .filter((item: string) => item !== '');
          } else {
            normalized[key] = [];
          }
        } else {
          normalized[key] = answer ?? '';
        }
      });
    }

    Object.keys(applicationData).forEach((key) => {
      if (key === 'fields') {
        return;
      }

      const value = applicationData[key];
      const isSectionKey = this.sectionGroups.some(
        (section) => section.sectionName === key
      );

      if (isSectionKey && Array.isArray(value)) {
        normalized[key] = value.map((row: any) => {
          if (row == null) {
            return {};
          }

          if (Array.isArray(row)) {
            const rowObj: any = {};
            row.forEach((item: any) => {
              if (item && item.id != null) {
                rowObj[String(item.id)] = item.answer;
              }
            });
            return rowObj;
          }

          if (typeof row === 'object') {
            const hasIdKeys = Object.keys(row).some((k) => !isNaN(Number(k)));
            if (hasIdKeys) {
              return row;
            }
            const rowObj: any = {};
            Object.values(row).forEach((item: any) => {
              if (item && item.id != null) {
                rowObj[String(item.id)] = item.answer;
              }
            });
            return rowObj;
          }
          if (typeof row === 'string') {
            const section = this.sectionGroups.find(
              (sectionGroup) => sectionGroup.sectionName === key
            );
            const fileQuestion = section?.questions.find(
              (question) => question.question_type === 'file'
            );

            return fileQuestion ? { [String(fileQuestion.id)]: row } : {};
          }

          return {};
        });
        return;
      }

      if (!isSectionKey && !normalized.hasOwnProperty(key)) {
        normalized[key] = value;
      }
    });

    return normalized;
  }

  private patchFormWithExistingData(applicationData: any): void {
    if (!applicationData || !this.serviceForm) return;
    const normalizedData = this.normalizeExistingApplicationData(applicationData);

    Object.keys(normalizedData).forEach((key) => {
      const section = this.sectionGroups.find((s) => s.sectionName === key);
      if (section) {
        const rows = normalizedData[key];
        if (!Array.isArray(rows) || rows.length === 0) {
          return;
        }

        this.ensureSectionRowCount(section, rows.length);

        rows.forEach((rowValues: any, rowIndex: number) => {
          const rowGroup = section.formArray.at(rowIndex) as FormGroup;
          section.questions.forEach((q) => {
            const control = rowGroup.get(String(q.id));
            if (!control) return;
            this.patchExistingControlValue(
              control,
              q,
              rowValues[q.id],
              section.sectionName,
              rowIndex
            );
          });
        });

        return;
      }

      const question = this.questions.find((q) => q.id.toString() === key);
      if (!question) return;

      const control = this.serviceForm.get(key);
      if (!control) return;

      this.patchExistingControlValue(control, question, normalizedData[key]);
    });

    this.cdr.detectChanges();
  }

  private normalizeSectionRows(sectionValue: any): Array<Record<string, any>> {
  if (!Array.isArray(sectionValue)) return [];

  return sectionValue.map((row: any) => {
    // tourism shape: [ [ {id, answer, type}, ... ] ]
    if (Array.isArray(row)) {
      return row.reduce((acc: Record<string, any>, field: any) => {
        if (field && field.id !== undefined) {
          acc[field.id] = field.answer;
        }
        return acc;
      }, {});
    }
    if (row && typeof row === 'object') {
      return row;
    }

    return {};
  });
}

private ensureSectionRowCount(section: any, rowCount: number): void {
  while (section.formArray.length < rowCount) {
    section.formArray.push(this.createSectionRow(section.questions));
  }

  while (section.formArray.length > rowCount) {
    section.formArray.removeAt(section.formArray.length - 1);
  }
}

  private patchExistingControlValue(
    control: any,
    question: ServiceQuestion,
    value: any,
    sectionName?: string,
    rowIndex?: number,
  ): void {
    if (!control) return;

    if (question.question_type === 'file') {
      if (typeof value === 'string' && value.trim() !== '') {
        const fileName = decodeURIComponent(value.split('/').pop() || 'file.pdf');
        const fakeFile = new File([], fileName, {
          type: this.getFileMimeType(fileName),
        });
        (fakeFile as any)._isFake = true;
        (fakeFile as any)._url = value;
        control.setValue(fakeFile);
        const key = this.getFileUrlKey(question.id, sectionName, rowIndex);
        this.fileUrls[key] = value;
      } else {
        control.setValue(null);
      }
      return;
    }

    if (question.question_type === 'date' && typeof value === 'string' && value.trim() !== '') {
      const date = new Date(value);
      control.setValue(isNaN(date.getTime()) ? value : date);
      return;
    }

    if (question.question_type === 'checkbox') {
      if (Array.isArray(value)) {
        control.setValue(value);
      } else if (typeof value === 'string') {
        control.setValue(
          value
            .split(',')
            .map((item: string) => item.trim())
            .filter((item: string) => item !== '')
        );
      } else {
        control.setValue([]);
      }
      return;
    }

    if (Array.isArray(value)) {
      control.setValue(value.length > 0 ? value[0] : '');
      return;
    }
    control.setValue(value ?? '');
  }

  calFee(): void {
    if (this.feeCalculating) return;

    this.serviceForm.markAllAsTouched();

    const validationErrors = this.getFormValidationErrors();
    if (validationErrors.length > 0) {
      const message =
        'Please fix the following:\n• ' + validationErrors.join('\n• ');
      this.apiService.openSnackBar(message, 'error');
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
    const actualAppId = this.appId2 !== null ? this.appId2 : this.applicationId;

    if (actualAppId !== null) {
      formData.append('application_id', actualAppId.toString());
    }

    if (this.extraPayment) {
      formData.append('extra_payment', this.extraPayment.toString());
    }

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
            const fieldName = `application_data[${q.id}][${rowIndex}]`;

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
            this.isCalculated = true;
            this.calculatedFee = Number(res.data.final_fee);
            this.effectiveFee = Number(res.data.effective_fee);
            this.previousPaid = Number(res.data.previous_paid);
            this.visible = true;
            this.formModifiedAfterFeeCalculation = false;
            this.apiService.openSnackBar(
              'Fee calculated successfully!',
              'success'
            );
          } else {
            this.visible = false;
            this.apiService.openSnackBar(
              res?.message || 'Failed to calculate fee.',
              'error'
            );
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

  private setupConditionalLogic(): void {
    this.questions.forEach((question) => {
      if (
        question.children_id &&
        question.children_id.length > 0 &&
        !question.display_rule?.depends_on
      ) {
        const control = this.serviceForm.get(question.id.toString());
        if (control) {
          control.valueChanges.subscribe((value) => {
            this.updateChildVisibility(question.id, value);
          });
        }
      }
    });

    this.sectionGroups.forEach((section) => {
      const formArray = this.getSectionFormArray(section.sectionName);
      formArray.valueChanges.subscribe((sectionValues) => {
        sectionValues.forEach((rowValue: any, rowIndex: number) => {
          section.questions.forEach((q) => {
            if (
              q.children_id &&
              q.children_id.length > 0 &&
              !q.display_rule?.depends_on
            ) {
              const controlValue = rowValue?.[q.id];
              if (controlValue !== undefined) {
                this.updateChildVisibilityInSection(
                  section.sectionName,
                  rowIndex,
                  q.id,
                  controlValue
                );
              }
            }
          });
        });
      });
    });
  }

  private updateChildVisibility(parentId: number, parentValue: any): void {
    const children = this.questions.filter(
      (q) => q.display_rule?.depends_on == parentId
    );

    children.forEach((child) => {
      if (child.display_rule) {
        const isVisible = this.evaluateCondition(
          parentValue,
          child.display_rule.operator,
          child.display_rule.value
        );
        this.questionVisibility[child.id] = isVisible;
      }
    });

    this.cdr.detectChanges();
  }

  private updateChildVisibilityInSection(
    sectionName: string,
    rowIndex: number,
    parentId: number,
    parentValue: any
  ): void {
    const section = this.sectionGroups.find(
      (s) => s.sectionName === sectionName
    );
    if (!section) return;

    const children = section.questions.filter(
      (q) => q.display_rule?.depends_on == parentId
    );

    children.forEach((child) => {
      if (child.display_rule) {
        const isVisible = this.evaluateCondition(
          parentValue,
          child.display_rule.operator,
          child.display_rule.value
        );
        const sectionKey = `${sectionName}_${rowIndex}_${child.id}`;
        this.questionVisibility[sectionKey] = isVisible;
      }
    });

    this.cdr.detectChanges();
  }

   private evaluateCondition(
    actualValue: any,
    operator: string,
    expectedValue: string
  ): boolean {
    // treat empty/missing actual as not matching
    if (actualValue === null || actualValue === undefined || actualValue === '') {
      return false;
    }

    // normalize operator and expected value
    const op = (operator || '').trim();
    const expectedRaw = expectedValue == null ? '' : String(expectedValue).trim();

    // handle cases where expected contains multiple allowed values (comma or pipe separated)
    const expectedList = expectedRaw.split(/\s*[,\|]\s*/).filter((v) => v !== '');

    // if actual is array (checkboxes, multi-select), check inclusion against expected list
    if (Array.isArray(actualValue)) {
      const actualStrs = actualValue.map((v) => String(v).trim());
      const anyMatch = expectedList.some((exp) => actualStrs.includes(exp));
      if (op === '!=' || op === '<>') {
        return !anyMatch;
      }
      // default equality-like behavior: show if any match
      return anyMatch;
    }

    // try numeric comparison if both sides are numeric
    const actualIsNumeric = !isNaN(Number(actualValue));
    const expectedIsNumeric = expectedList.length === 1 && !isNaN(Number(expectedList[0]));

    if (actualIsNumeric && expectedIsNumeric) {
      const actualNum = Number(actualValue);
      const expectedNum = Number(expectedList[0]);

      switch (op) {
        case '>':
          return actualNum > expectedNum;
        case '<':
          return actualNum < expectedNum;
        case '>=':
          return actualNum >= expectedNum;
        case '<=':
          return actualNum <= expectedNum;
        case '!=':
        case '<>':
          return actualNum !== expectedNum;
        case '=':
        case '==':
          return actualNum === expectedNum;
        default:
          return actualNum === expectedNum;
      }
    }

    // string comparison: check against any of expectedList
    const actualStr = String(actualValue).trim();

    const matchesAny = expectedList.some((exp) => actualStr === exp);

    switch (op) {
      case '!=':
      case '<>':
        return !matchesAny;
      case '=':
      case '==':
        return matchesAny;
      default:
        // default to strict equality against the full expected string
        return actualStr === expectedRaw;
    }
  }


  isQuestionVisible(
    questionId: number,
    sectionName?: string,
    rowIndex?: number
  ): boolean {
    if (sectionName !== undefined && rowIndex !== undefined) {
      const sectionKey = `${sectionName}_${rowIndex}_${questionId}`;
      return this.questionVisibility[sectionKey] !== false;
    }
    return this.questionVisibility[questionId] !== false;
  }

  stripHtmlTags(html: string): string {
    if (!html) return '';
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  }
}
