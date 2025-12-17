import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { TableModule } from 'primeng/table';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { GenericService } from '../../_service/generic/generic.service';
import { TooltipModule } from 'primeng/tooltip';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import Swal from 'sweetalert2';
import { LoaderService } from '../../_service/loader/loader.service';
import { finalize } from 'rxjs';
import { HttpResponse } from '@angular/common/http';

@Component({
  selector: 'app-business-users',
  templateUrl: './business-users.component.html',
  styleUrls: ['./business-users.component.scss'],
  imports: [
    CommonModule,
    TableModule,
    MatIconModule,
    MatInputModule,
    MatButtonModule,
    TooltipModule,
    ToggleSwitchModule,
    ReactiveFormsModule,
    FormsModule,
    InputTextModule,
    ButtonModule
  ]
})
export class BusinessUsersComponent implements OnInit {
  users: any[] = [];
  loading: boolean = false;
  userForms: { [key: number]: FormGroup } = {};

  columns: { field: string; header: string }[] = [
    { field: 'id', header: 'ID' },
    { field: 'name_of_enterprise', header: 'Enterprise Name' },
    { field: 'authorized_person_name', header: 'Authorized Person' },
    { field: 'email_id', header: 'Email' },
    { field: 'mobile_no', header: 'Mobile' },
    { field: 'user_name', header: 'Username' },
    { field: 'bin', header: 'BIN' },
    { field: 'district_name', header: 'District Name' },
    { field: 'subdivision_name', header: 'Subdivision Name' },
    { field: 'ulb_name', header: 'ULB Name' },
    { field: 'ward_name', header: 'Ward Name' },
    { field: 'registered_enterprise_address', header: 'Address' },
    { field: 'registered_enterprise_city', header: 'City' },
    { field: 'user_type', header: 'User Type' },
    { field: 'status', header: 'Status' }
  ];
  totalRecords: number = 0;
  rows: number = 10;
  currentPage: number = 1;

  globalFilterFields: string[] = this.columns.map(c => c.field);
  searchText: string = '';

  constructor(
    private genericService: GenericService,
    private fb: FormBuilder,
    private loaderService: LoaderService
  ) { }

  ngOnInit(): void {
    this.fetchUsers(1);
  }
  fetchUsers(page: number = 1, rowCount: number = this.rows) {
    this.loading = true;
    this.loaderService.showLoader();

    this.genericService
      .getBusinessUsersDetails(page, rowCount, this.searchText)
      .pipe(finalize(() => this.loaderService.hideLoader()))
      .subscribe({
        next: (res: any) => {
          this.users = res?.status === 1 && Array.isArray(res.data) ? res.data : [];
          this.totalRecords = res?.pagination?.total ?? 0;
          this.currentPage = res?.pagination?.current_page ?? page;
          this.rows = res?.pagination?.row_count ?? rowCount;

          this.userForms = {};
          this.users.forEach(user => {
            this.userForms[user.id] = this.fb.group({
              status: [user.status === 'active']
            });
          });

          this.loading = false;
        },
        error: () => {
          this.users = [];
          this.totalRecords = 0;
          this.loading = false;
        }
      });
  }

  onLazyLoad(event: any) {
    const page = Math.floor(event.first / event.rows) + 1;
    this.rows = event.rows;
    this.fetchUsers(page, this.rows);
  }
  applyFilter(event: Event, dt: any) {
    const filterValue = (event.target as HTMLInputElement).value;
    dt.filterGlobal(filterValue.trim().toLowerCase(), 'contains');
  }

  confirmStatusChange(user: any) {
    const form = this.userForms[user.id];
    const isActive = form.get('status')?.value;
    const newStatus = isActive ? 'active' : 'inactive';

    Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to change status to "${newStatus}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: newStatus === 'active' ? '#10b981' : '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, change it!',
      cancelButtonText: 'Cancel'
    }).then(result => {
      if (result.isConfirmed) {
        this.updateUserStatus(user, newStatus);
      } else {
        form.patchValue({ status: !isActive }, { emitEvent: false });
      }
    });
  }

  updateUserStatus(user: any, status: string) {
    this.genericService.updateBusinessUserStatus({ id: user.id, status }).subscribe({
      next: () => {
        user.status = status;
        Swal.fire({
          icon: 'success',
          title: 'Status Updated',
          text: `User status changed to ${status}.`,
          timer: 1500,
          showConfirmButton: false
        });
      },
      error: () => {
        const form = this.userForms[user.id];
        form.patchValue({ status: user.status === 'active' }, { emitEvent: false });
        Swal.fire('Error', 'Failed to update status.', 'error');
      }
    });
  }
  onServerSearch() {
    this.fetchUsers(1, this.rows);
  }
  clearSearch() {
    this.searchText = '';
    this.fetchUsers(1, this.rows);
  }
  confirmDownload() {
    Swal.fire({
      title: 'Download Excel?',
      text: 'Do you want to download the business users Excel file?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, download',
      cancelButtonText: 'Cancel',
      showClass: { popup: 'animate__animated animate__fadeInDown' },
      hideClass: { popup: 'animate__animated animate__fadeOutUp' }
    }).then(result => {
      if (result.isConfirmed) {
        this.performExport();
      }
    });
  }
  performExport() {
    const payload: any = {
      page: this.currentPage ?? 1,
      per_page: this.rows ?? 10,
      export: 'excel'
    };

    if (this.searchText && this.searchText.trim()) {
      payload.search = this.searchText.trim();
    }

    this.loaderService.showLoader();

    this.genericService
      .exportBusinessUsersExcel(payload)
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

            blob
              .text()
              .then((text: string) => {
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
              })
              .catch((err: any) => {
                Swal.fire('Export Failed', 'Unable to read server response: ' + (err?.message || err), 'error');
              });

            return;
          }
          const blob = resp.body ?? new Blob([], { type: 'application/octet-stream' });
          let filename = 'business_users.xlsx';
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
              html: `<strong>${filename}</strong><div>Excel file exported successfully.</div>`,
              timer: 1800,
              showConfirmButton: false,
              showClass: { popup: 'animate__animated animate__zoomIn' },
              hideClass: { popup: 'animate__animated animate__zoomOut' }
            });
          } catch (downloadErr) {
            console.error('Download error:', downloadErr);
            Swal.fire('Error', 'Unable to download the exported file.', 'error');
          }
        },
        error: (err: any) => {
          console.error('Export failed:', err);
          Swal.fire('Error', 'Failed to export Excel. Check console for details.', 'error');
        }
      });
  }
}
