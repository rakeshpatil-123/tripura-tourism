import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { animate, style, transition, trigger } from '@angular/animations';
import { GenericService } from '../../_service/generic/generic.service';
import { LoaderService } from '../../_service/loader/loader.service';
import { Router } from '@angular/router';
import { DynamicTableComponent } from "../../shared/component/table/table.component";
import { ConfirmDateDialogComponent } from '../confirm-date-dialog/confirm-date-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-departmental-inspection-list',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule, DynamicTableComponent],
  templateUrl: './departmental-inspection-list.component.html',
  styleUrls: ['./departmental-inspection-list.component.scss'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(8px)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
    ]),
  ],
})
export class DepartmentalInspectionListComponent implements OnInit, OnChanges {
  approvedInspections: any[] = [];
  inspectionColumns: any[] = [];
  filteredInspections: any[] = [];
  loading = false;
  @Input() filters: any = {};
  constructor(
    private genericService: GenericService,
    private loaderService: LoaderService,
    private dialog: MatDialog,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.defineColumns();
    this.getApprovedInspections();
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['filters'] && !changes['filters'].firstChange) {
      this.getApprovedInspections();
    }
  }
  applyFilterLogic(): void {
    const { dateFrom, dateTo, industryName } = this.filters || {};

    this.filteredInspections = this.approvedInspections.filter((inspection) => {
      const date = new Date(inspection.proposed_date);
      const from = dateFrom ? new Date(dateFrom) : null;
      const to = dateTo ? new Date(dateTo) : null;
      const industryMatch = industryName
        ? inspection.industry_name.toLowerCase().includes(industryName.toLowerCase())
        : true;

      const dateMatch =
        (!from || date >= from) &&
        (!to || date <= to);

      return industryMatch && dateMatch;
    });
  }

  defineColumns(dataSample?: any): void {
    const hiddenKeys = ['id', 'reason', 'updated_at', 'remarks'];

    if (dataSample) {
      this.inspectionColumns = Object.keys(dataSample)
        .filter(
          (key) =>
            !hiddenKeys.includes(key) &&
            dataSample[key] !== null &&
            dataSample[key] !== ''
        )
        .map((key) => ({
          key,
          label: this.formatLabel(key),
          type: key === 'status' ? 'badge' : 'text',
        }));
    } else {
      this.inspectionColumns = [
        { key: 'sno', label: 'S.No', type: 'number', width: '70px' },
        { key: 'inspection_id', label: 'Inspection ID', type: 'text' },
        { key: 'inspection_date', label: 'Date of Inspection', type: 'text' },
        { key: 'department_name', label: 'Department Name', type: 'text' },
        { key: 'inspection_type', label: 'Inspection Type', type: 'text' },
        { key: 'industry_name', label: 'Industry Name', type: 'text' },
        { key: 'inspector', label: 'Inspector', type: 'text' },
        { key: 'status', label: 'Status', type: 'badge' },
      ];
    }
    this.inspectionColumns.push({
      key: 'actions',
      label: 'Actions',
      type: 'action',
      width: '200px',
      actions: [
        {
          label: 'Download Report',
          color: 'accent',
          // visible: (row: any) => !!row.report_file_url,
          visible: (row: any) => !row.report_file_url,
          onClick: (row: any) => this.downloadReport(row),
        },
        {
          label: (row: any) =>
            row.department_type === 'joint' ? 'Suggest Date' : 'Confirm Date',
          color: 'accent',
          // visible: (row: any) => row.status !== 'pending',
           visible: (row: any) => row.status === 'pending' || row.status === 'approved',
          onClick: (row: any) => this.openConfirmDateDialog(row),
        },
      ],
    });
  }


  // getApprovedInspections(): void {
  //   this.loading = true;
  //   this.loaderService.showLoader();

  //   this.genericService
  //     .getByConditions({}, 'api/department/approved-inspections-list')
  //     .subscribe({
  //       next: (res: any) => {
  //         if (res?.status === 1 && Array.isArray(res.data) && res.data.length > 0) {
  //           this.approvedInspections = res.data.map((item: any, index: number) => ({
  //             sno: index + 1,
  //             ...item,
  //           }));
  //           this.defineColumns(this.approvedInspections[0]);

  //         } else {
  //           this.approvedInspections = [];
  //           this.inspectionColumns = [];
  //         }
  //       },
  //       error: (err) => {
  //         const errorMessage =
  //           err?.error?.message ||
  //           err?.message || 'Something went wrong while fetching inspection list.';
  //         this.genericService.openSnackBar?.(errorMessage, 'error');
  //       },
  //       complete: () => {
  //         this.loading = false;
  //         this.loaderService.hideLoader();
  //       },
  //     });
  // }
 getApprovedInspections(): void {
  this.loading = true;
  this.loaderService.showLoader();

  const { dateFrom, dateTo, industryName } = this.filters || {};
  let url = 'api/department/approved-inspections-list';

  const params: string[] = [];

  // 🟢 Format the dates properly as YYYY-MM-DD
  const formatDate = (date: any): string | null => {
    if (!date) return null;
    const d = new Date(date);
    if (isNaN(d.getTime())) return null;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formattedFrom = formatDate(dateFrom);
  const formattedTo = formatDate(dateTo);

  if (industryName) params.push(`industry_name=${encodeURIComponent(industryName)}`);
  if (formattedFrom) params.push(`from_date=${encodeURIComponent(formattedFrom)}`);
  if (formattedTo) params.push(`to_date=${encodeURIComponent(formattedTo)}`);

  if (params.length > 0) {
    url += '?' + params.join('&');
  }

  this.genericService.getByConditions({}, url).subscribe({
    next: (res: any) => {
      if (res?.status === 1 && Array.isArray(res.data) && res.data.length > 0) {
        this.approvedInspections = res.data.map((item: any, index: number) => ({
          sno: index + 1,
          ...item,
        }));
        this.defineColumns(this.approvedInspections[0]);
      } else {
        this.approvedInspections = [];
        this.inspectionColumns = [];
      }
    },
    error: (err) => {
      const errorMessage =
        err?.error?.message ||
        err?.message || 'Something went wrong while fetching the inspection list.';
      this.genericService.openSnackBar?.(errorMessage, 'error');
      Swal.fire({
        icon: 'error',
        title: 'Access Denied',
        text: errorMessage,
        background: '#ffffff',
        color: '#333',
        iconColor: '#e53935',
        showConfirmButton: true,
        confirmButtonColor: '#e53935',
        confirmButtonText: 'Okay',
        backdrop: `
      rgba(0,0,0,0.4)
      left top
      no-repeat
    `,
        showClass: {
          popup: 'animate__animated animate__shakeX animate__faster'
        },
        hideClass: {
          popup: 'animate__animated animate__fadeOut animate__faster'
        }
      });

      this.loading = false;
      this.loaderService.hideLoader();
    },

    complete: () => {
      this.loading = false;
      this.loaderService.hideLoader();
    },
  });
  }


  private formatLabel(key: string): string {
    return key
      .replace(/_/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }


  viewInspection(row: any): void {
    this.genericService.openSnackBar?.(`Viewing ${row.request_id}`, 'info');
  }

  downloadReport(row: any): void {
    if (!row.report_file_url) {
      this.genericService.openSnackBar?.('No report uploaded for this inspection', 'error');
      return;
    }
    window.open(row.report_file_url, '_blank');
  }
  openConfirmDateDialog(row: any): void {
    const dialogRef = this.dialog.open(ConfirmDateDialogComponent, {
      width: '700px',
      maxWidth: '90vw',
      height: 'auto',
      maxHeight: '180vh',
      data: { row },
      panelClass: 'confirm-date-dialog-container',
      enterAnimationDuration: '300ms',
      exitAnimationDuration: '200ms',
      autoFocus: false,
      restoreFocus: false,
    });


    dialogRef.afterClosed().subscribe(
      (result: { selectedDates: string[]; remarks: string } | null) => {
        if (!result || !result.selectedDates || result.selectedDates.length === 0) {
          return;
        }
        let payload: any;

        if (row.department_type === 'joint') {
          payload = {
            inspection_id: row.id,
            proposed_date: result.selectedDates,
            remarks: result.remarks,
          };

          this.loaderService.showLoader();
          this.genericService.updateInspectionRequestStatus(payload).subscribe({
            next: (res: any) => {
              this.loaderService.hideLoader();
              row.proposed_date = payload.proposed_date;
              row.remarks = payload.remarks;
              this.getApprovedInspections();
            },
            error: (err: any) => {
              this.loaderService.hideLoader();
            },
          });
        } else {
          payload = {
            id: row.id,
            inspection_date: result.selectedDates[0],
            remarks: result.remarks,
          };

          this.loaderService.showLoader();
          this.genericService.updateInspectionRequesDateChangetStatus(payload).subscribe({
            next: (res: any) => {
              this.loaderService.hideLoader();
              row.actual_date_of_inspection = payload.inspection_date;
              row.remarks = payload.remarks;
              this.getApprovedInspections();
            },
            error: (err: any) => {
              this.loaderService.hideLoader();
            },
          });
        }
      }
    );
  }

  deleteInspection(row: any): void {
    const confirmed = confirm(`Delete inspection ${row.request_id}?`);
    if (!confirmed) return;

    this.loaderService.showLoader();
    this.genericService
      .getByConditions({ id: row.id }, 'api/inspections/delete')
      .subscribe({
        next: () => {
          this.genericService.openSnackBar?.('Inspection deleted successfully', 'success');
          this.approvedInspections = this.approvedInspections.filter((x) => x.id !== row.id);
        },
        error: (err) => {
          this.genericService.openSnackBar?.('Failed to delete inspection', 'error');
        },
        complete: () => this.loaderService.hideLoader(),
      });
  }

  toTitleCase(str: string): string {
    return str ? str.replace(/\b\w/g, (c) => c.toUpperCase()) : '';
  }
}
