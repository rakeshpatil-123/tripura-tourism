import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogModule,
} from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { ReactiveFormsModule } from '@angular/forms';
import { GenericService } from '../../_service/generic/generic.service';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { IlogiFileUploadComponent } from '../../customInputComponents/ilogi-file-upload/ilogi-file-upload.component';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { MatDividerModule } from "@angular/material/divider";

@Component({
  selector: 'app-add-questionnaire-dialog',
  templateUrl: './add-questionnaire-dialog.component.html',
  styleUrls: ['./add-questionnaire-dialog.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatRadioModule,
    MatTableModule,
    IlogiFileUploadComponent,
    FormsModule,
    NgxMatSelectSearchModule,
    MatDividerModule
],
})
export class AddQuestionnaireDialogComponent implements OnInit {
  questionnaireForm: FormGroup;
  apiQuestions: any[] = [];
  availableColumns: string[] = [];
  selectedFile: File | null = null;
  sections: string[] = [];
  public filteredSections: string[] = [];
  public isAddingNewSection = false;
  public newSectionName = '';
  allowedFileTypes = ['jpg', 'jpeg', 'png', 'pdf', 'docx', 'xls', 'xlsx', 'csv', 'txt'];
  displayedColumns: string[] = [
    'question_label',
    'question_type',
    'options',
    'default_value',
    'is_required',
    'display_order',
    'group_label',
    'display_width',
    'status'
  ];
  regexPatterns = [
    { label: 'None', value: '' },
    { label: 'Only Alphabets (e.g. Name)', value: '^[A-Za-z ]+$' },
    { label: 'Only Numbers', value: '^[0-9]+$' },
    { label: 'Alphanumeric', value: '^[A-Za-z0-9]+$' },
    { label: 'Email', value: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[A-Za-z]{2,4}$' },
    { label: 'Phone (10 digits)', value: '^[6-9][0-9]{9}$' },
    {
      label: 'Password (Min 8 chars, 1 upper, 1 lower, 1 digit, 1 special)',
      value: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$'
    },
    { label: 'Pincode (6 digits)', value: '^[1-9][0-9]{5}$' },
    { label: 'Decimal Number', value: '^[0-9]+(\\.[0-9]{1,2})?$' },
    { label: 'URL', value: '^(https?:\\/\\/)?([\\w\\d-]+\\.)+[\\w-]{2,}(\\/\\S*)?$' },
    { label: 'Date (YYYY-MM-DD)', value: '^\\d{4}-\\d{2}-\\d{2}$' },
  ];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddQuestionnaireDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { service: any; mode: 'add' | 'edit'; questionnaire: any },
    private genericService: GenericService,
    private snackBar: MatSnackBar,
    private cdRef: ChangeDetectorRef 
  ) {
    this.questionnaireForm = this.fb.group({
      id: [null],
      service_id: [this.data?.service?.id || '', Validators.required],
      question_label: ['', Validators.required],
      question_type: ['text', Validators.required],
      is_required: ['no'],
      depends_on: [null],
      operator: [null],
      value: [null],
      options: [null],
      default_value: [null],
      is_section: [null],
      section_name: [null],
      default_source_table: [null],
      default_source_column: [null],
      display_order: [1],
      group_label: [''],
      sample_format: [null],
      display_width: ['50%'],
      status: [1],
      validation_required: ['no'],
      validation_rule: this.fb.group({
        type: ['text'],
        minLength: [
          null,
        ],
        maxLength: [
          null,
        ],
        pattern: [''],
        errorMessage: [''],
        mimes: [['jpg', 'jpeg', 'png', 'pdf', 'docx', 'xls', 'xlsx', 'csv', 'txt',]],
        max_size_mb: [3],
      })
    });
  }

  ngOnInit(): void {
    this.getSectionList();
    this.filteredSections = [...this.sections];

    const serviceId = this.data?.service?.id ?? this.data?.questionnaire?.service_id;

    if (serviceId) {
      this.loadQuestions(serviceId);
    }

    if (this.data.mode === 'edit' && this.data.questionnaire) {
      const q = this.data.questionnaire;
      this.questionnaireForm.patchValue({
        ...q,
        status: q.status === 1 || q.status === true ? '1' : '0',
        validation_required: q.validation_required ?? 'no',
        is_required: q.is_required ?? 'no',
        display_order: q.display_order ?? 1,
        display_width: q.display_width ?? '50%',
        group_label: q.group_label ?? '',
        section_name: q.section_name ?? '',
      });
      if (q.display_rule) {
        this.questionnaireForm.patchValue({
          operator: q.display_rule.operator || '',
          value: q.display_rule.value || null,
        });
      }
      if (q.validation_rule) {
        const rule = q.validation_rule;
        let mimesArray: string[] = [];
        if (Array.isArray(rule.mimes)) {
          mimesArray = rule.mimes;
        } else if (typeof rule.mimes === 'string') {
          try {
            const parsed = JSON.parse(rule.mimes);
            mimesArray = Array.isArray(parsed)
              ? parsed
              : rule.mimes.split(',').map((m: any) => m.trim()).filter(Boolean);
          } catch {
            mimesArray = rule.mimes.split(',').map((m: any) => m.trim()).filter(Boolean);
          }
        }
        this.validationRule.patchValue({
          mimes: mimesArray,
          max_size_mb: rule.max_size_mb || 3,
        });
      }

      if (q.sample_format) {
        this.selectedFile = null;
      }

      if (q.default_source_table) {
        this.onTableChange(q.default_source_table);
      }
    }
  }

