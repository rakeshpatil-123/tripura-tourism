import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription, of } from 'rxjs';
import { finalize, catchError, debounceTime } from 'rxjs/operators';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

import { GenericService } from '../../_service/generic/generic.service';
import { LoaderService } from '../../_service/loader/loader.service';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IlogiInputComponent } from '../../customInputComponents/ilogi-input/ilogi-input.component';
import { IlogiInputDateComponent } from '../../customInputComponents/ilogi-input-date/ilogi-input-date.component';

interface PaymentRecord {
  id: string | number;
  application_number: string;
  business: string;
  email_id?: string | null;
  mobile_no?: string | null;
  amount: number;
  expiry_date?: string | null;
  status?: string | null;
  method?: string | null;
  comments?: string | null;
  currency?: string;
  paidAt?: string | null;
}

@Component({
  selector: 'app-user-payment-list',
  templateUrl: './user-payment-list.component.html',
  styleUrls: ['./user-payment-list.component.scss'],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IlogiInputComponent, IlogiInputDateComponent]
})
export class UserPaymentListComponent implements OnInit, OnDestroy {

  private subs = new Subscription();
  allData: PaymentRecord[] = [];
  filteredData: PaymentRecord[] = [];
  displayedData: PaymentRecord[] = [];
  filterForm!: FormGroup;
  pageSize = 10;
  pageSizes = [5, 10, 20, 50];
  currentPage = 1;
  totalPages = 1;
  totalPagesArray: number[] = [];
  sortField = '';
  sortDir: 'asc' | 'desc' = 'asc';

  sortColumn: keyof PaymentRecord | '' = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  isLoading = false;
  isExporting = false;

  constructor(
    private genericService: GenericService,
    private loaderService: LoaderService,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {

    this.filterForm = this.fb.group({
      user_name: [''],
      mobile_min: [null],
      mobile_max: [null],
      fromDate: [null],
      toDate: [null],
      amountMin: [null],
      amountMax: [null],
      rows: [this.pageSize],
    });
    const formSub = this.filterForm.valueChanges
      .pipe(debounceTime(300))
      .subscribe(() => this.applyFilters());
    this.subs.add(formSub);
    const rowsSub = this.filterForm.get('rows')!.valueChanges.subscribe((val: number) => {
      if (val && !isNaN(val)) {
        this.pageSize = Number(val);
        this.updateDisplayedData();
      }
    });
    this.subs.add(rowsSub);
    this.loadUserPaymentList();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
  loadUserPaymentList(): void {
    this.isLoading = true;
    this.loaderService.showLoader();

    const subs = this.genericService
      .getByConditions({}, 'api/admin/get-all-applications-list')
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.loaderService.hideLoader();
        }),
        catchError(err => {
          console.error('API fetch failed', err);
          return of({ data: [] });
        })
      )
      .subscribe((res: any) => {
        this.allData = (res && res.data) ? res.data.map((d: any) => this.normalizeRecord(d)) : [];
        this.applyFilters();
      });

