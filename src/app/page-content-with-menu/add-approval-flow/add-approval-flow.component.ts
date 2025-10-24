import { Component, OnInit, Inject } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { GenericService } from '../../_service/generic/generic.service';
import { MatInputModule } from "@angular/material/input";
import { MatIconModule } from "@angular/material/icon";
import { MatCardModule } from "@angular/material/card";
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { LoaderService } from '../../_service/loader/loader.service';
import { finalize } from 'rxjs';
import Swal from 'sweetalert2'; 
import { animate, style, transition, trigger } from '@angular/animations';
@Component({
  selector: 'app-add-approval-flow',
  templateUrl: './add-approval-flow.component.html',
  styleUrls: ['./add-approval-flow.component.scss'],
  animations: [
    trigger('dialogAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-30px) scale(0.95)' }),
        animate('350ms ease-out', style({ opacity: 1, transform: 'translateY(0) scale(1)' }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ opacity: 0, transform: 'translateY(30px) scale(0.9)' }))
      ])
    ])
  ],
  standalone: true,
  imports: [MatInputModule, MatIconModule, MatCardModule, ReactiveFormsModule, MatSelectModule, CommonModule, MatDialogModule, MatProgressSpinnerModule],
})
export class AddApprovalFlowComponent implements OnInit {
  approvalFlowForm!: FormGroup;
  stepTypes = ['validation', 'review', 'screening', 'scrutiny', 'approval'];
  hierarchyLevels = ['block', 'subdivision1', 'subdivision2', 'subdivision3', 'district1', 'district2', 'district3', 'state1', 'state2', 'state3'];
  mode!: 'add' | 'edit';
  departments: { id: number; name: string }[] = [];
  isClosing = false;
  loading = false;
  constructor(
    private fb: FormBuilder,
    private genericService: GenericService,
    private dialogRef: MatDialogRef<AddApprovalFlowComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private loaderService: LoaderService
  ) {
    this.mode = data.mode;
  }

  ngOnInit(): void {
    this.loadDepartments();
    this.approvalFlowForm = this.fb.group({
      service_id: [this.data.service?.id || this.data.row.service?.id || ''],
      steps: this.fb.array([]),
    });
    if (this.mode === 'edit' && this.data.row) {
      const step = this.data.row;
      this.steps.push(this.fb.group({
        step_number: [step.step_number],
        step_type: [step.step_type, Validators.required],
        department_id: [step.department_id, Validators.required],
        hierarchy_level: [step.hierarchy_level, Validators.required],
      }));
    }
    else if (this.mode === 'add') {
      this.addStep();
    }
  }
  get steps(): FormArray {
    return this.approvalFlowForm.get('steps') as FormArray;
  }

  addStep(): void {
    this.steps.push(this.fb.group({
      step_number: [this.steps.length + 1],
      step_type: ['', Validators.required],
      department_id: ['', Validators.required],
      hierarchy_level: ['', Validators.required],
    }));
  }
  removeStep(index: number): void {
    this.steps.removeAt(index);
    this.steps.controls.forEach((ctrl, idx) => ctrl.get('step_number')?.setValue(idx + 1));
  }

  submit(): void {
    this.approvalFlowForm.markAllAsTouched();

    if (this.approvalFlowForm.invalid) {
      this.genericService.openSnackBar('Please fill all required fields correctly.', 'Close');
      return;
    }
    this.loading = true;
    this.loaderService.showLoader();
    const payload = {
      flows: this.steps.value.map((step: any) => ({
        service_id: Number(this.approvalFlowForm.value.service_id),
        step_number: Number(step.step_number),
        step_type: step.step_type,
        department_id: Number(step.department_id),
        hierarchy_level: step.hierarchy_level
      }))
    };

    if (this.mode === 'add') {
      this.genericService.addApprovalFlow(payload).pipe(finalize(()=>this.loaderService.hideLoader())).subscribe({
        next: (res: any) => this.handleResponse(res, 'Approval flow added successfully!'),
        error: (err) => this.handleError(err)
      });
    } else if (this.mode === 'edit') {
      payload.flows[0].id = this.data.row.id;
      this.genericService.updateApprovalFlow(payload).pipe(finalize(()=>this.loaderService.hideLoader())).subscribe({
        next: (res: any) => this.handleResponse(res, 'Approval flow updated successfully!'),
        error: (err) => this.handleError(err)
      });
    }
  }

  private handleResponse(res: any, successMessage: string) {
    this.loading = false;
    if (res.status === 1) {
      this.dialogRef.close(true);
      if (this.mode === 'add') {
        setTimeout(() => {
          Swal.fire({
            icon: 'success',
            title: 'Approval Flow Added!',
            text: res.message || successMessage,
            showConfirmButton: true,
            confirmButtonText: 'OK',
            confirmButtonColor: '#3f51b5',
            timer: 2500,
            timerProgressBar: true,
          });
        }, 200);
      }
      this.approvalFlowForm.reset();
      this.steps.clear();
      this.addStep();
    } else {
      this.genericService.openSnackBar(res.message || 'Operation failed', 'Close');
    }
  }

  private handleError(err: any) {
    this.loading = false;
    let message = 'Something went wrong. Please try again.';
    if (err?.error?.message) {
      message = err.error.message;
    } if (err?.error?.errors) {
      const errorMessages = Object.values(err.error.errors)
        .flat()
        .map((msg: any) => msg)
        .join('\n');
      message = errorMessages || message;
    }
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: message,
      confirmButtonColor: '#d33',
    });
  }

  loadDepartments(): void {
    this.loaderService.showLoader();
    this.genericService.getAllDepartmentNames().pipe(finalize(()=>this.loaderService.hideLoader())).subscribe({
      next: (res: any) => {
        if (res?.status) {
          this.departments = res.data;
        }
      },
      error: () => {
        this.departments = [];
      }
    });
  }
  closeDialog(): void {
    this.isClosing = true;
    setTimeout(() => this.dialogRef.close(), 300);
  }
}
