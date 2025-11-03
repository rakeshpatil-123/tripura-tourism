import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormArray } from '@angular/forms';
import { finalize, Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { DynamicTableComponent } from "../../shared/component/table/table.component";
import { IlogiSelectComponent } from '../../customInputComponents/ilogi-select/ilogi-select.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { LoaderService } from '../../_service/loader/loader.service';
import { GenericService } from '../../_service/generic/generic.service';
import { IlogiInputComponent } from '../../customInputComponents/ilogi-input/ilogi-input.component';
import { trigger, transition, style, animate } from '@angular/animations';
import { IlogiInputDateComponent } from '../../customInputComponents/ilogi-input-date/ilogi-input-date.component';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-add-departmental-joint-inspection',
  templateUrl: './add-departmental-joint-inspection.component.html',
  styleUrl: './add-departmental-joint-inspection.component.scss',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DynamicTableComponent,
    IlogiSelectComponent,
    IlogiInputDateComponent,
    IlogiInputComponent
  ],
  animations: [
    trigger('slideFadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(30px)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ opacity: 0, transform: 'translateY(20px)' })),
      ]),
    ]),
  ],
})
export class AddDepartmentalJointInspectionComponent implements OnInit, OnDestroy {
  deptJointInspectionForm!: FormGroup;
  subs: Subscription = new Subscription();
  deptId: any;
  selectedDates: string[] = [];
  holidays: any[] = [];
  riskCategories = [
    { id: 'low', name: 'Low', },
    { id: 'medium', name: 'Medium', },
    { id: 'high', name: 'High', }
  ];

  departmentsOptions = [
    { name: 'Dept A', id: 'DepartmentA' },
    { name: 'Dept B', id: 'DepartmentB' },
    { name: 'Dept C', id: 'DepartmentC' }
  ];
  unitOptions = [
    { name: 'Dept A', id: 'DepartmentA' },
  ];

  inspectionForOptions = [
    { name: 'The Equal Remuneration Act, 1976', id: 'regular' },
    { name: 'The Minimum Wages Act, 1948', id: 'surprise' },
    { name: 'The Shops and Establishments Act', id: 'followup' },
    { name: 'The Payment of Bonus Act, 1965', id: 'followup' },
    { name: 'The Shops and Establishments Act', id: 'followup' },
    { name: 'The Shops and Establishments Act', id: 'followup' },
  ];

  inspectionTypeOptions = [
    { name: 'Against Act', id: 'Against Act' },
    { name: 'Surprise', id: 'Surprise' },
    { name: 'Against Complain', id: 'Against Complain' },
    { name: 'On Request', id: 'On Request' },
    { name: 'Against Incident', id: 'Against Incident' },
  ];

  upcomingInspections = [
    { date: '2025-11-05', department: 'Labour', type: 'Surprise' },
    { date: '2025-11-10', department: 'Fire', type: 'Regular' },
    { date: '2025-11-15', department: 'Health', type: 'Follow-up' }
  ];

  inspectionColumns = [
    { key: 'date', label: 'Date' },
    { key: 'department', label: 'Department' },
    { key: 'type', label: 'Type' }
  ];

  constructor(private fb: FormBuilder, private loaderService: LoaderService, private genericService: GenericService, public router: Router, @Inject(MAT_DIALOG_DATA) public data: any, private dialogRef: MatDialogRef<AddDepartmentalJointInspectionComponent>,) { }