  loadQuestions(serviceId: number): void {
    this.genericService.getServiceQuestionnaires(serviceId).subscribe({
      next: (res: any) => {
        if (res.status === 1 && Array.isArray(res.data) && res.data.length) {
          const currentId = this.data?.questionnaire?.id;
          this.apiQuestions = currentId
            ? res.data.filter((q: any) => q.id !== currentId)
            : res.data;
        } else {
          this.apiQuestions = [];
        }
        this.cdRef.detectChanges();

        if (this.data.mode === 'edit' && this.data.questionnaire?.display_rule?.depends_on) {
          const dependsOnId = this.data.questionnaire.display_rule.depends_on;
          const exists = this.apiQuestions.some(
            q => String(q.id) === String(dependsOnId)
          );

          setTimeout(() => {
            if (exists) {
              this.questionnaireForm.patchValue({
                depends_on: dependsOnId,
              });
            } else {
            }
            this.cdRef.detectChanges();
          }, 50);
        }
      },
      error: (err) => {
        console.error('Failed to load questions', err);
        this.apiQuestions = [];
      },
    });
  }

  compareQuestions = (o1: any, o2: any): boolean => {
    if (o1 == null && o2 == null) return true;
    if (o1 == null || o2 == null) return false;

    const id1 = (typeof o1 === 'object' && 'id' in o1) ? (o1 as any).id : o1;
    const id2 = (typeof o2 === 'object' && 'id' in o2) ? (o2 as any).id : o2;

    return String(id1) === String(id2);
  }

  submit() {
    if (this.questionnaireForm.invalid) {
      this.questionnaireForm.markAllAsTouched();
      const uploadRuleGroup = this.questionnaireForm.get('upload_rule');
      if (uploadRuleGroup && uploadRuleGroup.invalid) {
        uploadRuleGroup.markAllAsTouched();
      }

      this.snackBar.open('Please fix all validation errors before submitting.', 'error', {
        duration: 3000,
      });
      return;
    }
    const formValue = this.questionnaireForm.value;
    const formData = new FormData();
    formData.append('questionnaires[0][id]', formValue.id || '');
    formData.append('questionnaires[0][service_id]', this.data.service.id.toString());
    formData.append('questionnaires[0][question_label]', formValue.question_label);
    formData.append('questionnaires[0][question_type]', formValue.question_type);
    formData.append('questionnaires[0][is_required]', formValue.is_required);
    if (formValue.depends_on || formValue.value || formValue.operator) {
      formData.append('questionnaires[0][display_rule][depends_on]', formValue.depends_on || '');
      formData.append('questionnaires[0][display_rule][operator]', formValue.operator || '');
      formData.append('questionnaires[0][display_rule][value]', formValue.value || '');
    }
    formData.append('questionnaires[0][validation_required]', formValue.validation_required);
    formData.append('questionnaires[0][options]', formValue.options || '');
    formData.append('questionnaires[0][default_source_table]', formValue.default_source_table || '');
    formData.append('questionnaires[0][default_source_column]', formValue.default_source_column || '');
    formData.append('questionnaires[0][default_value]', formValue.default_value || '');

    const sectionNameValue = (formValue.is_section === 'no') ? '' : (formValue.section_name ?? '');
    formData.append('questionnaires[0][section_name]', sectionNameValue);
    formData.append('questionnaires[0][is_section]', formValue.is_section || "no");
    formData.append('questionnaires[0][display_order]', formValue.display_order.toString());
    formData.append('questionnaires[0][group_label]', formValue.group_label || '');
    formData.append('questionnaires[0][display_width]', formValue.display_width || '');
    formData.append('questionnaires[0][status]', formValue.status);
    if (this.selectedFile) {
      formData.append('questionnaires[0][sample_format]', this.selectedFile, this.selectedFile.name);
    }
    const rule = formValue.validation_rule || {};
    formData.append('questionnaires[0][validation_rule][minLength]', rule.minLength || '');
    formData.append('questionnaires[0][validation_rule][maxLength]', rule.maxLength || '');
    formData.append('questionnaires[0][validation_rule][pattern]', rule.pattern || '');
    formData.append('questionnaires[0][validation_rule][errorMessage]', rule.errorMessage || '');
    if (formValue.question_type === 'file') {
      const rule = formValue.validation_rule || {};
    let mimesArray: string[] = [];

    if (Array.isArray(rule.mimes)) {
      mimesArray = rule.mimes;
    } else if (typeof rule.mimes === 'string') {
      mimesArray = rule.mimes.split(',').map((m: string) => m.trim()).filter(Boolean);
    }

    mimesArray.forEach((mime: string, index: number) => {
      formData.append(`questionnaires[0][validation_rule][mimes][${index}]`, mime);
    });
      formData.append('questionnaires[0][validation_rule][max_size_mb]', rule.max_size_mb || '3');
    }

      const request$ = this.data.mode === 'add'
        ? this.genericService.saveQuestionnaire(formData)
        : this.genericService.updateQuestionnaire(formData);

      request$.subscribe({
        next: (res: any) => {
          const successMsg = this.data.mode === 'add' ? 'added' : 'updated';
          if (res.status === 1 || this.data.mode === 'edit') {
            this.snackBar.open(`Questionnaire ${successMsg} successfully`, 'success', { duration: 3000 });
            this.dialogRef.close(successMsg);
          } else {
            this.snackBar.open(res.message || `Failed to ${this.data.mode === 'add' ? 'add' : 'update'} questionnaire`, 'error', { duration: 3000 });
          }
        },
        error: (err) => this.snackBar.open(`Failed to ${this.data.mode === 'add' ? 'add' : 'update'} questionnaire ${err.error.error}`, 'error', { duration: 3000 })
    });
}

