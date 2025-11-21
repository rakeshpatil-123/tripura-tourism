import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { ButtonModule } from 'primeng/button';
import { IlogiSelectComponent, SelectOption } from '../../customInputComponents/ilogi-select/ilogi-select.component';
import { LoaderService } from '../../_service/loader/loader.service';
import { GenericService } from '../../_service/generic/generic.service';
import Swal from 'sweetalert2';

interface CisRecord {
  dept?: string;
  year?: string;
  month?: string;
  total?: number;
  [k: string]: any;
}

@Component({
  selector: 'app-cis-summary',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IlogiSelectComponent,
    ButtonModule
  ],
  templateUrl: './cis-summary.component.html',
  styleUrls: ['./cis-summary.component.scss']
})
export class CisSummaryComponent implements OnInit, OnDestroy {
  filterForm: FormGroup;
  departments: SelectOption[] = [];
  data: CisRecord[] = [];
  tableColumns: string[] = [];
  pagedData: CisRecord[] = [];
  months = [
    { id: '01', name: 'January' },
    { id: '02', name: 'February' },
    { id: '03', name: 'March' },
    { id: '04', name: 'April' },
    { id: '05', name: 'May' },
    { id: '06', name: 'June' },
    { id: '07', name: 'July' },
    { id: '08', name: 'August' },
    { id: '09', name: 'September' },
    { id: '10', name: 'October' },
    { id: '11', name: 'November' },
    { id: '12', name: 'December' },
  ];

  years: { id: string; name: string }[] = [];
  page = 1;
  pageSize = 10;

  loading = false;
  subs = new Subscription();

  constructor(
    private fb: FormBuilder,
    private loaderService: LoaderService,
    private genericService: GenericService
  ) {
    const startYear = 2000;
    const endYear = 2030;
    for (let y = startYear; y <= endYear; y++) {
      this.years.push({ id: String(y), name: String(y) });
    }

    this.filterForm = this.fb.group({
      year: [''],
      month: [''],
      department: ['']
    });
  }

  ngOnInit(): void {
    this.subs.add(this.loadDepartments());
    this.applyPagination();
    this.search();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
  private loadDepartments() {
    this.loaderService.showLoader();
    return this.genericService.getAllDepartmentNames()
      .pipe(finalize(() => this.loaderService.hideLoader()))
      .subscribe({
        next: (res: any) => {
          const list =
            res?.data && Array.isArray(res.data)
              ? res.data
              : res?.data?.departments || [];

          if (Array.isArray(list) && list.length) {
            const opts = list.map((d: any) => ({
              id: d.id ? String(d.id) : d.department_code || d.name || '',
              name: d.name || d.department_name || d.department || d.name_of_enterprise || '',
            }));
            this.departments = [{ id: '', name: 'All Departments' }, ...opts];
          } else {
            this.departments = [{ id: '', name: 'All Departments' }];
          }
        },
        error: (err: any) => {
          console.error('Error loading departments', err);
          this.departments = [{ id: '', name: 'All Departments' }];
        }
      });
  }

  search(): void {
    this.filterForm.markAllAsTouched();

    const payload = {
      month: this.filterForm.value.month ? Number(this.filterForm.value.month) : null,
      year: this.filterForm.value.year ? Number(this.filterForm.value.year) : null
    };


    this.loaderService.showLoader();
    this.loading = true;

    const sub = this.genericService.getByConditions(payload, 'api/report/cis-summary-report')
      .pipe(
        finalize(() => {
          this.loaderService.hideLoader();
          this.loading = false;
        })
      )
      .subscribe({
        next: (res: any) => {
          if (res?.status === 0) {
            Swal.fire({
              title: 'Validation Error',
              html: `<strong>${res.message || 'Invalid request parameters.'}</strong>`,
              icon: 'warning',
              confirmButtonColor: '#003c5b',
              showClass: { popup: 'animate__animated animate__fadeInDown' },
              hideClass: { popup: 'animate__animated animate__fadeOutUp' }
            });

            this.data = [];
            this.applyPagination();
            return;
          }
          this.data = Array.isArray(res) ? res : (res?.data || []);

          if (!this.data.length) {
            Swal.fire({
              title: 'No Records Found',
              text: 'No CIS summary matched your filters.',
              icon: 'info',
              confirmButtonColor: '#003c5b',
              showClass: { popup: 'animate__animated animate__fadeIn' },
              hideClass: { popup: 'animate__animated animate__fadeOut' }
            });
          }

          this.page = 1;
          this.applyPagination();
        },

        error: (err: any) => {

          let message = 'Something went wrong. Please try again.';

          if (err?.error?.message) {
            message = err.error.message;
          }

          Swal.fire({
            title: 'Error Occurred!',
            html: `<strong>${message}</strong>`,
            icon: 'error',
            confirmButtonColor: '#d33',
            showClass: { popup: 'animate__animated animate__shakeX' },
            hideClass: { popup: 'animate__animated animate__fadeOut' }
          });

          this.data = [];
          this.applyPagination();
        }
      });

    this.subs.add(sub);
  }

  reset(): void {
    this.filterForm.reset({ year: '', month: '', department: '' });
    this.data = [];
    this.page = 1;
    this.applyPagination();
  }

  formatColumn(col: string): string {
    if (!col) return '';
    const map: { [key: string]: string } = {
      department_id: 'Department ID',
      department_name: 'Department Name',
      scheduled_inspections: 'Scheduled Inspections',
      inspections_conducted: 'Inspections Conducted',
      pending_inspections: 'Pending Inspections',
      self_certification_exempt_companies: 'Self Certification Exempt Companies',
      third_party_cert_exempt_companies: 'Third Party Cert Exempt Companies',
      reports_uploaded_within_48_hrs: 'Reports Uploaded Within 48 Hrs',
      reports_uploaded_beyond_48_hrs: 'Reports Uploaded Beyond 48 Hrs',
    };
    return map[col] ?? col.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }

  exportExcel(): void {
    if (!this.data?.length) {
      alert('No data to export!');
      return;
    }

    const headers = ['Department', 'Year', 'Month', 'Total'];
    const rows = this.data.map(d =>
      [
        (d.dept ?? '').toString().replace(/,/g, ' '),
        (d.year ?? '').toString(),
        (d.month ?? '').toString(),
        (d.total ?? '').toString()
      ].join(',')
    );
    const csv = `${headers.join(',')}\n${rows.join('\n')}`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `CIS_Summary_${this.filterForm.value.year || 'all'}_${this.filterForm.value.month || 'all'}.csv`;
    link.click();
    link.remove();
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil((this.data?.length || 0) / this.pageSize));
  }
  applyPagination(): any {
    const start = (this.page - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.pagedData = this.data.slice(start, end);
    if (this.data.length > 0) {
      this.tableColumns = Object.keys(this.data[0]);
    }
  }

  onPageChange(next: number): void {
    if (next < 1) return;
    const max = this.totalPages;
    if (next > max) return;
    this.page = next;
    this.applyPagination();
    const tableEl = document.querySelector('.data-table');
    if (tableEl) tableEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
