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
    private router: Router
  ) { }

  ngOnInit(): void {
    this.defineColumns();
    this.getApprovedInspections();
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['filters'] && !changes['filters'].firstChange) {
      this.applyFilterLogic();
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

  defineColumns(): void {
    this.inspectionColumns = [
      { key: 'sno', label: 'S.No', type: 'number', width: '70px' },
      { key: 'request_id', label: 'Request ID', type: 'text' },
      { key: 'proposed_date', label: 'Proposed Inspection Date', type: 'text' },
      { key: 'inspection_type', label: 'Inspection Type', type: 'text' },
      { key: 'industry_name', label: 'Industry Name', type: 'text' },
      { key: 'inspector', label: 'Inspector', type: 'text' },
      { key: 'status', label: 'Status', type: 'badge' },
      {
        key: 'actions',
        label: 'Actions',
        type: 'action',
        width: '200px',
        actions: [
          // {
          //   label: 'View',
          //   color: 'primary',
          //   onClick: (row: any) => this.viewInspection(row),
          // },
          {
            label: 'Download Report',
            color: 'accent',
            visible: (row: any) => row.report_file_url || 1,
            // visible: (row: any) => !!row.report_file_url,
            onClick: (row: any) => this.downloadReport(row),
          },
          // {
          //   label: 'Delete',
          //   color: 'warn',
          //   onClick: (row: any) => this.deleteInspection(row),
          // },
        ],
      },
    ];
  }


  getApprovedInspections(): void {
    this.loading = true;
    this.loaderService.showLoader();

    this.genericService
      .getByConditions({}, 'api/department/approved-inspections-list')
      .subscribe({
        next: (res: any) => {
          if (res?.status === 1 && Array.isArray(res.data)) {
            this.approvedInspections = res.data.map((item: any, index: number) => ({
              sno: index + 1,
              id: item.id,
              request_id: item.request_id ?? 'N/A',
              proposed_date: item.proposed_date ?? 'N/A',
              inspection_type: item.inspection_type ?? 'N/A',
              industry_name: item.industry_name ?? 'N/A',
              inspector: item.inspector ?? 'N/A',
              status: this.toTitleCase(item.status) ?? 'Pending',
              report_file_url: item.report_file_url ?? null,
            }));
          } else {
            this.approvedInspections = [];
            this.filteredInspections = [];
          }
        },
        error: (err) => {
          const errorMessage =
            err?.error?.message ||
            err?.message || 'Something went wrong while fetching inspection list.';
          this.genericService.openSnackBar?.(errorMessage, 'error');
        },

        complete: () => {
          this.loading = false;
          this.loaderService.hideLoader();
        },
      });
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
