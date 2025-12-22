import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as XLSX from 'xlsx';
import { GenericService } from '../../_service/generic/generic.service';
import {
  DynamicTableComponent,
  TableColumn,
  ColumnType,
} from '../../shared/component/table/table.component';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { IlogiInputComponent } from '../../customInputComponents/ilogi-input/ilogi-input.component';
import { SelectOption, IlogiSelectComponent } from '../../customInputComponents/ilogi-select/ilogi-select.component';
import { IlogiInputDateComponent } from '../../customInputComponents/ilogi-input-date/ilogi-input-date.component';
import { LoaderService } from '../../_service/loader/loader.service';
import { debounceTime, distinctUntilChanged, finalize } from 'rxjs';
import Swal from 'sweetalert2';

interface StatusActionModal {
  visible: boolean;
  applicationId: number;
  action: 'approved' | 'send_back' | 'rejected' | 'raise_extra_payment';
  title: string;
}

interface Subdivision {
  sub_division: string;
  sub_lgd_code: string;
}
interface District {
  district_code: string;
  district_name: string;
}

@Component({
  selector: 'app-applications',
  imports: [
    CommonModule,
    DynamicTableComponent,
    IlogiInputComponent,
    ReactiveFormsModule,
    IlogiSelectComponent,
    IlogiInputDateComponent,
  ],
  templateUrl: './applications.component.html',
  styleUrls: ['./applications.component.scss'],
  standalone: true,
})
export class ApplicationsComponent implements OnInit {
  departmentId: number | null = null;
  serviceId: number | null = null;
  currentServiceName: string = '';

  hierarchyLevels = [
    { id: '', name: 'None' },
    { id: 'block', name: 'Block' },
    { id: 'subdivision1', name: 'Subdivision 1' },
    { id: 'subdivision2', name: 'Subdivision 2' },
    { id: 'subdivision3', name: 'Subdivision 3' },
    { id: 'district1', name: 'District 1' },
    { id: 'district2', name: 'District 2' },
    { id: 'district3', name: 'District 3' },
    { id: 'state1', name: 'State 1' },
    { id: 'state2', name: 'State 2' },
    { id: 'state3', name: 'State 3' },
  ];

  statusOptions = [
    { id: '', name: 'None' },
    {id: 'noc_issued', name: 'NOC Issued'},
    { id: 'saved', name: 'Saved' },
    { id: 'submitted', name: 'Submitted' },
    { id: 'under_review', name: 'Under Review' },
    { id: 'approved', name: 'Approved' },
    { id: 'rejected', name: 'Rejected' },
    { id: 'send_back', name: 'Send Back' },
    { id: 're_submitted', name: 'Re-Submitted' },
    { id: 'extra_payment', name: 'Extra Payment' },
  ];

