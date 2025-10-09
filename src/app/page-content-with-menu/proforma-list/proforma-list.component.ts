import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GenericService } from '../../_service/generic/generic.service';
import { LoaderService } from '../../_service/loader/loader.service';
import Swal from 'sweetalert2';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TableColumn, DynamicTableComponent } from '../../shared/component/table/table.component';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { MultiSelectModule, MultiSelect } from 'primeng/multiselect';
@Component({
  selector: 'app-proforma-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    DynamicTableComponent,
    MultiSelectModule
  ],
  templateUrl: './proforma-list.component.html',
  styleUrls: ['./proforma-list.component.scss']
})
export class ProformaListComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private genericService = inject(GenericService);
  private loaderService = inject(LoaderService);
  private fb = inject(FormBuilder);
  @ViewChild('ms') ms!: MultiSelect;
  schemeId!: string;
  schemeTitle: string = '';
  proformas: any[] = [];
  loading = false;
  readonly PROFORMA_TYPES = [
    { label: 'Eligibility', value: 'eligibility' },
    { label: 'Claim', value: 'claim' }
  ];

  readonly CLAIM_TYPES = [
    { label: 'One Time', value: 'one_time' },
    { label: 'Monthly', value: 'monthly' },
    { label: 'Quarterly', value: 'quarterly' },
    { label: 'Half Yearly', value: 'half_yearly' },
    { label: 'Annually', value: 'annually' },
    { label: 'Biennially', value: 'biennially' },
    { label: 'Triennially', value: 'triennially' },
    { label: 'Quinquennially', value: 'quinquennially' }
  ];
  // Dialog states
  showProformaDialog = false;
  showProformaDetailsDialog = false;
  isEditMode = false;
  editingProformaId: string | null = null;
  selectedProforma: any;
  proformaFields: { label: string; value: any; class?: string }[] = [];
  selectedProformas: any[] = [];
  selectAll: boolean = false;
  selectedDependsProformas: any[] = [];
  proformaOptions: any[] = [];  

  // Form
  proformaForm: FormGroup = this.fb.group({
    code: ['', Validators.required],
    title: ['', Validators.required],
    proforma_type: ['eligibility', Validators.required],
    claim_type: [null],
    description: [''],
    display_order: [1, Validators.required],
    status: [1],
    depends_on_proforma_ids: [[]],
    max_claim_count: [null, [Validators.min(1)]]
  });

  columns: TableColumn[] = [
    { key: 'id', label: 'ID', type: 'number' },
    { key: 'title', label: 'Title', type: 'text' },
    { key: 'code', label: 'Code', type: 'text' },
    {
      key: 'proforma_type', label: 'Proforma Type', type: 'text', format: (value: any, row: any) => {
        const type = this.PROFORMA_TYPES.find(t => t.value === value);
        return type ? type.label : value;
      }
    },
    {
      key: 'claim_type', label: 'Claim Type', type: 'text', format: (value: any, row: any) => {
        const type = this.CLAIM_TYPES.find(t => t.value === value);
        return type ? type.label : value;
      }
    },
    { key: 'description', label: 'Description', type: 'text' },
    {
      key: 'status',
      label: 'Status',
      type: 'status',
      format: (value: any, row: any) => {
        return value === 1
          ? `<span class="status-active">Active</span>`
          : `<span class="status-inactive">Inactive</span>`;
      }
    },
    {
      key: 'actions',
      label: 'Actions',
      type: 'action',
      actions: [
        { label: 'View', onClick: (row) => this.viewProforma(row) },
        { label: 'Edit', onClick: (row) => this.openProformaDialog(row) },
        { label: 'Delete', color: 'warn', onClick: (row) => this.deleteProforma(row) },
        { label: 'Add Questions', color: 'accent', onClick: (row) => this.goToQuestions(row) }
      ]
    }
  ];


  ngOnInit(): void {
    this.schemeId = this.route.snapshot.paramMap.get('schemeId')!;
    this.schemeTitle = history.state.schemeTitle || 'Proformas';
    this.loadProformas();
  }


  loadProformas() {
    this.loading = true;
    this.loaderService.showLoader();
    this.genericService.getProformasByScheme(this.schemeId).pipe(finalize(() => this.loaderService.hideLoader())).subscribe({
      next: (res) => {
        this.loading = false;
        if (res?.status === 1 && Array.isArray(res.data)) {
          this.proformas = res.data.map((p: any) => ({
            ...p,
            label: p.title,
            value: p.id,
            statusLabel: p.status === 1 ? 'Active' : 'Inactive',
            statusColor: p.status === 1 ? 'green' : 'red'
          }));
          this.proformaOptions = res.data.map((p: any) => ({
            name: p.title,
            code: p.id
          }));
        } else {
          this.proformas = [];
          this.proformaOptions = [];
        }
      },
      error: () => {
        this.loading = false;
        this.loaderService.hideLoader();
        this.proformas = [];
        this.proformaOptions = [];
      }
    });
}

  viewProforma(payload: any) {
    this.loaderService.showLoader();
    this.genericService.viewSingleProforma(payload.id)
      .pipe(finalize(() => this.loaderService.hideLoader()))
      .subscribe((res: any) => {
        if (res.status === 1) {
          this.selectedProforma = res.data;

          this.proformaFields = [
            { label: 'ID', value: res.data.id },
            { label: 'Scheme ID', value: res.data.scheme_id },
            { label: 'Code', value: res.data.code },
            { label: 'Title', value: res.data.title },
            { label: 'Proforma Type', value: res.data.proforma_type },
            { label: 'Claim Type', value: res.data.claim_type },
            { label: 'Description', value: res.data.description },
            { label: 'Display Order', value: res.data.display_order },
            {
              label: 'Status',
              value: res.data.status === 1 ? 'Active' : 'Inactive',
              class: res.data.status === 1 ? 'status-active' : 'status-inactive'
            },
            // { label: 'Created At', value: res.data.created_at | date:'dd MMM yyyy, hh:mm a' },
            // { label: 'Updated At', value: res.data.updated_at | date:'dd MMM yyyy, hh:mm a' }
          ];

          this.showProformaDetailsDialog = true;
        }
      }, (error) => {
        console.error(error);
      });
  }


  openProformaDialog(p: any | null = null) {
    if (p) {
      this.isEditMode = true;
      this.editingProformaId = p.id;
      this.proformaForm.patchValue({
        code: p.code,
        title: p.title,
        proforma_type: p.proforma_type,
        claim_type: p.claim_type,
        description: p.description,
        display_order: p.display_order,
        status: p.status === 1 ? true : false,
        depends_on_proforma_ids: p.depends_on_proforma_ids || [],
        max_claim_count: p.max_claim_count || null
      });
    } else {
      this.isEditMode = false;
      this.editingProformaId = null;
      this.proformaForm.reset({
        proforma_type: 'eligibility',
        display_order: 1,
        status: 1,
        depends_on_proforma_ids: []
      });
    }
    this.showProformaDialog = true; // opens the dialog
  }
  goToQuestions(proforma: any) {
    if (!proforma?.id) return;

    this.router.navigate([
      '/dashboard/admin-incentive',
      this.schemeId,
      'proformas',
      proforma.id,
      'questions'
    ], {
      state: { schemeTitle: this.schemeTitle, proformaTitle: proforma.title }
    });
  }


  saveProforma() {
    if (this.proformaForm.invalid) {
      this.proformaForm.markAllAsTouched();
      return;
    }
    const fv = this.proformaForm.value;

    const payload: any = {
      scheme_id: this.schemeId,
      code: fv.code,
      title: fv.title,
      proforma_type: fv.proforma_type,
      description: fv.description,
      display_order: fv.display_order,
      status: fv.status === 'false' ? 0 : 1,
      depends_on_proforma_ids: fv.depends_on_proforma_ids || [],
      max_claim_count: fv.max_claim_count
    };
    if (fv.proforma_type === 'claim') {
      payload.claim_type = fv.claim_type;
      payload.max_claim_count = fv.max_claim_count || null;
    }
    if (this.isEditMode && this.editingProformaId) {
      payload.proforma_id = this.editingProformaId;
    }
    this.loaderService.showLoader();

    const request$ = this.isEditMode && this.editingProformaId
      ? this.genericService.updateProforma(payload)
      : this.genericService.createProforma(payload);

    request$.pipe(finalize(() => this.loaderService.hideLoader())).subscribe({
      next: (res) => {
        Swal.fire({
          title: this.isEditMode ? 'Updated!' : 'Created!',
          text: `"${fv.title}" ${this.isEditMode ? 'updated' : 'created'} successfully.`,
          icon: 'success',
          showClass: { popup: 'animate__animated animate__fadeInDown' },
          hideClass: { popup: 'animate__animated animate__fadeOutUp' }
        });

        this.showProformaDialog = false;
        this.loadProformas();
      },
      error: (err: any) => {
        this.showProformaDialog = false;
        let errorMessage = `Failed to ${this.isEditMode ? 'update' : 'create'} proforma.`;
        if (err?.error?.errors) {
          const messages = Object.values(err.error.errors)
            .flat()
            .join('\n');
          errorMessage = messages;
        } else if (err?.error?.message) {
          errorMessage = err.error.message;
        }

        Swal.fire('Error', errorMessage, 'error');
      }
    });
  }


  deleteProforma(p: any) {
    Swal.fire({
      title: 'Are you sure?',
      text: `Delete proforma "${p.title}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      showClass: { popup: 'animate__animated animate__fadeInDown' },
      hideClass: { popup: 'animate__animated animate__fadeOutUp' }
    }).then(result => {
      if (result.isConfirmed) {
        this.loaderService.showLoader();
        this.genericService.deleteProforma(p.id).pipe(finalize(() => this.loaderService.hideLoader())).subscribe({
          next: () => {
            Swal.fire({
              title: 'Deleted!',
              text: `"${p.title}" deleted successfully.`,
              icon: 'success',
              showClass: { popup: 'animate__animated animate__fadeInDown' },
              hideClass: { popup: 'animate__animated animate__fadeOutUp' }
            });
            this.loadProformas();
          },
          error: () => {
            this.showProformaDialog = false;
            this.loaderService.hideLoader();
            Swal.fire('Error', 'Failed to delete proforma.', 'error');
          }
        });
      }
    });
  }
  onRowAction(event: any) {
    const { action, row } = event;

    switch (action) {
      case 'View':
        this.viewProforma(row);
        break;
      case 'Edit':
        this.openProformaDialog(row);
        break;
      case 'Delete':
        this.deleteProforma(row);
        break;
      case 'Add Questions':
        this.goToQuestions(row);
        break;
      default:
        console.warn('Unknown action:', action);
    }
  }
  onSelectAllChange(event: any) {
    this.selectedProformas = event.checked ? [...this.ms.visibleOptions()] : [];
    this.selectAll = event.checked;
    this.proformaForm.patchValue({ depends_on_proforma_ids: this.selectedProformas.map(p => p.value) });
  }
  onChangeSelectedProformas() {
    this.proformaForm.patchValue({ depends_on_proforma_ids: this.selectedProformas.map(p => p.value) });
  }
  goToSchemes(): void {
    this.router.navigate(['/dashboard/admin-incentive']);
  }
}
