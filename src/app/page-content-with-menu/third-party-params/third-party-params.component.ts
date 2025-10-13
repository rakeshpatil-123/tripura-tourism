import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { trigger, state, style, animate, transition } from '@angular/animations';
import Swal from 'sweetalert2';
import { GenericService } from '../../_service/generic/generic.service';
import { LoaderService } from '../../_service/loader/loader.service';
import { finalize } from 'rxjs';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';

export enum DataSourceType {
  USER_INPUT = 'user_input',
  SYSTEM_GENERATED = 'system_generated',
  STATIC = 'static'
}

@Component({
  selector: 'app-third-party-params',
  templateUrl: './third-party-params.component.html',
  styleUrls: ['./third-party-params.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule,
    MatIconModule,
    MatSnackBarModule,
    DialogModule,
    ButtonModule
  ],
  animations: [
    trigger('dialogAnim', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px) scale(0.98)' }),
        animate('240ms cubic-bezier(.2,.8,.2,1)', style({ opacity: 1, transform: 'translateY(0) scale(1)' }))
      ]),
      transition(':leave', [
        animate('180ms cubic-bezier(.4,.0,.2,1)', style({ opacity: 0, transform: 'translateY(6px) scale(0.99)' }))
      ])
    ]),
    trigger('inputFocusAnim', [
      state('idle', style({ transform: 'scale(1)' })),
      state('focus', style({ transform: 'scale(1.01)' })),
      transition('idle <=> focus', animate('160ms ease-in-out'))
    ])
  ]
})
export class ThirdPartyParamsComponent implements OnInit {
  paramForm!: FormGroup;
  mode: 'add' | 'edit';
  availableColumns: string[] = [];
  dataSources = Object.values(DataSourceType);
  loading = false;
  displayViewDialog = false;
  serviceDetailsList: { label: string, value: any }[] = [];
  serviceDetails: any;

  constructor(
    private fb: FormBuilder,
    private loaderService: LoaderService,
    private genericService: GenericService,
    private dialogRef: MatDialogRef<ThirdPartyParamsComponent>,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.mode = data?.mode || 'add';
  }

  ngOnInit(): void {
    this.initForm();

  }

  initForm(): void {
    const param = this.data?.parameter || {};
    const isEdit = this.mode === 'edit';

    this.paramForm = this.fb.group({
      param_name: [param.param_name || '', [Validators.required, Validators.maxLength(120)]],
      param_type: [param.param_type || 'request', Validators.required],
      param_required: [param.param_required ?? 0, Validators.required],
      default_value: [param.default_value || '', Validators.maxLength(250)],
      default_source_table: [param.default_source_table || ''],
      default_source_column: [param.default_source_column || ''],
      data_source: [param.data_source || DataSourceType.USER_INPUT, Validators.required],
      description: [param.description || '', Validators.maxLength(500)],
    });
    if (isEdit && param.default_source_table) {
      this.onTableChange(param.default_source_table, true);
    }
  }



  prepareDetailsList(data: any) {
    this.serviceDetailsList = [
      { label: 'Parameter Name', value: data.param_name || '-' },
      { label: 'Parameter Type', value: data.param_type || '-' },
      { label: 'Required', value: data.param_required ? 'Yes' : 'No' },
      { label: 'Default Value', value: data.default_value || '-' },
      { label: 'Source Table', value: data.default_source_table || '-' },
      { label: 'Source Column', value: data.default_source_column || '-' },
      { label: 'Data Source', value: data.data_source || '-' },
      { label: 'Description', value: data.description || '-' },
      { label: 'Created At', value: data.created_at ? new Date(data.created_at).toLocaleString() : '-' },
      { label: 'Updated At', value: data.updated_at ? new Date(data.updated_at).toLocaleString() : '-' },
    ];
  }

onTableChange(table: string, initial = false) {
  if (!table) {
    this.availableColumns = [];
    this.paramForm.patchValue({ default_source_column: null });
    return;
  }

  this.loading = true;
  this.loaderService.showLoader();

  this.genericService.getColumns(table)
    .pipe(finalize(() => {
      this.loaderService.hideLoader();
      this.loading = false;
    }))
    .subscribe({
      next: (cols: any) => {
        // ✅ ensure we get a proper columns array
        this.availableColumns = Array.isArray(cols?.columns) ? cols.columns : [];

        // ✅ detect previously selected column (edit mode or existing value)
        const savedColumn =
          this.data?.parameter?.default_source_column ||
          this.paramForm.value.default_source_column;

        // ✅ prefill value on initial load (e.g., edit mode)
        if (initial && savedColumn && this.availableColumns.includes(savedColumn)) {
          this.paramForm.patchValue({
            default_source_column: savedColumn,
          });
        } else if (!initial) {
          // For new selections, reset the dropdown
          this.paramForm.patchValue({ default_source_column: null });
        }
      },
      error: () => {
        this.availableColumns = [];
        this.snackBar.open('Failed to fetch columns', 'Close', { duration: 3000 });
      }
    });
}




  onSubmit() {
    if (this.paramForm.invalid) {
      this.paramForm.markAllAsTouched();
      return;
    }

    const singleParam = {
      ...this.paramForm.value,
      service_id: this.data?.service?.id,
      id: this.data?.parameter?.id
    };

    const payload = { params: [singleParam] };

    this.loading = true;
    const obs = this.mode === 'add'
      ? this.genericService.createThirdPartyParams(payload)
      : this.genericService.updateThirdPartyParams(payload);

    obs.pipe(finalize(() => this.loading = false)).subscribe({
      next: (res: any) => {
        if (res.status === 1) {
          Swal.fire('Success', `Parameter ${this.mode === 'add' ? 'added' : 'updated'} successfully`, 'success');
          this.dialogRef.close(this.mode === 'add' ? 'created' : 'updated');
        } else {
          Swal.fire('Error', res.message || 'Operation failed', 'error');
        }
      },
      error: () => Swal.fire('Error', 'Something went wrong', 'error')
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  get param_name() {
    return this.paramForm.get('param_name');
  }
}
