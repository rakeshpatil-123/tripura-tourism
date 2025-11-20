

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
import { LoaderComponent } from '../../../page-template/loader/loader.component';

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
    LoaderComponent
  ],
})
export class InspectionComponent implements OnInit {
  @ViewChild('dateFromPicker') dateFromPicker!: IlogiInputDateComponent;
  @ViewChild('dateToPicker') dateToPicker!: IlogiInputDateComponent;
  @ViewChild('inspectionRequestDialog')
  inspectionRequestDialog!: TemplateRef<any>;
  @ViewChild('confirmDateDialog')
  confirmDateDialog!: TemplateRef<any>;
  selectedDepartmentId: number | null = null;
  inspectionListData: any[] = [];
  inspectionRequestListData: any[] = [];
  fullInspectionRequestListData: any[] = [];
  showDeleteModal = false;
  itemToDelete: any = null;
  isEditing = false;
  editingInspectionId: number | null = null;
  fullInspectionListData: any[] = [];

  // NEW: Confirm Date Modal Properties
  showConfirmDateModal = false;
  itemToConfirm: any = null;
  isConfirmDateEditing = false;
  confirmDateForm!: FormGroup;

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
    { key: 'proposed_date', label: 'Proposed Date', type: 'text' },
    { key: 'inspection_date', label: 'Inspection Date', type: 'text' },
    { key: 'inspection_type', label: 'Type', type: 'text' },
    { key: 'department_name', label: 'Department', type: 'text' },
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
          label: 'Confirm Date',
          color: 'primary',
          visible: (row: any) => row.status === 'Date Changed',
          onClick: (row: any) => {
            this.openConfirmDateModal(row);
          },
        },
        {
          label: 'Edit',
          color: 'primary',
          visible: (row: any) =>
            row.status !== 'approved' &&
            row.status !== 'rejected' &&
            row.status !== 'Date Changed',
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
  isConfirmDateDialogOpen = false;
  isLoading: boolean = false;

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

    // NEW: Confirm Date Form
    this.confirmDateForm = this.fb.group({
      inspection_date: ['', Validators.required],
      remarks: [''],
    });
  }

  ngOnInit(): void {
    this.loadDepartments();
    this.loadInspectionLists();
  }

  openConfirmDateModal(row: any): void {
    this.itemToConfirm = row;
    this.isConfirmDateEditing = false;

    const inspectionDate = row.inspection_date
      ? new Date(row.inspection_date)
      : null;

    this.confirmDateForm.patchValue({
      inspection_date: inspectionDate,
      remarks: '',
    });

    this.isConfirmDateDialogOpen = true;
    document.body.classList.add('dialog-open');
  }

  closeConfirmDateDialog(): void {
    this.isConfirmDateDialogOpen = false;
    this.isConfirmDateEditing = false;
    this.itemToConfirm = null;
    this.confirmDateForm.reset();
    document.body.classList.remove('dialog-open');
  }

  confirmDate(): void {
    if (!this.itemToConfirm) return;

    const payload = {
      id: this.itemToConfirm.id,
      proposed_date: this.confirmDateForm.get('inspection_date')?.value,
    };

    this.genericService
      .getByConditions(payload, 'api/inspection/inspection-date-update-by-user')
      .subscribe({
        next: (res: any) => {
          if (res?.status === 1) {
            this.genericService.openSnackBar(
              'Date confirmed successfully!',
              'success'
            );
            this.closeConfirmDateDialog();
            this.loadInspectionLists();
          } else {
            this.genericService.openSnackBar(
              res?.message || 'Failed to confirm date',
              'error'
            );
          }
        },
        error: (err) => {
          console.error('Confirm date error:', err);
          this.genericService.openSnackBar('Failed to confirm date', 'error');
        },
      });
  }

  openChangeDateModal(): void {
    this.isConfirmDateEditing = true;
  }

  submitChangedDate(): void {
    if (this.confirmDateForm.invalid) {
      this.confirmDateForm.markAllAsTouched();
      return;
    }

    const rawDate = this.confirmDateForm.get('inspection_date')?.value;
    const formattedDate =
      rawDate instanceof Date ? rawDate.toISOString().split('T')[0] : rawDate;

    const payload = {
      id: this.itemToConfirm.id,
      proposed_date: formattedDate,
      remarks: this.confirmDateForm.get('remarks')?.value || '',
    };

    this.genericService
      .getByConditions(payload, 'api/inspection/inspection-date-update-by-user')
      .subscribe({
        next: (res: any) => {
          if (res?.status === 1) {
            this.genericService.openSnackBar(
              'Date updated successfully!',
              'success'
            );
            this.closeConfirmDateDialog();
            this.loadInspectionLists();
          } else {
            this.genericService.openSnackBar(
              res?.message || 'Failed to update date',
              'error'
            );
          }
        },
        error: (err) => {
          console.error('Update date error:', err);
          this.genericService.openSnackBar('Failed to update date', 'error');
        },
      });
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
    this.isLoading = true;
    this.genericService
      .getByConditions(
        {},
        'api/inspection/date-confirmed-inspections-list-per-user'
      )
      .subscribe({
        next: (res: any) => {
          const data =
            res?.status === 1 && Array.isArray(res.data) ? res.data : [];
          this.fullInspectionListData = [...data];
          this.inspectionListData = [...data];
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Failed to load confirmed inspections:', err);
          this.fullInspectionListData = [];
          this.inspectionListData = [];
          this.genericService.openSnackBar(
            'Failed to load inspection list',
            'error'
          );
          this.isLoading = false;
        },
      });

    this.genericService
      .getByConditions({}, 'api/inspection/inspection-list')
      .subscribe({
        next: (res: any) => {
          const data =
            res?.status === 1 && Array.isArray(res.data) ? res.data : [];
          this.fullInspectionRequestListData = [...data];
          this.inspectionRequestListData = [...data];
        },
        error: (err) => {
          console.error('Failed to load inspection requests:', err);
          this.fullInspectionRequestListData = [];
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
    console.log(
      'Proposed date value:',
      this.inspectionForm.get('proposed_date')?.value
    );
    console.log(
      'Form errors:',
      this.inspectionForm.get('proposed_date')?.errors
    );
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
    const dateFrom = this.dateFromPicker?.value;
    const dateTo = this.dateToPicker?.value;
    const deptId = this.selectedDepartmentId;

    console.log('Applying filters to both tabs:', { deptId, dateFrom, dateTo });

    let filteredTab1 = [...this.fullInspectionListData];

    if (deptId !== null && deptId !== undefined) {
      filteredTab1 = filteredTab1.filter(
        (item) => item.department_id === deptId
      );
    }

    if (dateFrom || dateTo) {
      filteredTab1 = filteredTab1.filter((item) => {
        const dateStr = item.inspection_date;
        if (!dateStr) return false;

        const itemDate = new Date(dateStr);
        itemDate.setUTCHours(0, 0, 0, 0);

        if (dateFrom) {
          const from = new Date(dateFrom);
          from.setUTCHours(0, 0, 0, 0);
          if (itemDate < from) return false;
        }

        if (dateTo) {
          const to = new Date(dateTo);
          to.setUTCHours(0, 0, 0, 0);
          if (itemDate > to) return false;
        }

        return true;
      });
    }

    let filteredTab2 = [...this.fullInspectionRequestListData];

    if (deptId !== null && deptId !== undefined) {
      filteredTab2 = filteredTab2.filter(
        (item) => item.department_id === deptId
      );
    }

    if (dateFrom || dateTo) {
      filteredTab2 = filteredTab2.filter((item) => {
        const dateStr = item.proposed_inspection_date;
        if (!dateStr) return false;

        const itemDate = new Date(dateStr);
        itemDate.setUTCHours(0, 0, 0, 0);

        if (dateFrom) {
          const from = new Date(dateFrom);
          from.setUTCHours(0, 0, 0, 0);
          if (itemDate < from) return false;
        }

        if (dateTo) {
          const to = new Date(dateTo);
          to.setUTCHours(0, 0, 0, 0);
          if (itemDate > to) return false;
        }

        return true;
      });
    }

    this.inspectionListData = filteredTab1;
    this.inspectionRequestListData = filteredTab2;
  }

  resetFilters(): void {
    if (this.dateFromPicker) this.dateFromPicker.value = null;
    if (this.dateToPicker) this.dateToPicker.value = null;
    this.selectedDepartmentId = null;

    this.inspectionListData = [...this.fullInspectionListData];
    this.inspectionRequestListData = [...this.fullInspectionRequestListData];
  }

  onDepartmentChange(deptId: number | null): void {
    this.selectedDepartmentId = deptId;
  }
}
