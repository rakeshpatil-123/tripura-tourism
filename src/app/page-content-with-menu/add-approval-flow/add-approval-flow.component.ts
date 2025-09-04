import { Component, OnInit, Inject } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { GenericService } from '../../_service/generic/generic.service';
import { MatInputModule } from "@angular/material/input";
import { MatIconModule } from "@angular/material/icon";
import { MatCardModule } from "@angular/material/card";
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-add-approval-flow',
  templateUrl: './add-approval-flow.component.html',
  styleUrls: ['./add-approval-flow.component.scss'],
  standalone: true,
  imports: [MatInputModule, MatIconModule, MatCardModule, ReactiveFormsModule, MatSelectModule, CommonModule, MatDialogModule],
})
export class AddApprovalFlowComponent implements OnInit {
  approvalFlowForm!: FormGroup;
  stepTypes = ['validation', 'review', 'screening', 'scrutiny', 'approval'];
  hierarchyLevels = ['block', 'subdivision', 'district', 'state1', 'state2', 'state3'];
  mode!: 'add' | 'edit';
  departments: { id: number; name: string }[] = [];

  constructor(
    private fb: FormBuilder,
    private genericService: GenericService,
    private dialogRef: MatDialogRef<AddApprovalFlowComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.mode = data.mode;
  }

  ngOnInit(): void {
    this.loadDepartments();
    this.approvalFlowForm = this.fb.group({
      service_id: [this.data.service?.id || this.data.row.service?.id || '', Validators.required],
      steps: this.fb.array([]),
    });
    if (this.mode === 'edit' && this.data.row) {
      const step = this.data.row;
      this.steps.push(this.fb.group({
        step_number: [step.step_number, Validators.required],
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
      step_number: [this.steps.length + 1, Validators.required],
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
    if (this.approvalFlowForm.invalid) {
      this.genericService.openSnackBar('Please fill all required fields correctly.', 'Close');
      return;
    }

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
      this.genericService.addApprovalFlow(payload).subscribe({
        next: (res: any) => this.handleResponse(res, 'Approval flow added successfully!'),
        error: (err) => this.handleError(err)
      });
    } else if (this.mode === 'edit') {
      payload.flows[0].id = this.data.row.id;
      this.genericService.updateApprovalFlow(payload).subscribe({
        next: (res: any) => this.handleResponse(res, 'Approval flow updated successfully!'),
        error: (err) => this.handleError(err)
      });
    }
  }

  private handleResponse(res: any, successMessage: string) {
    if (res.status === 1) {
      this.genericService.openSnackBar(res.message || successMessage, 'Close');
      this.approvalFlowForm.reset();
      this.steps.clear();
      this.addStep();
      this.dialogRef.close(true);
    } else {
      this.genericService.openSnackBar(res.message || 'Operation failed', 'Close');
    }
  }

  private handleError(err: any) {
    let message = 'Something went wrong. Please try again.';
    if (err?.error?.message) {
      message = err.error.message;
    } else if (err?.error?.errors) {
      const firstKey = Object.keys(err.error.errors)[0];
      message = `${err.error.errors[firstKey][0]}`;
    }
    this.genericService.openSnackBar(message, 'Close');
    console.error('API Error:', err);
  }

  loadDepartments(): void {
    this.genericService.getAllDepartmentNames().subscribe({
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
    this.dialogRef.close();
  }
}
