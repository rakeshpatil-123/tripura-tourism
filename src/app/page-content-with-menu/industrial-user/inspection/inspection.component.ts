import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { GenericService } from '../../../_service/generic/generic.service';
import { IlogiInputComponent } from '../../../customInputComponents/ilogi-input/ilogi-input.component';
import {
  IlogiSelectComponent,
  SelectOption,
} from '../../../customInputComponents/ilogi-select/ilogi-select.component';
import { IlogiInputDateComponent } from '../../../customInputComponents/ilogi-input-date/ilogi-input-date.component';
import { CommonModule } from '@angular/common';
import { DynamicTableComponent } from '../../../shared/component/table/table.component';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { ConfirmationModalComponent } from '../../../shared/component/confirmation-modal/confirmation-modal.component';

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
    ConfirmationModalComponent,
  ],
})
export class InspectionComponent implements OnInit {
  @ViewChild('dateFromPicker') dateFromPicker!: any;
  @ViewChild('dateToPicker') dateToPicker!: any;
  @ViewChild('deptPicker') deptPicker!: any;
  @ViewChild('inspectionRequestDialog')
  inspectionRequestDialog!: TemplateRef<any>;
  inspectionListData: any[] = [];
  inspectionRequestListData: any[] = [];
  showDeleteModal = false;
  itemToDelete: any = null;
  isEditing = false;
  editingInspectionId: number | null = null;
  fullInspectionRequestList: any[] = [];
  filterDateFrom: Date | null = null;
  filterDateTo: Date | null = null;
  filterDepartmentId: number | null = null;

