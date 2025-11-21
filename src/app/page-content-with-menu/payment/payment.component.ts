import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { IlogiInputDateComponent } from '../../customInputComponents/ilogi-input-date/ilogi-input-date.component';
import { IlogiSelectComponent, SelectOption } from '../../customInputComponents/ilogi-select/ilogi-select.component';
import { GenericService } from '../../_service/generic/generic.service';
import { LoaderService } from '../../_service/loader/loader.service';
import { Subscription, finalize } from 'rxjs';

@Component({
  selector: 'app-payment',
  standalone: true,
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    IlogiInputDateComponent,
    IlogiSelectComponent
  ]
})
export class PaymentComponent implements OnInit, OnDestroy {

  currentPage = 'Payment';
  form!: FormGroup;

  data: any[] = [];
  departments: SelectOption[] = [];

  reportTypes: SelectOption[] = [
    { id: 'usage', name: 'Usage Report' },
    { id: 'payment', name: 'Payment Report' },
    { id: 'summary', name: 'Summary Report' },
  ];

  subs = new Subscription();

  constructor(
    private fb: FormBuilder,
    private genericService: GenericService,
    private loaderService: LoaderService
  ) { }

  ngOnInit(): void {
    this.form = this.fb.group(
      {
        fromDate: [null, Validators.required],
        toDate: [null, Validators.required],
        department: [''],
        reportType: ['', Validators.required]
      },
      { validators: this.dateRangeValidator }
    );

    const deptSubs = this.loadDepartments();
    this.subs.add(deptSubs);
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
  dateRangeValidator(group: FormGroup) {
    const from = group.get('fromDate')?.value;
    const to = group.get('toDate')?.value;

    if (from && to && new Date(from) > new Date(to)) {
      return { dateInvalid: true };
    }
    return null;
  }
  loadDepartments() {
    this.loaderService.showLoader();
    return this.genericService
      .getAllDepartmentNames()
      .pipe(finalize(() => this.loaderService.hideLoader()))
      .subscribe({
        next: (res: any) => {
          const list =
            res?.data && Array.isArray(res.data)
              ? res.data
              : res?.data?.departments || [];

          if (Array.isArray(list)) {
            this.departments = [
              { id: '', name: 'All Departments' },
              ...list.map((d: any) => ({
                id: d.id?.toString() || '',
                name: d.name || d.department_name || d.department
              }))
            ];
          }
        },
        error: () => {
          this.departments = [{ id: '', name: 'All Departments' }];
        }
      });
  }
  search() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const payload = {
      fromDate: this.formatDate(this.form.value.fromDate),
      toDate: this.formatDate(this.form.value.toDate),
      department: this.form.value.department,
      reportType: this.form.value.reportType
    };
    this.loaderService.showLoader();
    this.genericService
      .getByConditions(payload, 'dummy-payment-report')
      .pipe(finalize(() => this.loaderService.hideLoader()))
      .subscribe((res: any) => {
        this.data = res.data || [];
      });
    this.data = [
      { id: 1, dept: 'Finance', report: 'Usage Report', amount: '₹20,000' },
      { id: 2, dept: 'Commerce', report: 'Payment Report', amount: '₹15,000' }
    ];
  }
  reset() {
    this.form.reset();
    this.data = [];
  }
  exportExcel() {
    if (!this.data.length) return alert('No data to export!');

    const rows = this.data
      .map(d => `${d.id},${d.dept},${d.report},${d.amount}`)
      .join('\n');

    const blob = new Blob(
      [`ID,Department,Report,Amount\n${rows}`],
      { type: 'text/csv;charset=utf-8;' }
    );

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'Payment_Report.csv';
    link.click();
  }
  formatDate(date: any): string {
    if (!date) return '';
    return new Date(date).toISOString().slice(0, 10);
  }
}
