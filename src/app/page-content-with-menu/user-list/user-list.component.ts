import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { ButtonModule } from 'primeng/button';
import { IlogiSelectComponent, SelectOption } from '../../customInputComponents/ilogi-select/ilogi-select.component';
import { IlogiInputDateComponent } from '../../customInputComponents/ilogi-input-date/ilogi-input-date.component';
import { GenericService } from '../../_service/generic/generic.service';
import { LoaderService } from '../../_service/loader/loader.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-user-list',
  standalone: true,
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    IlogiSelectComponent,
    FormsModule,
    IlogiInputDateComponent
  ]
})
export class UserListComponent implements OnInit {
  filterForm!: FormGroup;
  subs: Subscription;
  departments: SelectOption[] = [];
  serviceList: SelectOption[] = [];
  users: any[] = [];
  pageSize: number = 10;
  currentPageSize: number = 1;
  totalPages: number = 0;
  totalPagesArray: number[] = [];
  pageSizeOptions: number[] = [5, 10, 20, 50];

  filteredData: any[] = [];
  displayedData: any[] = [];

  constructor(
    private fb: FormBuilder,
    private genericService: GenericService,
    private loaderService: LoaderService
  ) {
    this.subs = new Subscription;
  }

  ngOnInit(): void {
    const createFormSubs = this.createForm();
    const loaderDepartmentSubs = this.loadDepartmentList();
    this.subs.add(createFormSubs);
    this.subs.add(loaderDepartmentSubs);
    this.filterForm.get('department')?.valueChanges.subscribe((deptId: any) => {
      if (deptId) {
        const getServiveListSubs = this.getServiceList(deptId);
        this.subs.add(getServiveListSubs);
      } else {
        this.serviceList = [];
      }
      this.filterForm.get('service')?.reset();
    });

    this.search();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  private createForm() {
    const today = new Date();
    const past12Months = new Date();
    past12Months.setFullYear(today.getFullYear() - 1);
    const savedDeptId = localStorage.getItem('deptId') || '';
    this.filterForm = this.fb.group({
      fromDate: [past12Months],
      toDate: [today],
      department: [savedDeptId ? Number(savedDeptId) : ''],
      service: [null]
    });
  }

  loadDepartmentList() {
    this.loaderService.showLoader();
    this.genericService.getAllDepartmentNames()
      .pipe(finalize(() => this.loaderService.hideLoader()))
      .subscribe({
        next: (res: any) => {
          const deptData = res?.data || [];
          const savedDeptId = localStorage.getItem('deptId') || '';
          this.departments = [
            { id: '', name: 'All Departments' },
            ...deptData.map((d: any) => ({
              id: Number(d.id),
              name: d.name || d.department_name || d.department || ''
            }))
          ];
          this.filterForm.get('department')?.setValue(
            savedDeptId ? Number(savedDeptId) : '',
            { emitEvent: false }
          );
          if (savedDeptId) {
            const id = Number(savedDeptId);
            const svcSub = this.getServiceList(id);
            this.subs.add(svcSub);
          }

        },

        error: (err: any) => {
          this.departments = [];
          console.error('Error loading departments', err);

          Swal.fire({
            title: 'Failed to load departments',
            text: err?.error?.message || 'Unable to fetch department list.',
            icon: 'error',
            confirmButtonColor: '#d33',
            showClass: { popup: 'animate__animated animate__shakeX' },
            hideClass: { popup: 'animate__animated animate__fadeOut' }
          });
        }
      });
  }


  getServiceList(departmentId: any) {
    if (!departmentId) {
      this.serviceList = [];
      return;
    }

    this.genericService
      .getByConditions({ department_id: departmentId }, 'api/department/services')
      .pipe(finalize(() => { }))
      .subscribe({
        next: (res: any) => {
          const serviceData = res?.data || [];
          this.serviceList = Array.isArray(serviceData)
            ? serviceData.map((s: any) => ({ id: s.service_id, name: s.service_name }))
            : [];
        },
        error: (err: any) => {
          this.serviceList = [];
          console.error('Error loading services', err);
          Swal.fire({
            title: 'Failed to load services',
            text: err?.error?.message || 'Unable to fetch services for the selected department.',
            icon: 'error',
            confirmButtonColor: '#d33',
            showClass: { popup: 'animate__animated animate__shakeX' },
            hideClass: { popup: 'animate__animated animate__fadeOut' }
          });
        }
      });
  }
  private formatDate(input: any): string | null {
    if (!input) return null;
    const d = input instanceof Date ? input : new Date(input);
    if (isNaN(d.getTime())) return null;
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }
  search() {
    const deptId = this.filterForm.get('department')?.value;
    const serviceId = this.filterForm.get('service')?.value;
    const fromDateRaw = this.filterForm.get('fromDate')?.value;
    const toDateRaw = this.filterForm.get('toDate')?.value;
    if (!deptId) {
      Swal.fire({
        title: 'Please select a department',
        text: 'Department is required to search reports.',
        icon: 'warning'
      });
      return;
    }
    const payload: any = {
      from_date: this.formatDate(fromDateRaw) || null,
      to_date: this.formatDate(toDateRaw) || null,
      department_id: deptId,
      service_id: serviceId || null
    };
    const fd = payload.from_date ? new Date(payload.from_date) : null;
    const td = payload.to_date ? new Date(payload.to_date) : null;

    if (fd && td && fd > td) {
      Swal.fire({
        title: 'Invalid Date Range',
        text: 'From Date cannot be later than To Date.',
        icon: 'warning'
      });
      return;
    }
    this.loaderService.showLoader();
    this.genericService.getByConditions(payload, 'api/report/user-list')
      .pipe(finalize(() => this.loaderService.hideLoader()))
      .subscribe({
        next: (res: any) => {
          if (res?.status === 0) {
            Swal.fire({
              title: 'Error',
              text: res.message || 'Something went wrong.',
              icon: 'error'
            });
            this.users = [];
            return;
          }
          if (!Array.isArray(res?.data) || res.data.length === 0) {
            this.users = [];
            Swal.fire({
              title: 'No Records Found',
              text: res?.message || 'No data found for selected criteria.',
              icon: 'info'
            });
            return;
          }
          this.users = res.data.map((u: any) => ({
            enterpriseName: u.enterprise_name ?? '',
            personName: u.person_name ?? '',
            contactNo: u.contact_no ?? '',
            email: u.email ?? '',
            address: u.address ?? '',
            dateOfApplication: u.date_of_application ?? '',
            queryWithin7Days: u.query_within_7_days ?? '',
            queryAfter7Days: u.query_after_7_days ?? '',
            dateOfReceiptOfNoc: u.date_of_receipt_of_noc ?? ''
          }));
          this.filteredData = [...this.users];
          this.applyPagination();
        },

        error: (err: any) => {
          this.users = [];
          Swal.fire({
            title: 'Server Error',
            text: err?.error?.message || 'Something went wrong.',
            icon: 'error'
          });
        }
      });
  }
  reset(): void {
    this.filterForm.reset();
    this.filterForm.get('department')?.setValue('');
    this.filterForm.get('service')?.setValue('');
    this.users = [];
    this.filteredData = [];
    this.displayedData = [];
    this.currentPageSize = 1;
    this.totalPages = 0;
    this.totalPagesArray = [];
    this.pageSize = 10;
  }
  applyPagination(): void {
    const len = (this.filteredData || []).length;
    this.totalPages = len > 0 ? Math.ceil(len / this.pageSize) : 0;
    this.totalPagesArray = this.totalPages > 0 ? Array.from({ length: this.totalPages }, (_, i) => i + 1) : [];
    if (this.totalPages > 0 && this.currentPageSize > this.totalPages) this.currentPageSize = this.totalPages;
    if (this.currentPageSize < 1) this.currentPageSize = 1;
    this.updateDisplayedData();
  }

  updateDisplayedData(): void {
    const startIndex = (this.currentPageSize - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.displayedData = this.filteredData.slice(startIndex, endIndex);
  }

  onPageSizeChange(): void {
    this.currentPageSize = 1;
    this.applyPagination();
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
  exportExcel() {
    if (!this.users.length) {
      Swal.fire({
        title: 'No data to export',
        text: 'Please run a search and ensure there are results to export.',
        icon: 'info',
        confirmButtonColor: '#003c5b'
      });
      return;
    }

    const header = [
      'Sl No',
      'Enterprise Name',
      'Applicant Name',
      'Contact No',
      'Email',
      'Address',
      'Date of Application',
      'Query within 7 days',
      'Query after 7 days',
      'Date of Receipt of NOC'
    ];

    const rows = this.users.map((u, idx) => [
      idx + 1,
      u.enterpriseName,
      u.personName,
      u.contactNo,
      u.email,
      u.address,
      u.dateOfApplication,
      u.queryWithin7Days,
      u.queryAfter7Days,
      u.dateOfReceiptOfNoc
    ]);

    const csvContent = [header, ...rows]
      .map(r => r.map(cell => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `User_List_Report_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  }
}
