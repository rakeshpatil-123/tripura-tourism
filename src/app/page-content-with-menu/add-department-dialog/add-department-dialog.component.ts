import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { GenericService } from '../../_service/generic/generic.service';
import { MatInputModule } from "@angular/material/input";
import { MatIconModule } from "@angular/material/icon";
import { NgIf, NgFor } from '@angular/common';
import { MatCard, MatCardContent, MatCardHeader, MatCardSubtitle, MatCardTitle } from "@angular/material/card";


@Component({
  selector: 'app-add-department-dialog',
  templateUrl: './add-department-dialog.component.html',
  styleUrls: ['./add-department-dialog.component.scss'],
  imports: [MatInputModule, MatIconModule, ReactiveFormsModule, NgIf, NgFor, MatCard, MatCardHeader, MatCardSubtitle, MatCardTitle, MatCardContent]
})
export class AddDepartmentDialogComponent implements OnInit {
  departmentForm!: FormGroup;
  isSubmitting = false;
  mode: 'add' | 'edit' | 'view' = 'add';

  departmentDetails: any = null;
  isLoadingDetails = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddDepartmentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private genericService: GenericService
  ) { }

  ngOnInit(): void {
    this.mode = this.data?.mode || 'add';
    if (this.mode === 'view') {
      this.loadDepartmentDetails(this.data?.data?.id);
    } else {
      const department = this.data?.data || {};
      this.departmentForm = this.fb.group({
        name: [department?.name || '', [Validators.required, Validators.maxLength(50)]],
        details: [department?.details || '', [Validators.maxLength(200)]]
      });
    }
  }

  loadDepartmentDetails(id: number): void {
    if (!id) return;
    this.isLoadingDetails = true;
    this.genericService.getDepartmentDetails(id).subscribe({
      next: (res: any) => {
        this.departmentDetails = res?.data || null;
        this.isLoadingDetails = false;
      },
      error: () => {
        this.isLoadingDetails = false;
        this.genericService.openSnackBar('Failed to load department details.', 'Close');
        this.close();
      }
    });
  }

  get f() {
    return this.departmentForm?.controls;
  }

  onSubmit(): void {
    if (this.departmentForm.invalid) return;
    this.isSubmitting = true;
    const payload = this.departmentForm.value;

    if (this.mode === 'add') {
      this.genericService.addDepartment(payload).subscribe({
        next: (res: any) => {
          this.genericService.openSnackBar(res.message, 'Success');
          this.dialogRef.close('updated');
        },
        error: (err: any) => {
          this.isSubmitting = false;
          const backendErrors = err.error?.errors;
          if (backendErrors?.name) {
            this.genericService.openSnackBar(backendErrors.name[0], 'Error');
          } else {
            this.genericService.openSnackBar(err.error?.message || 'Failed to create department.', 'Error');
          }
        }
      });
    } else if (this.mode === 'edit') {
      payload.id = this.data.data.id;
      this.genericService.updateDepartment(payload).subscribe({
        next: (res: any) => {
          this.genericService.openSnackBar(res.message, 'Close');
          this.dialogRef.close('updated');
        },
        error: () => {
          this.isSubmitting = false;
          this.genericService.openSnackBar('Failed to update department.', 'Close');
        }
      });
    }
  }

  close(): void {
    this.dialogRef.close();
  }
}
