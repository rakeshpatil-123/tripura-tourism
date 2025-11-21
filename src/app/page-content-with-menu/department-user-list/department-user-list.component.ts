import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { IlogiSelectComponent, SelectOption } from '../../customInputComponents/ilogi-select/ilogi-select.component';
import { GenericService } from '../../_service/generic/generic.service';
import { LoaderService } from '../../_service/loader/loader.service';
import { finalize, Subscription } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-department-user-list',
  standalone: true,
  templateUrl: './department-user-list.component.html',
  styleUrls: ['./department-user-list.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IlogiSelectComponent,
    ButtonModule,
    FormsModule,
  ]
})
export class DepartmentUserListComponent implements OnInit, OnDestroy {

  filterForm!: FormGroup;
  users: any[] = [];
  deptId: any;
  departments: SelectOption[] = [];
  serviceList: SelectOption[] = [];
  approvalStepList: SelectOption[] = [];
  filteredData: any[] = [];
  displayedData: any[] = [];
  currentPageSize: number = 1;
  totalPages: number = 0;
  totalPagesArray: number[] = [];
  pageSize: number = 10;
  pageSizeOptions: number[] = [5, 10, 20, 50];
  subs: Subscription;
  constructor(
    private fb: FormBuilder,
    private genericService: GenericService,
    private loaderService: LoaderService,
  ) {
    this.subs = new Subscription;
  }

  ngOnInit(): void {
    const createFormSubs = this.createForm();
    this.deptId = localStorage.getItem('deptId');
    const loadDepartmentSubs = this.loadDepartmentList();
    this.filterForm.get('department')?.valueChanges.subscribe((deptId: any) => {
      if (deptId) {
        this.getServiceList(deptId);
        this.approvalStepList = [];
        this.filterForm.get('service')?.reset();
      }
    });
    this.subs.add(createFormSubs);
    this.subs.add(loadDepartmentSubs);
    this.filterForm.get('service')?.valueChanges.subscribe((serviceId: any) => {
      const deptId = this.filterForm.get('department')?.value;

      if (deptId && serviceId) {
        const getApprovalSubs = this.getApprovalStepsList(deptId);
        this.subs.add(getApprovalSubs);
      }
    });
  }
  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
  createForm() {
    this.filterForm = this.fb.group({
      department: [null],
      service: [null],
      approvalStep: [null]
    });
  }

  loadDepartmentList() {
    this.loaderService.showLoader();
    this.genericService.getAllDepartmentNames()
      .pipe(finalize(() => this.loaderService.hideLoader()))
      .subscribe({
        next: (res: any) => {
          const deptData = res?.data || [];

          this.departments = deptData.map((d: any) => ({
            id: d.id,
            name: d.name || d.department_name
          }));
        },
        error: () => {
          this.departments = [];
        }
      });
  }
  getServiceList(departmentId: any) {
    this.genericService
      .getByConditions({ department_id: departmentId }, 'api/department/services')
      .subscribe({
        next: (res: any) => {

          const serviceData = res?.data || [];

          this.serviceList = serviceData.map((s: any) => ({
            id: s.service_id,
            name: s.service_name
          }));
        },
        error: () => {
          this.serviceList = [];
        }
      });
  }

  getApprovalStepsList(departmentId: any) {
    const selectedServiceId = this.filterForm.get('service')?.value || null;
    const payload = {
      department_id: departmentId,
      service_id: selectedServiceId
    };

    this.genericService
      .getByConditions(payload, 'api/report/approval-steps-list')
      .subscribe({
        next: (res: any) => {

          const stepData = res?.data || [];

          this.approvalStepList = stepData.map((step: any) => ({
            id: step,
            name: this.toTitleCase(step)
          }));

        },
        error: () => {
          this.approvalStepList = [];
        }
      });
  }
  toTitleCase(str: string): string {
    return str
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
  applyPagination(): void {
    this.totalPages = Math.ceil(this.filteredData.length / this.pageSize);
    this.totalPagesArray = Array.from({ length: this.totalPages }, (_, i) => i + 1);
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
  search() {
    const departmentId = this.filterForm.get('department')?.value;
    const serviceId = this.filterForm.get('service')?.value;
    const approvalStep = this.filterForm.get('approvalStep')?.value;
    if (!departmentId) {
      Swal.fire({
        title: 'Department Required',
        text: 'Please select a department before searching.',
        icon: 'warning',
        confirmButtonColor: '#f57c00',
        showClass: { popup: 'animate__animated animate__fadeInDown' },
        hideClass: { popup: 'animate__animated animate__fadeOutUp' }
      });
      return;
    }
    const payload = {
      department_id: departmentId,
      service_id: serviceId || null,
      approval_step: approvalStep || null
    };
    this.loaderService.showLoader();
    this.genericService
      .getByConditions(payload, "api/report/department-user-list")
      .pipe(finalize(() => this.loaderService.hideLoader()))
      .subscribe({
        next: (res: any) => {
          if (res?.status === 0) {
            this.users = [];
            Swal.fire({
              title: 'Warning',
              text: res.message || 'Something went wrong.',
              icon: 'warning',
              confirmButtonColor: '#f57c00',
              showClass: { popup: 'animate__animated animate__fadeInDown' },
              hideClass: { popup: 'animate__animated animate__fadeOutUp' }
            });
            return;
          }
          if (!Array.isArray(res?.data) || res.data.length === 0) {
            this.users = [];
            Swal.fire({
              title: 'No Records Found',
              text: 'No users match your search criteria.',
              icon: 'info',
              confirmButtonColor: '#003c5b',
              showClass: { popup: 'animate__animated animate__zoomIn' },
              hideClass: { popup: 'animate__animated animate__zoomOut' }
            });
            return;
          }
          this.users = res.data.map((u: any) => ({
            department: u.department_name ?? '',
            role: u.role ?? '',
            username: u.user_name ?? '',
            name: u.name ?? '',
            designation: u.designation ?? '',
            email: u.email_id ?? '',
            mobile: u.mobile_number ?? '',
            assignmentDate: u.date_of_assignment ?? ''
          }));
          this.filteredData = [...this.users];
          this.currentPageSize = 1;
          this.applyPagination();
        },

        error: (err: any) => {
          console.error(err);
          this.users = [];

          Swal.fire({
            title: 'Error Occurred',
            text: err?.error?.message || 'Something went wrong while fetching user list.',
            icon: 'error',
            confirmButtonColor: '#d33',
            showClass: { popup: 'animate__animated animate__shakeX' },
            hideClass: { popup: 'animate__animated animate__fadeOut' }
          });
        }
      });
  }

  reset() {
    this.filterForm.reset();
    this.filterForm.get('department')?.setValue('');
    this.filterForm.get('service')?.setValue('');
    this.filterForm.get('approvalStep')?.setValue('');
    this.users = [];
    this.filteredData = [];
    this.displayedData = [];
    this.currentPageSize = 1;
    this.totalPages = 0;
    this.totalPagesArray = [];
    this.pageSize = 10;

    Swal.fire({
      title: 'Form Reset',
      text: 'All filters and data have been cleared.',
      icon: 'info',
      confirmButtonColor: '#003c5b'
    });
  }
  exportExcel() {
    alert('Excel downloaded successfully!');
  }
}
