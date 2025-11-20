import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicTableComponent } from '../../../shared/component/table/table.component';
import { GenericService } from '../../../_service/generic/generic.service';
import {
  IlogiSelectComponent,
  SelectOption,
} from '../../../customInputComponents/ilogi-select/ilogi-select.component';
import { IlogiInputComponent } from '../../../customInputComponents/ilogi-input/ilogi-input.component';
import { CommonModule } from '@angular/common';
import { IlogiInputDateComponent } from '../../../customInputComponents/ilogi-input-date/ilogi-input-date.component';
import { IlogiFileUploadComponent } from '../../../customInputComponents/ilogi-file-upload/ilogi-file-upload.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ConfirmationModalComponent } from '../../../shared/component/confirmation-modal/confirmation-modal.component';
import { Router } from '@angular/router';
import { LoaderComponent } from '../../../page-template/loader/loader.component';

interface Department {
  id: number;
  name: string;
  details: string;
}

interface Service {
  service_id: number;
  service_name: string;
  description: string;
}

@Component({
  selector: 'app-upload-existing-licence',
  imports: [
    DynamicTableComponent,
    IlogiSelectComponent,
    IlogiInputComponent,
    CommonModule,
    ReactiveFormsModule,
    IlogiInputDateComponent,
    IlogiFileUploadComponent,
    ConfirmationModalComponent,
    LoaderComponent
  ],
  templateUrl: './upload-existing-licence.component.html',
  styleUrl: './upload-existing-licence.component.scss',
})
export class UploadExistingLicenceComponent implements OnInit {
  licDatas: any[] = [];
  isDialogOpen: boolean = false;
  departments: SelectOption[] = [];
  services: SelectOption[] = [];
  licForm!: FormGroup;
  isSubmitting = false;
  isEditing = false;
  editingLicenseId: number | null = null;
  showDeleteModal = false;
  licenseToDelete: any = null;
  isLoading: boolean = false;

  licColumns: any[] = [
    { key: 'licensee_name', label: 'Licensee Name', type: 'text' },
    { key: 'license_no', label: 'Licence No.', type: 'text' },
    { key: 'application_no', label: 'Application No', type: 'text' },
    { key: 'valid_from', label: 'Valid From', type: 'text' },
    { key: 'expiry_date', label: 'Expiry Date', type: 'text' },
    { key: 'status', label: 'Status', type: 'text' },
    { key: 'created_at', label: 'Created At', type: 'text' },
    { key: 'updated_at', label: 'Updated At', type: 'text' },
    {
      key: 'actions',
      label: 'Action',
      type: 'action',
      width: '120px',
      actions: [
        {
          label: 'View',
          color: 'primary',
          onClick: (row: any) => {
           this.router.navigate([`dashboard/licence-details/${row.id}`])
           
          },
        },
        {
          label: 'Edit',
          color: 'primary',
          onClick: (row: any) => {
            this.openEditModal(row);
          },
        },
        {
          label: 'Delete',
          color: 'warn',
          onClick: (row: any) => {
            this.licenseToDelete = row;
            this.showDeleteModal = true;
          },
        },
      ],
    },
  ];