  onFileSelected(file: File, controlName: string): void {
    if (file) {
      this.selectedFile = file;
      this.questionnaireForm.get(controlName)?.setValue(file);
      this.snackBar.open(`Selected file: ${file.name}`, 'OK', { duration: 3000 });
    }
  }

  removeFile(controlName: string) {
    this.selectedFile = null;
    this.questionnaireForm.get(controlName)?.setValue(null);
  }

getExistingFileUrl(controlName: string): string | null {
    const filePath = this.data?.questionnaire?.[controlName];
    if (!filePath || this.selectedFile) return null;
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
      return filePath;
    }
    return `/uploads/${filePath}`;
  }

  getExistingFileName(controlName: string): string | null {
    const fileUrl = this.getExistingFileUrl(controlName);
    if (!fileUrl) return null;
    const parts = fileUrl.split('/');
    return parts[parts.length - 1];
  }

  close() {
    this.dialogRef.close();
  }

  getOptionsAsString(q: any): string {
    if (!q.options) return '';
    return Array.isArray(q.options) ? q.options.join(', ') : q.options;
  }

  onTableChange(table: string) {
    if (!table) {
      this.availableColumns = [];
      this.questionnaireForm.patchValue({ default_source_column: null });
      return;
    }

    this.genericService.getColumns(table).subscribe({
      next: (cols: any) => {
        this.availableColumns = cols['columns'];

        const selectedCol = this.data?.questionnaire?.default_source_column;
        if (selectedCol && this.availableColumns.includes(selectedCol)) {
          this.questionnaireForm.patchValue({
            default_source_column: selectedCol,
          });
        } else {
          this.questionnaireForm.patchValue({ default_source_column: null });
        }
      },
      error: () => {
        this.availableColumns = [];
        this.snackBar.open('Failed to fetch columns', 'error', {
          duration: 3000,
        });
      },
    });
  }
  
  getSectionList() {
    this.genericService
      .getServiceQuestionnaireSection(this.data.service.id)
      .subscribe((res: any) => {
        this.sections = res.data || [];
        this.filteredSections = [...this.sections];
      });
  }
  get uploadRule() {
    return this.questionnaireForm.get('upload_rule')!;
  }

  filterSections(event: any) {
    const searchTerm = event.target.value?.toLowerCase() || '';
    this.filteredSections = this.sections.filter(section =>
      section.toLowerCase().includes(searchTerm)
    );
  }

  showAddNewSectionInput(event?: MouseEvent) {
    event?.stopPropagation();
    this.isAddingNewSection = true;
    setTimeout(() => {
      const input = document.querySelector('.new-section-input') as HTMLElement;
      input?.focus();
    });
  }
  onSaveNewSection(evt?: Event) {
    evt?.stopPropagation();
    this.saveNewSection();
  }
  stopEvent(event: Event | KeyboardEvent) {
    event.stopPropagation();
  }
  saveNewSection() {
    const newName = this.newSectionName.trim();
    if (!newName) return;
    if (!this.sections.includes(newName)) {
      this.sections.push(newName);
    }
    this.filteredSections = [...this.sections];
    this.questionnaireForm.get('section_name')?.setValue(newName);

    this.newSectionName = '';
    this.isAddingNewSection = false;
    this.snackBar.open(`New section "${newName}" added`, 'OK', { duration: 2000 });
  }
  get validationRule() {
    return this.questionnaireForm.get('validation_rule') as FormGroup;
  }
}