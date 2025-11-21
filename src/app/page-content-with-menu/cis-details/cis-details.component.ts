import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { finalize, Subscription } from 'rxjs';

import { IlogiInputDateComponent } from '../../customInputComponents/ilogi-input-date/ilogi-input-date.component';
import { IlogiSelectComponent, SelectOption } from '../../customInputComponents/ilogi-select/ilogi-select.component';
import { GenericService } from '../../_service/generic/generic.service';
import { LoaderService } from '../../_service/loader/loader.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-cis-details',
  standalone: true,
  templateUrl: './cis-details.component.html',
  styleUrls: ['./cis-details.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    IlogiInputDateComponent,
    IlogiSelectComponent,
    ButtonModule
  ]
})
export class CisDetailsComponent implements OnInit, OnDestroy {

  fromDate: Date | null = null;
  toDate: Date | null = null;
  selectedDept: any = null;
  pageSizeOptions: number[] = [5, 10, 20, 50, 100];
  selectedInspection: any = null;
  data: any[] = [];
  pagedData: any[] = [];
  columns: string[] = [];
  animateTable: boolean = false;
  dateError = '';

  departments: SelectOption[] = [];
  inspections = [
    { id: 'fire', name: 'Fire Safety' },
    { id: 'health', name: 'Health Inspection' },
    { id: 'welfare', name: 'Labour Welfare' }
  ];

  subs = new Subscription();
  page = 1;
  pageSize = 10;

  constructor(
    private genericService: GenericService,
    private loader: LoaderService
  ) { }

  ngOnInit(): void {
    this.subs.add(this.loadDepartments());
    const today = new Date();
    const past12Months = new Date();
    past12Months.setFullYear(today.getFullYear() - 1);

    this.fromDate = past12Months;
    this.toDate = today;
    this.search();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
  private loadDepartments() {
    this.loader.showLoader();
    return this.genericService.getAllDepartmentNames()
      .pipe(finalize(() => this.loader.hideLoader()))
      .subscribe({
        next: (res: any) => {
          const list = res?.data || [];
          this.departments = [{ id: '', name: 'All Departments' },
          ...list.map((d: any) => ({
            id: String(d.id || d.code || ''),
            name: d.name || d.department || 'Department'
          }))
          ];
        },
        error: () => {
          this.departments = [{ id: '', name: 'All Departments' }];
        }
      });
  }
  validateDates() {
    this.dateError = '';
    if (this.fromDate && this.toDate) {
      const f = new Date(this.fromDate);
      const t = new Date(this.toDate);
      if (f > t) {
        this.dateError = 'From Date cannot be greater than To Date.';
      }
    }
  }
  search(): void {
    this.validateDates();
    if (this.dateError) return;

    const payload = {
      from_date: this.formatDate(this.fromDate),
      to_date: this.formatDate(this.toDate),
      department_id: this.selectedDept || null,
      inspection_for: this.selectedInspection ? [this.selectedInspection] : []
    };

    this.loader.showLoader();

    this.genericService.getByConditions(payload, 'api/report/cis-details-report')
      .pipe(finalize(() => this.loader.hideLoader()))
      .subscribe({
        next: (res: any) => {
          if (res?.status === 0) {
            Swal.fire({
              icon: 'warning',
              title: 'Validation Error',
              html: `<strong>${res.message || 'Invalid request parameters'}</strong>`,
              confirmButtonColor: '#f57c00'
            });
            this.data = [];
            this.pagedData = [];
            this.columns = [];
            return;
          }

          this.data = Array.isArray(res?.data) ? res.data : [];

          if (!this.data.length) {
            Swal.fire({
              icon: 'info',
              title: 'No Data Found',
              text: 'No CIS inspection details match your filters.',
              confirmButtonColor: '#003c5b'
            });
          }
          if (this.data.length) {
            this.columns = Object.keys(this.data[0]);
          }
          this.page = 1;
          this.applyPagination();
          this.animateTable = true;
          setTimeout(() => (this.animateTable = false), 600);
        },
        error: (err: any) => {
          console.error("CIS Details Error:", err);
          Swal.fire({
            icon: 'error',
            title: 'Server Error',
            html: `<div style="font-size:15px; color:#444;">
                    ${err?.error?.message || 'Something went wrong. Please try again later.'}
                  </div>`,
            confirmButtonColor: '#d33'
          });
          this.data = [];
          this.pagedData = [];
          this.columns = [];
        }
      });
  }
  onPageSizeChange(): void {
    this.page = 1;
    this.applyPagination();
  }
  reset(): void {
    this.fromDate = null;
    this.toDate = null;
    this.selectedDept = '';
    this.selectedInspection = '';
    this.dateError = '';
    this.data = [];
    this.pagedData = [];
    this.columns = [];
    this.page = 1;
  }

  exportExcel(): void {
    if (!this.data.length) {
      alert("No data to export!");
      return;
    }

    const header = "SL No,Enterprise,Address,Contact,Email,Inspection,Date\n";
    const rows = this.data.map((d, i) =>
      `${i + 1},${d.enterprise ?? ''},${d.address ?? ''},${d.contact ?? ''},${d.email ?? ''},${d.inspection ?? ''},${d.date ?? ''}`
    ).join("\n");

    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `CIS_Details_Report.csv`;
    link.click();
  }

  private formatDate(date: any): string | null {
    if (!date) return null;
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  formatColumn(col: string): string {
    return col?.split('_').join(' ').toUpperCase();
  }
  get totalPages(): number {
    return Math.max(1, Math.ceil((this.data?.length || 0) / this.pageSize));
  }

  applyPagination(): void {
    const start = (this.page - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.pagedData = this.data.slice(start, end);
  }

  onPageChange(next: number): void {
    if (next < 1) return;
    if (next > this.totalPages) return;
    this.page = next;
    this.applyPagination();

    const tableEl = document.querySelector('.data-table');
    if (tableEl) tableEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