    this.subs.add(subs);
  }
  toggleSort(column: string) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column as any;
      this.sortDirection = 'asc';
    }
    this.sortField = String(this.sortColumn);
    this.sortDir = this.sortDirection;
    this.applySort();
    this.currentPage = 1;
    this.updateDisplayedData();
  }

  private normalizeRecord(raw: any): PaymentRecord {
    const id = raw.id ?? raw._id ?? `id-${Math.random().toString(36).slice(2)}`;

    const application_number = String(raw.application_number ?? '');
    const business = String(raw.business ?? raw.businessName ?? '—');
    const email_id = raw.email_id ?? raw.email ?? null;
    const mobile_no = raw.mobile_no ?? raw.mobileNo ?? raw.mobile ?? null;
    const amt = Number(raw.amount ?? 0);
    const amount = Number.isFinite(amt) ? amt : 0;

    const expiry_date = raw.expiry_date ?? null;
    const status = raw.status ? String(raw.status).trim().toLowerCase().replace(/^\w/, c => c.toUpperCase()) : 'Pending';
    const method = raw.method ?? null;
    const comments = raw.comments ?? null;

    return {
      id,
      application_number,
      business,
      email_id,
      mobile_no,
      amount,
      expiry_date,
      status,
      method,
      comments,
      currency: raw.currency ?? 'INR',
      paidAt: raw.paidAt ?? null
    };
  }


  applyFilters(): void {
    const fv = this.filterForm?.value || {};
    const term = (fv.user_name || '').toString().trim().toLowerCase();
    const name = (fv.user_name || '').toString().trim().toLowerCase();
    const parseDateString = (s: any): Date | null => {
      if (!s) return null;
      const iso = new Date(s);
      if (!isNaN(iso.getTime())) return iso;
      if (typeof s === 'string' && /^\d{2}\-\d{2}\-\d{4}$/.test(s)) {
        const [dd, mm, yyyy] = s.split('-').map(x => parseInt(x, 10));
        return new Date(yyyy, mm - 1, dd);
      }
      return null;
    };

    const from = parseDateString(fv.fromDate);
    const to = parseDateString(fv.toDate);
    const amtMin = fv.amountMin != null && fv.amountMin !== '' ? Number(fv.amountMin) : null;
    const amtMax = fv.amountMax != null && fv.amountMax !== '' ? Number(fv.amountMax) : null;
    const mobileMin = fv.mobile_min != null && fv.mobile_min !== '' ? Number(fv.mobile_min) : null;
    const mobileMax = fv.mobile_max != null && fv.mobile_max !== '' ? Number(fv.mobile_max) : null;
    const onlyDigits = (phone?: string) => (phone ? phone.replace(/\D/g, '') : '');

    this.filteredData = this.allData.filter(r => {
      let ok = true;
      if (term) {
        const appNo = (r.application_number ?? '').toString().toLowerCase();
        const biz = (r.business ?? '').toString().toLowerCase();
        const email = (r.email_id ?? '').toString().toLowerCase();
        const mobile = (r.mobile_no ?? '').toString().toLowerCase();

        ok = ok && (appNo.includes(term) || biz.includes(term) || email.includes(term) || mobile.includes(term));
      }

      if (from) {
        const d = r.expiry_date ? new Date(r.expiry_date) : null;
        if (d) ok = ok && d >= from;
      }
      if (to) {
        const d = r.expiry_date ? new Date(r.expiry_date) : null;
        if (d) ok = ok && d <= to;
      }
      if (amtMin !== null && !Number.isNaN(amtMin)) {
        ok = ok && (Number(r.amount) >= amtMin);
      }
      if (amtMax !== null && !Number.isNaN(amtMax)) {
        ok = ok && (Number(r.amount) <= amtMax);
      }
      if ((mobileMin !== null && !Number.isNaN(mobileMin)) || (mobileMax !== null && !Number.isNaN(mobileMax))) {
        const digits = onlyDigits(r.mobile_no ?? '');
        if (!digits) return false;
        const numeric = Number(digits);
        if (mobileMin !== null && !Number.isNaN(mobileMin)) ok = ok && numeric >= mobileMin;
        if (mobileMax !== null && !Number.isNaN(mobileMax)) ok = ok && numeric <= mobileMax;
      }

      return ok;
    });

    if (this.sortColumn) {
      this.applySort();
    }
    this.currentPage = 1;
    this.updateDisplayedData();
  }
  toNumber(val: any): number {
    return Number(val);
  }
  formatCurrency(amount: number, currency = 'INR') {
    try {
      return new Intl.NumberFormat('en-IN', { style: 'currency', currency }).format(amount);
    } catch {
      return `${currency} ${amount.toFixed(2)}`;
    }
  }
  applySort(): void {
    if (!this.sortColumn) return;
    const col = this.sortColumn;
    this.filteredData.sort((a, b) => {
      const va = (a as any)[col];
      const vb = (b as any)[col];
      if (va == null && vb == null) return 0;
      if (va == null) return this.sortDirection === 'asc' ? -1 : 1;
      if (vb == null) return this.sortDirection === 'asc' ? 1 : -1;
      if (typeof va === 'number' && typeof vb === 'number') {
        return this.sortDirection === 'asc' ? va - vb : vb - va;
      }
      const dateA = Date.parse(va);
      const dateB = Date.parse(vb);
      if (!isNaN(dateA) && !isNaN(dateB)) {
        return this.sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
      }
      return this.sortDirection === 'asc'
        ? String(va).localeCompare(String(vb))
        : String(vb).localeCompare(String(va));
    });
  }
  updateDisplayedData(): void {
    this.totalPages = Math.max(1, Math.ceil(this.filteredData.length / this.pageSize));
    this.totalPagesArray = Array.from({ length: this.totalPages }, (_, i) => i + 1);
    if (this.currentPage > this.totalPages) {
      this.currentPage = 1;
    }

    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;

    this.displayedData = this.filteredData.slice(startIndex, endIndex);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updateDisplayedData();
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updateDisplayedData();
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updateDisplayedData();
    }
  }
  changePageSize(size: number) {
    this.pageSize = size;
    this.currentPage = 1;
    this.updateDisplayedData();
  }
  refreshList() {
    this.loadUserPaymentList();
  }
  markAsPaid(record: PaymentRecord) {
    if (!record) return;
    const statusNormalized = (record.status || '').toString().toLowerCase();
    if (statusNormalized === 'paid') {
      Swal.fire({
        icon: 'info',
        title: 'Already Paid',
        text: `${record.business || '—'} - Application ${record.application_number} is already marked as paid.`,
        timer: 2200,
        showConfirmButton: false
      });
      return;
    }
    Swal.fire({
      title: `Mark application ${record.application_number} as paid?`,
      html: `
  <div class="swal-form-wrapper">

      <div class="swal-info fadeSlideIn">
        <p><strong>Business:</strong> ${record.business || '—'}</p>
        <p><strong>Application:</strong> ${record.application_number}</p>
        <p><strong>Amount:</strong> <span class="amount">₹ ${Number(record.amount || 0).toFixed(2)}</span></p>
      </div>

      <hr class="swal-divider" />

      <div class="swal-field fadeSlideIn">
        <label for="swal-grn" class="swal-label">GRN Number <span class="required">*</span></label>
        <input id="swal-grn" class="swal2-input swal-input" placeholder="Enter GRN number (required)" />
      </div>

      <div class="swal-field fadeSlideIn">
        <label for="swal-remark" class="swal-label">Remarks</label>
        <textarea 
          id="swal-remark" 
          class="swal2-textarea swal-textarea" 
          placeholder="Enter remark/remarks (optional)">
        </textarea>
      </div>

  </div>

  <style>
      .swal-form-wrapper {
        width: 100%;
        max-width: 420px;
        margin: 0 auto;
        text-align: center;
        animation: fadeIn 0.45s ease;
      }

      .swal-info p {
        margin: 6px 0;
        font-size: 14px;
        color: #263238;
        text-align: center;
      }

      .amount {
        font-weight: 700;
        color: #003c5b;
      }

      .swal-divider {
        margin: 14px auto;
        width: 85%;
        border: 0;
        border-top: 1px solid #e6eef6;
      }

      .swal-field {
        margin: 12px auto;
        text-align: center;
        width: 100%;
      }

      .swal-label {
        font-weight: 600;
        margin-bottom: 6px;
        display: block;
        text-align: center !important;
        color: #003c5b;
      }

      .required {
        color: #d32f2f;
      }

      .swal-input,
      .swal-textarea {
        width: 100% !important;
        max-width: 100%;
        box-sizing: border-box;
        margin: 0 auto;
      }

      .swal-textarea {
        min-height: 90px !important;
        resize: vertical;
      }

      /* Smooth fade + slide animation */
      .fadeSlideIn {
        animation: fadeSlide 0.5s ease both;
      }

      @keyframes fadeSlide {
        0% { opacity: 0; transform: translateY(8px); }
        100% { opacity: 1; transform: translateY(0); }
      }

      @keyframes fadeIn {
        0% { opacity: 0; }
        100% { opacity: 1; }
      }

      @media (max-width: 480px) {
        .swal-form-wrapper {
          max-width: 100%;
          padding: 0 4px;
        }
      }
  </style>
`,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Mark Paid',
      cancelButtonText: 'Cancel',
      showLoaderOnConfirm: true,
      customClass: {
        popup: 'swal-custom-popup',
        title: 'swal-custom-title'
      },
      willOpen: () => {
        const grnEl = (document.getElementById('swal-grn') as HTMLInputElement | null);
        if (grnEl) grnEl.focus();
      },
      preConfirm: () => {
        const grnEl = (document.getElementById('swal-grn') as HTMLInputElement | null);
        const remarkEl = (document.getElementById('swal-remark') as HTMLTextAreaElement | null);
        const grn = grnEl ? (grnEl.value || '').toString().trim() : '';
        const remark = remarkEl ? remarkEl.value.trim() : '';
        if (!grn) {
          Swal.showValidationMessage('GRN number is required.');
          return;
        }
        return { grn, remark };
      }
    }).then((result) => {
      if (!result.isConfirmed || !result.value) return;

      const { grn, remark } = result.value as { grn: string; remark: string };

      this.isLoading = true;
      this.loaderService.showLoader();

      const payload = {
        application_id: record.id,
        GRN_number: grn,
        comments: remark || 'paid by admin'
      };

      const subs = this.genericService.getByConditions(payload, 'api/admin/mark-application-paid')
        .pipe(finalize(() => {
          this.isLoading = false;
          this.loaderService.hideLoader();
        }), catchError(err => {
          console.error('mark-payment-paid failed', err);
          Swal.fire({
            icon: 'error',
            title: 'Mark as Paid failed',
            html: `<div style="text-align:left">Could not mark application as paid. Please try again.<br/><small style="color:#64748b">${err?.message || ''}</small></div>`,
            confirmButtonText: 'OK',
            customClass: { popup: 'swal-error-popup' }
          });
          return of({ success: false });
        }))
        .subscribe((apiRes: any) => {
          const ok = apiRes && (apiRes.success === true || apiRes.status === 1 || apiRes?.message?.toLowerCase?.().includes('success'));
          if (!ok && apiRes && apiRes.success === false) {
            Swal.fire({
              icon: 'error',
              title: 'Failed',
              text: apiRes.message || 'Could not mark as paid. Try again.'
            });
            return;
          }
          record.status = 'Paid';
          record.paidAt = new Date().toISOString();
          record.comments = (record.comments ? record.comments + ' | ' : '') + `GRN:${grn}${remark ? ' | ' + remark : ''}`;
          Swal.fire({
            icon: 'success',
            title: 'Marked Paid',
            html: `<div style="text-align:left">
                   <p><strong>Application:</strong> ${record.application_number}</p>
                   <p><strong>GRN:</strong> ${grn}</p>
                   <p><strong>Amount:</strong> <span style="font-weight:600">₹ ${Number(record.amount || 0).toFixed(2)}</span></p>
                 </div>`,
            showConfirmButton: true,
            confirmButtonText: 'OK',
            backdrop: true,
            customClass: { popup: 'swal-success-popup' },
            showCloseButton: false,
          }).then(() => {
            this.loadUserPaymentList();
          });
          this.applyFilters();
        });

      this.subs.add(subs);
    });
  }
  exportToExcel(useFiltered = true) {
    this.isExporting = true;
    try {
      const dataToExport = (useFiltered ? this.filteredData : this.allData).map((r: any) => ({
        'Application No': r.application_number,
        'Business': r.business,
        'Email': r.email_id || '',
        'Phone': r.mobile_no || '',
        'Amount': Number(r.amount || 0),
        'Expiry Date': r.expiry_date ? new Date(r.expiry_date).toLocaleDateString() : '',
          'Status': r.status || '',
          'Method': r.method || '',
        'Comments': r.comments || ''
      }));

      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Payments');

      const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([wbout], { type: 'application/octet-stream' });
      saveAs(blob, `payments_export_${new Date().toISOString().slice(0, 10)}.xlsx`);
    } catch (e) {
      console.error('Export failed', e);
      Swal.fire({ icon: 'error', title: 'Export failed', text: 'Could not export to Excel.' });
    } finally {
      this.isExporting = false;
    }
  }
  public statusClass(status?: string | null): string {
    const s = (status ?? '').toString().trim().toLowerCase();
    switch (s) {
      case 'paid': return 'pill-paid';
      case 'pending': return 'pill-pending';
      case 'overdue': return 'pill-overdue';
      case 'rejected': return 'pill-rejected';
      case 'approved': return 'pill-approved';
      default: return 'pill-default';
    }
  }
  public isPaid(status?: string | null): boolean {
    return (status ?? '').toString().trim().toLowerCase() === 'paid';
  }
}
