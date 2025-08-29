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
  ],
})
export class AddQuestionnaireDialogComponent implements OnInit {
  questionnaireForm: FormGroup;
  apiQuestions: any[] = [];
  availableColumns: string[] = [];
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
      group_label: ['Basic Information'],
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
          100,
          [Validators.required, Validators.min(1), Validators.max(100)],
        ],
        pattern: ['^[A-Za-z ]+$'],
        errorMessage: ['Only alphabets allowed'],
      }),
    });
  }

  ngOnInit(): void {
    if (this.data?.questionnaire) {
      this.questionnaireForm.patchValue(this.data.questionnaire);
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
      this.snackBar.open('Please fix the errors before submitting', 'error', {
        duration: 3000,
      });
      return;
    }
    let formValue = this.prepareFormValue();
    const payload = { questionnaires: [formValue] };

    if (this.data.mode === 'add') {
      this.genericService.saveQuestionnaire(payload).subscribe({
        next: (res: any) => {
          if (res.status === 1) {
            this.close();
            this.snackBar.open('Questionnaire added successfully', 'success', {
              duration: 3000,
            });
            this.apiQuestions.unshift(formValue);
            this.questionnaireForm.reset({
              service_id: this.data.service.id,
              question_type: 'text',
              is_required: 'yes',
              display_order: this.apiQuestions.length + 1,
              group_label: 'Basic Information',
              display_width: '50%',
              status: 1,
              validation_required: 'yes',
              validation_rule: {
                type: 'text',
                minLength: 3,
                maxLength: 100,
                pattern: '^[A-Za-z ]+$',
                errorMessage: 'Only alphabets allowed',
              },
            });
          } else {
            this.snackBar.open(
              res.message || 'Failed to add questionnaire',
              'error',
              { duration: 3000 }
            );
          }
        },
        error: () => {
          this.snackBar.open('Failed to add questionnaire', 'error', {
            duration: 3000,
          });
        },
      });
    } else {
      this.genericService.updateQuestionnaire(payload).subscribe({
        next: () => {
          this.snackBar.open('Questionnaire updated successfully', 'success', {
            duration: 3000,
          });
          this.dialogRef.close('updated');
        },
        error: () => {
          this.snackBar.open('Failed to update questionnaire', 'error', {
            duration: 3000,
          });
        },
      });
    }
  }

  private prepareFormValue() {
    let formValue = { ...this.questionnaireForm.value };

    formValue.service_id = this.data.service.id;

    if (this.data.mode === 'add') {
      delete formValue.id;
    }
    if (formValue.options && Array.isArray(formValue.options)) {
      formValue.options = formValue.options.join(',');
    } else if (formValue.options && typeof formValue.options === 'string') {
      formValue.options = formValue.options.trim();
    } else {
      formValue.options = null;
    }

    return formValue;
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
