import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { TableModule } from 'primeng/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { GenericService } from '../../_service/generic/generic.service';
import { TooltipModule } from 'primeng/tooltip';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import Swal from 'sweetalert2';
import { LoaderService } from '../../_service/loader/loader.service';
import { finalize } from 'rxjs';
import { Router } from '@angular/router';
import { HttpResponse } from '@angular/common/http';

@Component({
  selector: 'app-departmental-services',
  templateUrl: './all-department-applications.component.html',
  styleUrls: ['./all-department-applications.component.scss'],
  imports: [
    CommonModule,
    TableModule,
    MatIconModule,
    MatButtonModule,
    TooltipModule,
    FormsModule,
    InputTextModule,
    ButtonModule
  ],
})
export class AllDepartmentApplicationsComponent implements OnInit {
  services: any[] = [];
  serviceColumns: any[] = [];
  displayedColumns: { field: string; header: string }[] = [];

  isLoading: boolean = false;
  totalRecords: number = 0;
  rows: number = 10;
  currentPage: number = 1;

  searchText: string = '';
  globalFilterFields: string[] = [];

  constructor(
    private apiService: GenericService,
    private router: Router,
    private loaderService: LoaderService
  ) { }

  ngOnInit(): void {
    const deptId = localStorage.getItem('deptId');
    if (!deptId) {
      this.apiService.openSnackBar('Department ID not found.', 'Close');
    }
    this.fetchServices(1, this.rows);
  }

  fetchServices(page: number = 1, rowCount: number = this.rows) {
    this.isLoading = true;
    this.loaderService.showLoader();

    const departmentId = localStorage.getItem('deptId') || '';
    const payload: any = {
      department_id: departmentId,
      page: page,
      row_count: rowCount
    };

    if (this.searchText && this.searchText.trim()) {
      payload.search = this.searchText.trim();
    }
    this.apiService
      .getByConditions(payload, 'api/department/services')
      .pipe(finalize(() => this.loaderService.hideLoader()))
      .subscribe({
        next: (res: any) => {
          this.isLoading = false;

          if (res?.status === 1 && Array.isArray(res.data)) {
            this.services = res.data;
            this.totalRecords = res?.pagination?.total ?? (Array.isArray(res.data) ? res.data.length : 0);
            this.currentPage = res?.pagination?.current_page ?? page;
            this.rows = res?.pagination?.row_count ?? rowCount;
            this.serviceColumns = this.generateColumns(res.data);
            const preferredOrder = [
              'service_name',
              'total_applications',
              'pending_applications',
              'target_days',
              'actions'
            ];
            this.displayedColumns = [];
            preferredOrder.forEach(key => {
              const found = this.serviceColumns.find((c: any) => c.key === key);
              if (found) {
                this.displayedColumns.push({ field: found.key, header: found.label });
              }
            });

            if (!this.displayedColumns.some(c => c.field === 'actions')) {
              this.displayedColumns.push({ field: 'actions', header: 'Actions' });
            }

            this.globalFilterFields = this.displayedColumns
              .map(c => c.field)
              .filter(f => f !== 'actions');
          } else {
            this.services = [];
            this.displayedColumns = [];
            this.totalRecords = 0;
            this.apiService.openSnackBar(res?.message || 'No services found for this department.', 'Close');
          }
        },
        error: (err) => {
          this.isLoading = false;
          this.services = [];
          this.displayedColumns = [];
          this.totalRecords = 0;
          console.error('Error loading services:', err);
          this.apiService.openSnackBar('Failed to load services.', 'Close');
        }
      });
  }

  applyClientSearch(dt: any) {
    const q = (this.searchText || '').trim();
    if (!dt) {
      return;
    }

    if (!q) {
      try { dt.reset(); } catch { }
      return;
    }

    try {
      dt.filterGlobal(q.toLowerCase(), 'contains');
    } catch (e) {
      try { dt.reset(); } catch { }
    }
  }

  clearClientSearch(dt: any) {
    this.searchText = '';
    if (!dt) return;
    try {
      dt.reset();
    } catch {
    }
  }


