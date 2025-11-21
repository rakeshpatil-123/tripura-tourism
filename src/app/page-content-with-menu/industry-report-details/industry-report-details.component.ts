import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { IlogiSelectComponent, SelectOption } from '../../customInputComponents/ilogi-select/ilogi-select.component';
import { IlogiInputDateComponent } from '../../customInputComponents/ilogi-input-date/ilogi-input-date.component';
import { GenericService } from '../../_service/generic/generic.service';
import { LoaderService } from '../../_service/loader/loader.service';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';

interface District {
  district_code: string;
  district_name: string;
}

interface Subdivision {
  sub_division: string;
  sub_lgd_code: string;
}

@Component({
  selector: 'app-industry-report-details',
  standalone: true,
  templateUrl: './industry-report-details.component.html',
  styleUrls: ['./industry-report-details.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    IlogiSelectComponent,
    IlogiInputDateComponent,
    ButtonModule,
    ReactiveFormsModule
  ]
})
export class IndustryReportDetailsComponent implements OnInit, OnDestroy {
  currentPage = 'Industry Report details';
  districts: SelectOption[] = [];
  subdivisions: SelectOption[] = [];
  loadingDistricts = false;
  subs: Subscription;
  pageSize: number = 10;
  currentPageSize: number = 1;
  totalPages: number = 0;
  totalPagesArray: number[] = [];
  pageSizeOptions: number[] = [5, 10, 20, 50, 100];
  displayedData: any[] = [];
  filteredData: any[] = [];
  data: any[] = [];

  industryDetailsForm!: FormGroup;