  constructor(
    private fb: FormBuilder,
    private apiService: GenericService,
    private router: Router
  ) {
    this.licForm = this.fb.group({
      department_id: ['', Validators.required],
      service_id: ['', Validators.required],
      license_name: ['', [Validators.required, Validators.maxLength(255)]],
      upload_lic: [null],
      Application_no: ['', [Validators.required, Validators.maxLength(500)]],
      license_no: ['', [Validators.required, Validators.maxLength(500)]],
      valid_from_date: ['', Validators.required],
      expiry_date: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadDepartments();
    this.loadLicenses();
  }

  loadDepartments(): void {
    this.isLoading = true
    this.apiService
      .getByConditions({}, 'api/department-get-all-departments')
      .subscribe({
        next: (res: any) => {
          if (res?.status === 1 && res.data) {
            const data = Array.isArray(res.data) ? res.data : [res.data];
            this.departments = data.map((dept: Department) => ({
              id: dept.id,
              name: dept.name,
            }));
          }
          this.isLoading = false

        },
        error: (err) => {
          console.error('Failed to load departments:', err);
          this.apiService.openSnackBar('Failed to load departments', 'error');
          this.isLoading = false
        },

      });
  }

  onDepartmentChange(deptId: number | null): void {
    this.licForm.get('service_id')?.reset();
    this.services = [];

    if (!deptId) return;

    this.apiService
      .getByConditions({ department_id: deptId }, 'api/department/services')
      .subscribe({
        next: (res: any) => {
          if (res?.status === 1 && Array.isArray(res.data)) {
            this.services = res.data.map((svc: Service) => ({
              id: svc.service_id,
              name: svc.service_name,
            }));
          } else {
            this.services = [];
          }
        },
        error: (err) => {
          console.error('Failed to load services:', err);
          this.apiService.openSnackBar('Failed to load services', 'error');
          this.services = [];
        },
      });
  }

  loadLicenses(): void {
    this.apiService
      .getByConditions({}, 'api/user/existing-license-view')
      .subscribe({
        next: (res: any) => {
          this.licDatas = res?.status === 1 && Array.isArray(res.data) ? res.data : [];
        },
        error: (err) => {
          console.error('Failed to load licenses:', err);
          this.licDatas = [];
          this.apiService.openSnackBar('Failed to load licenses', 'error');
        },
      });
  }

 openDialog(): void {
    this.isEditing = false;
    this.editingLicenseId = null;
    this.licForm.reset();
    this.isDialogOpen = true;
    document.body.classList.add('dialog-open');
  }

  openEditModal(row: any): void {
    this.isEditing = true;
    this.editingLicenseId = row.id;

    const validFrom = row.valid_from ? new Date(row.valid_from) : null;
    const expiryDate = row.expiry_date ? new Date(row.expiry_date) : null;

    this.licForm.patchValue({
      department_id: row.department_id,
      service_id: row.service_id,
      license_name: row.licensee_name,
      Application_no: row.application_no,
      license_no: row.license_no,
      valid_from_date: validFrom,
      expiry_date: expiryDate,
    });

    this.onDepartmentChange(row.department_id);

    this.isDialogOpen = true;
    document.body.classList.add('dialog-open');
  }

  closeDialog(): void {
    this.isDialogOpen = false;
    this.isEditing = false;
    this.editingLicenseId = null;
    this.licForm.reset();
    document.body.classList.remove('dialog-open');
  }

  submitLic(): void {
    if (this.licForm.invalid) {
      this.licForm.markAllAsTouched();
      return;
    }

    if (this.isSubmitting) return;
    this.isSubmitting = true;

    const raw = this.licForm.value;

    const validFrom = raw.valid_from_date instanceof Date 
      ? raw.valid_from_date.toISOString().split('T')[0] 
      : raw.valid_from_date;
    
    const expiryDate = raw.expiry_date instanceof Date 
      ? raw.expiry_date.toISOString().split('T')[0] 
      : raw.expiry_date;

    if (this.isEditing && this.editingLicenseId) {
      const payload = {
        id: this.editingLicenseId,
        department_id: raw.department_id,
        service_id: raw.service_id,
        licensee_name: raw.license_name,
        application_no: raw.Application_no,
        license_no: raw.license_no,
        valid_from: validFrom,
        expiry_date: expiryDate,
        status: 'pending'
      };

      this.apiService
        .getByConditions(payload, 'api/user/existing-license-update')
        .subscribe({
          next: (res: any) => {
            this.isSubmitting = false;
            if (res?.status === 1) {
              this.apiService.openSnackBar('License updated successfully!', 'success');
              this.closeDialog();
              this.loadLicenses();
            } else {
              this.apiService.openSnackBar(res?.message || 'Failed to update license', 'error');
            }
          },
          error: (err) => {
            this.isSubmitting = false;
            console.error('Update error:', err);
            this.apiService.openSnackBar('Failed to update license', 'error');
          },
        });
    } else {
      const payload = {
        department_id: raw.department_id,
        service_id: raw.service_id,
        licensee_name: raw.license_name,
        application_no: raw.Application_no,
        license_no: raw.license_no,
        valid_from: validFrom,
        expiry_date: expiryDate,
      };

      const formData = new FormData();
      for (const [key, value] of Object.entries(payload)) {
        if (value != null) {
          formData.append(key, value as string | Blob);
        }
      }

      const file = raw.upload_lic;
      if (file) {
        formData.append('upload_lic', file);
      }

      this.apiService
        .getByConditions(formData, 'api/user/existing-license-store')
        .subscribe({
          next: (res: any) => {
            this.isSubmitting = false;
            if (res?.status === 1) {
              this.apiService.openSnackBar('License uploaded successfully!', 'success');
              this.closeDialog();
              this.loadLicenses();
            } else {
              this.apiService.openSnackBar(res?.message || 'Failed to upload license', 'error');
            }
          },
          error: (err) => {
            this.isSubmitting = false;
            console.error('Upload error:', err);
            this.apiService.openSnackBar('Failed to upload license', 'error');
          },
        });
    }
  }

  confirmDelete(): void {
    if (!this.licenseToDelete) return;

    const payload = { id: this.licenseToDelete.id };
    this.apiService
      .getByConditions(payload, 'api/user/existing-license-delete')
      .subscribe({
        next: (res: any) => {
          this.showDeleteModal = false;
          this.licenseToDelete = null;
          if (res?.status === 1) {
            this.apiService.openSnackBar('License deleted successfully!', 'success');
            this.loadLicenses();
          } else {
            this.apiService.openSnackBar(res?.message || 'Failed to delete license', 'error');
          }
        },
        error: (err) => {
          this.showDeleteModal = false;
          this.licenseToDelete = null;
          console.error('Delete error:', err);
          this.apiService.openSnackBar('Failed to delete license', 'error');
        },
      });
  }

  cancelDelete(): void {
    this.showDeleteModal = false;
    this.licenseToDelete = null;
  }
}