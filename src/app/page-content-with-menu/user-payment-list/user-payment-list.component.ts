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
import { IlogiSelectComponent, SelectOption } from '../../customInputComponents/ilogi-select/ilogi-select.component';
import { HttpResponse } from '@angular/common/http';

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
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IlogiInputComponent, IlogiInputDateComponent, IlogiSelectComponent]
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
  totalRecords = 0;
  totalPagesArray: number[] = [];
  visiblePages: number[] = [];
  private readonly PAGE_BUTTON_WINDOW = 10; 
  sortField = '';
  sortDir: 'asc' | 'desc' = 'asc';
  paymentStatus : SelectOption[] = [
    {id: '', name: 'All'},
    {id: 'paid', name: 'Paid'},
    {id: 'pending', name: 'Pending'}
  ];
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
      mobile_no: [''],
      grn_number: [''],
      fromDate: [null],
      toDate: [null],
      amountMin: [null],
      amountMax: [null],
      status: [''],
      rows: [this.pageSize],
    });
    const formSub = this.filterForm.valueChanges
      .pipe(debounceTime(400))
      .subscribe(() => {
       this.loadUserPaymentList(1);
  });
this.subs.add(formSub);
const rowsSub = this.filterForm.get('rows')!.valueChanges.subscribe((val: number) => {
  const newRows = (val && !isNaN(val)) ? Number(val) : this.pageSize;
  this.pageSize = newRows;
  this.loadUserPaymentList(1);
});
this.subs.add(rowsSub);
    this.loadUserPaymentList();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
  loadUserPaymentList(page: number = 1): void {
    this.isLoading = true;
    this.loaderService.showLoader();
    const formatToISODate = (d: any): string | null => {
      if (!d) return null;
      if (d instanceof Date && !isNaN(d.getTime())) {
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
      }
      if (typeof d === 'string' && /^\d{2}\-\d{2}\-\d{4}$/.test(d)) {
        const [dd, mm, yyyy] = d.split('-');
        return `${yyyy}-${mm}-${dd}`;
      }
      const parsed = new Date(d);
      return !isNaN(parsed.getTime()) ? parsed.toISOString().slice(0, 10) : null;
    };
    const fv = this.filterForm?.value || {};
    const payload: any = {
      page: page,
      per_page: Number(fv.rows) || this.pageSize
    };

    if (fv.user_name) {
      payload.search = fv.user_name;
      if (typeof fv.user_name === 'string' && /\S+@\S+\.\S+/.test(fv.user_name)) {
        payload.email_id = fv.user_name;
      }
    }
    if (fv.email_id) payload.email_id = fv.email_id;
    if (fv.amountMin !== null && fv.amountMin !== '') payload.min_amount = fv.amountMin;
    if (fv.amountMax !== null && fv.amountMax !== '') payload.max_amount = fv.amountMax;

    const fromIso = formatToISODate(fv.fromDate);
    const toIso = formatToISODate(fv.toDate);
    if (fromIso) payload.from_date = fromIso;
    if (toIso) payload.to_date = toIso;

    if (fv.grn_number) payload.GRN_number = fv.grn_number;
    if (fv.mobile_no) payload.mobile_no = fv.mobile_no;
    if (fv.status !== null && fv.status !== undefined && String(fv.status).trim() !== '') {
      payload.status = String(fv.status).trim().toLowerCase();
    }

    const subs = this.genericService
      .getByConditions(payload, 'api/admin/get-all-applications-list')
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.loaderService.hideLoader();
        }),
        catchError(err => {
          console.error('API fetch failed', err);
          return of({ data: [], pagination: { current_page: 1, last_page: 1, per_page: this.pageSize, total: 0 } });
        })
      )
      .subscribe((res: any) => {
        const dataArray = (res && res.data) ? res.data : [];
        this.allData = dataArray.map((d: any) => this.normalizeRecord(d));
        this.filteredData = this.allData.slice();
        this.displayedData = this.allData.slice();
        const pag = res && res.pagination ? res.pagination : null;

  if (pag) {
  this.currentPage = Number(pag.current_page) || page || 1;
  this.pageSize = Number(pag.per_page) || this.pageSize || 10;
  this.totalPages = Math.max(1, Number(pag.last_page) || 1);

  const last = Number(pag.last_page) || 1;
  this.totalPagesArray = Array.from({ length: last }, (_, i) => i + 1);

  this.totalRecords = Number(pag.total) || dataArray.length || 0;
} else {
  this.currentPage = page;
  this.totalPages = Math.max(
    1,
    Math.ceil((this.filteredData.length || 0) / (this.pageSize || 10))
  );
  this.totalPagesArray = Array.from(
    { length: this.totalPages },
    (_, i) => i + 1
  );
  this.totalRecords = this.filteredData.length || 0;
}
this.computeVisiblePages();

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
async exportToExcel(useFiltered = true) {
  const confirm = await Swal.fire({
    title: 'Are you sure?',
    text: 'Do you want to download the Excel file?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Yes, Download',
    cancelButtonText: 'Cancel',
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    background: '#fff',
    heightAuto: false,
    showClass: { popup: 'animate__animated animate__zoomIn' },
    hideClass: { popup: 'animate__animated animate__zoomOut' }
  });

  if (!confirm.isConfirmed) return;
  this.isExporting = true;
  this.loaderService.showLoader();

  const swalAnim = {
    showClass: { popup: 'animate__animated animate__zoomIn' },
    hideClass: { popup: 'animate__animated animate__zoomOut' }
  };

  try {
    const fv = this.filterForm?.value || {};
    const isEmailLike = (s: string) =>
      typeof s === 'string' && /\S+@\S+\.\S+/.test(s);

    const formatToISODate = (d: any): string | null => {
      if (!d) return null;
      if (d instanceof Date && !isNaN(d.getTime())) {
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
      }
      if (typeof d === 'string' && /^\d{2}\-\d{2}\-\d{4}$/.test(d)) {
        const [dd, mm, yyyy] = d.split('-');
        return `${yyyy}-${mm}-${dd}`;
      }
      const parsed = new Date(d);
      return !isNaN(parsed.getTime()) ? parsed.toISOString().slice(0, 10) : null;
    };

    const base64ToBlob = (b64: string, mime = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') => {
      const stripped = b64.replace(/^data:.*;base64,/, '');
      const byteChars = atob(stripped);
      const byteNumbers = new Array(byteChars.length);
      for (let i = 0; i < byteChars.length; i++) {
        byteNumbers[i] = byteChars.charCodeAt(i);
      }
      return new Blob([new Uint8Array(byteNumbers)], { type: mime });
    };

    const isBlobLike = (x: any) =>
      (typeof Blob !== 'undefined' && x instanceof Blob) ||
      (x && typeof x === 'object' && 'size' in x && 'type' in x);

    const findBase64 = (obj: any): string | null => {
      if (!obj || typeof obj !== 'object') return null;
      for (const k of Object.keys(obj)) {
        const v = obj[k];
        if (typeof v === 'string' && /^data:.*;base64,/.test(v)) return v;
        if (typeof v === 'string' && /^[A-Za-z0-9+/=\s]+$/.test(v) && v.length > 200) return v;
        if (typeof v === 'object') {
          const nested = findBase64(v);
          if (nested) return nested;
        }
      }
      return null;
    };
    const params: any = {};
    if (fv.user_name) {
      params.name_of_enterprise = fv.user_name;
      params.search = fv.user_name;
      if (isEmailLike(fv.user_name)) params.email_id = fv.user_name;
    }
    if (fv.email_id) params.email_id = fv.email_id;
    if (fv.amountMin !== null && fv.amountMin !== '') params.min_amount = fv.amountMin;
    if (fv.amountMax !== null && fv.amountMax !== '') params.max_amount = fv.amountMax;

    const fromIso = formatToISODate(fv.fromDate);
    const toIso = formatToISODate(fv.toDate);
    if (fromIso) params.from_date = fromIso;
    if (toIso) params.to_date = toIso;

    if (fv.GRN_number) params.GRN_number = fv.GRN_number;
    if (fv.grn_number) params.GRN_number = fv.grn_number;
    if (fv.mobile_no) params.mobile_no = fv.mobile_no;

    if (fv.status !== null && fv.status !== undefined && String(fv.status).trim() !== '') {
      params.status = String(fv.status).trim().toLowerCase();
    }
    const esc = encodeURIComponent;
    const query = Object.keys(params)
      .filter(k => params[k] !== '' && params[k] !== null && params[k] !== undefined)
      .map(k => `${esc(k)}=${esc(String(params[k]))}`)
      .join('&');

    const endpoint = useFiltered
      ? `api/admin/applications/export-filtered${query ? `?${query}` : ''}`
       : `api/admin/applications/export-full`;
    const subs = this.genericService.exportApplicationsAsBlob(endpoint, {})
      .pipe(
        finalize(() => {
          this.isExporting = false;
          this.loaderService.hideLoader();
        }),
        catchError(err => {
          throw err;
        })
      )
      .subscribe({
        next: async (resp: HttpResponse<Blob>) => {
          try {
            const filenameFromResp = resp.headers?.get('content-disposition') || '';
            let filename = `services_export_${new Date().toISOString().slice(0, 10)}.xlsx`;
            const m = filenameFromResp.match(/filename\*?=([^;]+)/i);
            if (m && m[1]) {
              filename = decodeURIComponent((m[1] || '').replace(/['"]/g, '').trim());
            } else if ((resp as any)?.bodyFileName) {
              filename = (resp as any).bodyFileName;
            }

            const bodyBlob = resp.body;

            const mime = bodyBlob?.type || '';
            const isExcelMime = /excel|spreadsheet|vnd.openxmlformats-officedocument|vnd.ms-excel|application\/octet-stream/i.test(mime);

            if (bodyBlob && bodyBlob.size > 0 && isExcelMime) {
              const urlObj = URL.createObjectURL(bodyBlob);
              const a = document.createElement('a');
              a.href = urlObj;
              a.download = filename;
              document.body.appendChild(a);
              a.click();
              a.remove();
              URL.revokeObjectURL(urlObj);

              await Swal.fire({
                icon: 'success',
                title: 'Exported!',
                html: `Your Excel file <strong>${filename}</strong> has been downloaded successfully.`,
                ...swalAnim,
                timer: 1400,
                showConfirmButton: false
              });
              return;
            }
            const contentTypeHeader = resp.headers.get('content-type') || '';
            if (bodyBlob && bodyBlob.size > 0 && contentTypeHeader.includes('application/json')) {
              const txt = await bodyBlob.text();
              let parsed: any = null;
              try {
                parsed = JSON.parse(txt);
              } catch (e) {
              }

              const url = parsed?.downloadUrl || parsed?.fileUrl || parsed?.url || parsed?.data?.downloadUrl || parsed?.data?.fileUrl;
              const base64 =
                parsed?.fileBase64 ||
                parsed?.base64 ||
                parsed?.data?.fileBase64 ||
                parsed?.data?.base64 ||
                null;

              if (url) {
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                a.remove();
                await Swal.fire({ icon: 'success', title: 'Downloaded!', html: `Your file <strong>${filename}</strong> has been downloaded.`, timer: 1400, showConfirmButton: false, ...swalAnim });
                return;
              }

              if (base64) {
                const b = base64ToBlob(base64);
                if (b.size > 0) {
                  const urlObj = URL.createObjectURL(b);
                  const a = document.createElement('a');
                  a.href = urlObj;
                  a.download = filename;
                  document.body.appendChild(a);
                  a.click();
                  a.remove();
                  URL.revokeObjectURL(urlObj);
                  await Swal.fire({ icon: 'success', title: 'Downloaded!', html: `Your file <strong>${filename}</strong> has been downloaded.`, timer: 1400, showConfirmButton: false, ...swalAnim });
                  return;
                }
              }

              if (parsed?.message) {
                await Swal.fire({ icon: 'info', title: 'Info', text: parsed.message, ...swalAnim });
                return;
              }

              await Swal.fire({ icon: 'info', title: 'No Data', text: 'The server did not return a downloadable file.', ...swalAnim });
              return;
            }

            if (!bodyBlob || bodyBlob.size === 0) {
              await Swal.fire({ icon: 'info', title: 'No Data', text: 'No records available for export.', ...swalAnim });
              return;
            }
            try {
              const txt = await bodyBlob.text();
              const maybeBase64 = findBase64({ data: txt }) || (typeof txt === 'string' && /^[A-Za-z0-9+/=\s]+$/.test(txt) && txt.length > 200 ? txt : null);
              if (maybeBase64) {
                const blobFromBase64 = base64ToBlob(maybeBase64);
                if (blobFromBase64.size > 0) {
                  const urlObj = URL.createObjectURL(blobFromBase64);
                  const a = document.createElement('a');
                  a.href = urlObj;
                  a.download = filename;
                  document.body.appendChild(a);
                  a.click();
                  a.remove();
                  URL.revokeObjectURL(urlObj);
                  await Swal.fire({ icon: 'success', title: 'Downloaded!', html: `Your file <strong>${filename}</strong> has been downloaded.`, timer: 1400, showConfirmButton: false, ...swalAnim });
                  return;
                }
              }
            } catch (e) {
              // ignore parsing fallback
            }

            await Swal.fire({ icon: 'info', title: 'No Data', text: 'The server did not return a downloadable file.', ...swalAnim });
          } catch (e) {
            console.error('Export download handling failed', e);
            await Swal.fire({ icon: 'error', title: 'Export failed', text: 'Could not download the export file.', ...swalAnim });
          }
        },
        error: async (err: any) => {
          console.error('Export API failed', err);
          await Swal.fire({
            icon: 'error',
            title: 'Export failed',
            html: `<div style="text-align:left">Failed to export data. Please try again.<br/><small style="color:#64748b">${err?.message || ''}</small></div>`,
            ...swalAnim
          });
        }
      });

    this.subs.add(subs);

  } catch (e) {
    console.error('Export failed', e);
    await Swal.fire({
      icon: 'error',
      title: 'Export failed',
      text: 'Could not export to Excel.',
      ...swalAnim
    });
    this.isExporting = false;
    this.loaderService.hideLoader();
  }
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

    const statusFilter = (fv.status !== null && fv.status !== undefined && String(fv.status).trim() !== '')
      ? String(fv.status).toString().trim().toLowerCase()
      : null;
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
      if (statusFilter) {
        const recStatus = (r.status ?? '').toString().trim().toLowerCase();
        ok = ok && recStatus === statusFilter;
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
    this.loadUserPaymentList(page);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
        this.loadUserPaymentList(this.currentPage + 1);
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.loadUserPaymentList(this.currentPage - 1);
    }
  }
  changePageSize(size: number) {
    this.pageSize = size;
    if (this.filterForm && this.filterForm.get('rows')) {
      this.filterForm.get('rows')!.setValue(size, { emitEvent: false });
    }
    this.loadUserPaymentList(1);
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
  private computeVisiblePages(): void {
    const total = Math.max(1, Number(this.totalPages || 1));
    const maxButtons = Math.max(1, this.PAGE_BUTTON_WINDOW);

    if (total <= maxButtons) {
      this.visiblePages = Array.from({ length: total }, (_, i) => i + 1);
      return;
    }
    const half = Math.floor(maxButtons / 2);
    let start = Math.max(1, this.currentPage - half);
    let end = start + maxButtons - 1;

    if (end > total) {
      end = total;
      start = Math.max(1, end - maxButtons + 1);
    }

    this.visiblePages = Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }
}