  inspectionColumns: any[] = [
    { key: 'inspection_id', label: 'Inspection ID', type: 'text' },
    { key: 'inspection_date', label: 'Inspection Date', type: 'text' },
    { key: 'inspection_type', label: 'Type', type: 'text' },
    { key: 'deprtment', label: 'Department', type: 'text' },
    { key: 'inspector', label: 'Inspector', type: 'text' },
    { key: 'status', label: 'Status', type: 'text' },
    { key: 'created_by', label: 'Created By', type: 'text' },
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
            this.router.navigate(['/dashboard/inspection-view/', row.id]);
          },
        },
        {
          label: 'Edit',
          color: 'primary',
          visible: (row: any) =>
            row.status !== 'approved' && row.status !== 'rejected',
          onClick: (row: any) => {
            this.openEditModal(row);
          },
        },
        {
          label: 'Delete',
          visible: (row: any) =>
            row.status !== 'approved' && row.status !== 'rejected',
          color: 'warn',
          onClick: (row: any) => {
            this.itemToDelete = row;
            this.showDeleteModal = true;
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
      reason_for_request: [
        '',
        [Validators.required, Validators.maxLength(500)],
      ],
      remarks: [''],
    });
  }

  ngOnInit(): void {
    this.loadDepartments();
    this.loadInspectionLists();
  }
  openEditModal(row: any): void {
    this.isEditing = true;
    this.editingInspectionId = row.id;

    let proposedDate = '';
    if (Array.isArray(row.proposed_date) && row.proposed_date.length > 0) {
      proposedDate = row.proposed_date[0];
    } else if (typeof row.proposed_date === 'string') {
      proposedDate = row.proposed_date;
    } else if (
      Array.isArray(row.proposed_inspection_date) &&
      row.proposed_inspection_date.length > 0
    ) {
      proposedDate = row.proposed_inspection_date[0];
    } else if (typeof row.proposed_inspection_date === 'string') {
      proposedDate = row.proposed_inspection_date;
    }

    this.inspectionForm.patchValue({
      department_id: row.department_id || row.deprtment?.id || '',
      proposed_date: proposedDate,
      reason_for_request: row.reason_for_request || '',
      remarks: row.remarks || '',
    });

    this.isDialogOpen = true;
    document.body.classList.add('dialog-open');
  }

  // private parseDateForPicker(dateStr: string): string | null {
  //   if (!dateStr) return null;

  //   if (dateStr === 'N/A' || dateStr === 'Invalid date') return null;
  //   return dateStr;
  // }

  onConfirmDelete(): void {
    if (!this.itemToDelete) return;

    this.genericService
      .getByConditions(
        { id: this.itemToDelete.id },
        'api/inspection/inspection-delete'
      )
      .subscribe({
        next: (res: any) => {
          this.showDeleteModal = false;
          this.itemToDelete = null;

          if (res?.status === 1) {
            this.genericService.openSnackBar(
              'Inspection deleted successfully',
              'success'
            );
            this.loadInspectionLists();
          } else {
            this.genericService.openSnackBar(
              res?.message || 'Failed to delete inspection',
              'error'
            );
          }
        },
        error: (err) => {
          console.error('Failed to delete inspection:', err);
          this.genericService.openSnackBar(
            'Failed to delete inspection',
            'error'
          );
          this.showDeleteModal = false;
          this.itemToDelete = null;
        },
      });
  }

  onCancelDelete(): void {
    this.showDeleteModal = false;
    this.itemToDelete = null;
  }

  loadDepartments(): void {
    this.genericService
      .getByConditions({}, 'api/inspection/get-inspection-departments')
      .subscribe({
        next: (res: any) => {
          if (res?.status === 1 && Array.isArray(res.data)) {
            this.departments = res.data.map((dept: Department) => ({
              id: dept.id,
              name: dept.name,
            }));
          }
        },
        error: (err) => {
          console.error('Failed to load departments:', err);
          this.genericService.openSnackBar(
            'Failed to load departments',
            'error'
          );
        },
      });
  }

  loadInspectionLists(): void {
    this.genericService
      .getByConditions(
        {},
        'api/inspection/date-confirmed-inspections-list-per-user'
      )
      .subscribe({
        next: (res: any) => {
          if (res?.status === 1 && Array.isArray(res.data)) {
            this.fullInspectionRequestList = res.data;
            this.inspectionRequestListData = [...res.data];
          } else {
            this.fullInspectionRequestList = [];
            this.inspectionRequestListData = [];
          }
        },
        error: (err) => {
          console.error('Failed to load inspection list:', err);
          this.inspectionListData = [];
          this.genericService.openSnackBar(
            'Failed to load inspection list',
            'error'
          );
        },
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
          this.genericService.openSnackBar(
            'Failed to load inspection requests',
            'error'
          );
        },
      });
  }

  requestInspection(): void {
    this.isEditing = false;
    this.editingInspectionId = null;
    this.inspectionForm.reset();
    this.isDialogOpen = true;
    document.body.classList.add('dialog-open');
  }

  closeDialog(): void {
    this.isDialogOpen = false;
    document.body.classList.remove('dialog-open');
  }

  submitInspectionRequest(): void {
      console.log('Form valid?', this.inspectionForm.valid);
  console.log('Proposed date value:', this.inspectionForm.get('proposed_date')?.value);
  console.log('Form errors:', this.inspectionForm.get('proposed_date')?.errors);
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

    const basePayload = {
      department_id: this.inspectionForm.get('department_id')?.value,
      proposed_date: formattedDate ? [formattedDate] : [],
      reason_for_request: this.inspectionForm.get('reason_for_request')?.value,
      remarks: this.inspectionForm.get('remarks')?.value,
    };

    if (this.isEditing && this.editingInspectionId) {
      const payload = { ...basePayload, id: this.editingInspectionId };
      this.genericService
        .getByConditions(payload, 'api/inspection/inspection-update')
        .subscribe({
          next: (res: any) => {
            if (res?.status === 1) {
              this.genericService.openSnackBar(
                'Inspection updated successfully!',
                'success'
              );
              this.closeDialog();
              this.loadInspectionLists();
            } else {
              this.genericService.openSnackBar(
                res?.message || 'Failed to update',
                'error'
              );
            }
          },
          error: (err) => {
            console.error('Update error:', err);
            this.genericService.openSnackBar(
              'Failed to update inspection',
              'error'
            );
          },
        });
    } else {
      this.genericService
        .getByConditions(basePayload, 'api/inspection/inspection-store')
        .subscribe({
          next: (res: any) => {
            if (res?.status === 1) {
              this.genericService.openSnackBar(
                'Inspection request submitted!',
                'success'
              );
              this.closeDialog();
              this.loadInspectionLists();
            } else {
              this.genericService.openSnackBar(
                res?.message || 'Failed to submit',
                'error'
              );
            }
          },
          error: (err) => {
            console.error('Submission error:', err);
            this.genericService.openSnackBar(
              'Failed to submit request',
              'error'
            );
          },
        });
    }
  }

 applyFilters(): void {
  const dateFrom = this.dateFromPicker?.value;      // Should be Date or null
  const dateTo = this.dateToPicker?.value;          // Should be Date or null
  const deptId = this.deptPicker?.selectedValue;    // Should be number or null

  let filtered = this.fullInspectionRequestList;

  // Filter by department
  if (deptId !== null && deptId !== undefined) {
    filtered = filtered.filter(item => item.department_id === deptId);
  }

  // Filter by date
  if (dateFrom || dateTo) {
    filtered = filtered.filter(item => {
      const itemDateStr = item.proposed_inspection_date;
      if (!itemDateStr) return false;

      const itemDate = new Date(itemDateStr);
      itemDate.setUTCHours(0, 0, 0, 0);

      let matches = true;

      if (dateFrom) {
        const fromDate = new Date(dateFrom);
        fromDate.setUTCHours(0, 0, 0, 0);
        matches = matches && itemDate >= fromDate;
      }

      if (dateTo) {
        const toDate = new Date(dateTo);
        toDate.setUTCHours(0, 0, 0, 0);
        matches = matches && itemDate <= toDate;
      }

      return matches;
    });
  }

  this.inspectionRequestListData = filtered;
}

resetFilters(): void {
  if (this.dateFromPicker && typeof this.dateFromPicker.clear === 'function') {
    this.dateFromPicker.clear();
  } else if (this.dateFromPicker) {
    this.dateFromPicker.value = null;
  }

  if (this.dateToPicker && typeof this.dateToPicker.clear === 'function') {
    this.dateToPicker.clear();
  } else if (this.dateToPicker) {
    this.dateToPicker.value = null;
  }

  if (this.deptPicker && typeof this.deptPicker.clear === 'function') {
    this.deptPicker.clear();
  } else if (this.deptPicker) {
    this.deptPicker.selectedValue = null;
  }

  this.inspectionRequestListData = [...this.fullInspectionRequestList];
}

  onDateFromChange(date: Date | null): void {
    this.filterDateFrom = date;
  }

  onDateToChange(date: Date | null): void {
    this.filterDateTo = date;
  }

  onDepartmentChange(deptId: number | null): void {
    this.filterDepartmentId = deptId;
  }
}
