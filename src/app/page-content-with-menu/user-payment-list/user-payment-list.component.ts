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
  id: string;
  userName: string;
  businessName: string;
  email?: string;
  phone?: string;
  invoiceId?: string;
  amount: number;
  currency?: string;
  dueDate?: string;
  createdAt?: string;
  status?: 'Pending' | 'Paid' | 'Overdue';
  paymentMethod?: string;
  notes?: string;
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
      .getByConditions({}, 'get-user-payment-list')
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.loaderService.hideLoader();
        }),
        catchError(err => {
          console.error('API fetch failed, using dummy data', err);
          return of({ data: this.getDummyData() });
        })
      )
      .subscribe((res: any) => {
        this.allData = (res && res.data) ? res.data.map((d: any) => this.normalizeRecord(d)) : [];
        this.applyFilters();
      });

    this.subs.add(subs);
  }
  toggleSort(field: keyof PaymentRecord) {
    if (this.sortColumn === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = field;
      this.sortDirection = 'asc';
    }
    this.sortField = String(this.sortColumn);
    this.sortDir = this.sortDirection;
    this.applySort();
    this.currentPage = 1;
    this.updateDisplayedData();
  }

  private normalizeRecord(raw: any): PaymentRecord {
    return {
      id: raw.id ?? raw._id ?? 'id-' + Math.random().toString(36).slice(2),
      userName: raw.userName ?? raw.name ?? (raw.user?.name ?? 'Unknown User'),
      businessName: raw.businessName ?? raw.company ?? (raw.user?.company ?? '—'),
      email: raw.email ?? raw.user?.email ?? '',
      phone: raw.phone ?? raw.user?.phone ?? '',
      invoiceId: raw.invoiceId ?? raw.invoice ?? ('INV-' + Math.floor(Math.random() * 900000 + 100000)),
      amount: Number(raw.amount ?? raw.total ?? 0),
      currency: raw.currency ?? 'INR',
      dueDate: raw.dueDate ?? raw.due_at ?? raw.due ?? new Date().toISOString(),
      createdAt: raw.createdAt ?? raw.created_at ?? new Date().toISOString(),
      status: raw.status ?? 'Pending',
      paymentMethod: raw.paymentMethod ?? raw.method ?? 'Bank Transfer',
      notes: raw.notes ?? '',
      paidAt: raw.paidAt ?? null
    };
  }

  private getDummyData(): PaymentRecord[] {
    const now = new Date();
    const d = (i: number) => new Date(now.getTime() - i * 86400000).toISOString();

    return [
      {
        id: '1',
        userName: 'Acme Corp',
        businessName: 'Acme Corporation',
        email: 'billing@acme.com',
        phone: '555-1001',
        invoiceId: 'INV-1001',
        amount: 1200.0,
        currency: 'INR',
        dueDate: d(2),
        createdAt: d(10),
        status: 'Pending',
        paymentMethod: 'Wire',
        notes: 'Quarterly invoice'
      },
      {
        id: '2',
        userName: 'Beta LLC',
        businessName: 'Beta LLC',
        email: 'pay@beta.com',
        phone: '555-1002',
        invoiceId: 'INV-1002',
        amount: 450.5,
        currency: 'INR',
        dueDate: d(5),
        createdAt: d(15),
        status: 'Overdue',
        paymentMethod: 'Credit Card',
        notes: 'Late fee applied'
      },
      {
        id: '3',
        userName: 'Gamma Traders',
        businessName: 'Gamma Traders',
        email: 'finance@gamma.com',
        phone: '555-1003',
        invoiceId: 'INV-1003',
        amount: 200.0,
        currency: 'INR',
        dueDate: d(0),
        createdAt: d(7),
        status: 'Paid',
        paymentMethod: 'PayPal',
        notes: '',
        paidAt: d(0)
      },
      ...Array.from({ length: 32 }).map(
        (_, i): PaymentRecord => ({
          id: `d${i + 4}`,
          userName: `rakesh ${i + 4}`,
          businessName: `rakesh enterprise ${i + 4} Ltd.`,
          email: `businessuser${i + 4}@gmail.com`,
          phone: `+91-555-${1000 + i}`,
          invoiceId: `INV-${1100 + i}`,
          amount: Math.round((100 + Math.random() * 900) * 100) / 100,
          currency: 'INR',
          dueDate: new Date(Date.now() + (i - 10) * 86400000).toISOString(),
          createdAt: new Date(Date.now() - (i + 5) * 86400000).toISOString(),
          status:
            i % 7 === 0
              ? 'Paid'
              : i % 5 === 0
                ? 'Overdue'
                : 'Pending',

          paymentMethod: ['Wire', 'Credit Card', 'PayPal'][i % 3],
          notes: i % 6 === 0 ? 'Priority customer' : ''
        })
      )
    ];
  }

  applyFilters(): void {
    const fv = this.filterForm?.value || {};
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

      if (name) {
        ok = ok && (
          (r.userName || '').toLowerCase().includes(name) ||
          (r.businessName || '').toLowerCase().includes(name) ||
          (r.email || '').toLowerCase().includes(name) ||
          (r.invoiceId || '').toLowerCase().includes(name)
        );
      }

      if (from) {
        const due = r.dueDate ? new Date(r.dueDate) : null;
        if (due) ok = ok && due >= from;
      }
      if (to) {
        const due = r.dueDate ? new Date(r.dueDate) : null;
        if (due) ok = ok && due <= to;
      }

      if (amtMin !== null && !Number.isNaN(amtMin)) {
        ok = ok && r.amount >= amtMin;
      }
      if (amtMax !== null && !Number.isNaN(amtMax)) {
        ok = ok && r.amount <= amtMax;
      }
      if ((mobileMin !== null && !Number.isNaN(mobileMin)) || (mobileMax !== null && !Number.isNaN(mobileMax))) {
        const digits = onlyDigits(r.phone);
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

    if (record.status === 'Paid') {
      Swal.fire({
        icon: 'info',
        title: 'Already Paid',
        text: `${record.userName} - Invoice ${record.invoiceId} is already marked as paid.`,
        timer: 2200,
        showConfirmButton: false
      });
      return;
    }
    Swal.fire({
      title: `Mark invoice ${record.invoiceId} as paid?`,
      html:
        `<div style="text-align:left">
          <p>Client: <strong>${record.userName}</strong></p>
          <p>Invoice: <strong>${record.invoiceId}</strong></p>
          <p>Outstanding amount: <strong>${record.currency || 'INR'} ${record.amount.toFixed(2)}</strong></p>
        </div>`,
      input: 'number',
      inputLabel: 'Enter amount received',
      inputValue: record.amount,
      inputAttributes: {
        min: '0',
        step: '0.01'
      },
      showCancelButton: true,
      confirmButtonText: 'Proceed & mark paid',
      cancelButtonText: 'Cancel',
      showLoaderOnConfirm: true,
      customClass: {
        popup: 'swal-custom'
      },
      showCloseButton: true,
      backdrop: true,
      preConfirm: (enteredValue) => {
        const val = Number(enteredValue);
        if (Number.isNaN(val) || val <= 0) {
          Swal.showValidationMessage('Please enter a valid positive amount.');
          return;
        }
        return { amountPaid: val };
      },
      didOpen: () => {
      }
    }).then((result) => {
      if (result.isConfirmed && result.value && (result.value as any).amountPaid != null) {
        const amountPaid = (result.value as any).amountPaid;
        this.isLoading = true;
        this.loaderService.showLoader();

        const payload = {
          id: record.id,
          amountPaid
        };

        const subs = this.genericService.getByConditions(payload, 'mark-payment-paid')
          .pipe(finalize(() => {
            this.isLoading = false;
            this.loaderService.hideLoader();
          }), catchError(err => {
            console.error('mark-payment-paid failed', err);
            Swal.fire({
              icon: 'error',
              title: 'Failed',
              text: 'Could not mark as paid. Please try again.',
            });
            return of({ success: false });
          }))
          .subscribe((apiRes: any) => {
            if (apiRes && apiRes.success === false) {
              return;
            }
            record.status = 'Paid';
            record.paidAt = new Date().toISOString();
            record.notes = (record.notes ? record.notes + ' | ' : '') + `Marked paid (${amountPaid})`;
            Swal.fire({
              icon: 'success',
              title: 'Marked Paid',
              text: `${record.userName} invoice ${record.invoiceId} marked paid (${record.currency || 'INR'} ${amountPaid.toFixed(2)}).`,
              timer: 2500,
              showConfirmButton: false
            });
            this.applyFilters();
          });

        this.subs.add(subs);
      }
    });
  }
  exportToExcel(useFiltered = true) {
    this.isExporting = true;
    try {
      const dataToExport = (useFiltered ? this.filteredData : this.allData).map(r => ({
        'Invoice ID': r.invoiceId,
        'Client Name': r.userName,
        'Business': r.businessName,
        'Email': r.email,
        'Phone': r.phone,
        'Amount': r.amount,
        'Currency': r.currency,
        'Due Date': r.dueDate ? new Date(r.dueDate).toLocaleDateString() : '',
        'Created At': r.createdAt ? new Date(r.createdAt).toLocaleString() : '',
        'Status': r.status,
        'Payment Method': r.paymentMethod,
        'Notes': r.notes,
        'Paid At': r.paidAt ? new Date(r.paidAt).toLocaleString() : ''
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
}
