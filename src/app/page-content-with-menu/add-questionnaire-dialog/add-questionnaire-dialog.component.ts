import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
    IlogiFileUploadComponent
  ],
})
export class AddQuestionnaireDialogComponent implements OnInit {
  questionnaireForm: FormGroup;
  apiQuestions: any[] = [];
  availableColumns: string[] = [];
  selectedFile: File | null = null;
  displayedColumns: string[] = [
    'question_label',
    'question_type',
    'options',
    'default_value',
    'is_required',
    'display_order',
    'group_label',
    'display_width',
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
    private snackBar: MatSnackBar
  ) {
    this.questionnaireForm = this.fb.group({
      id: [null],
      service_id: [this.data?.service?.id || '', Validators.required],
      question_label: ['', Validators.required],
      question_type: ['text', Validators.required],
      is_required: ['yes', Validators.required],
      options: [null],
      default_value: [null],
      default_source_table: [null],
      default_source_column: [null],
      display_order: [1, [Validators.required, Validators.pattern(/^[0-9]+$/)]],
      group_label: [''],
      sample_format: [null],
      display_width: ['50%'],
      status: [1, Validators.required],
      validation_required: ['yes', Validators.required],
      validation_rule: this.fb.group({
        type: ['text'],
        minLength: [
          3,
          [Validators.required, Validators.min(1), Validators.max(100)],
        ],
        maxLength: [
          1000,
          [Validators.required, Validators.min(1), Validators.max(1000)],
        ],
        pattern: [''],
        errorMessage: [''],
      }),
    });
  }

  ngOnInit(): void {
    if (this.data?.questionnaire) {
      this.questionnaireForm.patchValue(this.data.questionnaire);
      if (this.data.questionnaire.sample_format) {
        this.selectedFile = null;
      }
      if (this.data.questionnaire.default_source_table) {
        this.onTableChange(this.data.questionnaire.default_source_table);
      }
    } else {
      this.genericService
        .getServiceQuestionnaires(this.data.service.id)
        .subscribe((res: any) => {
          if (res.status === 1 && res.data?.length) {
            this.apiQuestions = res.data;
          }
        });
    }
  }

  submit() {
    if (this.questionnaireForm.invalid) {
      this.questionnaireForm.markAllAsTouched();
      this.snackBar.open('Please fix the errors before submitting', 'error', { duration: 3000 });
      return;
    }

    const formValue = this.questionnaireForm.value;
    const formData = new FormData();
    formData.append('questionnaires[0][id]', formValue.id || '');
    formData.append('questionnaires[0][service_id]', this.data.service.id.toString());
    formData.append('questionnaires[0][question_label]', formValue.question_label);
    formData.append('questionnaires[0][question_type]', formValue.question_type);
    formData.append('questionnaires[0][is_required]', formValue.is_required);
    formData.append('questionnaires[0][validation_required]', formValue.validation_required);
    if (this.selectedFile) {
      formData.append('questionnaires[0][sample_format]', this.selectedFile, this.selectedFile.name);
    }

    if (this.data.mode === 'add') {
      this.genericService.saveQuestionnaire(formData).subscribe({
        next: (res: any) => {
          if (res.status === 1) {
            this.snackBar.open('Questionnaire added successfully', 'success', { duration: 3000 });
              this.dialogRef.close('added');
          } else {
            this.snackBar.open(res.message || 'Failed to add questionnaire', 'error', { duration: 3000 });
          }
        },
        error: () => this.snackBar.open('Failed to add questionnaire', 'error', { duration: 3000 })
      });
    } else {
      this.genericService.updateQuestionnaire(formData).subscribe({
        next: () => this.snackBar.open('Questionnaire updated successfully', 'success', { duration: 3000 }),
      error: () => this.snackBar.open('Failed to update questionnaire', 'error', { duration: 3000 })
    });
  }
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
}
