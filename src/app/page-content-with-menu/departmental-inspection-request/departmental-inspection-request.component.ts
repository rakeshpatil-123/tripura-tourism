import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from "@angular/material/card";
import { Router } from '@angular/router';
import { GenericService } from '../../_service/generic/generic.service';
import { LoaderService } from '../../_service/loader/loader.service';
import { finalize } from 'rxjs/operators';
import { DynamicTableComponent } from "../../shared/component/table/table.component";
import Swal from 'sweetalert2';

@Component({
  selector: 'app-departmental-inspection-request',
  standalone: true,
  imports: [CommonModule, MatCardModule, DynamicTableComponent],
  templateUrl: './departmental-inspection-request.component.html',
  styleUrls: ['./departmental-inspection-request.component.scss']
})
export class DepartmentalInspectionRequestComponent implements OnInit, OnChanges {
  deptId: any;
  inspectorId: any;
  inspections: any[] = [];
  filteredInspections: any[] = [];
  inspectors: any[] = []
  @Input() filters: any = {};
  inspectionColumns: any[] = [];
  holidays: any[] = [];
  constructor(
    private genericService: GenericService,
    private loaderService: LoaderService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.deptId = localStorage.getItem('deptId') || 1;
    this.inspectorId = this.genericService.decryptLocalStorageItem('userId') || '';
    this.initializeColumns();
    this.getInspectionList();
    this.getAllHolidays();
  }

  initializeColumns(): void {
    this.inspectionColumns = [
      { key: 'sno', label: 'S.No', type: 'number', width: '70px' },
      { key: 'request_id', label: 'Request ID', type: 'text' },
      { key: 'proposed_date', label: 'Proposed Date', type: 'text' },
      { key: 'inspection_type', label: 'Inspection Type', type: 'text' },
      { key: 'industry_name', label: 'Industry Name', type: 'text' },
      { key: 'inspector', label: 'Inspector Name', type: 'text' },
      { key: 'status', label: 'Status', type: 'badge' },

      {
        key: 'actions',
        label: 'Actions',
        type: 'action',
        width: '220px',
        actions: [
          {
            label: 'Approve',
            color: 'success',
            visible: (row: any) => row.status?.toLowerCase() === 'pending' || row.status?.toLowerCase() === 're_submitted',
            onClick: (row: any) => this.updateInspectionStatus(row, 'approved')
          },
          {
            label: 'Reject',
            color: 'danger',
            visible: (row: any) => row.status?.toLowerCase() === 'pending',
            onClick: (row: any) => this.updateInspectionStatus(row, 'rejected')
          }
        ]
      }
    ];
  }

  getInspectorsList(): void {
    this.genericService.getAllInspectorList(this.deptId).subscribe((res: any) => {
      if (res.status === 1) {
        this.inspections = res.data;
      }
    })
  }

