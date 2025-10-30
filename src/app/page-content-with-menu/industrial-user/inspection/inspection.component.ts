import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { GenericService } from '../../../_service/generic/generic.service';
import { IlogiInputComponent } from '../../../customInputComponents/ilogi-input/ilogi-input.component';
import { IlogiSelectComponent, SelectOption } from '../../../customInputComponents/ilogi-select/ilogi-select.component';
import { IlogiInputDateComponent } from '../../../customInputComponents/ilogi-input-date/ilogi-input-date.component';
import { CommonModule } from '@angular/common';
import { DynamicTableComponent } from '../../../shared/component/table/table.component';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';

interface Department {
  id: number;
  name: string;
  details: string;
}

@Component({
  selector: 'app-inspection',
  templateUrl: './inspection.component.html',
  styleUrls: ['./inspection.component.scss'],
  imports: [
    IlogiInputComponent,
    IlogiSelectComponent,
    IlogiInputDateComponent,
    CommonModule,
    ReactiveFormsModule,
    DynamicTableComponent,
    MatTabsModule,
    MatButtonModule,
  ],
})
export class InspectionComponent implements OnInit {
  @ViewChild('inspectionRequestDialog') inspectionRequestDialog!: TemplateRef<any>;
  inspectionListData: any[] = [];
inspectionRequestListData: any[] = [];

inspectionColumns: any[] = [
  { key: 'inspection_id', label: 'Inspection ID', type: 'text' },
  { key: 'inspection_date', label: 'Inspection Date', type: 'text' },
  { key: 'inspection_type', label: 'Type', type: 'text' },
  { key: 'deprtment', label: 'Department', type: 'text' },
  { key: 'inspector', label: 'Inspector', type: 'text' },
  { key: 'status', label: 'Status', type: 'text' },
  { key: 'created_by', label: 'Created By', type: 'text' }
];

requestColumns: any[] = [
  { key: 'request_id', label: 'Request ID', type: 'text' },
  { key: 'proposed_inspection_date', label: 'Proposed Date', type: 'text' },
  { key: 'inspection_type', label: 'Type', type: 'text' },
  { key: 'industry_name', label: 'Industry', type: 'text' },
  { key: 'inspector', label: 'Inspector', type: 'text' },
  { key: 'status', label: 'Status', type: 'text' },
  { key: 'created_by', label: 'Created By', type: 'text' },
  { key: 'updated_by', label: 'Updated By', type: 'text' },
   {
        key: 'actions',
        label: 'Action',
        type: 'action',
        width: '120px',
        actions: [
          {
            label: 'View Details',
            color: 'primary',
            onClick: (row: any) => {
              // this.router.navigate(['/industrial-user/inspection/inspection-request-details', row.request_id]);
              
            },
          },
          {
            label: 'Edit Inspection',
            color: 'primary',
            onClick: (row: any) => {
              console.log(row, "hehe");
              
            },
          },
          {
            label: 'Delete Inspection',
            color: 'primary',
            onClick: (row: any) => {
              console.log(row, "hehe");
              
            },
          },
       
        ],
      },
];

  departments: SelectOption[] = [];
  inspectionForm!: FormGroup;
  isDialogOpen = false;

  constructor(
    private fb: FormBuilder,
    private genericService: GenericService,
    private router: Router
  ) {
    this.inspectionForm = this.fb.group({
      department_id: ['', Validators.required],
      proposed_date: ['', Validators.required],
      reason_for_request: ['', [Validators.required, Validators.maxLength(500)]],
      remarks: ['']
    });
  }

  ngOnInit(): void {
    this.loadDepartments();
    this.loadInspectionLists();
  }

  loadDepartments(): void {
    this.genericService
      .getByConditions({}, 'api/inspection/get-inspection-departments')
      .subscribe({
        next: (res: any) => {
          if (res?.status === 1 && Array.isArray(res.data)) {
            this.departments = res.data.map((dept: Department) => ({
              id: dept.id,
              name: dept.name
            }));
          }
        },
        error: (err) => {
          console.error('Failed to load departments:', err);
          this.genericService.openSnackBar('Failed to load departments', 'error');
        }
      });
  }

  loadInspectionLists(): void {
  this.genericService
    .getByConditions({}, 'api/inspection/date-confirmed-inspections-list-per-user')
    .subscribe({
      next: (res: any) => {
        if (res?.status === 1 && Array.isArray(res.data)) {
          this.inspectionListData = res.data;
        } else {
          this.inspectionListData = [];
        }
      },
      error: (err) => {
        console.error('Failed to load inspection list:', err);
        this.inspectionListData = [];
        this.genericService.openSnackBar('Failed to load inspection list', 'error');
      }
    });

  this.genericService
    .getByConditions({}, 'api/inspection/inspection-list')
    .subscribe({
      next: (res: any) => {
        if (res?.status === 1 && Array.isArray(res.data)) {
          this.inspectionRequestListData = res.data;
        } else {
          this.inspectionRequestListData = [];
        }
      },
      error: (err) => {
        console.error('Failed to load inspection requests:', err);
        this.inspectionRequestListData = [];
        this.genericService.openSnackBar('Failed to load inspection requests', 'error');
      }
    });
}

  requestInspection(): void {
    this.inspectionForm.reset();
    this.isDialogOpen = true;
    document.body.classList.add('dialog-open');
  }

  closeDialog(): void {
    this.isDialogOpen = false;
    document.body.classList.remove('dialog-open');
  }

  submitInspectionRequest(): void {
    if (this.inspectionForm.invalid) {
      this.inspectionForm.markAllAsTouched();
      return;
    }

    const rawDate = this.inspectionForm.get('proposed_date')?.value;
    let formattedDate = '';
    
    if (rawDate instanceof Date) {
      formattedDate = rawDate.toISOString().split('T')[0];
    } else if (typeof rawDate === 'string') {
      formattedDate = rawDate;
    }

    const payload = {
      department_id: this.inspectionForm.get('department_id')?.value,
      proposed_date: formattedDate,
      reason_for_request: this.inspectionForm.get('reason_for_request')?.value,
      remarks: this.inspectionForm.get('remarks')?.value
    };

    this.genericService
      .getByConditions(payload, 'api/inspection/inspection-store')
      .subscribe({
        next: (res: any) => {
          if (res?.status === 1) {
            this.genericService.openSnackBar('Inspection request submitted successfully!', 'success');
            this.closeDialog();
          } else {
            this.genericService.openSnackBar(res?.message || 'Failed to submit request', 'error');
          }
        },
        error: (err) => {
          console.error('Submission error:', err);
          this.genericService.openSnackBar('Failed to submit inspection request', 'error');
        }
      });
  }
}