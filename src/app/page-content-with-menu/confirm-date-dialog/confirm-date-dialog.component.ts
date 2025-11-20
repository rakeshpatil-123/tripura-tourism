import { Component, Inject } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { IlogiInputDateComponent } from '../../customInputComponents/ilogi-input-date/ilogi-input-date.component';
import { IlogiInputComponent } from '../../customInputComponents/ilogi-input/ilogi-input.component';

@Component({
  selector: 'app-confirm-date-dialog',
  templateUrl: './confirm-date-dialog.component.html',
  styleUrls: ['./confirm-date-dialog.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IlogiInputDateComponent, IlogiInputComponent],
})
export class ConfirmDateDialogComponent {
  form: FormGroup;
  isJoint = false;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<ConfirmDateDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.isJoint = data.row?.department_type === 'joint';

    if (this.isJoint) {
      this.form = this.fb.group({
        selectedDates: this.fb.array([]),
        remarks: new FormControl(''),
      });

      const existing = data.row?.proposed_date || [];
      if (existing.length > 0) {
        existing.slice(0, 3).forEach((d: string) => {
          this.selectedDatesArray.push(this.createDateGroup(d));
        });
      } else {
        this.selectedDatesArray.push(this.createDateGroup(null));
      }
    } else {
      this.form = this.fb.group({
        singleDate: new FormControl(
          data.row?.actual_date_of_inspection?.[0]
            ? new Date(data.row.actual_date_of_inspection[0])
            : null,

        ),
        remarks: new FormControl('')
      });
    }
  }

  get selectedDatesArray(): FormArray {
    return this.form.get('selectedDates') as FormArray;
  }

  createDateGroup(value: string | null): FormGroup {
    return this.fb.group({
      date: new FormControl(value ? new Date(value) : null),
    });
  }

  addSlot(): void {
    if (this.selectedDatesArray.length < 3) {
      this.selectedDatesArray.push(this.createDateGroup(null));
    }
  }

  removeSlot(index: number): void {
    this.selectedDatesArray.removeAt(index);
  }

  normalizeDateToISO(value: any): string | null {
    if (!value) return null;

    if (value instanceof Date && !isNaN(value.getTime())) {
      return this.formatDateYMD(value);
    }

    if (typeof value === 'string') {
      const parsed = new Date(value);
      return isNaN(parsed.getTime()) ? null : this.formatDateYMD(parsed);
    }

    return null;
  }

  private formatDateYMD(d: Date): string {
    const yyyy = d.getFullYear();
    const mm = (d.getMonth() + 1).toString().padStart(2, '0');
    const dd = d.getDate().toString().padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }
  cancel(): void {
    this.dialogRef.close(null);
  }

  confirm(): void {
    const finalDates: string[] = [];
    let remarksValue = this.form.get('remarks')?.value || '';

    if (this.isJoint) {
      this.selectedDatesArray.controls.forEach((ctrl) => {
        const val = ctrl.get('date')?.value;
        const normalized = this.normalizeDateToISO(val);
        if (normalized) finalDates.push(normalized);
      });
    } else {
      const val = this.form.get('singleDate')?.value;
      const normalized = this.normalizeDateToISO(val);
      if (normalized) finalDates.push(normalized);
    }

    this.dialogRef.close({ selectedDates: finalDates, remarks: remarksValue });
  }

  pickedCount(): number {
    if (this.isJoint) {
      return this.selectedDatesArray.controls.filter(
        (ctrl) => !!ctrl.get('date')?.value
      ).length;
    }
    return this.form.get('singleDate')?.value ? 1 : 0;
  }
}