  districts: SelectOption[] = [];
  subdivisions: SelectOption[] = [];
  applications: any[] = [];
  filteredApplications: any[] = [];
  columns: TableColumn[] = [];
  isLoading: boolean = false;
  loadingDistricts = false;
  loadingSubdivisions = false;
  statusModal: StatusActionModal = {
    visible: false,
    applicationId: 0,
    action: 'approved',
    title: '',
  };
  remarkForm: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: GenericService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private loaderService: LoaderService
  ) {
    this.remarkForm = this.fb.group({
      remarks: ['', [Validators.required, Validators.minLength(5)]],
      district_id: [''],
      searchDate: [''],
      startDate: [''],
      endDate: [''],
      subdivision_id: [''],
      hierarchy_level: [''],
      current_status: [''],
      search: ['']
    });

  }
  ngOnInit(): void {
    this.loadParamsAndData();
    this.loadDistricts();

    this.remarkForm.get('district_id')?.valueChanges.subscribe(district => {
      this.loadSubdivisions(district);
      this.applyFilters();
    });
    this.remarkForm.get('searchDate')?.valueChanges.subscribe(() => {
      this.applyFilters();
    });
    this.remarkForm.get('startDate')?.valueChanges.subscribe(() => this.applyFilters());
    this.remarkForm.get('endDate')?.valueChanges.subscribe(() => this.applyFilters());

    this.remarkForm.get('subdivision_id')?.valueChanges.subscribe(() => this.applyFilters());
    this.remarkForm.get('hierarchy_level')?.valueChanges.subscribe(() => this.applyFilters());
    this.remarkForm.get('current_status')?.valueChanges.subscribe(() => this.applyFilters());
    this.remarkForm.get('search')?.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged()
      )
      .subscribe(() => this.applyFilters());
    this.setDefaultDateRange();
  }


  loadParamsAndData(): void {
    this.isLoading = true;

    this.route.params.subscribe((params) => {
      const deptId = +params['departmentId'];
      const servId = +params['serviceId'];

      if (isNaN(deptId) || isNaN(servId)) {
        this.apiService.openSnackBar('Invalid application link.', 'Close');
        this.router.navigate(['/departmental-services']);
        return;
      }

      this.departmentId = deptId;
      this.serviceId = servId;
      this.loadApplications();
    });
  }

  loadApplications(): void {
    const payload = {
      department_id: this.departmentId,
      service_id: this.serviceId,
    };
    this.loaderService.showLoader();
    const uid = this.apiService.getDecryptedUserId();
    const api1 = `api/department/user/${uid}/assigned-applications`;
    const api2 = `api/department/applications`;
    const viewMode = this.route.snapshot.queryParamMap.get('view');
    const selectedApi = viewMode === 'all-applications' ? api2 : api1;

    this.isLoading = true;

    this.apiService.getByConditions(payload, selectedApi).pipe(finalize(() => this.loaderService.hideLoader())).subscribe({
      next: (res: any) => {
        this.isLoading = false;

        if (
          res?.success === true ||
          (res?.status === 1 && Array.isArray(res.data))
        ) {
          this.applications = res.data.map((app: any) => ({
            ...app,
            hierarchy: this.capitalizeFirstLetter(app.hierarchy_level),
            payment_status: this.capitalizeFirstLetter(app.payment_status),
            submission_date: this.formatDateTime(app.submission_date),
            max_processing_date: this.formatDateTime(app.max_processing_date),
          }));
          this.currentServiceName = this.applications.length
            ? this.applications[0].service_name || ''
            : '';
          this.filteredApplications = [...this.applications];
          this.columns = this.generateColumns(this.applications);
        } else {
          this.applications = [];
          this.columns = [];
          this.apiService.openSnackBar(
            res?.message || 'No applications found.',
            'Close'
          );
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('API Error:', err);
        this.apiService.openSnackBar('Failed to load applications.', 'Close');
      },
    });
  }



  generateColumns(data: any[]): TableColumn[] {
    if (!Array.isArray(data) || data.length === 0) return [];
    const firstItem = data[0];
    const columns: TableColumn[] = [];

    const skipKeys = ['application_id', 'service_name', 'final_fee', 'extra_payment', 'total_fee', 'current_step_number', 'ulb_code', 'ulb_name', 'ward_code', 'ward_name', 'district_code', 'subdivision_code'];

    const columnConfig: Record<
      string,
      {
        type?: ColumnType;
        label?: string;
        width?: string;
        linkHref?: (row: any) => string;
      }
    > = {
      // application_id: {
      //   label: 'Application ID',
      //   width: '120px',
      //   type: 'link',
      //   linkHref: (row: any) => `/dashboard/service-view/${row.application_id}`,
      // },
      application_number: { label: 'Application Number', width: '190px', type: 'link', linkHref: (row: any) => `/dashboard/service-view/${row.application_id}`},
      // service_name: { label: 'Service', width: '180px' },
      applicant_name: { label: 'Applicant Name', width: '180px' },
      applicant_email: { label: 'Email', width: '200px' },
      applicant_mobile: { label: 'Mobile', width: '140px' },
      department: { label: 'Department', width: '160px' },
      status: { type: 'status', label: 'Status', width: '140px' },
      district: { label: 'District', width: '160px' },
      sub_division: { label: 'Subdivision', width: '160px' },
      hierarchy: { label: 'Hierarchy', width: '140px' },
      payment_status: { type: 'status', label: 'Payment Status', width: '140px' },
      submission_date: { type: 'text', label: 'Submission Date', width: '180px' },
      max_processing_date: { type: 'text', label: 'Max Processing Date', width: '180px' },
    };

    for (const key in firstItem) {
      if (!firstItem.hasOwnProperty(key)) continue;
      if (key === 'view' || skipKeys.includes(key)) continue;

      const config = columnConfig[key] || {};
      const type: ColumnType =
        config.type || this.guessColumnType(key, firstItem[key]);
      const label = config.label || this.formatLabel(key);
      const width = config.width;

      columns.push({
        key,
        label,
        type,
        sortable: true,
        ...(width && { width }),
        ...(config.linkHref && { linkHref: config.linkHref }),
      });
    }

    columns.push({
      key: 'view',
      label: 'View',
      type: 'icon',
      icon: 'visibility',
      width: '60px',
      onClick: (row: any) => {
        this.router.navigate(['/dashboard/service-view', row.application_id]);
      },
      sortable: false,
    });

    return columns;
  }

formatDateTime(dateTimeString: string): string {
  if (!dateTimeString) return '-';

  // Support numeric timestamps (seconds or milliseconds)
  let date: Date;
  if (/^\d+$/.test(dateTimeString.trim())) {
    const ts = Number(dateTimeString.trim());
    date = new Date(dateTimeString.trim().length === 10 ? ts * 1000 : ts);
  } else {
    date = new Date(dateTimeString);
  }

  if (isNaN(date.getTime())) return dateTimeString;

  // Format in a consistent timezone (Asia/Kolkata) and produce "YYYY-MM-DD HH:mm:ss"
  const dtf = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

  const parts = dtf.formatToParts(date).reduce<Record<string,string>>((acc, part) => {
    if (part.type !== 'literal') acc[part.type] = part.value;
    return acc;
  }, {});

  // Ensure we have all parts; otherwise fall back to original formatting
  const { year, month, day, hour, minute, second } = parts;
  if (!(year && month && day && hour && minute && second)) {
    // Fallback to original local formatting (previous behaviour)
    const y = date.getFullYear();
    const mo = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const h = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    const s = String(date.getSeconds()).padStart(2, '0');
    return `${y}-${mo}-${d} ${h}:${min}:${s}`;
  }

  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}


private capitalizeFirstLetter(str: string): string {
  if (!str) return str;

  // Normalize separators to spaces (underscores, hyphens, multiple separators)
  let s = str.replace(/[_-]+/g, ' ');

  // Split camelCase / PascalCase boundaries (e.g. "underReview" -> "under Review")
  s = s.replace(/([a-z0-9])([A-Z])/g, '$1 $2');

  // Separate letters from trailing digits (e.g. "subdivision1" -> "subdivision 1")
  s = s.replace(/([A-Za-z])([0-9])/g, '$1 $2').replace(/([0-9])([A-Za-z])/g, '$1 $2');

  // Collapse multiple spaces and trim
  s = s.replace(/\s+/g, ' ').trim();

  // Title-case each word to make it more meaningful ("under review" -> "Under Review")
  return s
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}


  openStatusModal(
    applicationId: number,
    action: 'approved' | 'send_back' | 'rejected' | 'raise_extra_payment',
    title: string
  ): void {
    this.statusModal.visible = true;
    this.statusModal.applicationId = applicationId;
    this.statusModal.action = action;
    this.statusModal.title = title;
    this.remarkForm.get('remarks')?.reset();
    this.cdr.detectChanges();
  }

  closeModal(): void {
    this.statusModal.visible = false;
    this.remarkForm.reset();
  }

  onSubmitStatus(): void {
    if (this.remarkForm.invalid) {
      this.remarkForm.markAllAsTouched();
      return;
    }

    const remarks = this.remarkForm.get('remarks')?.value;
    const { applicationId, action } = this.statusModal;

    this.updateApplicationStatus(applicationId, action, remarks);
    this.closeModal();
  }

  updateApplicationStatus(
    applicationId: number,
    status: string,
    remarks: string
  ): void {
    const payload = { status, remarks };

    this.apiService
      .getByConditions(
        payload,
        `api/department/applications/${applicationId}/status`
      )
      .subscribe({
        next: (res: any) => {
          if (res?.status === 1) {
            this.apiService.openSnackBar(
              `Application ${status.replace('_', ' ').toUpperCase()} successfully.`,
              'Close'
            );
            const app = this.applications.find(
              (a) => a.application_id === applicationId
            );
            if (app) app.status = status;
          } else {
            this.apiService.openSnackBar(res?.message || 'Failed to update status.', 'Close');
          }
        },
        error: (err) => {
          console.error('Status update failed:', err);
          this.apiService.openSnackBar(
            'Could not update status. Please try again.',
            'Close'
          );
        },
      });
  }

  guessColumnType(key: string, value: any): ColumnType {
    const keyLower = key.toLowerCase();
    if (keyLower.includes('date') || (keyLower.includes('at') && typeof value === 'string'))
      return 'date';
    if (keyLower.includes('name') || keyLower.includes('phone') || keyLower.includes('email'))
      return 'text';
    if (keyLower.includes('amount') || keyLower.includes('fee')) return 'currency';
    if (typeof value === 'number') return 'number';
    if (typeof value === 'boolean') return 'boolean';
    return 'text';
  }

  formatLabel(key: string): string {
    return key
      .replace(/_([a-z])/g, ' $1')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/^\w/, (c) => c.toUpperCase())
      .trim();
  }
  loadDistricts(): void {
    this.loadingDistricts = true;
    this.apiService.getByConditions({}, 'api/tripura/get-all-districts').subscribe({
      next: (res: any) => {
        if (res?.status === 1 && Array.isArray(res.districts)) {
          this.districts = [
            { id: '', name: 'None' },
            ...res.districts.map((d: District) => ({
              id: d.district_code,
              name: d.district_name
            }))
          ];
        }
        this.loadingDistricts = false;
      },
      error: (err: any) => {
        console.error('Failed to load districts:', err);
        this.apiService.openSnackBar('Failed to load districts', 'Error');
        this.loadingDistricts = false;
      }
    });
  }
  loadSubdivisions(districtCode: string): void {
    this.loadingSubdivisions = true;
    const selectedDistrict = this.districts.find(d => d.id === districtCode);
    if (!selectedDistrict) {
      this.loadingSubdivisions = false;
      return;
    }

    const payload = { district: selectedDistrict.name };
    this.apiService.getByConditions(payload, 'api/tripura/get-sub-subdivisions').subscribe({
      next: (res: any) => {
        if (res?.status === 1 && Array.isArray(res.subdivision)) {
          this.subdivisions = [
            { id: '', name: 'None' },
            ...res.subdivision.map((s: Subdivision) => ({
              id: s.sub_lgd_code,
              name: s.sub_division
            }))
          ];
        }
        this.loadingSubdivisions = false;
      },
      error: (err: any) => {
        console.error('Failed to load subdivisions:', err);
        this.apiService.openSnackBar('Failed to load subdivisions', 'Error');
        this.loadingSubdivisions = false;
      }
    });
  }


  private normalizeToYmd(dateRaw: any): string | null {
    if (!dateRaw) return null;
    if (dateRaw instanceof Date) {
      const d = dateRaw as Date;
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${dd}`;
    }
    if (typeof dateRaw === 'string') {
      const s = dateRaw.trim();
      if (/^\d{2}-\d{2}-\d{4}$/.test(s)) {
        const [d, m, y] = s.split('-');
        return `${y}-${m}-${d}`;
      }
      const parsed = new Date(s);
      if (!isNaN(parsed.getTime())) {
        const y = parsed.getFullYear();
        const m = String(parsed.getMonth() + 1).padStart(2, '0');
        const dd = String(parsed.getDate()).padStart(2, '0');
        return `${y}-${m}-${dd}`;
      }
      return s;
    }
    return null;
  }
  private applyFilters(): void {
    const payload: any = {};
    if (this.departmentId != null) payload.department_id = this.departmentId;
    if (this.serviceId != null) payload.service_id = this.serviceId;

    const status = this.remarkForm.get('current_status')?.value;
    if (status) payload.status = status;

    const districtId = this.remarkForm.get('district_id')?.value;
    if (districtId) payload.district_id = districtId;

    const subdivisionId = this.remarkForm.get('subdivision_id')?.value;
    if (subdivisionId) payload.subdivision_id = subdivisionId;

    const rawSearch = (this.remarkForm.get('search')?.value || '').toString().trim();
    if (rawSearch) {
      const numericOnly = rawSearch.replace(/\D/g, '');
      const looksLikePhone = numericOnly.length >= 3 && /^[\d+\-\s()]+$/.test(rawSearch);

      if (looksLikePhone) {
        payload.search = numericOnly;
      } else {
        payload.search = rawSearch;
      }
    }
    const startRaw = this.remarkForm.get('startDate')?.value ?? this.remarkForm.get('searchDate')?.value;
    const endRaw = this.remarkForm.get('endDate')?.value ?? this.remarkForm.get('searchDate')?.value;
    const startNorm = this.normalizeToYmd(startRaw);
    const endNorm = this.normalizeToYmd(endRaw);
    let dateFrom = startNorm;
    let dateTo = endNorm;
    if (dateFrom && dateTo) {
      if (new Date(dateFrom) > new Date(dateTo)) {
        const tmp = dateFrom;
        dateFrom = dateTo;
        dateTo = tmp;
      }
    }
    if (dateFrom) payload.date_from = dateFrom;
    if (dateTo) payload.date_to = dateTo;
    this.loadingSubdivisions = false;
    this.isLoading = true;
    this.loaderService.showLoader();

    this.apiService
      .getByConditions(payload, 'api/department/applications')
      .pipe(finalize(() => {
        this.isLoading = false;
        this.loaderService.hideLoader();
      }))
      .subscribe({
        next: (res: any) => {
          if (res?.status === 1 && Array.isArray(res.data)) {
            this.applications = res.data.map((app: any) => ({
              ...app,
              status: this.capitalizeFirstLetter(app.status),
              payment_status: this.capitalizeFirstLetter(app.payment_status),
              submission_date: this.formatDateTime(app.submission_date),
              max_processing_date: this.formatDateTime(app.max_processing_date),
            }));
            this.filteredApplications = [...this.applications];
            this.columns = this.generateColumns(this.applications);
            if (!this.currentServiceName && this.applications.length) {
              this.currentServiceName = this.applications[0].service_name || '';
            }
          } else {
            this.applications = [];
            this.filteredApplications = [];
            this.columns = [];
            this.apiService.openSnackBar(res?.message || 'No applications found.', 'Close');
          }
        },
        error: (err: any) => {
          console.error('Filter API error:', err);
          this.applications = [];
          this.filteredApplications = [];
          this.columns = [];
          this.apiService.openSnackBar('Failed to load applications. Please try again.', 'Close');
        },
      });
  }
  resetFilters(): void {
    this.remarkForm.patchValue(
      {
        district_id: '',
        subdivision_id: '',
        hierarchy_level: '',
        current_status: '',
        search: ''
      },
      { emitEvent: false }
    );
    this.setDefaultDateRange();
    this.subdivisions = [];
  }

  navigate(path: string): void {
    this.router.navigate([path]);
  }
  goToServices(): void {
    const target = '/dashboard/all-departmental-applications';
    const current = this.router.url;

    if (window.history.length > 1) {
      window.history.back();
      setTimeout(() => {
        if (this.router.url === current) {
          this.router.navigate([target]);
        }
      }, 350);
    } else {
      this.router.navigate([target]);
    }
  }
  private setDefaultDateRange(): void {
    const today = new Date();
    const oneYearBack = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
    this.remarkForm.patchValue(
      {
        startDate: oneYearBack,
        endDate: today
      },
      { emitEvent: false }
    );
    this.applyFilters();
  }
  async downloadExcel(): Promise<void> {
    const rowCount = this.filteredApplications?.length ?? 0;
    if (rowCount === 0) {
      this.apiService.openSnackBar('No data to export.', 'Close');
      return;
    }
    const confirm = await Swal.fire({
      title: `Export ${rowCount} application${rowCount > 1 ? 's' : ''}?`,
      html: `This will generate an Excel file containing <strong>${rowCount}</strong> application${rowCount > 1 ? 's' : ''}. Do you want to continue?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, export now',
      cancelButtonText: 'No, cancel',
      reverseButtons: true,
      showClass: { popup: 'swal-fade-in' },
      hideClass: { popup: 'swal-fade-out' },
      focusConfirm: false
    });

    if (!confirm.isConfirmed) {
      return;
    }
    Swal.fire({
      title: 'Preparing file...',
      html: `<div class="swal-loading-wrapper">
             <div class="swal-spinner" aria-hidden="true"></div>
             <div style="margin-top:10px; font-size:0.95rem">Generating Excel — please wait</div>
           </div>`,
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => Swal.showLoading()
    });

    try {
      const excelData = this.filteredApplications.map(app => ({
        'Application ID': app.application_id,
        'Service Name': app.service_name,
        'Applicant Name': app.applicant_name,
        'Applicant Email': app.applicant_email || '',
        'Applicant Phone': app.applicant_phone,
        'Department': app.department || '',
        'Status': app.status,
        'District': app.district_name || app.district || '',
        'Subdivision': app.subdivision_name || app.sub_division || '',
        'ULB': app.ulb_name || '',
        'Ward': app.ward_name || '',
        'Hierarchy': app.hierarchy || '',
        'Payment Status': app.payment_status,
        'Final Fee': app.final_fee || '0',
        'Extra Payment': app.extra_payment || '0',
        'Total Fee': app.total_fee || '0',
        'Submission Date': app.submission_date,
        'Max Processing Date': app.max_processing_date,
        'Current Step': app.current_step_number || ''
      }));

      const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(excelData);
      const workbook: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Applications');
      const fileName = `Applications_${this.serviceId || 'export'}_${new Date().toISOString().slice(0, 10)}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      Swal.close();
      await Swal.fire({
        title: 'Export complete!',
        html: `
    <div class="swal-success-graphic" aria-hidden="true">
      <svg viewBox="0 0 120 120" width="120" height="120" class="swal-checkmark">
        <circle cx="60" cy="60" r="54" class="swal-circle" fill="none" stroke-width="6" />
        <path class="swal-check" d="M34 64 L54 84 L88 48" fill="none" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </div>
    <div style="margin-top:8px">Your file <strong>${fileName}</strong> should be downloading now.</div>`,
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,
        allowOutsideClick: false,
        showClass: { popup: 'swal-pop-in' },
        hideClass: { popup: 'swal-pop-out' }
      });
    } catch (err: any) {
      Swal.close();
      Swal.fire({
        title: 'Export failed',
        html: `<p>Something went wrong while creating the file.<br><small>${(err && err.message) ? err.message : ''}</small></p>`,
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  }
}
