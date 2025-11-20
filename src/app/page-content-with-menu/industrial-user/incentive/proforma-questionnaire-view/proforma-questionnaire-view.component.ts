// proforma-questionnaire-view.component.ts
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { GenericService } from '../../../../_service/generic/generic.service';
import { IlogiSelectComponent } from '../../../../customInputComponents/ilogi-select/ilogi-select.component';
import { IlogiCheckboxComponent } from '../../../../customInputComponents/ilogi-checkbox/ilogi-checkbox.component';
import { IlogiFileUploadComponent } from '../../../../customInputComponents/ilogi-file-upload/ilogi-file-upload.component';
import { IlogiInputComponent } from '../../../../customInputComponents/ilogi-input/ilogi-input.component';
import { IlogiRadioComponent } from '../../../../customInputComponents/ilogi-radio/ilogi-radio.component';
import { IlogiInputDateComponent } from '../../../../customInputComponents/ilogi-input-date/ilogi-input-date.component';
import { CommonModule } from '@angular/common';
import { LoaderComponent } from '../../../../page-template/loader/loader.component';

interface FileMeta {
  file_id: string;
  path: string;
  url: string;
  name: string;
  mime: string;
  size: number;
}
interface Application {
  application_id: number;
  application_no: string;
  workflow_status: string;
  application_type: string;
  is_editable: boolean;
}
interface Question {
  id: number;
  question_label: string;
  question_type: string;
  is_required: 'yes' | 'no';
  options: string | null;
  default_value: string | null;
  default_source_table: string | null;
  default_source_column: string | null;
  group_label: string | null;
  display_width: string;
  display_order: number | null;
  upload_rule: any;
  validation_required: 'yes' | 'no';
  parsedOptions:
    | { id: string; name: string }[]
    | { value: string; name: string }[];
  is_claim: 'yes' | 'no';
  claim_percentage: number | null;
  claim_per_unit: number | null;

  value: any;
  files: FileMeta[];
}

