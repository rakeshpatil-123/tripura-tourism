import { Component, OnInit } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { RegistrationComponent } from '../../page-content/auth/registration/registration.component';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { DividerModule } from 'primeng/divider';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { GenericService } from '../../_service/generic/generic.service';
import { IlogiSelectComponent } from "../../customInputComponents/ilogi-select/ilogi-select.component";
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TooltipModule } from 'primeng/tooltip';
import { ToggleSwitchModule } from "primeng/toggleswitch";
import Swal from 'sweetalert2';
import { LoaderService } from '../../_service/loader/loader.service';
import { debounceTime, finalize } from 'rxjs/operators';
import { IlogiInputComponent } from '../../customInputComponents/ilogi-input/ilogi-input.component';
import { HttpResponse } from '@angular/common/http';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-departmental-users',
  standalone: true,
  imports: [
    RouterModule,
    RegistrationComponent,
    CommonModule,
    TableModule,
    DividerModule,
    ButtonModule,
    DialogModule,
    IlogiSelectComponent,
    FormsModule,
    TooltipModule,
    ToggleSwitchModule,
    ReactiveFormsModule,
    IlogiInputComponent
  ],
  templateUrl: './departmental-users.component.html',
  styleUrls: ['./departmental-users.component.scss']
})
export class DepartmentalUsersComponent implements OnInit {
  users: any[] = [];
  userRole: any;
  loading: boolean = false;
  isStateLevelUser: boolean = false;
  rowsPerPageOptions: number[] = [5, 10, 20];
  displayDialog: boolean = false;
  private readonly STORAGE_KEY = 'selectedDepartment';
  usersBackup: any[] = [];
  departments: any[] = [];
  searchChanged: Subject<string> = new Subject<string>();
  selectedDepartment: any = null;
  selectedUser: any = null;
  editMode: boolean = false;
  userForms: { [key: number]: FormGroup } = {};
  filters: any = {
    name: '',
    mobile: '',
    email: '',
    department: ''
  };
  pagination: {
    current_page: number;
    row_count: number;
    total: number;
    start_row?: number;
    end_row?: number;
    last_page?: number;
  } = {
      current_page: 1,
      row_count: 5,
      total: 0,
      start_row: 1,
      end_row: 0,
      last_page: 1
    };

  constructor(private genericService: GenericService, private loaderService: LoaderService, private router: Router) { }

