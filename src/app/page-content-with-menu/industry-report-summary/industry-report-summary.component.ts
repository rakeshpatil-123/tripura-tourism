import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { IlogiSelectComponent, SelectOption } from '../../customInputComponents/ilogi-select/ilogi-select.component';
import { IlogiInputDateComponent } from '../../customInputComponents/ilogi-input-date/ilogi-input-date.component';
import { GenericService } from '../../_service/generic/generic.service';
import { LoaderService } from '../../_service/loader/loader.service';
import { Subscription, throwIfEmpty } from 'rxjs';
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
  selector: 'app-industry-report-summary',
  standalone: true,
  templateUrl: './industry-report-summary.component.html',
  styleUrls: ['./industry-report-summary.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    IlogiSelectComponent,
    IlogiInputDateComponent,
    ButtonModule,
    ReactiveFormsModule
  ]
})


export class IndustryReportSummaryComponent implements OnInit, OnDestroy {
  currentPage = 'Industry Report summary';
  districts: SelectOption[] = [];
  subdivisions: SelectOption[] = [];
  fromDate: any;
  toDate: any;
  selectedDept: any;
  selectedDistrict: any;
  selectedSubDiv: any;
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
  departments: SelectOption[] = [];
  industrySummaryForm!: FormGroup
  constructor(private genericService: GenericService, loaderService: LoaderService, private fb: FormBuilder) {
    this.subs = new Subscription;
    const today = new Date();
    const past12Months = new Date();
    past12Months.setFullYear(today.getFullYear() - 1);
    this.industrySummaryForm = this.fb.group({
      district_code: [null],
      subdivision_code: [null],
      fromDate: [past12Months],
      toDate: [today],
    })
  };

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
  ngOnInit(): void {
    const districtSub = this.loadDistricts();
    if (districtSub) this.subs.add(districtSub);
    this.search();
    const valueChangesSub = this.industrySummaryForm.get('district_code')?.valueChanges.subscribe((id: any) => {
      const subdivisionSub = this.loadSubdivisions(id);
      if (subdivisionSub) this.subs.add(subdivisionSub);
    });

    if (valueChangesSub) this.subs.add(valueChangesSub);
  }

  search() {
    const formData = this.industrySummaryForm.value;

    const payload = {
      from_date: formData.fromDate,
      to_date: formData.toDate,
      district: formData.district_code,
      subdivision: formData.subdivision_code,
    };
    this.data = [];
    this.filteredData = [];
    this.displayedData = [];
    this.resetPagination();

    this.genericService
      .getByConditions(payload, 'api/report/industry-report-summary')
      .subscribe({
        next: (res: any) => {
          if (res?.status === 0) {
            Swal.fire({
              icon: "warning",
              title: "Validation Error",
              html: `<div style="font-size:16px; font-weight:500;">${res.message}</div>`,
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
              district_name: item.district_name ?? '—',
              sub_division_name: item.sub_division_name ?? '—',
              manufacturing_count: typeof item.manufacturing_count === 'number' ? item.manufacturing_count : (Number(item.manufacturing_count) || 0),
              services_count: typeof item.services_count === 'number' ? item.services_count : (Number(item.services_count) || 0)
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
          this.totalPages = 0;
          this.totalPagesArray = [];

          if (err?.error?.message) {
            Swal.fire({
              icon: "warning",
              title: "Validation Error",
              html: `<div style="font-size:16px; font-weight:500;">${err.error.message}</div>`,
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
  }
  resetPagination(): void {
    this.currentPageSize = 1;
    this.totalPages = 0;
    this.totalPagesArray = [];
  }

  applyPagination(): void {
    this.totalPages = this.filteredData.length > 0 ? Math.ceil(this.filteredData.length / this.pageSize) : 0;
    this.totalPagesArray = this.totalPages > 0 ? Array.from({ length: this.totalPages }, (_, i) => i + 1) : [];
    if (this.currentPageSize > this.totalPages && this.totalPages > 0) {
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

  onPageSizeChange(): void {
    this.currentPageSize = 1;
    this.applyPagination();
  }

  getDistrictName(id: number): string {
    const district = this.districts.find(x => x.id == id);
    return district ? district.name : "Unknown District";
  }

  getSubdivisionName(id: number): string {
    const subdivision = this.subdivisions.find(x => x.id == id);
    return subdivision ? subdivision.name : "Unknown Subdivision";
  }
  reset() {
    this.industrySummaryForm.reset({
      fromDate: null,
      toDate: null,
      district_code: null,
      subdivision_code: null,
    });
    this.districts = [];
    this.subdivisions = [];
    this.data = [];
    this.filteredData = [];
    this.displayedData = [];
    this.resetPagination();
    Swal.fire({
      icon: 'info',
      title: 'Reset Successful',
      text: 'All filters and report data have been cleared.',
      timer: 1500,
      showConfirmButton: false,
    });
  }
  loadDistricts(): Subscription {
    this.loadingDistricts = true;
    const sub = this.genericService.getByConditions({}, 'api/tripura/get-all-districts').subscribe({
      next: (res: any) => {
        if (res?.status === 1 && Array.isArray(res.districts)) {
          this.districts = res.districts.map((d: District) => ({
            id: d.district_code,
            name: d.district_name
          }));
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
    const selectedDistrict = this.districts.find(d => d.id === districtCode);
    if (!selectedDistrict) {
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
        }
      },
      error: (err: any) => {
        this.genericService.openSnackBar('Failed to load subdivisions', 'Error');
      }
    });

    return sub;
  }

  exportExcel() {
    if (!this.data.length) return alert('⚠️ No data available to export!');
    const rows = this.data
      .map(d => `${d.id},${d.dept},${d.district},${d.div},${d.report}`)
      .join('\n');
    const blob = new Blob(
      [`ID,Department,District,Division,Report\n${rows}`],
      { type: 'text/csv;charset=utf-8;' }
    );
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'Industry_Report_summary.csv';
    link.click();
  }
}