  constructor(
    private genericService: GenericService,
    private loaderService: LoaderService,
    private fb: FormBuilder
  ) {
    this.subs = new Subscription();
    const today = new Date();
    const past12Months = new Date();
    past12Months.setFullYear(today.getFullYear() - 1);
    this.industryDetailsForm = this.fb.group({
      fromDate: [past12Months, Validators.required],
      toDate: [today, Validators.required],
      district_code: [null],
      subdivision_code: [null],
      department_id: [null]
    });
  }
  ngOnInit(): void {
    const districtSub = this.loadDistricts();
    if (districtSub) this.subs.add(districtSub);
    const searchSub = this.search();
    if (searchSub) this.subs.add(searchSub);

    const ctrl = this.industryDetailsForm.get('district_code');
    if (ctrl) {
      const valueChangesSub = ctrl.valueChanges.subscribe((id: any) => {
        const subdivisionSub = this.loadSubdivisions(id);
        if (subdivisionSub) this.subs.add(subdivisionSub);
      });
      this.subs.add(valueChangesSub);
    }
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  search(): Subscription | null {
    const formData = this.industryDetailsForm.value;
    const payload: any = {
      from_date: formData.fromDate,
      to_date: formData.toDate,
      district: formData.district_code,
      sub_division: formData.subdivision_code
    };

    if (formData.department_id) {
      payload.department_id = formData.department_id;
    }
    this.data = [];
    this.filteredData = [];
    this.displayedData = [];
    this.resetPagination();

    const sub = this.genericService
      .getByConditions(payload, 'api/report/industry-report-details')
      .subscribe({
        next: (res: any) => {
          if (res?.status === 0) {
            Swal.fire({
              icon: "warning",
              title: "Validation Error",
              html: `
              <div style="font-size:16px; font-weight:500; line-height:1.4;">
                ${res.message || "Invalid request parameters"}
              </div>
            `,
              showClass: { popup: "animate__animated animate__fadeInDown" },
              hideClass: { popup: "animate__animated animate__fadeOutUp" }
            });
            return;
          }
          if (res?.message === "No record found." || !res.data?.length) {
            this.data = [];
            this.filteredData = [];
            this.displayedData = [];
            this.resetPagination();

            Swal.fire({
              icon: "info",
              title: "No Records Found",
              html: `<div style="font-size:16px; font-weight:500;">
                     No industry report data found for the selected filters.
                   </div>`,
              showClass: { popup: "animate__animated animate__fadeInDown" },
              hideClass: { popup: "animate__animated animate__fadeOutUp" }
            });

            return;
          }
          if (res.status === 1 && Array.isArray(res.data)) {
            this.data = res.data.map((item: any) => ({
              district: item.district ?? 'N/A',
              subdivision: item.sub_division ?? item.subdivision ?? 'N/A',
              unique_id: item.unique_id ?? item.bin ?? item.id ?? 'N/A',
              enterprise_name: item.enterprise_name ?? item.name_of_enterprise ?? 'N/A',
              mobile_no: item.mobile_no ?? 'N/A',
              registration_date: item.registration_date ?? item.created_at ?? 'N/A',
              services_availed_count: item.services_availed_count ?? 0,
              activity: item.activity ?? item.activity_of_enterprise ?? 'N/A',
              product_manufacturing_process: item.product_manufacturing_process ?? 'N/A',
              category: item.category ?? item.category_of_enterprise ?? 'N/A',
              women_entrepreneur: this._formatWomenEntrepreneur(
                item.women_entrepreneur ?? item.owner_details_is_women_entrepreneur
              ),
              nic_2_digit: item.nic_2_digit ?? 'N/A',
              nic_4_digit: item.nic_4_digit ?? 'N/A',
              nic_5_digit: item.nic_5_digit ?? 'N/A',
              investment: item.investment ?? item.investment_details_total_project_cost ?? null,
              employment: item.employment ?? item.employment_details_total_employment ?? null,
              turnover: item.turnover ?? item.annual_turnover ?? null,
              land_type: item.land_type ?? item.unit_location_land_type ?? 'N/A',
              industrial_area_name: item.industrial_area_name ?? item.unit_location_estate_name ?? 'N/A'
            }));
            this.filteredData = [...this.data];
            this.applyPagination();
          }
        },
        error: (err: any) => {
          this.data = [];
          this.filteredData = [];
          this.displayedData = [];
          this.resetPagination();
          if (err?.error?.message) {
            Swal.fire({
              icon: "warning",
              title: "Validation Error",
              html: `
              <div style="font-size:16px; font-weight:500; line-height:1.4;">
                ${err.error.message}
              </div>
            `,
              showClass: { popup: "animate__animated animate__fadeInDown" },
              hideClass: { popup: "animate__animated animate__fadeOutUp" }
            });
            return;
          }

          Swal.fire({
            icon: "error",
            title: "Server Error",
            html: `<div style="font-size:16px; font-weight:500;">
                   Unable to load report data.<br>Please try again later.
                 </div>`,
            showClass: { popup: "animate__animated animate__shakeX" },
            hideClass: { popup: "animate__animated animate__fadeOut" }
          });
        }
      });

    return sub;
  }
  private _formatWomenEntrepreneur(val: any): string | null {
    if (val === null || val === undefined || val === '') return null;
    const v = String(val).toLowerCase();
    if (['1', 'yes', 'y', 'true', 't'].includes(v)) return 'Yes';
    if (['0', 'no', 'n', 'false', 'f'].includes(v)) return 'No';
    return null;
  }

  getDistrictName(id: number | string): string {
    const district = this.districts.find(x => x.id == id);
    return district ? district.name : "Unknown District";
  }

  getSubdivisionName(id: number | string): string {
    const subdivision = this.subdivisions.find(x => x.id == id);
    return subdivision ? subdivision.name : "Unknown Subdivision";
  }

  reset() {
    this.industryDetailsForm.reset({
      fromDate: null,
      toDate: null,
      district_code: null,
      subdivision_code: null,
      department_id: null
    });
    this.subdivisions = [];
    this.data = [];
    this.filteredData = [];
    this.displayedData = [];
    this.resetPagination();

    Swal.fire({
      icon: 'info',
      title: 'Reset Successful',
      text: 'All filters and report data have been cleared.',
      timer: 1200,
      showConfirmButton: false,
    });
  }
  resetPagination(): void {
    this.currentPageSize = 1;
    this.totalPages = 0;
    this.totalPagesArray = [];
    this.displayedData = [];
  }

  applyPagination(): void {
    if (!this.filteredData || !Array.isArray(this.filteredData)) {
      this.filteredData = Array.isArray(this.data) ? [...this.data] : [];
    }
    const effectivePageSize = Number(this.pageSize) || 10;
    this.totalPages = this.filteredData.length > 0 ? Math.ceil(this.filteredData.length / effectivePageSize) : 0;
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
    console.log('applyPagination -> items:', this.filteredData.length, 'pageSize:', effectivePageSize, 'totalPages:', this.totalPages, 'currentPage:', this.currentPageSize);
  }


  updateDisplayedData(): void {
    const effectivePageSize = Number(this.pageSize) || 10;
    const startIndex = (this.currentPageSize - 1) * effectivePageSize;
    const endIndex = startIndex + effectivePageSize;
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

  onPageSizeChange(): void {
    this.pageSize = Number(this.pageSize) || 10;
    this.currentPageSize = 1;
    this.applyPagination();
  }
  loadDistricts(): Subscription | null {
    this.loadingDistricts = true;
    const sub = this.genericService.getByConditions({}, 'api/tripura/get-all-districts').subscribe({
      next: (res: any) => {
        if (res?.status === 1 && Array.isArray(res.districts)) {
          this.districts = res.districts.map((d: District) => ({
            id: d.district_code,
            name: d.district_name
          }));
        } else {
          this.districts = [];
        }
        this.loadingDistricts = false;
      },
      error: (err: any) => {
        this.loadingDistricts = false;
        this.genericService.openSnackBar('Failed to load districts', 'Error');
      }
    });
    return sub;
  }

  loadSubdivisions(districtCode: string): Subscription | null {
    if (!districtCode) {
      this.subdivisions = [];
      return null;
    }

    const selectedDistrict = this.districts.find(d => d.id === districtCode);
    if (!selectedDistrict) {
      this.subdivisions = [];
      return null;
    }

    const payload = { district: selectedDistrict.name };

    const sub = this.genericService.getByConditions(payload, 'api/tripura/get-sub-subdivisions').subscribe({
      next: (res: any) => {
        if (res?.status === 1 && Array.isArray(res.subdivision)) {
          this.subdivisions = res.subdivision.map((s: Subdivision) => ({
            id: s.sub_lgd_code,
            name: s.sub_division
          }));
        } else {
          this.subdivisions = [];
        }
      },
      error: (err: any) => {
        this.genericService.openSnackBar('Failed to load subdivisions', 'Error');
      }
    });

    return sub;
  }

  exportExcel() {
    if (!this.data.length) {
      alert('⚠️ No data available to export!');
      return;
    }

    const headers = [
      'district',
      'sub_division',
      'unique_id',
      'enterprise_name',
      'mobile_no',
      'registration_date',
      'services_availed_count',
      'activity',
      'product_manufacturing_process',
      'category',
      'women_entrepreneur',
      'nic_2_digit',
      'nic_4_digit',
      'nic_5_digit',
      'investment',
      'employment',
      'turnover',
      'land_type',
      'industrial_area_name'
    ];

    const rows = this.data.map(row => {
      return headers.map(h => {
        const alias = this._aliasForHeader(h);
        let val = row[h];
        if ((val === undefined || val === null) && alias) {
          val = row[alias];
        }

        if (val === null || val === undefined) return '';
        const s = String(val).replace(/"/g, '""');
        return `"${s}"`;
      }).join(',');
    }).join('\n');

    const csv = `${headers.join(',')}\n${rows}`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = 'Industry_Report_Details.csv';
    link.click();
    URL.revokeObjectURL(url);
  }
  private _aliasForHeader(header: string): string | null {
    const map: any = {
      sub_division: 'subdivision',
      unique_id: 'bin',
      enterprise_name: 'name_of_enterprise',
      registration_date: 'created_at',
      activity: 'activity_of_enterprise',
      investment: 'investment_details_total_project_cost',
      employment: 'employment_details_total_employment',
      turnover: 'annual_turnover',
      land_type: 'unit_location_land_type',
      industrial_area_name: 'unit_location_estate_name'
    };
    return map[header] ?? null;
  }
}
