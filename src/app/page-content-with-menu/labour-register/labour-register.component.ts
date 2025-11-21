import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { IlogiSelectComponent } from '../../customInputComponents/ilogi-select/ilogi-select.component';
import { GenericService } from '../../_service/generic/generic.service';
import { LoaderService } from '../../_service/loader/loader.service';
import { Subscription, finalize } from 'rxjs';
import Swal from 'sweetalert2';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-labour-register',
  standalone: true,
  templateUrl: './labour-register.component.html',
  styleUrls: ['./labour-register.component.scss'],
  imports: [CommonModule, ReactiveFormsModule, IlogiSelectComponent, ButtonModule]
})
export class LabourRegisterComponent implements OnInit, OnDestroy {

  labourForm!: FormGroup;
  organizations: any[] = [];
  data: any[] = [];
  pageIndex = 0;
  pageSize = 10;

  subs = new Subscription();

  constructor(
    private genericService: GenericService,
    private loader: LoaderService
  ) { }

  ngOnInit(): void {
    this.labourForm = new FormGroup({
      organization: new FormControl(null),
      form: new FormControl(null)
    });

    this.subs.add(this.loadOrganizations());
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  loadOrganizations() {
    this.loader.showLoader();
    return this.genericService.getAllDepartmentNames()
      .pipe(finalize(() => this.loader.hideLoader()))
      .subscribe({
        next: (res: any) => {
          const list = res?.data || [];
          this.organizations = list.map((d: any) => ({
            id: d.id,
            name: d.name || d.department || d.department_name
          }));
        },
        error: () => {
          Swal.fire('Error', 'Unable to load organizations', 'error');
        }
      });
  }

  search() {
    const payload = {
      organization_id: this.labourForm.value.organization,
      form_type: this.labourForm.value.form
    };

    this.loader.showLoader();

    this.genericService.getByConditions(payload, 'get-labour-registered-data')
      .pipe(finalize(() => this.loader.hideLoader()))
      .subscribe({
        next: (res: any) => {
          this.data = res.data || [];
          this.pageIndex = 0;
        },
        error: () => {
          Swal.fire('Error', 'Search failed', 'error');
        }
      });
  }
  reset() {
    this.labourForm.reset();
    this.data = [];
  }
  get paginatedData() {
    const start = this.pageIndex * this.pageSize;
    return this.data.slice(start, start + this.pageSize);
  }

  get totalPages() {
    return Math.ceil(this.data.length / this.pageSize);
  }

  nextPage() {
    if (this.pageIndex < this.totalPages - 1) this.pageIndex++;
  }

  prevPage() {
    if (this.pageIndex > 0) this.pageIndex--;
  }
  exportExcel() {
    if (!this.data.length) return;

    const rows = this.data.map(d => `${d.org},${d.form},${d.date}`).join('\n');
    const blob = new Blob([`Organization,Form,Date\n${rows}`],
      { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'Labour_Register.csv';
    link.click();
  }
}
