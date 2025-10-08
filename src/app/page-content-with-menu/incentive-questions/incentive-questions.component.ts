import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GenericService } from '../../_service/generic/generic.service';
import { LoaderService } from '../../_service/loader/loader.service';
import Swal from 'sweetalert2';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { DynamicTableComponent, TableColumn } from '../../shared/component/table/table.component';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { finalize } from 'rxjs';
@Component({
  selector: 'app-incentive-questions',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    DynamicTableComponent,
    ToggleSwitch
  ],
  templateUrl: './incentive-questions.component.html',
  styleUrls: ['./incentive-questions.component.scss']
})
export class IncentiveQuestionsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  public router = inject(Router);
  private genericService = inject(GenericService);
  private loaderService = inject(LoaderService);
  private fb = inject(FormBuilder);

  schemeId!: string;
  proformaId!: string;
  schemeTitle: string = '';
  proformaTitle: string = '';
  questions: any[] = [];
  loading = false;
  showQuestionDialog = false;
  isEditMode = false;
  editingQuestionId: string | null = null;
  checked: boolean = false;
  showPreviewDialog: boolean = false;
  showQuestionDetailsDialog: boolean = false;
  selectedQuestion: any = null;

  questionForm: FormGroup = this.fb.group({
    label: ['', Validators.required],
    type: ['text', Validators.required],
    required: [true],
    defaultValue: [''],
    displayOrder: [1],
    groupLabel: [''],
    displayWidth: ['col-12'],
    mimes: ['jpg'],
    max_size_mb: [5],
    multiple: [false],
    min_files: [1],
    max_files: [1]
  });


  columns: TableColumn[] = [
    { key: 'label', label: 'Question', type: 'text' },
    {
      key: 'type', label: 'Type', type: 'text', format: (value: any) => {
        if (!value) return '';
        return value.toString().replace(/_/g, ' ').replace(/\w\S*/g, (txt: any) =>
          txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
        );
      }
    },
    {
      key: 'required', label: 'Required', type: 'text', format: (value: any) => {
        if (value === 'yes' || value === true) return 'Yes';
        if (value === 'no' || value === false) return 'No';
        return value;
      }
    },
    {
      key: 'actions',
      label: 'Actions',
      type: 'action',
      cellClass: () => 'actions-column',
      actions: [
        { label: 'View', onClick: (row) => this.viewQuestionDialog(row) },
        { label: 'Edit', onClick: (row) => this.openQuestionDialog(row) },
        { label: 'Delete', color: 'warn', onClick: (row) => this.deleteQuestion(row) }
      ]
    }
  ];

  ngOnInit(): void {
    this.schemeId = this.route.snapshot.paramMap.get('schemeId')!;
    this.proformaId = this.route.snapshot.paramMap.get('proformaId')!;
    this.schemeTitle = history.state.schemeTitle || 'Scheme';
    this.proformaTitle = history.state.proformaTitle || 'Proforma';
    this.loadQuestions();
  }

  loadQuestions() {
    this.loading = true;
    this.loaderService.showLoader();
    this.genericService.getIncentiveQuestions(this.proformaId).pipe(finalize(() => this.loaderService.hideLoader())).subscribe({
      next: (res: any) => {
        this.loading = false;

        if (res?.status === 1 && Array.isArray(res.data)) {
          this.questions = res.data.map((q: any) => ({
            id: q.id,
            label: q.question_label,
            type: q.question_type,
            required: q.is_required,
            raw: q
          }));
        } else {
          this.questions = [];
        }
      },
      error: () => {
        this.loading = false;
        this.loaderService.hideLoader();
        this.questions = [];
      }
    });
  }

  openQuestionDialog(q: any | null = null) {
    if (q) {
      const data = q.raw || q;
      this.isEditMode = true;
      this.editingQuestionId = data.id;
      this.questionForm.patchValue({
        label: data.question_label,
        type: data.question_type,
        required: data.is_required === 'yes',
        defaultValue: data.default_value,
        displayOrder: data.display_order,
        groupLabel: data.group_label,
        displayWidth: data.display_width
      });
    } else {
      this.isEditMode = false;
      this.editingQuestionId = null;
      this.questionForm.reset({ type: 'text', required: true });
    }
    this.showQuestionDialog = true;
  }


  viewQuestionDialog(row: any): void {
    this.loaderService.showLoader();
    this.genericService.viewSingleIncentiveQuestion(row.id)
      .pipe(finalize(() => this.loaderService.hideLoader()))
      .subscribe({
        next: (res: any) => {
          const data = res.data;
          if (data.upload_rule && typeof data.upload_rule === 'string') {
            data.upload_rule = JSON.parse(data.upload_rule);
          }

          this.selectedQuestion = data;
          this.showQuestionDetailsDialog = true;
        },
        error: () => {
          Swal.fire('Error', 'Failed to fetch question details', 'error');
        }
      });
  }

  saveQuestion() {
    if (this.questionForm.invalid) {
      this.questionForm.markAllAsTouched();
      return;
    }

    const fv = this.questionForm.value;

    const questionnaire: any = {
      proforma_id: this.proformaId,
      question_label: fv.label,
      question_type: fv.type,
      is_required: fv.required ? 'yes' : 'no',
      default_value: fv.defaultValue || '',
      display_order: fv.displayOrder || 1,
      group_label: fv.groupLabel || '',
      display_width: fv.displayWidth || 'col-12',
      status: true,
      validation_required: fv.required ? 'yes' : 'no'
    };
    if (['file', 'image', 'video', 'audio'].includes(fv.type)) {
      questionnaire.upload_rule = {
        mimes: fv.mimes?.split(',') || this.getDefaultMimes(fv.type).split(','),
        max_size_mb: fv.max_size_mb || this.getDefaultMaxSize(fv.type),
        multiple: fv.multiple || false,
        min_files: fv.type === 'file' ? 0 : (fv.min_files || 1),
        max_files: fv.type === 'file' ? 5 : (fv.max_files || 1)
      };
    }
    if (this.isEditMode && this.editingQuestionId) {
      questionnaire.id = this.editingQuestionId;
    }

    const payload = questionnaire;

    this.loaderService.showLoader();

    const request$ = this.isEditMode
      ? this.genericService.updateIncentiveQuestion(payload)
      : this.genericService.createIncentiveQuestion(payload);

    request$.pipe(finalize(() => this.loaderService.hideLoader())).subscribe({
      next: () => {
        Swal.fire(
          'Success',
          `Question ${this.isEditMode ? 'updated' : 'added'} successfully.`,
          'success'
        );
        this.showQuestionDialog = false;
        this.loadQuestions();
      },
      error: () => {
        this.loaderService.hideLoader();
        Swal.fire(
          'Error',
          `Failed to ${this.isEditMode ? 'update' : 'add'} question.`,
          'error'
        );
      }
    });
  }



  deleteQuestion(q: any) {
    Swal.fire({
      title: 'Are you sure?',
      text: `Delete question "${q.label}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    }).then(result => {
      if (result.isConfirmed) {
        this.loaderService.showLoader();
        this.genericService.deleteIncentiveQuestion(q.id).pipe(finalize(() => this.loaderService.hideLoader())).subscribe({
          next: () => {
            Swal.fire('Deleted!', `Question "${q.label}" deleted successfully.`, 'success');
            this.loadQuestions();
          },
          error: () => {
            this.loaderService.hideLoader();
            Swal.fire('Error', 'Failed to delete question.', 'error');
          }
        });
      }
    });
  }

  onRowAction(event: any) {
    const { action, row } = event;
    if (action === 'Edit') this.openQuestionDialog(row);
    else if (action === 'Delete') this.deleteQuestion(row);
  }
  goBack() {
    this.router.navigate([`/dashboard/admin-incentive/${this.schemeId}/proformas`]);
  }
  getDefaultMimes(type: string): string {
    switch (type) {
      case 'file': return 'pdf,doc,docx';
      case 'image': return 'jpg,png,jpeg';
      case 'video': return 'mp4,mkv';
      case 'audio': return 'mp3,wav';
      default: return '';
    }
  }

  getDefaultMaxSize(type: string): number {
    switch (type) {
      case 'file': return 10;
      case 'image': return 5;
      case 'video': return 50;
      case 'audio': return 10;
      default: return 5;
    }
  }
  allQuestionPreview() {
    this.loadQuestions();
    this.showPreviewDialog = true;
  }
  get questionFields() {
    if (!this.selectedQuestion) return [];
    return [
      { label: 'ID', value: this.selectedQuestion.id },
      { label: 'Proforma ID', value: this.selectedQuestion.proforma_id },
      { label: 'Question Label', value: this.selectedQuestion.question_label },
      { label: 'Question Type', value: this.selectedQuestion.question_type },
      { label: 'Is Required', value: this.selectedQuestion.is_required },
      { label: 'Default Value', value: this.selectedQuestion.default_value || '-' },
      { label: 'Display Order', value: this.selectedQuestion.display_order },
      { label: 'Group Label', value: this.selectedQuestion.group_label || '-' },
      { label: 'Display Width', value: this.selectedQuestion.display_width },
      { label: 'Status', value: this.selectedQuestion.status === 1 ? 'Active' : 'Inactive' },
      { label: 'Validation Required', value: this.selectedQuestion.validation_required },
      { label: 'Created At', value: new Date(this.selectedQuestion.created_at).toLocaleString() },
      { label: 'Updated At', value: new Date(this.selectedQuestion.updated_at).toLocaleString() },
    ];
  }
}
