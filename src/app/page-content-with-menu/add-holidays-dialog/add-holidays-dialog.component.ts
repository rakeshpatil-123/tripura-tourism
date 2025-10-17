import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { GenericService } from '../../_service/generic/generic.service';
import { MatInputModule } from "@angular/material/input";
import { MatIconModule } from "@angular/material/icon";
import { NgIf, NgFor, CommonModule } from '@angular/common';
import { MatCard, MatCardContent, MatCardHeader, MatCardSubtitle, MatCardTitle } from "@angular/material/card";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MAT_DATE_FORMATS, MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatMomentDateModule, provideMomentDateAdapter } from '@angular/material-moment-adapter';
import moment from 'moment';
import Swal from 'sweetalert2';
import { LoaderService } from '../../_service/loader/loader.service';
import { finalize } from 'rxjs';
export const MY_DATE_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'DD/MM/YYYY',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-add-holidays-dialog',
  templateUrl: './add-holidays-dialog.component.html',
  styleUrls: ['./add-holidays-dialog.component.scss'],
  imports: [
    MatInputModule,
    MatIconModule,
    ReactiveFormsModule,
    NgIf,
    NgFor,
    MatCard,
    MatCardHeader,
    MatCardSubtitle,
    MatCardTitle,
    MatCardContent,
    CommonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatMomentDateModule,
  ],
  providers: [provideMomentDateAdapter(), { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS }],
})
export class AddHolidaysDialogComponent implements OnInit {
  holidayForm!: FormGroup;
  isSubmitting = false;
  mode: 'add' | 'edit' | 'view' = 'add';

  holidayDetails: any = null;
  isLoadingDetails = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddHolidaysDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private genericService: GenericService,
    private loaderService: LoaderService
  ) { }

  ngOnInit(): void {
    this.mode = this.data?.mode || 'add';
    if (this.mode === 'view') {
      this.loadHolidayDetails(this.data?.data?.id);
    } else {
      const holiday = this.data?.data || {};
      this.holidayForm = this.fb.group({
        holiday_date: [holiday?.holiday_date ? new Date(holiday.holiday_date) : '', [Validators.required]],
        description: [holiday?.description || '', [Validators.required, Validators.maxLength(200)]]
      });
    }
  }

  loadHolidayDetails(id: number): void {
    if (!id) return;
    this.isLoadingDetails = true;
    this.holidayDetails = this?.data.data || null;
    this.isLoadingDetails = false;
  }

  get f() {
    return this.holidayForm?.controls;
  }

  onSubmit(): void {
    if (this.holidayForm.invalid) return;
    this.isSubmitting = true;

    const formValue = this.holidayForm.value;
    const formattedDate = moment(formValue.holiday_date).format('YYYY-MM-DD');
    const payload = { ...formValue, holiday_date: formattedDate };

    if (this.mode === 'add') {
      this.loaderService.showLoader();
      this.genericService.addHoliday(payload).pipe(finalize(()=> this.loaderService.hideLoader())).subscribe({
        next: (res: any) => {
          this.dialogRef.close();
          Swal.fire({
            title: 'Holiday Created!',
            text: res.message,
            icon: 'success',
            showClass: { popup: 'animate__animated animate__fadeInDown' },
            hideClass: { popup: 'animate__animated animate__fadeOutUp' },
            confirmButtonText: 'OK',
            customClass: { confirmButton: 'swal2-confirm-btn' }
          }).then(() => this.dialogRef.close('updated'));
        },
        error: (err: any) => {
          this.dialogRef.close();
          this.isSubmitting = false;
          const errorMsg = err.error?.message || 'Failed to create holiday.';
          Swal.fire({
            title: 'Error!',
            text: errorMsg,
            icon: 'error',
            showClass: { popup: 'animate__animated animate__fadeInDown' },
            hideClass: { popup: 'animate__animated animate__fadeOutUp' },
            confirmButtonText: 'OK',
            customClass: { confirmButton: 'swal2-confirm-btn' }
          });
        }
      });
    } else if (this.mode === 'edit') {
      this.loaderService.showLoader();
      payload.id = this.data.data.id;
      this.genericService.updateHoliday(payload).pipe(finalize(()=>this.loaderService.hideLoader())).subscribe({
        next: (res: any) => {
          this.dialogRef.close();
          Swal.fire({
            title: 'Holiday Updated!',
            text: res.message,
            icon: 'success',
            showClass: { popup: 'animate__animated animate__fadeInDown' },
            hideClass: { popup: 'animate__animated animate__fadeOutUp' },
            confirmButtonText: 'OK',
            customClass: { confirmButton: 'swal2-confirm-btn' }
          }).then(() => this.dialogRef.close('updated'));
        },
        error: () => {
          this.dialogRef.close();
          this.isSubmitting = false;
          Swal.fire({
            title: 'Error!',
            text: 'Failed to update holiday.',
            icon: 'error',
            showClass: { popup: 'animate__animated animate__fadeInDown' },
            hideClass: { popup: 'animate__animated animate__fadeOutUp' },
            confirmButtonText: 'OK',
            customClass: { confirmButton: 'swal2-confirm-btn' }
          });
        }
      });
    }
  }

  close(): void {
    this.dialogRef.close();
  }
}