@Component({
  selector: 'app-proforma-questionnaire-view',
  templateUrl: './proforma-questionnaire-view.component.html',
  styleUrls: ['./proforma-questionnaire-view.component.scss'],
  imports: [
    IlogiSelectComponent,
    IlogiCheckboxComponent,
    IlogiFileUploadComponent,
    IlogiInputComponent,
    IlogiRadioComponent,
    IlogiInputDateComponent,
    CommonModule,
    ReactiveFormsModule,
    LoaderComponent
  ],
})
export class ProformaQuestionnaireViewComponent implements OnInit {
  claimCalculations: { [questionId: number]: number } = {};
  totalClaimAmount: number = 0;
  proformaId: number | null = null;
  fileNames: { [key: string]: string } = {};
  appData: Application | null = null;
  applicationId: number | null = null;
  app_Type: string | null = null;
  questionnaireData: Question[] = [];
  groupedQuestions: { [key: string]: Question[] } = {};
  proformaForm!: FormGroup;
  loading: boolean = false;
  error: string | null = null;
  readonlyFields: { [questionId: number]: boolean } = {};
  // resolvedFileUrls: { [id: number]: string } = {};
  resolvedFileUrls: { [key: string]: string } = {};
  schemeId: number | null = null;
  constructor(
    private route: ActivatedRoute,
    private apiService: GenericService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {
    this.proformaForm = this.fb.group({});
  }

  ngOnInit(): void {
    // console.log('Resolved URLs:', this.resolvedFileUrls);
    const proformaId = this.route.snapshot.paramMap.get('proformaId');
    const schemeId = this.route.snapshot.paramMap.get('schemeId');
    const appType = this.route.snapshot.queryParamMap.get('proforma_type');
    console.log(appType, 'App type');

    const applicationId =
      this.route.snapshot.queryParamMap.get('applicationId');
    if (proformaId !== null && !isNaN(Number(proformaId))) {
      this.proformaId = Number(proformaId);
    } else {
      this.error = 'Invalid proforma ID';
      return;
    }
    if (appType !== null) {
      this.app_Type = appType;
    }
    // console.log(appType, "agaya");

    if (schemeId !== null && !isNaN(Number(schemeId))) {
      this.schemeId = Number(schemeId);
    } else {
      this.error = 'Invalid scheme ID';
      return;
    }
    if (applicationId !== null && !isNaN(Number(applicationId))) {
      this.applicationId = Number(applicationId);
    }

    this.fetchQuestionnaire(this.proformaId);
  }

  private getUserId(): number | null {
    const userId = localStorage.getItem('userId');
    return userId ? Number(userId) : null;
  }

  private fetchQuestionnaire(proformaId: number): void {
    this.loading = true;

    const payload: any = { proforma_id: proformaId };
    if (this.applicationId !== null) {
      payload.application_id = this.applicationId;
    }

    this.apiService
      .getByConditions(
        payload,
        'api/user/incentive/proforma-questionnaire-view'
      )
      .subscribe({
        next: (res: any) => {
          if (res?.status === 1 && Array.isArray(res.data.questions)) {
            this.appData = res.data.application;
            console.log(this.appData?.is_editable, 'application data');

            this.questionnaireData = res.data.questions.map((q: any) => {
              let parsedOptions: any = [];

              if (q.question_type === 'select') {
                parsedOptions = this.parseOptionsForSelect(
                  q.options || q.default_value
                );
              } else if (['radio', 'checkbox'].includes(q.question_type)) {
                parsedOptions = this.parseOptionsForRadioCheckbox(
                  q.options || q.default_value
                );
              } else if (q.question_type === 'switch') {
                parsedOptions = [
                  { value: 'yes', name: 'Yes' },
                  { value: 'no', name: 'No' },
                ];
              }

              return {
                ...q,
                parsedOptions,
              };
            });

            console.log(this.questionnaireData.length, "aye");
            

            this.groupQuestions();
            this.buildFormGroup();
            this.patchSavedAnswers();
            this.loadDefaultValues();
          } else {
            this.error = res?.message || 'Failed to load questionnaire';
            this.loading = false;
          }
        },
        error: () => {
          this.loading = false;
          this.error = 'Failed to load questionnaire';
        },
      });
  }

  private patchSavedAnswers(): void {
    this.questionnaireData.forEach((q) => {
      const control = this.proformaForm.get(q.id.toString());

      if (control && q.value !== null && q.value !== undefined) {
        let valueToSet = q.value;

        if (q.question_type === 'date') {
          const parsed = new Date(valueToSet);
          valueToSet = isNaN(parsed.getTime()) ? null : parsed;
        } else if (
          q.question_type === 'checkbox' &&
          typeof valueToSet === 'string'
        ) {
          valueToSet = valueToSet.split(',').map((s: string) => s.trim());
        } else if (q.question_type === 'switch') {
          valueToSet =
            (valueToSet || '').toString().toLowerCase() === 'yes'
              ? 'yes'
              : 'no';
        }

        control.setValue(valueToSet);
      }

      if (q.question_type === 'file' && !q.upload_rule?.max_files) {
        if (Array.isArray(q.files) && q.files.length > 0) {
          const fileUrl = q.files[0].url;
          const fileName =
            q.files[0].name || this.extractFileNameFromUrl(fileUrl);

          this.resolvedFileUrls[q.id] = fileUrl;

          const fakeFile = new File([], fileName, { type: q.files[0].mime });
          this.proformaForm.get(q.id.toString())?.setValue(fakeFile);
        }
      }

      if (q.question_type === 'file' && q.upload_rule?.max_files > 1) {
        const maxFiles = q.upload_rule.max_files;
        for (let i = 1; i <= maxFiles; i++) {
          const fileControlName = `${q.id}_${i}`;
          const fileControl = this.proformaForm.get(fileControlName);
          if (fileControl && Array.isArray(q.files) && q.files[i - 1]) {
            const fileUrl = q.files[i - 1].url;
            const fileName =
              q.files[i - 1].name || this.extractFileNameFromUrl(fileUrl);

            this.resolvedFileUrls[fileControlName] = fileUrl;

            const fakeFile = new File([], fileName, {
              type: q.files[i - 1].mime,
            });
            this.proformaForm.get(fileControlName)?.setValue(fakeFile);
          }
        }
      }
    });
  }

  private loadDefaultValues(): void {
    const userId = this.getUserId();
    if (!userId) {
      this.loading = false;
      return;
    }

    const questionsWithDefaults = this.questionnaireData.filter(
      (q) =>
        q.default_source_table &&
        q.default_source_column &&
        (q.value === null || q.value === undefined)
    );

    if (questionsWithDefaults.length === 0) {
      this.loading = false;
      return;
    }

    const promises = questionsWithDefaults.map((q) => {
      const payload = {
        user_id: userId,
        default_source_table: q.default_source_table,
        default_source_column: q.default_source_column,
      };

      return this.apiService
        .getByConditions(payload, 'api/get-default-source')
        .toPromise()
        .then((res: any) => {
          if (res) {
            const control = this.proformaForm.get(q.id.toString());
            if (control) {
              let valueToSet = res.value;

              if (q.question_type === 'date') {
                const parsed = new Date(res.value);
                valueToSet = isNaN(parsed.getTime()) ? null : parsed;
              }

              control.setValue(valueToSet);
              this.readonlyFields[q.id] = true;

              if (q.question_type === 'file') {
                const url = res.value;
                this.resolvedFileUrls[q.id] = url;

                const fileName = this.extractFileNameFromUrl(url);
                const fakeFile = new File([], fileName, {
                  type: this.getFileMimeType(fileName),
                });
                control.setValue(fakeFile);
              }
            }
          }
        })
        .catch((err) => {
          console.error('Error loading default for question', q.id, err);
        });
    });

    Promise.all(promises).finally(() => {
      this.loading = false;
      this.cdr.detectChanges();
    });
  }
  private extractFileNameFromUrl(url: string): string {
    try {
      return decodeURIComponent(url.split('?')[0].split('/').pop() || 'file');
    } catch {
      return 'file';
    }
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

  private parseOptionsForRadioCheckbox(
    optionsStr: string | null
  ): { value: string; name: string }[] {
    if (!optionsStr) return [];
    return optionsStr
      .split(',')
      .map((opt) => opt.trim())
      .filter(Boolean)
      .map((opt) => ({ value: opt, name: opt }));
  }

  private parseOptionsForSelect(
    optionsStr: string | null
  ): { id: string; name: string }[] {
    if (!optionsStr) return [];
    return optionsStr
      .split(',')
      .map((opt) => opt.trim())
      .filter(Boolean)
      .map((opt) => ({ id: opt, name: opt }));
  }

  getSelectOptions(q: Question): { id: string; name: string }[] {
    return Array.isArray(q.parsedOptions) && q.parsedOptions.length > 0
      ? (q.parsedOptions as { id: string; name: string }[])
      : [];
  }

  getRadioOptions(q: Question): { value: string; name: string }[] {
    return Array.isArray(q.parsedOptions) && q.parsedOptions.length > 0
      ? (q.parsedOptions as { value: string; name: string }[])
      : [];
  }

  getCheckboxOptions(q: Question): { value: string; name: string }[] {
    return Array.isArray(q.parsedOptions) && q.parsedOptions.length > 0
      ? (q.parsedOptions as { value: string; name: string }[])
      : [];
  }

  private buildFormGroup(): void {
    const group: any = {};

    this.questionnaireData.forEach((q) => {
      // Handle multi-file questions
      if (q.question_type === 'file' && q.upload_rule?.max_files > 1) {
        const maxFiles = q.upload_rule.max_files;
        for (let i = 1; i <= maxFiles; i++) {
          group[`${q.id}_${i}`] = [null];
        }
      }
      else {
        let value: any;

        if (q.question_type === 'checkbox') {
          value = [];
        } else if (q.question_type === 'switch') {
          const def = (q.default_value || '').toString().toLowerCase();
          value = def === 'true' || def === '1' || def === 'yes' ? 'yes' : 'no';
        } else if (q.question_type === 'date') {
          if (q.default_value) {
            const parsed = new Date(q.default_value);
            value = isNaN(parsed.getTime()) ? null : parsed;
          } else {
            value = null;
          }
        } else if (q.question_type === 'file') {
          // Single file
          value = null;
        } else {
          value = q.default_value || '';
        }

        group[q.id] = [value];
      }
    });

    this.proformaForm = this.fb.group(group);

    if (this.app_Type === 'claim') {
      this.questionnaireData.forEach((q) => {
        if (
          q.question_type === 'number' &&
          q.is_claim === 'yes' &&
          (q.claim_percentage !== null || q.claim_per_unit !== null)
        ) {
          const control = this.proformaForm.get(q.id.toString());
          if (control) {
            control.valueChanges.subscribe((val) => {
              this.updateClaimCalculation(q, val);
            });
          }
        }
      });
    }
  }

  private updateClaimCalculation(question: Question, inputValue: any): void {
    let amount = 0;

    const numValue = parseFloat(inputValue);
    if (!isNaN(numValue) && numValue > 0) {
      if (question.claim_percentage !== null) {
        amount = numValue * (question.claim_percentage / 100);
      } else if (question.claim_per_unit !== null) {
        amount = numValue * question.claim_per_unit;
      }
    }

    this.claimCalculations[question.id] = amount;
    this.recalculateTotalClaim();
  }

  private recalculateTotalClaim(): void {
    this.totalClaimAmount = Object.values(this.claimCalculations).reduce(
      (sum, val) => sum + val,
      0
    );
  }

  private groupQuestions(): void {
    const groups: { [key: string]: Question[] } = {};
    this.questionnaireData.forEach((q) => {
      const groupKey = q.group_label || 'General';
      if (!groups[groupKey]) groups[groupKey] = [];
      groups[groupKey].push(q);
    });
    this.groupedQuestions = groups;
  }

  getKeys(obj: any): string[] {
    return Object.keys(obj);
  }

  isFieldReadonly(questionId: number): boolean {
    return !!this.readonlyFields[questionId];
  }

  getFullFileUrl(path: string | null): string | null {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return '/' + path.replace(/\\/g, '/');
  }
  getFileUrl(questionId: number): string | null {
    return this.resolvedFileUrls[questionId] || null;
  }

  private sendApplication(
    payload: any,
    files: { [questionId: number]: File[] }
  ): void {
    const formData = new FormData();

    Object.keys(payload).forEach((key) => {
      if (key === 'form_answers_json') {
        formData.append(key, JSON.stringify(payload[key]));
      } else {
        formData.append(key, payload[key]);
      }
    });

    Object.keys(files).forEach((questionId) => {
      const fileArray = files[Number(questionId)];
      fileArray.forEach((file) => {
        formData.append(`files[${questionId}][]`, file);
      });
    });

    this.apiService
      .getByConditions(
        formData,
        'api/user/incentive/proforma-application-store'
      )
      .subscribe({
        next: (res: any) => {
          if (res?.status === 1) {
            this.apiService.openSnackBar(
              res.message || 'Application saved successfully!',
              'success'
            );
            if (this.app_Type === 'claim') {
              window.location.href = 'dashboard/claim';
            } else {
              window.location.href = 'dashboard/eligibility';
            }
          } else {
            this.apiService.openSnackBar(
              res?.message || 'Operation failed.',
              'error'
            );
          }
        },
       error: (err) => {
  console.error('Submission error:', err);

  if (
    err?.error?.errors &&
    typeof err.error.errors === 'object' &&
    !Array.isArray(err.error.errors)
  ) {
    const errorEntries = Object.entries(err.error.errors); 

    if (errorEntries.length > 0) {
      const [errorKey, rawMessages] = errorEntries[0];

      let message = 'Invalid file format.';
      if (Array.isArray(rawMessages) && rawMessages.length > 0) {
        message = String(rawMessages[0]); 
      }

      const match = errorKey.match(/^files\.(\d+)\.\d+$/);
      if (match) {
        const questionId = Number(match[1]);
        const question = this.questionnaireData.find(q => q.id === questionId);
        const label = question?.question_label || 'This file field';

        this.apiService.openSnackBar(`Invalid file for ${label}: ${message}`, 'error');
        return;
      }
    }
  }

  this.apiService.openSnackBar('Failed to save application.', 'error');
}
      });
  }

  onSubmit(): void {
    const missingField = this.getMissingRequiredField();
    if (missingField) {
      this.apiService.openSnackBar(`Please fill: ${missingField}`, 'error');
      return;
    }
    if (this.proformaForm.invalid || this.schemeId === null) {
      this.apiService.openSnackBar('Please fill all required fields.', 'error');
      return;
    }
    const { payload, files } = this.preparePayload(false);
    this.sendApplication(payload, files);
  }

  onSaveAsDraft(): void {
    if (this.proformaForm.invalid || this.schemeId === null) {
      this.apiService.openSnackBar('Please fill all required fields.', 'error');
      return;
    }
    const { payload, files } = this.preparePayload(true);
    this.sendApplication(payload, files);
  }

  private getMissingRequiredField(): string | null {
    const rawValues = this.proformaForm.getRawValue();

    for (const q of this.questionnaireData) {
      if (q.is_required !== 'yes') continue;

      let value: any;

      if (q.question_type === 'file') {
        if (q.upload_rule?.max_files > 1) {
          let hasFile = false;
          for (let i = 1; i <= q.upload_rule.max_files; i++) {
            const controlName = `${q.id}_${i}`;
            if (
              (rawValues[controlName] instanceof File &&
                rawValues[controlName].size > 0) ||
              this.resolvedFileUrls[controlName]
            ) {
              hasFile = true;
              break;
            }
          }
          if (!hasFile) {
            return q.question_label;
          }
        } else {
          const controlValue = rawValues[q.id];
          if (
            !(controlValue instanceof File && controlValue.size > 0) &&
            !this.resolvedFileUrls[q.id]
          ) {
            return q.question_label;
          }
        }
      } else {
        value = rawValues[q.id];

        if (q.question_type === 'checkbox') {
          if (!Array.isArray(value) || value.length === 0) {
            return q.question_label;
          }
        } else if (q.question_type === 'switch') {
          if (value !== 'yes' && value !== 'no') {
            return q.question_label;
          }
        } else {
          if (
            value === null ||
            value === undefined ||
            value === '' ||
            (typeof value === 'string' && value.trim() === '')
          ) {
            return q.question_label;
          }
        }
      }
    }

    return null;
  }

  getInputType(
    questionType: string
  ): 'text' | 'number' | 'email' | 'textarea' | 'password' | 'tel' {
    switch (questionType) {
      case 'number':
        return 'number';
      case 'tel':
        return 'tel';
      case 'email':
        return 'email';
      case 'textarea':
        return 'textarea';
      case 'password':
        return 'password';
      default:
        return 'text';
    }
  }

  getRange(n: number): number[] {
    return Array.from({ length: n }, (_, i) => i + 1);
  }

  getMultiFileControlName(questionId: number, index: number): string {
    return `${questionId}_${index}`;
  } 

  trackByIndex(index: number): number {
    return index;
  }

  private preparePayload(isDraft: boolean = false): {
    payload: any;
    files: { [questionId: number]: File[] };
  } {
    const formAnswers: { [key: string]: { value: any } } = {};
    const files: { [questionId: number]: File[] } = {};

    const rawValues = this.proformaForm.getRawValue();

    this.questionnaireData.forEach((q) => {
      if (q.question_type === 'file' && q.upload_rule?.max_files > 1) {
        const urlArray: string[] = [];
        const fileArray: File[] = [];

        for (let i = 1; i <= q.upload_rule.max_files; i++) {
          const controlValue = rawValues[`${q.id}_${i}`];
          const fileKey = `${q.id}_${i}`;

          if (controlValue instanceof File && controlValue.size > 0) {
            fileArray.push(controlValue);
          } else if (this.resolvedFileUrls[fileKey]) {
            urlArray.push(this.resolvedFileUrls[fileKey]);
          }
        }

        if (urlArray.length > 0) {
          formAnswers[q.id] = { value: urlArray };
        }

        if (fileArray.length > 0) {
          files[q.id] = fileArray;
        }
      } else if (q.question_type === 'file') {
        const controlValue = rawValues[q.id];

        if (controlValue instanceof File && controlValue.size > 0) {
          files[q.id] = [controlValue];
        } else if (this.resolvedFileUrls[q.id]) {
          formAnswers[q.id] = { value: this.resolvedFileUrls[q.id] };
        }
      } else {
        let value = rawValues[q.id];
        if (q.question_type === 'date' && value instanceof Date) {
          value = value.toISOString().split('T')[0];
        } else if (q.question_type === 'checkbox' && Array.isArray(value)) {
          value = value.join(', ');
        }
        formAnswers[q.id] = { value: value || '' };
      }
    });

    const application_type = this.app_Type || 'eligibility';

    const payload: any = {
      scheme_id: this.schemeId,
      proforma_id: this.proformaId,
      application_type: application_type,
      form_answers_json: formAnswers,
      save_data: isDraft ? 1 : 0,
    };

    if (this.applicationId !== null) {
      payload.application_id = this.applicationId;
    }

    return { payload, files };
  }

  stripHtmlTags(html: string): string {
  if (!html) return '';
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
}
}
