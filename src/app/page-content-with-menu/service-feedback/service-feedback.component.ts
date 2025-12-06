import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  QueryList,
  Renderer2,
  ViewChild,
  ViewChildren
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Subscription, debounceTime } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import { FilterBarComponent } from '../filter-bar/filter-bar.component';
import { IlogiSelectComponent, SelectOption } from '../../customInputComponents/ilogi-select/ilogi-select.component';
import { LoaderService } from '../../_service/loader/loader.service';
import { GenericService } from '../../_service/generic/generic.service';
import { IlogiInputDateComponent } from '../../customInputComponents/ilogi-input-date/ilogi-input-date.component';
import { IlogiInputComponent } from '../../customInputComponents/ilogi-input/ilogi-input.component';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-service-feedback',
  standalone: true,
  imports: [
    CommonModule,
    IlogiInputComponent,
    ReactiveFormsModule,
    FilterBarComponent,
    IlogiInputDateComponent,
    IlogiSelectComponent,
    FormsModule
  ],
  templateUrl: './service-feedback.component.html',
  styleUrls: ['./service-feedback.component.scss'],
  animations: [
    trigger('pageFade', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('600ms cubic-bezier(.25,.8,.25,1)', style({ opacity: 1 }))
      ])
    ]),
    trigger('slideInHeader', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-15px)' }),
        animate('480ms 80ms cubic-bezier(.2,.8,.2,1)',
          style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('cardStagger', [
      transition(':enter', [
        query('.card',
          [
            style({ opacity: 0, transform: 'translateY(12px) scale(0.97)' }),
            stagger('120ms',
              animate('520ms cubic-bezier(.2,.8,.3,1)',
                style({ opacity: 1, transform: 'translateY(0) scale(1)' })
              )
            )
          ],
          { optional: true }
        )
      ])
    ]),
    trigger('chartFadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.92)' }),
        animate('600ms 120ms cubic-bezier(.2,.9,.3,1)',
          style({ opacity: 1, transform: 'scale(1)' }))
      ])
    ]),
    trigger('listStagger', [
      transition('* => *', [
        query(':enter',
          [
            style({ opacity: 0, transform: 'translateY(10px)' }),
            stagger('70ms',
              animate('420ms cubic-bezier(.2,.8,.2,1)',
                style({ opacity: 1, transform: 'translateY(0)' }))
            )
          ],
          { optional: true }
        ),

        query(':leave',
          [
            stagger('50ms',
              animate('260ms cubic-bezier(.2,.8,.2,1)',
                style({ opacity: 0, transform: 'translateY(-10px)' }))
            )
          ],
          { optional: true }
        )
      ])
    ]),
    trigger('noDataAnim', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.95) translateY(8px)' }),
        animate('480ms cubic-bezier(.25,.8,.25,1)',
          style({ opacity: 1, transform: 'scale(1) translateY(0)' }))
      ])
    ]),
    trigger('fadeUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(14px)' }),
        animate('420ms 60ms cubic-bezier(.2,.8,.3,1)',
          style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('380ms cubic-bezier(.3,.9,.3,1)', style({ opacity: 1 }))
      ])
    ])
  ]
})
export class ServiceFeedbackComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('barCanvas', { static: false }) barCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('pieCanvas', { static: false }) pieCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChildren('card') cards!: QueryList<ElementRef<HTMLElement>>;
  private sampleCounts = [12, 22, 55, 80, 120];
  private sampleSentiment = [70, 20, 10];
  private subs = new Subscription();
  pageSize: number = 10;
  currentPageSize: number = 1;
  totalPages: number = 0;
  serviceList: SelectOption[] = [];
  totalPagesArray: number[] = [];
  pageSizeOptions: number[] = [5, 10, 20, 50, 100];
  displayedData: any[] = [];
  filterForm: FormGroup;
  departmentsList: SelectOption[] = [];
  departments: Array<{ department_id: number, department_name: string, avg_rating?: number, ratings_count?: number }> = [];
  feedbacks: any[] = [];
  filteredFeedbacks: any[] = [];
  summary: any = { department_name: '-', avg_rating: 0, ratings_count: 0 };
  barChart!: Chart;
  pieChart!: Chart;
  private io?: IntersectionObserver;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private loaderService: LoaderService,
    private genericService: GenericService,
    private cdr: ChangeDetectorRef,
    private renderer: Renderer2,
    private snackBar: MatSnackBar
  ) {
    this.filterForm = this.fb.group({
      department_id: [null],
      service: [null],
      user_name: [''],
      from_dt: [''],
      to_dt: [''],
      duration: ['Last 30 Days']
    });
  }
  ngOnInit(): void {
    const departmentSubs = this.loadDepartmentList();
    this.subs.add(departmentSubs);
    const formSub = this.filterForm.valueChanges.pipe(debounceTime(300)).subscribe(() => {
      this.applyFiltersAndRefreshCharts();
    });
    this.subs.add(formSub);
    this.loadDepartments();
    this.feedbacks = [];
    this.filteredFeedbacks = [...this.feedbacks];
    this.filterForm.get('department')?.valueChanges.subscribe((deptId: any) => {
      if (deptId) {
        this.getServiceList(deptId);
        this.filterForm.get('service')?.reset();
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

  ngAfterViewInit(): void {
    const cardsArray = this.cards.toArray();
    cardsArray.forEach((c, i) => {
      this.renderer.setStyle(c.nativeElement, '--delay', `${i * 140}ms`);
    });
    this.io = new IntersectionObserver(
      entries => {
        entries.forEach((entry, idx) => {
          const el = entry.target as HTMLElement;
          if (entry.isIntersecting) {
            this.renderer.addClass(el, 'in-view');
          }
        });
      },
      { threshold: 0.12 }
    );
    cardsArray.forEach((c) => this.io!.observe(c.nativeElement));
    setTimeout(() => {
      this.createBarChart([0, 0, 0, 0, 0]);
      this.createPieChart([0, 0, 0]);
      this.applyFiltersAndRefreshCharts();
    }, 80);
  }
  resetPagination(): void {
    this.currentPageSize = 1;
    this.totalPages = 0;
    this.totalPagesArray = [];
    this.displayedData = [];
  }

  applyPagination(): void {
    if (!this.filteredFeedbacks || !Array.isArray(this.filteredFeedbacks)) {
      this.filteredFeedbacks = Array.isArray(this.feedbacks) ? [...this.feedbacks] : [];
    }
    const effectivePageSize = Number(this.pageSize) || 10;
    this.totalPages = this.filteredFeedbacks.length > 0 ? Math.ceil(this.filteredFeedbacks.length / effectivePageSize) : 0;
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
    // optional: debug log
    // console.log('applyPagination -> items:', this.filteredFeedbacks.length, 'pageSize:', effectivePageSize, 'totalPages:', this.totalPages, 'currentPage:', this.currentPageSize);
  }

  updateDisplayedData(): void {
    const effectivePageSize = Number(this.pageSize) || 10;
    const startIndex = (this.currentPageSize - 1) * effectivePageSize;
    const endIndex = startIndex + effectivePageSize;
    this.displayedData = this.filteredFeedbacks.slice(startIndex, endIndex);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPageSize = page;
      this.updateDisplayedData();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  nextPage(): void {
    if (this.currentPageSize < this.totalPages) {
      this.currentPageSize++;
      this.updateDisplayedData();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  prevPage(): void {
    if (this.currentPageSize > 1) {
      this.currentPageSize--;
      this.updateDisplayedData();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  onPageSizeChange(): void {
    this.pageSize = Number(this.pageSize) || 10;
    this.currentPageSize = 1;
    this.applyPagination();
  }

  get exportDisabled() {
    return !(this.filteredFeedbacks && this.filteredFeedbacks.length > 0);
  }

  ngOnDestroy(): void {
    if (this.barChart) this.barChart.destroy();
    if (this.pieChart) this.pieChart.destroy();
    if (this.io) this.io.disconnect();
  }
  private updateSentimentBadge(sentiment: number[]) {
    const total = sentiment.reduce((s, v) => s + v, 0) || 1;
    const positivePct = Math.round((sentiment[0] / total) * 100);
    const el = document.getElementById('sentimentPercent');
    if (el) el.textContent = `${positivePct}%`;
  }
  private createBarChart(initialCounts: number[]) {
    if (!this.barCanvas) return;
    if (this.barChart) this.barChart.destroy();

    const canvas = this.barCanvas.nativeElement;
    const ctx = canvas.getContext('2d')!;
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height || 400);
    gradient.addColorStop(0, '#003c5b');
    gradient.addColorStop(1, '#fda00f');

    this.barChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['1★', '2★', '3★', '4★', '5★'],
        datasets: [
          {
            label: 'Count',
            data: initialCounts,
            backgroundColor: gradient,
            borderRadius: 8,
            barPercentage: 0.64,
            categoryPercentage: 0.7,
            hoverBorderColor: '#fff',
            hoverBorderWidth: 2
          } as any
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 900,
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            enabled: true,
            backgroundColor: '#ffffff',
            titleColor: '#003c5b',
            bodyColor: '#08121a',
            borderColor: 'rgba(3,12,20,0.06)',
            borderWidth: 1
          },
          title: {
            display: true,
            text: 'Rating counts (1–5)',
            color: '#003c5b',
            padding: { top: 6, bottom: 10 },
            font: { size: 14, }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              color: '#0b1720'
            }
          },
          y: {
            beginAtZero: true,
            ticks: {
              precision: 0,
              color: '#0b1720'
            },
            grid: {
              color: 'rgba(3,12,20,0.04)'
            }
          }
        },
        hover: {
          mode: 'index'
        }
      }
    });
  }

  private createPieChart(initial: number[]) {
    if (!this.pieCanvas) return;
    if (this.pieChart) this.pieChart.destroy();
    const canvas = this.pieCanvas.nativeElement;
    const ctx = canvas.getContext('2d')!;
    const gradPositive = ctx.createLinearGradient(0, 0, canvas.width || 220, 0);
    gradPositive.addColorStop(0, '#003c5b');
    gradPositive.addColorStop(1, '#2a6a80');

    const gradNeutral = ctx.createLinearGradient(0, 0, canvas.width || 220, 0);
    gradNeutral.addColorStop(0, '#fda00f');
    gradNeutral.addColorStop(1, '#f57c00');

    const gradNegative = ctx.createLinearGradient(0, 0, canvas.width || 220, 0);
    gradNegative.addColorStop(0, '#c23a33');
    gradNegative.addColorStop(1, '#f05a47');

    this.pieChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Positive', 'Neutral', 'Negative'],
        datasets: [
          {
            data: initial,
            backgroundColor: [gradPositive as any, gradNeutral as any, gradNegative as any],
            hoverOffset: 14,
            borderWidth: 2,
            borderColor: 'rgba(255,255,255,0.85)'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '64%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              usePointStyle: true,
              pointStyle: 'circle',
              color: '#0b1720'
            }
          },
          tooltip: {
            enabled: true,
            callbacks: {
              label: (ctx) => {
                const val = ctx.raw as number;
                const sum = (ctx.chart.data.datasets![0].data as number[]).reduce((a, b) => a + b, 0) || 1;
                const pct = Math.round((val / sum) * 100);
                return `${ctx.label}: ${val} (${pct}%)`;
              }
            }
          },
          title: {
            display: true,
            text: 'Sentiment',
            color: '#003c5b',
            padding: { bottom: 8 }
          }
        },
        animation: {
          animateRotate: true,
          duration: 900,
          easing: 'easeOutCubic'
        }
      }
    });
  }
  loadDepartmentList() {
    this.loaderService.showLoader();
    this.genericService.getAllDepartmentNames()
      .pipe(finalize(() => this.loaderService.hideLoader()))
      .subscribe({
        next: (res: any) => {
          const deptData = res?.data || [];
          this.departmentsList = deptData.map((d: any) => ({ id: d.id, name: d.name }));
        },
        error: (err: any) => {
          this.departmentsList = [];
          console.error('Error loading departments', err);

          const message =
            err?.error?.message || 'Unable to fetch department list. Please try again.';

          this.snackBar.open(message, 'Close', {
            duration: 4000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
            panelClass: ['snack-error']
          });
        }
      });
  }

  loadDepartments() {
    this.loaderService.showLoader();
    this.isLoading = true;
    const s = this.genericService.getByConditions({}, 'api/user-feedback-list')
      .pipe(finalize(() => {
        this.loaderService.hideLoader();
        this.isLoading = false;
      }))
      .subscribe({
        next: (res: any) => {
          if (res?.status && Array.isArray(res.data)) {
            this.departments = res.data.map((d: any) => ({
              department_id: d.department_id,
              department_name: d.department_name,
              avg_rating: d.avg_rating,
              ratings_count: d.ratings_count
            }));
            this.summary = this.departments[0];

            if (this.departments.length) {
              this.filterForm.patchValue(
                { department_id: this.departments[0].department_id },
                { emitEvent: false }
              );
              this.onDepartmentSelect(this.departments[0].department_id);
            }
          } else {
            this.departments = [];
            Swal.fire({
              icon: 'info',
              title: 'No departments',
              text: res?.message || 'No departments found.'
            });
          }
        },

        error: () => {
          this.snackBar.open(
            'Unable to fetch list. Please try again.',
            'Close',
            {
              duration: 4000,
              horizontalPosition: 'center',
              verticalPosition: 'top',
              panelClass: ['snack-error', 'snack-animate']
            }
          );
        }
      });

    this.subs.add(s);
  }
  onDepartmentSelect(deptId: number | null) {
    if (!deptId) return;
    this.filterForm.patchValue({ department_id: deptId }, { emitEvent: false });
    this.fetchServiceFeedbackList(deptId);
  }

  // --- Updated fetchServiceFeedbackList (map new API fields into the shape the component expects) ---
  fetchServiceFeedbackList(department_id: number) {
    this.loaderService.showLoader();
    this.isLoading = true;
    const s = this.genericService.getByConditions({}, 'api/user/service-feedback-list')
      .pipe(finalize(() => { this.loaderService.hideLoader(); this.isLoading = false; }))
      .subscribe({
        next: (res: any) => {
          if (res?.status) {
            this.summary = res.summary || this.summary;
            this.feedbacks = Array.isArray(res.data)
              ? res.data.map((d: any) => ({
                user_name: d.username ?? d.user_name ?? '-',
                service: d.service ?? '-',
                rating: (d.satisfaction !== undefined && d.satisfaction !== null) ? d.satisfaction : (d.rating ?? null),
                feedback: d.feedback ?? '-',
                suggestions: d.suggestions ?? '-',
                created_at: d.submitted_on ?? d.created_at ?? ''
              }))
              : [];

            this.applyFiltersAndRefreshCharts();
            this.genericService.openSnackBar(
              res.message || 'Feedback loaded',
              'Close',
            );
          } else {
            this.feedbacks = [];
            this.filteredFeedbacks = [];
            this.updateCharts([0, 0, 0, 0, 0], [0, 0, 0]);
            Swal.fire({ icon: 'info', title: 'No data', text: res?.message || 'No feedback found.' });
          }
        },
        error: (err: any) => {
          this.feedbacks = [];
          this.filteredFeedbacks = [];
          this.updateCharts([0, 0, 0, 0, 0], [0, 0, 0]);

          const message =
            err?.error?.message || 'Unable to fetch feedbacks. Please try again.';

          this.genericService.openSnackBar(message, 'Close');

        }
      });

    this.subs.add(s);
  }

  applyFiltersAndRefreshCharts() {
    const vals = this.filterForm.value;
    const search = (vals.user_name || '').toString().trim().toLowerCase();
    const fromStr = vals.from_dt || '';
    const toStr = vals.to_dt || '';

    const start = fromStr ? this.parseDateString(fromStr) : null;
    const end = toStr ? this.parseDateString(toStr) : null;
    if (end) { end.setHours(23, 59, 59, 999); }
    this.filteredFeedbacks = this.feedbacks.filter(item => {
      let ok = true;

      if (search) {
        const hay = `${item.user_name || ''} ${item.feedback || ''} ${item.id || ''}`.toLowerCase();
        ok = ok && hay.includes(search);
      }

      if ((start || end) && item.created_at) {
        const d = this.parseApiDate(item.created_at);
        if (d) {
          if (start && d < start) ok = false;
          if (end && d > end) ok = false;
        }
      }

      return ok;
    });
    const ratingCounts = [0, 0, 0, 0, 0];
    let pos = 0, neu = 0, neg = 0;

    this.filteredFeedbacks.forEach(f => {
      const r = Number(f.rating);
      if (!isNaN(r) && r >= 1 && r <= 5) {
        ratingCounts[r - 1] += 1;
      }
      if (!isNaN(r)) {
        if (r >= 4) pos++;
        else if (r === 3) neu++;
        else if (r >= 1 && r <= 2) neg++;
      }
    });

    this.filteredFeedbacks.forEach(f => {
      const r = Number(f.rating);
      if (!isNaN(r) && r >= 1 && r <= 5) {
        ratingCounts[r - 1] += 1;
      }
      if (!isNaN(r)) {
        if (r >= 4) pos++;
        else if (r === 3) neu++;
        else if (r >= 1 && r <= 2) neg++;
      }
    });
    const sentiment = [pos, neu, neg];
    this.updateCharts(ratingCounts, sentiment);
    this.updateSentimentBadge(sentiment);
    this.summary.ratings_count = this.filteredFeedbacks.length;

    const validRatings = this.filteredFeedbacks
      .map(f => Number(f.rating))
      .filter(r => !isNaN(r) && r >= 1 && r <= 5);

    if (validRatings.length) {
      const avg = validRatings.reduce((a, b) => a + b, 0) / validRatings.length;
      this.summary.avg_rating = Number(avg.toFixed(2));
    } else {
      this.summary.avg_rating = null;
    }
    this.applyPagination();
    this.cdr.detectChanges();

  }


  parseApiDate(text: string): Date | null {
    try {
      const cleaned = (text || '').replace(' at ', ' ');
      const d = new Date(cleaned);
      if (!isNaN(d.getTime())) return d;
    } catch (e) { }
    return null;
  }

  parseDateString(s: string): Date | null {
    try {
      const d = new Date(s);
      if (!isNaN(d.getTime())) return d;
    } catch (e) { }
    return null;
  }

  private updateCharts(barCounts: number[], pieCounts: number[]) {
    if (!this.barChart) this.createBarChart(barCounts);
    else {
      this.barChart.data.datasets[0].data = barCounts;
      this.barChart.update();
    }

    if (!this.pieChart) this.createPieChart(pieCounts);
    else {
      this.pieChart.data.datasets[0].data = pieCounts;
      this.pieChart.update();
    }
  }
  exportExcel() {
    if (this.exportDisabled) return;
    const headers = ['#', 'User', 'Service', 'Submitted On', 'Satisfaction', 'Feedback', 'Suggestions'];
    const rows = this.filteredFeedbacks.map((r: any, idx: number) => [
      idx + 1,
      r.user_name || '-',
      r.service || '-',
      r.created_at || '-',
      r.rating ?? '-',
      (r.feedback || '-'),
      (r.suggestions || '-'),
    ]);
    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => '"' + String(cell).replace(/"/g, '""') + '"').join(','))
      .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.summary.department_name ? this.summary.department_name.replace(/\s+/g, '_') : 'feedback'}_export.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    const btn = document.querySelector('.btn-excel');
    if (btn) {
      (btn as HTMLElement).animate(
        [
          { transform: 'translateY(0) scale(1)' },
          { transform: 'translateY(-6px) scale(1.02)' },
          { transform: 'translateY(0) scale(1)' },
        ],
        { duration: 420, easing: 'cubic-bezier(.2,.8,.2,1)' }
      );
    }
  }
  refreshDashboard() {
    const dept = this.filterForm.value.department_id;
    if (dept) this.onDepartmentSelect(dept);
    else this.loadDepartments();
  }

  formatDate(created_at: string) {
    const d = this.parseApiDate(created_at);
    if (!d) return created_at || '-';
    return d.toLocaleString();
  }
  get totalCount(): number {
    return this.summary?.ratings_count || (this.feedbacks?.length || 0);
  }

  get avgRating(): string {
    return this.summary && this.summary.avg_rating ? (Number(this.summary.avg_rating).toFixed(2)) : '—';
  }

  get shownRows(): number {
    return this.filteredFeedbacks?.length || 0;
  }

  get positiveCount(): number {
    return this.filteredFeedbacks.filter(f => (f.rating || 0) >= 4).length;
  }

  get neutralCount(): number {
    return this.filteredFeedbacks.filter(f => (f.rating || 0) === 3).length;
  }

  get negativeCount(): number {
    return this.filteredFeedbacks.filter(f => (f.rating || 0) <= 2).length;
  }
}