  ngOnInit(): void {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    this.userRole = localStorage.getItem('userRole');
    const hierarchyLevel = localStorage.getItem('hierarchy');
    const isStateOfficer = hierarchyLevel?.startsWith('state');
    this.isStateLevelUser = isStateOfficer || false;
    if (saved !== null && saved !== '') {
      this.selectedDepartment = +saved;
    } else {
      this.selectedDepartment = null;
    }
    this.searchChanged
    .pipe(debounceTime(500))
    .subscribe(value => {
      this.filters.search = value.trim();
      this.applyFilters();
    });
    this.fetchProfile(this.pagination.current_page, this.pagination.row_count);
    this.loadDepartments();
  }
  applyFilters() {
    this.pagination.current_page = 1;

    this.filters.department = this.selectedDepartment || '';
    this.filters.search = this.filters.search?.trim() || '';

    this.fetchProfile(1, this.pagination.row_count);
  }
  fetchProfile(page: number = 1, per_page?: number) {
    this.loaderService.showLoader();
    this.loading = true;
    const currentUserType = localStorage.getItem('userRole');
    const requestedPerPage = (typeof per_page === 'number' && per_page > 0) ? per_page : this.pagination.row_count;
    const params: any = { page, per_page: requestedPerPage };

    const searchValue = (this.filters.search || '').toString().trim();
    if (searchValue) {
      params.search = searchValue;
    }

    const selectedDep = (this.selectedDepartment !== null && this.selectedDepartment !== undefined && this.selectedDepartment !== '')
      ? +this.selectedDepartment
      : undefined;
    if (selectedDep !== undefined) {
      params.department_id = selectedDep;
    }

    const apiCall =
      currentUserType === 'admin'
        ? this.genericService.getAdminDepartmentalUserProfile(params)
        : this.genericService.getDepartmentalUserProfile(params);

    apiCall.pipe(finalize(() => this.loaderService.hideLoader())).subscribe({
      next: (res: any) => {
        if (res && res.pagination) {
          const dataArray = res.data || [];
          this.mapUsersAndForms(dataArray);
          const serverRowCount = res.pagination.row_count;
          if (typeof serverRowCount === 'number' && serverRowCount > 0 && serverRowCount !== requestedPerPage) {
            console.warn(`Server returned row_count=${serverRowCount} but client requested per_page=${requestedPerPage}. Preserving client selection.`);
          }
          this.pagination.current_page = res.pagination.current_page ?? page;
          this.pagination.row_count = requestedPerPage;
          this.pagination.total = res.pagination.total ?? dataArray.length;
          this.pagination.start_row = res.pagination.start_row ?? ((this.pagination.current_page - 1) * this.pagination.row_count) + 1;
          this.pagination.end_row = res.pagination.end_row ?? (this.pagination.start_row + dataArray.length - 1);
          this.pagination.last_page = res.pagination.last_page ?? Math.ceil(this.pagination.total / this.pagination.row_count);
          this.usersBackup = [...this.users];
        }
        else if (res && (res.status === 1 || res.success) && res.data) {
          this.mapUsersAndForms(res.data);
          this.pagination.current_page = 1;
          this.pagination.row_count = requestedPerPage;
          this.pagination.total = this.users.length;
          this.pagination.start_row = 1;
          this.pagination.end_row = this.users.length;
          this.pagination.last_page = 1;
          this.usersBackup = [...this.users];

          if (this.selectedDepartment !== null && this.selectedDepartment !== undefined && this.selectedDepartment !== '') {
            const depId = +this.selectedDepartment;
            this.users = this.usersBackup.filter(u => u.department_id === depId);
          } else {
            this.users = [...this.usersBackup];
          }
        } else {
          console.warn('Failed to fetch profile');
          this.users = [];
          this.usersBackup = [];
          this.pagination.total = 0;
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching profile:', err);
        this.users = [];
        this.loading = false;
      }
    });
  }
LoginAsDeptUser(user: any): void {
  this.loaderService.showLoader();
  const payload = { user_id: user.id };

  this.genericService.getByConditions(payload, 'api/admin/login-by-admin')
    .pipe(finalize(() => this.loaderService.hideLoader()))
    .subscribe({
      next: (res: any) => {
        if (res?.status === 1 && res?.token) {
          try {
            const existingAdminBackup = localStorage.getItem('admin_token_backup');
            if (!existingAdminBackup) {
              const currentToken = localStorage.getItem('token') ?? '';
              if (currentToken) {
                localStorage.setItem('admin_token_backup', currentToken);
              }
            }
          } catch (e) {
            console.warn('Could not backup admin token', e);
          }

          // open a new tab to a "switch-user" route that will receive the session
          const switchUrl = `${window.location.origin}/switch-user`;
          const newWin = window.open(switchUrl, '_blank');

          if (!newWin) {
            Swal.fire('Popup blocked', 'Please allow popups for this site to switch user.', 'error');
            return;
          }

          // Wait for the new tab to signal readiness, then send the payload.
          // Add a timeout so we don't leave the listener forever.
          const onMessage = (ev: MessageEvent) => {
            try {
              if (ev.origin !== window.location.origin) return; // security
              if (ev.data === 'SWITCH_USER_READY') {
                const payloadToSend = {
                  token: res.token,
                  token_type: res.token_type || 'bearer',
                  expires_in: res.expires_in || '',
                  data: res.data
                };
                newWin.postMessage({ action: 'SET_SESSION', payload: payloadToSend }, window.location.origin);

                // optional: focus the new tab
                try { newWin.focus(); } catch (e) { /* ignore */ }

                window.removeEventListener('message', onMessage);
                clearTimeout(waitTimeout);
              }
            } catch (err) {
              console.warn('Error handling message from switch window', err);
            }
          };
          window.addEventListener('message', onMessage);

          const waitTimeout = window.setTimeout(() => {
            window.removeEventListener('message', onMessage);
            Swal.fire('Timeout', 'New tab did not respond. Please try again.', 'error');
          }, 10000); // 10s timeout

          // IMPORTANT: Do NOT overwrite admin's localStorage session values with the impersonated user's token.
          // Keep admin logged in in this tab. If you must change UI state, do it without replacing admin credentials.
          // So DO NOT call localStorage.setItem('token', res.token) here.

          // Keep admin UI logged-in (if your app requires a call)
          this.genericService.setLoginStatus(true);

          Swal.fire({
            icon: 'success',
            title: 'Login Successful',
            text: `Switched to ${res.data?.name_of_enterprise || res.data?.authorized_person_name || res.data?.email_id}`,
            timer: 1500,
            showConfirmButton: false
          }).then(() => {
            // intentionally do not navigate away from admin tab — admin remains logged in here.
          });
        } else {
          Swal.fire('Login Failed', res?.message || 'Unable to login this user.', 'error');
        }
      },
      error: (err: any) => {
        console.error('Login error:', err);
        Swal.fire('Error', 'Failed to login user. Please try again.', 'error');
      }
    });
}


     logout(): void {
      this.genericService.logoutUser();
    }

   
  private mapUsersAndForms(rawArray: any[]) {
    this.users = rawArray.map((user: any) => ({
      id: user.id,
      name_of_enterprise: user.name_of_enterprise,
      authorized_person_name: user.authorized_person_name,
      email_id: user.email_id,
      mobile_no: user.mobile_no,
      user_name: user.user_name,
      hierarchy_level: user.hierarchy_level,
      district_name: user.districts_name,
      subdivision_name: user.subdivisions_name,
      ulb_name: user.blocks_name,
      ward_name: user.ward_name,
      bin: user.bin,
      registered_enterprise_address: user.registered_enterprise_address,
      registered_enterprise_city: user.registered_enterprise_city,
      department_name: user.department_name,
      inspector: user.inspector,
      department_id: user.department_id,
      status: user.status,
      created_at: user.created_at,
      updated_at: user.updated_at,
      created_by: user.created_by,
      updated_by: user.updated_by
    }));
    this.userForms = {};
    this.users.forEach(user => {
      this.userForms[user.id] = new FormGroup({
        status: new FormControl(user.status === 'active')
      });
    });
  }

  loadDepartments(): void {
    this.loaderService.showLoader();

    this.genericService.getAllDepartmentNames()
      .pipe(finalize(() => this.loaderService.hideLoader()))
      .subscribe({
        next: (res: any) => {
          if (res?.status) {
            this.departments = res.data.map((d: any) => ({
              id: d.id,
              name: d.name
            }));
            this.departments.unshift({
              id: '',
              name: 'All'
            });
          }
        },
        error: () => {
          this.departments = [
            { id: '', name: 'All' }
          ];
        }
      });
  }


  filterByDepartment(departmentId: any): void {
    const isAll = departmentId === null
      || departmentId === ''
      || departmentId === undefined
      || departmentId === 'all'
      || departmentId === 'All';

    if (isAll) {
      this.selectedDepartment = null;
      localStorage.removeItem(this.STORAGE_KEY);
      if (this.pagination.total > 0) {
        this.fetchProfile(1, this.pagination.row_count);
        return;
      }
      this.users = [...this.usersBackup];
      return;
    }
    const depId = +departmentId;
    this.selectedDepartment = depId;
    localStorage.setItem(this.STORAGE_KEY, String(depId));
    const usingServerSide = this.pagination.total > 0;
    if (usingServerSide) {
      this.fetchProfile(1, this.pagination.row_count);
      return;
    }
    this.users = this.usersBackup.filter(u => u.department_id === depId);
  }

  openDialog() {
    this.selectedUser = null;
    this.displayDialog = true;
    this.editMode = false;
  }
  editUser(user: any): void {
    this.editMode = true;
    this.selectedUser = null;
    this.loaderService.showLoader();
    const payload = { id: user.id };
  this.genericService.getByConditions(payload, 'api/admin/get-department-user-details')
    .pipe(finalize(() => this.loaderService.hideLoader()))
    .subscribe({
      next: (res: any) => {
        if (res?.success && res?.data) {
          const locations = Array.isArray(res.locations)
            ? res.locations
            : Array.isArray(res.data?.locations)
              ? res.data.locations
              : [];
          this.selectedUser = { ...res.data, user_id: user.id, locations };
          this.displayDialog = true;
        } else {
          this.genericService.openSnackBar('Failed to load user details.', 'Error');
        }
      },
      error: (err: any) => {
        console.error('Error fetching user details:', err);
        this.genericService.openSnackBar('Something went wrong while loading details.', 'Error');
      }
    });
  }
  closeDialog() {
    this.displayDialog = false;
    this.selectedUser = null;
  }

  handleRegistrationSuccess() {
    this.displayDialog = false;
    this.fetchProfile(this.pagination.current_page, this.pagination.row_count);
  }
onPageChange(event: any) {
  // fade animation: try to target table wrapper first, fallback to tbody
  const table = document.querySelector('.p-datatable') || document.querySelector('.p-datatable-tbody');
  if (table) {
    table.classList.add('table-fade-out');
    setTimeout(() => {
      table.classList.remove('table-fade-out');
    }, 250);
  }

  // compute requested page safely (PrimeNG page is zero-based when present)
  const requestedPage = (typeof event.page === 'number')
    ? (event.page + 1)
    : (typeof event.first === 'number' && typeof event.rows === 'number')
      ? (Math.floor(event.first / event.rows) + 1)
      : this.pagination.current_page;

  // determine rows per page robustly
  const rows = (typeof event.rows === 'number' && event.rows > 0)
    ? event.rows
    : (this.pagination.row_count || this.rowsPerPageOptions[0]);

  // ensure the current rows value appears in the rowsPerPageOptions so the dropdown always shows the selected value
  if (!this.rowsPerPageOptions.includes(rows)) {
    this.rowsPerPageOptions = [...this.rowsPerPageOptions, rows].sort((a, b) => a - b);
  }

  this.pagination.current_page = requestedPage;
  this.pagination.row_count = rows;

  this.fetchProfile(requestedPage, rows);
}
  confirmStatusChange(event: any, user: any) {
    const isCurrentlyActive = user.status === 'active';
    const newStatus = isCurrentlyActive ? 'inactive' : 'active';

    Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to change status to "${newStatus}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: newStatus === 'active' ? '#10b981' : '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, change it!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.updateUserStatus(user, newStatus);
      } else {
        setTimeout(() => {
          this.userForms[user.id].controls['status'].setValue(isCurrentlyActive, { emitEvent: false });
        });
      }
    });
  }

  updateUserStatus(user: any, status: string) {
    const payload = { id: user.id, status };
    this.loaderService.showLoader();
    this.genericService.updateDepartmentalUserStatus(payload).pipe(finalize(() => this.loaderService.hideLoader())).subscribe({
      next: () => {
        user.status = status;
        if (this.userForms[user.id]) {
          this.userForms[user.id].controls['status'].setValue(status === 'active', { emitEvent: false });
        }
        this.fetchProfile(this.pagination.current_page, this.pagination.row_count);

        Swal.fire({
          icon: 'success',
          title: 'Status Updated',
          text: `User status changed to "${status}".`,
          timer: 1500,
          showConfirmButton: false
        });
      },
      error: () => {
        if (this.userForms[user.id]) {
          this.userForms[user.id].controls['status'].setValue(user.status === 'active', { emitEvent: false });
        }
        Swal.fire('Error', 'Failed to update status.', 'error');
      }
    });
  }
  confirmExportExcel() {
    Swal.fire({
      title: 'Export Department Users?',
      text: 'Do you want to download the Excel file of all departmental users?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#22c55e',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, Download',
      cancelButtonText: 'Cancel',
      showClass: { popup: 'animate__animated animate__zoomIn' },
      hideClass: { popup: 'animate__animated animate__zoomOut' }
    }).then((result) => {
      if (result.isConfirmed) {
        this.exportExcel();
      }
    });
  }

  exportExcel() {
    this.loaderService.showLoader();
    const searchValue = (this.filters.search || '').toString().trim();
    const selectedDep = (this.selectedDepartment !== null && this.selectedDepartment !== undefined && this.selectedDepartment !== '')
      ? +this.selectedDepartment
      : undefined;

    const payload: any = {};

    if (searchValue) {
      payload.search = searchValue;
    }
    if (selectedDep !== undefined) {
      payload.department_id = selectedDep;
    }
    payload.page = this.pagination.current_page ?? 1;
    payload.row_count  = this.pagination.row_count ?? 5;
    payload.export = 'excel';

    const currentUserType = localStorage.getItem('userRole');
    const exportCall =
      currentUserType === 'admin'
        ? this.genericService.exportDepartmentalUsersExcelAdmin(payload)
        : this.genericService.exportDepartmentalUsersExcelDept(payload);

    exportCall
      .pipe(finalize(() => this.loaderService.hideLoader()))
      .subscribe({
        next: (resp: HttpResponse<Blob>) => {
          const status = resp.status;
          const headers = resp.headers;
          const contentType = (headers.get('content-type') || '').toLowerCase();
          const disposition = headers.get('content-disposition') || '';
          if (contentType.includes('application/json') || contentType.includes('text/html') || status >= 400) {
            const blob = resp.body;
            if (!blob) {
              Swal.fire('Export Failed', 'Server returned an empty response.', 'error');
              return;
            }
            blob.text().then((text: string) => {
              if (!text) {
                Swal.fire('Export Failed', 'Server returned an empty response.', 'error');
                return;
              }

              try {
                const parsed = JSON.parse(text);
                const msg = parsed?.message || parsed?.error || JSON.stringify(parsed);
                Swal.fire('Export Failed', msg || 'Server returned an error while exporting.', 'error');
              } catch (e) {
                const snippet = text.length > 120 ? text.slice(0, 120) + '...' : text;
                Swal.fire('Export Failed', `Server returned unexpected content: ${snippet}`, 'error');
              }
            }).catch((err: any) => {
              Swal.fire('Export Failed', 'Unable to read server response: ' + (err?.message || err), 'error');
            });

            return;
          }
          const blob = resp.body ?? new Blob([], { type: 'application/octet-stream' });
          let filename = 'departmental_users.xlsx';
          const filenameMatch = /filename\*?=(?:UTF-8'')?["']?([^;"']+)["']?/i.exec(disposition);
          if (filenameMatch && filenameMatch[1]) {
            try {
              filename = decodeURIComponent(filenameMatch[1]);
            } catch {
              filename = filenameMatch[1];
            }
          }

          try {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            setTimeout(() => window.URL.revokeObjectURL(url), 1000);

            Swal.fire({
              icon: 'success',
              title: 'Downloaded!',
              text: 'Excel file exported successfully.',
              timer: 1500,
              showConfirmButton: false,
              showClass: { popup: 'animate__animated animate__fadeInDown' },
              hideClass: { popup: 'animate__animated animate__fadeOutUp' }
            });
          } catch (downloadErr) {
            console.error('Download error:', downloadErr);
            Swal.fire('Error', 'Unable to download the exported file.', 'error');
          }
        },
        error: (err) => {
          console.error('Export failed:', err);
          Swal.fire('Error', 'Failed to export Excel. Check console for details.', 'error');
        }
      });
  }
  formatListHtml(value: string | null | undefined): string {
    if (!value) return '----';
    const parts = String(value).split(',').map(p => p.trim()).filter(Boolean);
    if (parts.length === 0) return '----';
    return parts.map(p => this.escapeHtml(p) + ',').join('<br>');
  }
  escapeHtml(s: string): string {
    return s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}