  ngOnInit(): void {
    this.deptId = localStorage.getItem('deptId') || 1;
    const deptSubs = this.getDepartments();
    const holidaysSubs = this.getAllHolidays();
    const unitSubs = this.getUnitsList();
    this.subs.add(holidaysSubs);
    this.subs.add(deptSubs);
    this.subs.add(unitSubs);
    this.deptJointInspectionForm = this.fb.group({
      unitName: [null, Validators.required],
      unitAddress: ['',],
      unitDistrict: ['',],
      unitSubDivision: ['',],
      riskCategory: ['',],
      proposedDate: ['',],
      inspectionType: ['',],
      department: ['',],
      inspectionFor: ['',],
      remarks: ['']
    });
    const unitNameControl = this.deptJointInspectionForm.get('unitName');
    if (unitNameControl) {
      const unitSubs = unitNameControl.valueChanges.subscribe((selectedUnitId: any) => {
        if (selectedUnitId) {
          const unitDetailsSubs = this.getUnitDetails(selectedUnitId);
          this.subs.add(unitDetailsSubs);
        }
      });
      this.subs.add(unitSubs);
    }
  }
  getDepartments(): void {
    this.genericService.getByConditions({ department_id: this.deptId }, 'api/inspection/get-inspection-departments').subscribe({
      next: (response: any) => {
        if (response.status === 1 && Array.isArray(response.data)) {
          this.departmentsOptions = response.data.map((dept: any) => ({
            id: String(dept.id),
            name: dept.name,
            details: dept.details,
          }));
        } else {
          this.departmentsOptions = [];
        }
      },
      error: (error) => {
        this.departmentsOptions = [];
      },
    });
  }


  onSubmit(): void {
    //  Optional: Enable this section if you want to validate before submit
    // if (this.deptJointInspectionForm.invalid) {
    //   this.deptJointInspectionForm.markAllAsTouched();

    //   const invalidFields = Object.keys(this.deptJointInspectionForm.controls)
    //     .filter((key) => this.deptJointInspectionForm.get(key)?.invalid)
    //     .map((key) =>
    //       key
    //         .replace(/([A-Z])/g, ' $1')
    //         .replace(/^./, (str) => str.toUpperCase())
    //     )
    //     .join(', ');

    //   Swal.fire({
    //     title: 'Form Incomplete',
    //     html: `
    //       <p>Please fill all required fields before submitting.</p>
    //       <p><b>Missing:</b> ${invalidFields || 'Unknown fields'}</p>
    //     `,
    //     icon: 'warning',
    //     confirmButtonColor: '#f59e0b',
    //     confirmButtonText: 'Got it!',
    //     background: '#fff8e1',
    //     color: '#78350f',
    //     showClass: { popup: 'animate__animated animate__shakeX' },
    //   });

    //   return;
    // }

    const formValue = this.deptJointInspectionForm.value;

    const proposedDateArray = Array.isArray(formValue.proposedDate)
      ? formValue.proposedDate.map((date: any) =>
        this.formatDateToYYYYMMDD(date)
      )
      : [this.formatDateToYYYYMMDD(formValue.proposedDate)];

    const payload = {
      department_id: this.deptId,
      proposed_date: proposedDateArray,
      inspection_type: formValue.inspectionType,
      inspection_for: Array.isArray(formValue.inspectionFor)
        ? formValue.inspectionFor
        : [formValue.inspectionFor],
      remarks: formValue.remarks,
      unit_name: formValue.unitName,
      unit_address: formValue.unitAddress,
      unit_district: formValue.unitDistrict,
      unit_sub_division: formValue.unitSubDivision,
      risk_category: formValue.riskCategory,
      department: formValue.department,
    };

    // ✅ Show loader before API call
    this.loaderService.showLoader();

    this.genericService
      .getByConditions(payload, 'api/inspection/inspection-store')
      .pipe(finalize(() => this.loaderService.hideLoader()))
      .subscribe({
        next: (response: any) => {
          if (response.status === 1) {
            this.dialogRef.close('submitted');

            setTimeout(() => {
              Swal.fire({
                title: 'Joint Inspection Created!',
                html: `
                <div style="font-size: 15px; color:#374151; text-align:left;">
                  <b>Unit:</b> ${payload.unit_name}<br>
                  <b>Type:</b> ${payload.inspection_type}<br>
                  <b>Date:</b> ${Array.isArray(payload.proposed_date)
                    ? payload.proposed_date.join(', ')
                    : payload.proposed_date
                  }
                </div>
              `,
                icon: 'success',
                background: '#ecfdf5',
                color: '#065f46',
                confirmButtonColor: '#10b981',
                confirmButtonText: 'Continue',
                showClass: {
                  popup: 'animate__animated animate__fadeInDown animate__faster',
                },
                hideClass: {
                  popup: 'animate__animated animate__fadeOutUp animate__faster',
                },
                timer: 2000,
                timerProgressBar: true,
              }).then(() => {
                // ✅ 3. Navigate after success popup
                this.router.navigate(['/dashboard/departmental-inspection']);
              });
            }, 400); // delay ensures dialog is fully closed before showing alert
          } else {
            Swal.fire({
              title: 'Submission Failed',
              text:
                response.message ||
                'Something went wrong, please try again later.',
              icon: 'error',
              background: '#fef2f2',
              color: '#7f1d1d',
              confirmButtonColor: '#ef4444',
              confirmButtonText: 'Retry',
              showClass: { popup: 'animate__animated animate__shakeX' },
            });
          }
        },
        error: (err: any) => {
          console.error('Error creating inspection:', err);

          Swal.fire({
            title: 'Server Error',
            text: 'Unable to create inspection at the moment. Please try again later.',
            icon: 'error',
            background: '#fef2f2',
            color: '#7f1d1d',
            confirmButtonColor: '#dc2626',
            confirmButtonText: 'OK',
            showClass: { popup: 'animate__animated animate__shakeX' },
          });
        },
      });
  }