  getInspectionList(): void {
  this.loaderService.showLoader();

  // Extract filters safely
  const { dateFrom, dateTo, industryName } = this.filters || {};
  const departmentId = this.deptId || 1;

  // Base endpoint
  let url = `api/department/inspections-by-department?department_id=${departmentId}`;

  // Utility to format date as YYYY-MM-DD
  const formatDate = (date: any): string | null => {
    if (!date) return null;
    const d = new Date(date);
    if (isNaN(d.getTime())) return null;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Format and append filters
  const formattedFrom = formatDate(dateFrom);
  const formattedTo = formatDate(dateTo);
  const params: string[] = [];

  if (industryName) params.push(`industry_name=${encodeURIComponent(industryName)}`);
  if (formattedFrom) params.push(`from_date=${encodeURIComponent(formattedFrom)}`);
  if (formattedTo) params.push(`to_date=${encodeURIComponent(formattedTo)}`);

  if (params.length > 0) {
    url += '&' + params.join('&');
  }

  // ✅ Call API
  this.genericService
    .getByConditions({}, url)
    .pipe(finalize(() => this.loaderService.hideLoader()))
    .subscribe({
      next: (res: any) => {
        if (res?.status === 1 && Array.isArray(res.data) && res.data.length > 0) {
          this.inspections = res.data.map((item: any, index: number) => ({
            sno: index + 1,
            id: item.id,
            request_id: item.request_id || 'N/A',
            proposed_date: this.formatProposedDate(item.proposed_date),
            inspection_type: item.inspection_type || 'N/A',
            industry_name: item.industry_name || 'N/A',
            inspector: item.inspector || 'Not Assigned',
            status: this.formatStatus(item.status)
          }));

          // Keep filteredInspections in sync (for dynamic filter view)
          this.filteredInspections = [...this.inspections];
        } else {
          this.inspections = [];
          this.filteredInspections = [];
        }
      },
      error: (err) => {
        console.error('Failed to fetch inspections:', err);
        this.genericService.openSnackBar('Failed to load inspections.', 'error');
        this.inspections = [];
        this.filteredInspections = [];
      }
    });
}


  //  updateInspectionStatus(row: any, status: string): void {
  //   const actionText = status === 'approved' ? 'Approve' : 'Reject';

  //   Swal.fire({
  //     title: `${actionText} Inspection?`,
  //     text: `Are you sure you want to ${actionText.toLowerCase()} this inspection request (${row.request_id})?`,
  //     icon: 'question',
  //     showCancelButton: true,
  //     confirmButtonText: `Yes, ${actionText}`,
  //     cancelButtonText: 'Cancel',
  //     reverseButtons: true,
  //     background: '#f9f9f9',
  //     color: '#333',
  //     confirmButtonColor: status === 'approved' ? '#28a745' : '#d33',
  //     cancelButtonColor: '#6c757d',
  //     customClass: {
  //       popup: 'swal2-rounded swal2-shadow-lg',
  //       confirmButton: 'swal2-confirm-btn',
  //       cancelButton: 'swal2-cancel-btn'
  //     },
  //     showClass: {
  //       popup: 'animate__animated animate__zoomIn animate__faster'
  //     },
  //     hideClass: {
  //       popup: 'animate__animated animate__zoomOut animate__faster'
  //     }
  //   }).then((result) => {
  //     if (result.isConfirmed) {
  //       const payload = {
  //         id: row.id,
  //         inspector: this.inspectorId || 1,
  //         status: status
  //       };

  //       this.loaderService.showLoader();
  //       this.genericService
  //         .getByConditions(payload, 'api/department/inspections-status-update')
  //         .pipe(finalize(() => this.loaderService.hideLoader()))
  //         .subscribe({
  //           next: (res: any) => {
  //             Swal.fire({
  //               title: `Inspection ${status}!`,
  //               text: `The inspection has been ${status} successfully.`,
  //               icon: status === 'approved' ? 'success' : 'error',
  //               confirmButtonColor: '#3085d6',
  //               background: '#ffffff',
  //               color: '#333',
  //               timer: 2500,
  //               showClass: {
  //                 popup: 'animate__animated animate__fadeInDown'
  //               },
  //               hideClass: {
  //                 popup: 'animate__animated animate__fadeOutUp'
  //               }
  //             });
  //             this.getInspectionList(); // refresh
  //           },
  //           error: (err) => {
  //             console.error('Failed to update inspection status:', err);
  //             Swal.fire({
  //               title: 'Error!',
  //               text: 'Failed to update inspection status.',
  //               icon: 'error',
  //               confirmButtonColor: '#d33',
  //               background: '#fff',
  //               color: '#333'
  //             });
  //           }
  //         });
  //     }
  //   });
  // }
  // updateInspectionStatus(row: any, status: string): void {
  //   const actionText = status === 'approved' ? 'Approve' : 'Reject';

  //   // Example: dynamic dropdown options
  //   const inspectionOptions: { [key: string]: string } = {
  //     'Inspection 1': 'inspection_1',
  //     'Inspection 2': 'inspection_2',
  //     'Inspection 3': 'inspection_3',
  //   };

  //   Swal.fire({
  //     title: `${actionText} Inspection?`,
  //     html: `
  //       <div style="text-align:left;">
  //         <label for="inspectionSelect" style="font-weight:500;">Select Inspection:</label>
  //         <select id="inspectionSelect" class="swal2-select" style="width:100%;padding:8px;margin-top:6px;">
  //           ${Object.entries(inspectionOptions)
  //             .map(([label, value]) => `<option value="${value}">${label}</option>`)
  //             .join('')}
  //         </select>
  //       </div>
  //     `,
  //     icon: 'question',
  //     showCancelButton: true,
  //     confirmButtonText: `Yes, ${actionText}`,
  //     cancelButtonText: 'Cancel',
  //     reverseButtons: true,
  //     background: '#f9f9f9',
  //     color: '#333',
  //     confirmButtonColor: status === 'approved' ? '#28a745' : '#d33',
  //     cancelButtonColor: '#6c757d',
  //     preConfirm: () => {
  //       const selectedValue = (document.getElementById('inspectionSelect') as HTMLSelectElement)?.value;
  //       if (!selectedValue) {
  //         Swal.showValidationMessage('Please select an inspection!');
  //       }
  //       return selectedValue;
  //     },
  //   }).then((result) => {
  //     if (result.isConfirmed) {
  //       const selectedInspection = result.value;
  //       const payload = {
  //         id: row.id,
  //         inspector: this.inspectorId || 1,
  //         selectedInspection,
  //         status: status,
  //       };

  //       this.loaderService.showLoader();
  //       this.genericService
  //         .getByConditions(payload, 'api/department/inspections-status-update')
  //         .pipe(finalize(() => this.loaderService.hideLoader()))
  //         .subscribe({
  //           next: (res: any) => {
  //             Swal.fire({
  //               title: `Inspection ${status}!`,
  //               text: `The inspection (${selectedInspection}) has been ${status} successfully.`,
  //               icon: status === 'approved' ? 'success' : 'error',
  //               confirmButtonColor: '#3085d6',
  //               background: '#ffffff',
  //               color: '#333',
  //               timer: 2500,
  //               showClass: { popup: 'animate__animated animate__fadeInDown' },
  //               hideClass: { popup: 'animate__animated animate__fadeOutUp' }
  //             });
  //             this.getInspectionList(); // refresh list
  //           },
  //           error: (err) => {
  //             console.error('Failed to update inspection status:', err);
  //             Swal.fire({
  //               title: 'Error!',
  //               text: 'Failed to update inspection status.',
  //               icon: 'error',
  //               confirmButtonColor: '#d33',
  //               background: '#fff',
  //               color: '#333'
  //             });
  //           }
  //         });
  //     }
  //   });
  // }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['filters'] && !changes['filters'].firstChange) {
      this.getInspectionList(); // fetch filtered data from API
    }
  }
  applyFilterLogic(): void {
    const { dateFrom, dateTo, industryName } = this.filters || {};

    this.filteredInspections = this.inspections.filter((inspection) => {
      const date = new Date(inspection.proposed_date);
      const from = dateFrom ? new Date(dateFrom) : null;
      const to = dateTo ? new Date(dateTo) : null;
      const industryMatch = industryName
        ? inspection.industry_name.toLowerCase().includes(industryName.toLowerCase())
        : true;

      const dateMatch =
        (!from || date >= from) &&
        (!to || date <= to);

      return industryMatch && dateMatch;
    });
  }

  updateInspectionStatus(row: any, status: string): void {
    const actionText = status === 'approved' ? 'Approve' : 'Reject';

    this.genericService.getAllInspectorList(this.deptId).subscribe((res: any) => {
      if (res.status === 1 && Array.isArray(res.data)) {
        const inspectorList = res.data;
        const inspectorOptions = inspectorList
          .map(
            (ins: any) =>
              `<option value="${ins.id}">${ins.authorized_person_name}</option>`
          )
          .join('');
        const inspectorDropdownHTML =
          status === 'approved'
            ? `
          <label for="inspectorSelect" style="font-weight:500;color:#444;">Select Inspector:</label>
          <select id="inspectorSelect" class="swal2-select" 
            style="width:80%;padding:10px;margin-top:8px;border-radius:8px;border:1px solid #ccc;outline:none;">
            <option value="">-- Choose Inspector --</option>
            ${inspectorList
              .map(
                (ins: any) =>
                  `<option value="${ins.id}">${ins.authorized_person_name}</option>`
              )
              .join('')}
          </select>
        `
            : '';

        Swal.fire({
          title: `<span style="font-size:22px;font-weight:600;color:#333;">${actionText} Inspection Request</span>`,
          html: `
          <div style="text-align:left;font-family:'Inter',sans-serif;">
             ${inspectorDropdownHTML}

            <label for="remarkInput" style="font-weight:500;color:#444;margin-top:15px;display:block;">Remark:</label>
            <textarea id="remarkInput" rows="3" placeholder="Enter your remark..." 
              style="width:100%;padding:10px;margin-top:8px;color:black;border-radius:8px;background: white;border:1px solid #ccc;resize:vertical;outline:none;"></textarea>
          </div>
        `,
          showCancelButton: true,
          confirmButtonText: `Yes, ${actionText}`,
          cancelButtonText: 'Cancel',
          reverseButtons: true,
          focusConfirm: false,
          width: '480px',
          background: '#ffffff',
          color: '#333',
          confirmButtonColor: status === 'approved' ? '#28a745' : '#d33',
          cancelButtonColor: '#6c757d',
          showClass: {
            popup: 'animate__animated animate__zoomIn animate__faster'
          },
          hideClass: {
            popup: 'animate__animated animate__zoomOut animate__faster'
          },
          customClass: {
            popup: 'swal2-rounded swal2-shadow-lg',
            confirmButton: 'swal2-confirm-btn',
            cancelButton: 'swal2-cancel-btn'
          },
          preConfirm: () => {
            const inspectorSelect = (document.getElementById('inspectorSelect') as HTMLSelectElement)?.value;
            const remarkInput = (document.getElementById('remarkInput') as HTMLTextAreaElement)?.value.trim();

            if (!inspectorSelect && actionText === 'Approve') {
              Swal.showValidationMessage('Please select an inspector!');
              return false;
            }
            if (!remarkInput) {
              Swal.showValidationMessage('Please enter a remark!');
              return false;
            }

            return { inspectorId: inspectorSelect, remark: remarkInput };
          }
        }).then((result) => {
          if (result.isConfirmed && result.value) {
            const { inspectorId, remark } = result.value;

            const payload = {
              id: row.id,
              inspector: inspectorId,
              remark: remark,
              status: status
            };

            this.loaderService.showLoader();
            this.genericService
              .getByConditions(payload, 'api/department/inspections-status-update')
              .pipe(finalize(() => this.loaderService.hideLoader()))
              .subscribe({
                next: (res: any) => {
                  Swal.fire({
                    title: `Inspection ${status}!`,
                    html: `
                    <div style="font-size:15px;color:#444;">
                      Request ID: <b>${row.request_id}</b><br>
                      Inspector: <b>${inspectorList.find((i: any) => i.id == inspectorId)?.authorized_person_name}</b><br>
                      Remark: <b>${remark}</b>
                    </div>
                  `,
                    icon: status === 'approved' ? 'success' : 'error',
                    background: '#ffffff',
                    color: '#333',
                    confirmButtonColor: '#3085d6',
                    timer: 2500,
                    showClass: { popup: 'animate__animated animate__fadeInDown' },
                    hideClass: { popup: 'animate__animated animate__fadeOutUp' }
                  });
                  this.getInspectionList();
                },
                error: (err) => {
                  console.error('Failed to update inspection status:', err);
                  Swal.fire({
                    title: 'Error!',
                    text: 'Failed to update inspection status.',
                    icon: 'error',
                    confirmButtonColor: '#d33',
                    background: '#fff',
                    color: '#333'
                  });
                }
              });
          }
        });
      } else {
        Swal.fire({
          title: 'No Inspectors Found!',
          text: 'Please add inspectors first before approving or rejecting.',
          icon: 'warning',
          confirmButtonColor: '#3085d6'
        });
      }
    });
  }

  getAllHolidays(): void {
    this.loaderService.showLoader();
    this.genericService.viewHolidays({}).pipe(finalize(() => this.loaderService.hideLoader())).subscribe({
      next: (res: any) => {
        if (res?.status === 1 && Array.isArray(res.data)) {
          this.holidays = res.data;
        } else {
          this.holidays = [];
        }
      },
      error: () => {
        this.genericService.openSnackBar('Failed to load holidays', 'Close');
        this.holidays = [];
      }
    });
  }

  filterByDateRange(list: any[], dateFrom: Date | null, dateTo: Date | null) {
    if (!dateFrom && !dateTo) return list;

    return list.filter((item) => {
      const dates = (item.proposed_date || '')
        .split(',')
        .map((d: string) => new Date(d.trim()))
        .filter((d: any) => !isNaN(d.getTime()));

      return dates.some((d: any) => {
        const afterStart = !dateFrom || d >= dateFrom;
        const beforeEnd = !dateTo || d <= dateTo;
        return afterStart && beforeEnd;
      });
    });
  }
  formatStatus(status: string): string {
    if (!status) return 'N/A';
    const s = status.toLowerCase();
    if (s.includes('pending')) return 'Pending';
    if (s.includes('approved')) return 'Approved';
    if (s.includes('rejected')) return 'Rejected';
    return status;
  }
  formatProposedDate(rawDate: any): string {
    if (!rawDate || rawDate === 'null') return 'N/A';

    let dates: string[] = [];
    if (typeof rawDate === 'string' && rawDate.trim().startsWith('[')) {
      try {
        const parsed = JSON.parse(rawDate);
        if (Array.isArray(parsed)) dates = parsed;
      } catch {
        dates = [rawDate];
      }
    }
    else if (Array.isArray(rawDate)) {
      dates = rawDate;
    }
    else {
      dates = [rawDate];
    }
    const formattedDates = dates
      .map((d) => {
        const date = new Date(d);
        if (isNaN(date.getTime())) return null;
        return date.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        });
      })
      .filter(Boolean);

    return formattedDates.length ? formattedDates.join(', ') : 'N/A';
  }

}
