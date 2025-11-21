import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule, formatDate as ngFormatDate } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, FormsModule } from '@angular/forms';
import { finalize, Subscription } from 'rxjs';

import { ButtonModule } from 'primeng/button';
import { IlogiSelectComponent, SelectOption } from '../../customInputComponents/ilogi-select/ilogi-select.component';
import { IlogiInputDateComponent } from '../../customInputComponents/ilogi-input-date/ilogi-input-date.component';
import { LoaderService } from '../../_service/loader/loader.service';
import { GenericService } from '../../_service/generic/generic.service';

interface NocRecord {
  // keep generic fallback
  [key: string]: any;

  // explicit fields mapped from backend response
  department_id?: number;
  department_name?: string;

  // counts / metrics (numbers)
  received?: number;
  processed?: number;
  approved?: number;
  submitted_within_timelines?: number;
  submitted_timelines_lapsed?: number;
  clarification_stage?: number;
  rejected?: number;
  other_status?: number;
  queried_within_7_days?: number;
  queried_after_7_days?: number;
}


@Component({
  selector: 'app-nod-issue-status',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IlogiSelectComponent,
    IlogiInputDateComponent,
    ButtonModule,
    FormsModule,
  ],
  templateUrl: './nod-issue-status.component.html',
  styleUrls: ['./nod-issue-status.component.scss']
})
export class NodIssueStatusComponent implements OnInit, OnDestroy {

  filterForm: FormGroup;
  departments: SelectOption[] = [];
  data: NocRecord[] = [];
  pagedData: NocRecord[] = [];
  pageSizeOptions: number[] = [5, 10, 20, 50, 100];
  page = 1;
  pageSize = 10;

  loading = false;
  subs = new Subscription();

  constructor(
    private fb: FormBuilder,
    private loaderService: LoaderService,
    private genericService: GenericService
  ) {
    const today = new Date();
    const past12Months = new Date();
    past12Months.setFullYear(today.getFullYear() - 1);
    this.filterForm = this.fb.group({
      fromDate: [past12Months, Validators.required],
      toDate: [today, Validators.required],
      department: ['']
    }, { validators: this.dateRangeValidator.bind(this) });
  }

  ngOnInit(): void {
    this.subs.add(this.loadDepartments());
    this.applyPagination();
    this.search();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
  private dateRangeValidator(group: AbstractControl): ValidationErrors | null {
    const f = group.get('fromDate')?.value;
    const t = group.get('toDate')?.value;
    if (f && t) {
      const fd = new Date(f);
      const td = new Date(t);
      if (fd > td) {
        return { dateRangeInvalid: true };
      }
    }
    return null;
  }

  get fromDateControl() { return this.filterForm.get('fromDate'); }
  get toDateControl() { return this.filterForm.get('toDate'); }
  get formErrors() { return this.filterForm.errors; }

  get totalPages(): number {
    return Math.max(1, Math.ceil((this.data?.length || 0) / this.pageSize));
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
          this.departments = [{ id: '', name: 'All Departments' }];
        }
      });
  }

  onPageSizeChange(): void {
    this.page = 1;
    this.applyPagination();
  }
  search(): void {
    this.filterForm.markAllAsTouched();

    if (this.filterForm.invalid) {
      return;
    }

    const payload = {
      from_date: this.filterForm.value.fromDate ? this.formatDate(this.filterForm.value.fromDate) : null,
      to_date: this.filterForm.value.toDate ? this.formatDate(this.filterForm.value.toDate) : null,
      department_id: this.filterForm.value.department || null
    };

    this.loaderService.showLoader();
    this.loading = true;

    const sub = this.genericService
      .getByConditions(payload, 'api/report/department-approvals')
      .pipe(
        finalize(() => {
          this.loaderService.hideLoader();
          this.loading = false;
        })
      )
      .subscribe({
        next: (res: any) => {
          const raw = Array.isArray(res) ? res : (res?.data || []);
          this.data = raw.map((item: any) => ({
            department_id: item.department_id ?? null,
            department_name: item.department_name ?? item.dept ?? 'N/A',

            received: Number(item.received ?? 0),
            processed: Number(item.processed ?? 0),
            approved: Number(item.approved ?? 0),
            submitted_within_timelines: Number(item.submitted_within_timelines ?? 0),
            submitted_timelines_lapsed: Number(item.submitted_timelines_lapsed ?? 0),
            clarification_stage: Number(item.clarification_stage ?? 0),
            rejected: Number(item.rejected ?? 0),
            other_status: Number(item.other_status ?? 0),
            queried_within_7_days: Number(item.queried_within_7_days ?? 0),
            queried_after_7_days: Number(item.queried_after_7_days ?? 0),

            _raw: item
          }));

          this.page = 1;
          this.applyPagination();
        },

        error: (err: any) => {
          console.error('Error fetching NOC data', err);
          this.data = [];
          this.page = 1;
          this.applyPagination();
        }
      });

    this.subs.add(sub);
  }

  reset(): void {
    this.filterForm.reset({ fromDate: null, toDate: null, department: '' });
    this.data = [];
    this.page = 1;
    this.applyPagination();
  }
  exportExcel(): void {
    if (!this.data?.length) return;

    const payload = {
      from_date: this.filterForm.value.fromDate ? this.formatDate(this.filterForm.value.fromDate) : null,
      to_date: this.filterForm.value.toDate ? this.formatDate(this.filterForm.value.toDate) : null,
      department_id: this.filterForm.value.department || null
    };

    this.loaderService.showLoader();
    if (typeof this.genericService.getByConditions === 'function') {
      const sub = this.genericService.getByConditions(payload, 'api/report/noc-data/export')
        .pipe(finalize(() => this.loaderService.hideLoader()))
        .subscribe({
          next: (blob: Blob) => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `noc-issue-status-${this.formatDate(new Date())}.xlsx`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
          },
          error: (err: any) => {
            console.error('Export error', err);
            alert('Export failed');
          }
        });
      this.subs.add(sub);
      return;
    }
    const sub = this.genericService.getByConditions(payload, 'api/report/noc-data')
      .pipe(finalize(() => this.loaderService.hideLoader()))
      .subscribe({
        next: (res: any) => {
          alert('Export not implemented on client. Received ' + (Array.isArray(res) ? res.length : res?.data?.length || 0) + ' records.');
        },
        error: () => {
          alert('Export failed');
        }
      });
    this.subs.add(sub);
  }
  applyPagination(): void {
    const start = (this.page - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.pagedData = (this.data || []).slice(start, end);
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
  formatDate(d: any): string | null {
    if (!d) return null;
    try {
      return ngFormatDate(d, 'yyyy-MM-dd', 'en');
    } catch {
      const dt = new Date(d);
      return ngFormatDate(dt, 'yyyy-MM-dd', 'en');
    }
  }
}