  getUnitsList(): void {
    this.loaderService.showLoader();

    this.genericService.getUnitsList()
      .pipe(finalize(() => this.loaderService.hideLoader()))
      .subscribe({
        next: (response: any) => {
          if (response.status === 1 && Array.isArray(response.data)) {
            this.unitOptions = response.data.map((unit: any) => ({
              id: String(unit.id),
              name: unit.unit_name || 'Unnamed Unit',
            }));
          } else {
            this.unitOptions = [];
            this.showDialogAlert({
              title: 'No Units Found',
              text: 'No available units were found for this department.',
              icon: 'info',
              iconColor: '#0284c7',
              confirmButtonColor: '#0ea5e9',
              background: '#e0f2fe',
              color: '#075985',
            });
          }
        },
        error: (err: any) => {
          console.error('Error fetching units:', err);
          this.unitOptions = [];
          this.showDialogAlert({
            title: 'Error',
            text: 'Failed to fetch units. Please try again later.',
            icon: 'error',
            iconColor: '#dc2626',
            confirmButtonColor: '#ef4444',
            background: '#fef2f2',
            color: '#7f1d1d',
          });
        },
      });
  }
  private formatDateToYYYYMMDD(date: any): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }


  private showDialogAlert({
    title,
    text,
    icon,
    iconColor,
    confirmButtonColor,
    background,
    color,
  }: {
    title: string;
    text: string;
    icon: any;
    iconColor?: string;
    confirmButtonColor?: string;
    background?: string;
    color?: string;
  }): void {
    Swal.fire({
      title,
      text,
      icon,
      iconColor,
      background,
      color,
      confirmButtonColor,
      confirmButtonText: 'OK',
      allowOutsideClick: true,
      allowEscapeKey: true,
      backdrop: true,
      customClass: {
        popup: 'swal-override-zindex animate__animated animate__fadeInDown',
      },
      showClass: {
        popup: 'animate__animated animate__fadeInDown animate__faster',
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOutUp animate__faster',
      },
    });
  }

  getUnitDetails(UnitId: number): void {
    if (!UnitId) return;

    this.loaderService.showLoader();
    this.genericService
      .getUnitDetails(UnitId)
      .pipe(finalize(() => this.loaderService.hideLoader()))
      .subscribe({
        next: (response: any) => {
          if (response.status === 1 && response.data) {
            const unit = response.data;
            this.deptJointInspectionForm.patchValue({
              unitAddress: unit.unit_address || '',
              unitDistrict: unit.unit_location_district || '',
              unitSubDivision: unit.unit_location_subdivision || '',
              riskCategory: unit.category_of_enterprise || '',
            });
          } else {
          }
        },
        error: (err: any) => {
          console.error('Error fetching unit details:', err);
        },
      });
  }

  getAllHolidays(): void {
    this.loaderService.showLoader();
    this.genericService.viewHolidays({}).pipe(finalize(() => this.loaderService.hideLoader())).subscribe({
      next: (res: any) => {
        if (res?.status === 1 && Array.isArray(res.data)) {
          this.holidays = res.data;
        } else {
          this.holidays = [];
        }
      },
      error: () => {
        this.genericService.openSnackBar('Failed to load holidays', 'Close');
        this.holidays = [];
      }
    });
  }


  onCancel(): void {
    this.dialogRef.close('cancelled');
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}

