import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { IlogiInputDateComponent } from '../../customInputComponents/ilogi-input-date/ilogi-input-date.component';
import { IlogiSelectComponent, SelectOption } from '../../customInputComponents/ilogi-select/ilogi-select.component';
import { GenericService } from '../../_service/generic/generic.service';
import { LoaderService } from '../../_service/loader/loader.service';
import { finalize, Subscription } from 'rxjs';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import FileSaver from 'file-saver';

@Component({
  selector: 'app-application-status',
  standalone: true,
  templateUrl: './application-status.component.html',
  styleUrls: ['./application-status.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IlogiSelectComponent,
    IlogiInputDateComponent,
    ButtonModule,
    FormsModule
  ]
})
export class ApplicationStatusComponent implements OnInit, OnDestroy {
  currentPage = 'Application Status';
  filterForm!: FormGroup;
  data: any[] = [];
  pageSize: number = 10;
  currentPageSize: number = 1;
  totalPages: number = 0;
  totalPagesArray: number[] = [];
  pageSizeOptions: number[] = [5, 10, 20, 50, 100];
  displayedData: any[] = [];
  filteredData: any[] = [];


  departments: SelectOption[] = [];
  subs: Subscription;
  statuses: SelectOption[] = [
    { id: '', name: 'All status' },
    { id: 'submitted', name: 'Submitted' },
    {id: 'noc_issued', name: 'NOC Issued'},
    { id: 'approved', name: 'Approved' },
    { id: 'rejected', name: 'Rejected' },
    { id: 'send_back', name: 'Send Back' },
    { id: 'extra_payment', name: 'Extra Payment' }
  ];

  constructor(
    private fb: FormBuilder,
    private genericService: GenericService,
    private loaderService: LoaderService,
    private cdRef: ChangeDetectorRef
  ) { this.subs = new Subscription }

  ngOnInit(): void {
    this.initializeForm();
    const allDepartmentSubs = this.getAllDepartmentList();
    if (allDepartmentSubs) this.subs.add(allDepartmentSubs);
    const getApplicationSubs = this.getApplicationStatus();
    if (getApplicationSubs) this.subs.add(getApplicationSubs);
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  initializeForm(): void {
    const today = new Date();
    const past12Months = new Date();
    past12Months.setFullYear(today.getFullYear() - 1);
    this.filterForm = this.fb.group({
      fromDate: [past12Months, Validators.required],
      toDate: [today, Validators.required],
      department: [null],
      status: [null]
    });
  }

  getAllDepartmentList(): Subscription {
    this.loaderService.showLoader();
    const sub = this.genericService.getAllDepartmentNames()
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
            this.departments = [
              { id: '', name: 'All Departments' },
              ...opts,
            ];
          } else {
            this.departments = [{ id: '', name: 'All Departments' }];
          }
        },
        error: (err: any) => {
          console.error('Error loading departments', err);
          this.departments = [{ id: '', name: 'All Departments' }];
        }
      });

    return sub;
  }

  getApplicationStatus(): Subscription {
    const payload: any = {
      from_date: this.filterForm.value.fromDate ? this.formatDate(this.filterForm.value.fromDate) : null,
      to_date: this.filterForm.value.toDate ? this.formatDate(this.filterForm.value.toDate) : null,
      department_id: this.filterForm.value.department || null,
      application_status: this.filterForm.value.status || null
    };

    this.loaderService.showLoader();

    const sub = this.genericService
      .getByConditions(payload, 'api/report/application-status')
      .pipe(finalize(() => this.loaderService.hideLoader()))
      .subscribe({
        next: (res: any) => {
          if (res?.status === 0) {
            this.data = [];
            this.filteredData = [];
            this.displayedData = [];
            this.resetPagination();
            return;
          }
          this.data = Array.isArray(res?.data) ? res.data : [];
          this.resetPagination();
          this.applyPagination();
          this.filteredData = [...this.data];
          this.applyPagination();

          if (!this.data.length) {
            Swal.fire({
              icon: 'info',
              title: 'No Records Found',
              text: 'No applications match your selected criteria.',
              confirmButtonColor: '#003c5b',
              showClass: { popup: 'animate__animated animate__zoomIn' },
              hideClass: { popup: 'animate__animated animate__zoomOut' }
            });
          }
        },

        error: (err: any) => {
          this.data = [];
          this.filteredData = [];
          this.displayedData = [];
          this.resetPagination();
        }
      });

    return sub;
  }
  resetPagination(): void {
    this.currentPageSize = 1;
    this.totalPages = 1;
    this.totalPagesArray = [1];
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  search(): void {
    this.getApplicationStatus();
  }
  reset(): void {
    this.filterForm.reset({
      fromDate: null,
      toDate: null,
      department: '',
      status: ''
    });
    this.data = [];
    this.filteredData = [];
    this.displayedData = [];
    this.currentPageSize = 1;
    this.totalPages = 0;
    this.totalPagesArray = [];
    this.pageSize = 10;
    this.cdRef.detectChanges();
  }


  exportExcel(): void {
    if (!this.data || this.data.length === 0) {
      Swal.fire({
        icon: 'info',
        title: 'No Data',
        text: 'There is no data available to export.',
        confirmButtonColor: '#003c5b'
      });
      return;
    }

    const fileName = `application-status-${new Date().getTime()}.xlsx`;
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.data);

    const workbook: XLSX.WorkBook = {
      Sheets: { 'Application Status': worksheet },
      SheetNames: ['Application Status']
    };
    const excelBuffer: any = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array'
    });
    const blob: Blob = new Blob([excelBuffer], {
      type:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
    });

    FileSaver.saveAs(blob, fileName);
  }

  onPageSizeChange(): void {
    this.currentPageSize = 1;
    this.applyPagination();
  }
  getStatusClass(status: string): string {
    const normalized = status?.toLowerCase().replace(/\s+/g, "_");

    switch (normalized) {
      case "submitted":
        return "status-badge status-submitted";
      case "approved":
        return "status-badge status-approved";
      case "rejected":
        return "status-badge status-rejected";
      case "send_back":
        return "status-badge status-send_back";
      case "extra_payment":
        return "status-badge status-extra_payment";
      default:
        return "status-badge status-default";
    }
  }

  applyPagination(): void {
    if (!this.filteredData || !Array.isArray(this.filteredData)) {
      this.filteredData = Array.isArray(this.data) ? [...this.data] : [];
    }
    this.totalPages = this.filteredData.length > 0 ? Math.max(1, Math.ceil(this.filteredData.length / this.pageSize)) : 0;
    this.totalPagesArray = this.totalPages > 0 ? Array.from({ length: this.totalPages }, (_, i) => i + 1) : [];
    if (this.totalPages === 0) {
      this.currentPageSize = 1;
      this.displayedData = [];
      return;
    }
    if (this.currentPageSize > this.totalPages) {
      this.currentPageSize = this.totalPages;
    }
    if (this.currentPageSize < 1) {
      this.currentPageSize = 1;
    }

    this.updateDisplayedData();
  }

  updateDisplayedData(): void {
    const startIndex = (this.currentPageSize - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;

    this.displayedData = this.filteredData.slice(startIndex, endIndex);
  }
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPageSize = page;
      this.updateDisplayedData();
    }
  }

  nextPage(): void {
    if (this.currentPageSize < this.totalPages) {
      this.currentPageSize++;
      this.updateDisplayedData();
    }
  }

  prevPage(): void {
    if (this.currentPageSize > 1) {
      this.currentPageSize--;
      this.updateDisplayedData();
    }
  }

  toTitleCase(status: string): string {
    if (!status) return "";
    return status
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }
}
