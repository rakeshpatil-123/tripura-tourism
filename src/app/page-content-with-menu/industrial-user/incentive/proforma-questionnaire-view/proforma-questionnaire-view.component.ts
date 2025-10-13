// proforma-questionnaire-view.component.ts
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { GenericService } from '../../../../_service/generic/generic.service';
import { IlogiSelectComponent } from '../../../../customInputComponents/ilogi-select/ilogi-select.component';
import { IlogiCheckboxComponent } from '../../../../customInputComponents/ilogi-checkbox/ilogi-checkbox.component';
import { IlogiFileUploadComponent } from '../../../../customInputComponents/ilogi-file-upload/ilogi-file-upload.component';
import { IlogiInputComponent } from '../../../../customInputComponents/ilogi-input/ilogi-input.component';
import { IlogiRadioComponent } from '../../../../customInputComponents/ilogi-radio/ilogi-radio.component';
import { IlogiInputDateComponent } from '../../../../customInputComponents/ilogi-input-date/ilogi-input-date.component';
import { CommonModule } from '@angular/common';

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
  upload_rule: any;
  validation_required: 'yes' | 'no';
  parsedOptions:
    | { id: string; name: string }[]
    | { value: string; name: string }[];
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
  ],
})
export class ProformaQuestionnaireViewComponent implements OnInit {
  proformaId: number | null = null;
  questionnaireData: Question[] = [];
  groupedQuestions: { [key: string]: Question[] } = {};
  proformaForm!: FormGroup;
  loading = false;
  error: string | null = null;
  readonlyFields: { [questionId: number]: boolean } = {};
  resolvedFileUrls: { [id: number]: string } = {};
  schemeId: number | null = null;
  constructor(
    private route: ActivatedRoute,
    private apiService: GenericService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) { this.proformaForm = this.fb.group({});}

  ngOnInit(): void {
    //  this.proformaForm = this.fb.group({});
    const proformaId = this.route.snapshot.paramMap.get('proformaId');
    const schemeId = this.route.snapshot.paramMap.get('schemeId');

    if (proformaId !== null && !isNaN(Number(proformaId))) {
      this.proformaId = Number(proformaId);
    } else {
      this.error = 'Invalid proforma ID';
      return;
    }

    if (schemeId !== null && !isNaN(Number(schemeId))) {
      this.schemeId = Number(schemeId);
    } else {
      this.error = 'Invalid scheme ID';
      return;
    }

    this.fetchQuestionnaire(this.proformaId);
  }
  // private loadProformaId(): void {
  //   const id = this.route.snapshot.paramMap.get('proformaId');
  //   if (id !== null && !isNaN(Number(id))) {
  //     this.proformaId = Number(id);
  //     this.fetchQuestionnaire(this.proformaId);
  //   } else {
  //     this.error = 'Invalid proforma ID';
  //   }
  // }

  private getUserId(): number | null {
    const userId = localStorage.getItem('userId');
    return userId ? Number(userId) : null;
  }

  private fetchQuestionnaire(proformaId: number): void {
    this.loading = true;
    const payload = { proforma_id: proformaId };

    this.apiService
      .getByConditions(
        payload,
        'api/user/incentive/proforma-questionnaire-view'
      )
      .subscribe({
        next: (res: any) => {
          if (res?.status === 1 && Array.isArray(res.data.questions)) {
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

            this.groupQuestions();
            this.buildFormGroup();
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

  private loadDefaultValues(): void {
    const userId = this.getUserId();
    if (!userId) {
      this.loading = false;
      return;
    }

    const questionsWithDefaults = this.questionnaireData.filter(
      (q) => q.default_source_table && q.default_source_column
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
                this.resolvedFileUrls[q.id] = res.value;
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
      // Handle all other question types (including single file)
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
          // text, number, email, select, radio, textarea, password, url, etc.
          value = q.default_value || '';
        }

        group[q.id] = [value];
      }
    });

    this.proformaForm = this.fb.group(group);
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
          } else {
            this.apiService.openSnackBar(
              res?.message || 'Operation failed.',
              'error'
            );
          }
        },
        error: (err) => {
          console.error('Submission error:', err);
          this.apiService.openSnackBar('Failed to save application.', 'error');
        },
      });
  }

  onSubmit(): void {
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

  getInputType(
    questionType: string
  ): 'text' | 'number' | 'email' | 'textarea' | 'password' {
    switch (questionType) {
      case 'number':
        return 'number';
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
        const fileArray: File[] = [];
        for (let i = 1; i <= q.upload_rule.max_files; i++) {
          const controlValue = rawValues[`${q.id}_${i}`];
          if (controlValue instanceof File) {
            fileArray.push(controlValue);
          }
        }
        if (fileArray.length > 0) {
          files[q.id] = fileArray;
        }
      } else if (q.question_type === 'file') {
        const controlValue = rawValues[q.id];
        if (controlValue instanceof File) {
          files[q.id] = [controlValue];
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

    const payload: any = {
      scheme_id: this.schemeId,
      proforma_id: this.proformaId,
      application_type: 'eligibility',
      form_answers_json: formAnswers,
      save_data: isDraft ? 1 : 0,
    };

   

    return { payload, files };
  }
}
