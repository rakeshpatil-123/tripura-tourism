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
import { Select } from 'primeng/select';

interface DropdownOption {
  name: string;
  value: string;
}
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
    ToggleSwitch,
    Select
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
  readonlyFieldError: string | null = null;
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
  showSourceHint: boolean = false;
  showClaimHint: boolean = false;
  questionForm: FormGroup = this.fb.group({
    label: ['', Validators.required],
    type: ['text', Validators.required],
    required: [true],
    defaultValue: [''],
    displayOrder: [1],
    groupLabel: [''],
    displayWidth: ['col-12'],
    default_source_table: [null],
    default_source_column: [null],
    is_claim: [false],
    claim_per_unit: ['', [Validators.min(0)]],
    claim_percentage: ['', [Validators.min(0), Validators.max(100)]],
    mimes: ['jpg'],
    max_size_mb: [5],
    multiple: [false],
    min_files: [1],
    max_files: [1]
  });
  sourceTables: DropdownOption[] = [];
  availableColumnsDropdown: DropdownOption[] = [];


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
    this.sourceTables = [
      { name: 'Unit Details', value: 'unit_details' },
      { name: 'Enterprise Details', value: 'enterprise_details' },
      { name: 'Management Details', value: 'management_details' },
      { name: 'Line of Activity', value: 'line_of_activities' },
      { name: 'General Attachments', value: 'general_attachments' },
      { name: 'Clearances', value: 'clearances' },
      { name: 'Bank Details', value: 'bank_details' },
      { name: 'Activities', value: 'activities' }
    ];
    this.loadQuestions();
    this.questionForm.get('is_claim')?.valueChanges.subscribe((value) => {
      if (value) {
        this.questionForm.get('claim_per_unit')?.enable();
        this.questionForm.get('claim_percentage')?.enable();
        this.showClaimHint = false;
      } else {
        this.questionForm.get('claim_per_unit')?.reset();
        this.questionForm.get('claim_percentage')?.reset();
      }
    });
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
        required: data.is_required === 'yes' || data.is_required === true ? 'yes' : 'no',
        defaultValue: data.default_value,
        displayOrder: data.display_order,
        groupLabel: data.group_label,
        displayWidth: data.display_width,
        default_source_table: data.default_source_table || null,
        is_claim: data.is_claim === 'yes' || data.is_claim === true,
        claim_per_unit: data.claim_per_unit || null,
        claim_percentage: data.claim_percentage || null
      });
      if (data.default_source_table) {
        this.onTableChange(data.default_source_table);
        setTimeout(() => {
          this.questionForm.patchValue({
            default_source_column: data.default_source_column || null
          });
        });
      }
    } else {
      this.isEditMode = false;
      this.editingQuestionId = null;
      this.questionForm.reset({
        type: 'text',
        required: true,
        is_claim: false,
        claim_per_unit: null,
        claim_percentage: null
      });
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
      is_required: fv.required === 'yes' ? 'yes' : 'no',
      default_value: fv.defaultValue || '',
      display_order: fv.displayOrder || 1,
      group_label: fv.groupLabel || '',
      display_width: fv.displayWidth || 'col-12',
      default_source_table: fv.default_source_table || null,
      default_source_column: fv.default_source_column || null,
      status: true,
      validation_required: fv.required ? 'yes' : 'no'
    };
    questionnaire.is_claim = fv.is_claim ? 'yes' : 'no';
    if (fv.is_claim) {
      questionnaire.claim_per_unit = fv.claim_per_unit || null;
      questionnaire.claim_percentage = fv.claim_percentage || null;
    }
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
  onTableChange(table: string, prefillColumn?: string) {
    this.questionForm.patchValue({ default_source_column: null });
    this.availableColumnsDropdown = [];
    this.showSourceHint = false;

    if (!table) return;

    this.genericService.getColumns(table).subscribe({
      next: (res: any) => {
        if (res && Array.isArray(res.columns)) {
          this.availableColumnsDropdown = res.columns.map((col: string) => ({
            name: col,
            value: col
          }));
          this.availableColumnsDropdown.unshift({ name: '-- Select None --', value: '' });
          if (prefillColumn && this.availableColumnsDropdown.some(c => c.value === prefillColumn)) {
            this.questionForm.patchValue({ default_source_column: prefillColumn });
          }
        } else {
          this.availableColumnsDropdown = [];
          this.questionForm.patchValue({ default_source_column: null });
        }
      },
      error: () => {
        this.availableColumnsDropdown = [];
        this.questionForm.patchValue({ default_source_column: null });
      }
    });
  }
  onSourceColumnClick() {
    if (!this.questionForm.get('default_source_table')?.value) {
      this.showSourceHint = true;
    } else {
      this.showSourceHint = false;
    }
  }
  onClaimFieldClick() {
    const isClaim = this.questionForm.get('is_claim')?.value;
    if (!isClaim) {
      this.showClaimHint = true;
    }
  }
  closeDialog() {
    this.showQuestionDialog = false;
    this.onDialogClose();
  }

  onDialogClose() {
    if (this.questionForm) {
      this.questionForm.reset();
    }
    this.isEditMode = false;
    this.showClaimHint = false;
    this.availableColumnsDropdown = [];
  }
  openDummyPdf(event: Event) {
    event.preventDefault();
    const pdfContent = `
    %PDF-1.4
    1 0 obj
    << /Type /Catalog /Pages 2 0 R >>
    endobj
    2 0 obj
    << /Type /Pages /Kids [3 0 R] /Count 1 >>
    endobj
    3 0 obj
    << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842]
       /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
    endobj
    4 0 obj
    << /Length 500 >>
    stream
      BT
      /F1 28 Tf
      80 780 Td
      (SWAAGAT 2.0 PORTAL) Tj

      /F1 16 Tf
      80 740 Td
      (Government of Tripura) Tj

      /F1 12 Tf
      80 700 Td
      (-----------------------------------------------) Tj
      80 680 Td
      (🌐 A Single Window Clearance System for Entrepreneurs) Tj

      80 660 Td
      (⚙️ Streamlined Approval Process for Businesses) Tj
      80 640 Td
      (📄 Unified Interface to Apply, Track and Receive Approvals) Tj
      80 620 Td
      (🏛️ Integration with All Major Government Departments) Tj
      80 600 Td
      (🚀 Transparent, Fast and Paperless Workflow) Tj
      80 580 Td
      (🔒 Secure Digital Verification and Real-Time Updates) Tj
      80 560 Td
      (💡 Empowering Investors and Entrepreneurs in Tripura) Tj

      /F1 12 Tf
      80 520 Td
      (-----------------------------------------------) Tj
      80 500 Td
      (Visit: https://swaagat.tripura.gov.in) Tj
      ET
    endstream
    endobj
    5 0 obj
    << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
    endobj
    xref
    0 6
    0000000000 65535 f 
    0000000010 00000 n 
    0000000060 00000 n 
    0000000115 00000 n 
    0000000640 00000 n 
    0000001190 00000 n 
    trailer
    << /Root 1 0 R /Size 6 >>
    startxref
    1290
    %%EOF
  `;
    const blob = new Blob([pdfContent], { type: 'application/pdf' });
    const pdfUrl = URL.createObjectURL(blob);
    window.open(pdfUrl, '_blank');
    setTimeout(() => URL.revokeObjectURL(pdfUrl), 5000);
  }
  onReadonlyFieldFocus(field: string) {
    if (field === 'claim_percentage' && this.questionForm.get('claim_per_unit')?.value) {
      this.readonlyFieldError = 'claim_percentage';
    } else if (field === 'claim_per_unit' && this.questionForm.get('claim_percentage')?.value) {
      this.readonlyFieldError = 'claim_per_unit';
    } else {
      this.readonlyFieldError = null;
    }
    if (this.readonlyFieldError) {
      setTimeout(() => {
        this.readonlyFieldError = null;
      }, 3000);
    }
  }
}