  getCellText(row: any, field: string) {
    return (row && row[field] !== undefined && row[field] !== null) ? String(row[field]) : '----';
  }
  getTooltip(row: any, field: string): string {
    if (!row) return '';

    if (field === 'service_name') {
      const name = row.service_name ? String(row.service_name) : 'Unknown Service';
      const id = row.service_id !== undefined && row.service_id !== null ? `ID: ${row.service_id}` : '';
      return id ? `${name}\n${id}` : name;
    }

    if (field === 'total_applications') {
      const val = row.total_applications ?? 0;
      return `Total: ${val}`;
    }

    if (field === 'pending_applications') {
      const val = row.pending_applications ?? 0;
      return `Pending: ${val}`;
    }

    if (field === 'target_days') {
      const val = row.target_days ?? '-';
      return `Target: ${val}`;
    }
    return this.getCellText(row, field);
  }
  generateColumns(data: any[]): any[] {
    if (!Array.isArray(data) || data.length === 0) {
      return [
        { key: 'service_name', label: 'Service Name', type: 'link' },
        { key: 'actions', label: 'Actions', type: 'action' }
      ];
    }

    const firstItem = data[0];
    const columns: any[] = [];

    for (const key in firstItem) {
      if (!firstItem.hasOwnProperty(key)) continue;

      let label = this.formatLabel(key);
      if (key === 'service_name') {
        columns.push({ key, label, type: 'link', sortable: true });
      } else {
        columns.push({ key, label, type: 'text', sortable: true });
      }
    }
    columns.push({
      key: 'actions',
      label: 'Actions',
      type: 'action',
      width: '140px',
      actions: [
        {
          label: 'View applications',
          color: 'success',
          onClick: (row: any) => this.viewApplications(row)
        }
      ]
    });

    return columns;
  }

  formatLabel(key: string): string {
    return key
      .replace(/_([a-z])/g, ' $1')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/^\w/, (c) => c.toUpperCase())
      .trim();
  }
  onServiceNameClick(row: any) {
    const deptId = this.getDepartmentId();
    if (!deptId || !row?.service_id) {
      this.apiService.openSnackBar('Missing required IDs.', 'Close');
      return;
    }
    this.router.navigate(['dashboard/all-service-application', deptId, row.service_id], {
      queryParams: { view: 'all-applications' },
    });
  }

  viewApplications(row: any) {
    const deptId = this.getDepartmentId();
    if (!deptId || !row?.service_id) {
      this.apiService.openSnackBar('Missing required IDs.', 'Close');
      return;
    }
    this.router.navigate(['dashboard/all-service-application', deptId, row.service_id], {
      queryParams: { view: 'all-applications' },
    });
  }

  getDepartmentId(): number | null {
    const deptId = localStorage.getItem('deptId');
    return deptId ? Number(deptId) : null;
  }

  confirmDownload() {
    Swal.fire({
      title: 'Download Excel?',
      text: 'Do you want to export applications data Excel file?',
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
      row_count: this.rows ?? 10,
      export: 'excel',
      department_id: this.getDepartmentId()
    };

    if (this.searchText && this.searchText.trim()) {
      payload.search = this.searchText.trim();
    }

    this.loaderService.showLoader();
    this.apiService
      .getAllDepartmentalApplicationExportExcel()
      .pipe(finalize(() => this.loaderService.hideLoader()))
      .subscribe({
        next: (res: Blob | HttpResponse<Blob>) => {
          let blobBody: Blob | null = null;
          let filename = 'applications_data_export.xlsx';

          if (res instanceof Blob) {
            blobBody = res;
          } else if ((res as HttpResponse<Blob>).body) {
            const httpResp = res as HttpResponse<Blob>;
            blobBody = httpResp.body ?? null;
            const disposition = httpResp.headers?.get('content-disposition') || '';
            const filenameMatch = /filename\*?=(?:UTF-8'')?["']?([^;"']+)["']?/i.exec(disposition);
            if (filenameMatch && filenameMatch[1]) {
              try {
                filename = decodeURIComponent(filenameMatch[1]);
              } catch {
                filename = filenameMatch[1];
              }
            }
          }

          if (!blobBody || blobBody.size === 0) {
            Swal.fire('No Data', 'No records available for export.', 'info');
            return;
          }

          try {
            const downloadBlob = new Blob([blobBody], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = window.URL.createObjectURL(downloadBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);

            Swal.fire({
              icon: 'success',
              title: 'Downloaded!',
              html: `<strong>${filename}</strong><div>Excel file exported successfully.</div>`,
              timer: 1800,
              showConfirmButton: false
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
