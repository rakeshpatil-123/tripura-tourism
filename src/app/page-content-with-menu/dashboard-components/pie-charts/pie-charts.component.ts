import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild,
  ElementRef,
  ChangeDetectorRef,
  AfterViewInit,
  OnDestroy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  NgApexchartsModule,
  ChartComponent,
  ApexChart,
  ApexNonAxisChartSeries,
  ApexLegend,
  ApexResponsive,
  ApexTitleSubtitle,
  ApexTooltip
} from 'ng-apexcharts';
import {
  trigger,
  state,
  style,
  transition,
  animate,
  keyframes
} from '@angular/animations';

export type PieChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  labels: string[];
  colors: string[];
  legend: ApexLegend;
  responsive: ApexResponsive[];
  title: ApexTitleSubtitle;
  tooltip: ApexTooltip;
};

const revealAnimation = trigger('reveal', [
  state('hidden', style({ opacity: 0, transform: 'translateY(18px) scale(0.995)' })),
  state('visible', style({ opacity: 1, transform: 'translateY(0) scale(1)' })),
  transition(
    'hidden => visible',
    animate(
      '760ms cubic-bezier(0.22, 1, 0.36, 1)',
      keyframes([
        style({ opacity: 0, transform: 'translateY(18px) scale(0.995)', offset: 0 }),
        style({ opacity: 0.6, transform: 'translateY(8px) scale(0.998)', offset: 0.6 }),
        style({ opacity: 1, transform: 'translateY(0) scale(1)', offset: 1.0 })
      ])
    )
  ),
  transition('visible => hidden', animate('420ms ease'))
]);

@Component({
  selector: 'app-pie-chart',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './pie-charts.component.html',
  styleUrl: './pie-charts.component.scss',
  animations: [revealAnimation]
})
export class PieChartsComponent implements OnChanges, AfterViewInit, OnDestroy {
  @Input() data: any[] | null = null;
  @ViewChild('chart') chart!: ChartComponent;
  @ViewChild('container', { static: false }) container?: ElementRef<HTMLDivElement>;
  public chartOptions: PieChartOptions | null = null;

  public hasData = false;
  public visible = false;

  private observer?: IntersectionObserver;

  constructor(private cdr: ChangeDetectorRef) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      if (!Array.isArray(this.data)) {
        this.data = [];
      }
      this.prepareChartData();
    }
  }

  ngAfterViewInit(): void {
    try {
      this.observer = new IntersectionObserver(
        entries => {
          for (const entry of entries) {
            if (entry.isIntersecting && !this.visible) {
              this.visible = true;
              this.cdr.detectChanges();
            }
          }
        },
        { root: null, rootMargin: '0px 0px -12% 0px', threshold: 0.12 }
      );

      if (this.container?.nativeElement) {
        this.observer.observe(this.container.nativeElement);
      }
    } catch {
      this.visible = true;
    }
  }

  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = undefined;
    }
  }

  private prepareChartData(): void {
    const raw = this.data ?? [];
    const labels = raw.map((d: any) => d?.service_name ?? d?.district_name ?? d?.name ?? 'Unknown');
    const series = raw.map((d: any) => {
      const v = d?.avg_approval_days ?? d?.count ?? d?.application_count ?? d?.value ?? d?.total ?? 0;
      const n = Number(v);
      return Number.isFinite(n) ? n : 0;
    });
    this.hasData = Array.isArray(series) && series.length > 0 && series.some(v => v > 0);

    if (!this.hasData) {
      this.chartOptions = null;
      this.visible = true;
      try { this.cdr.detectChanges(); } catch { }
      return;
    }
    const isLarge = series.length > 10;
    const chartType = isLarge ? 'donut' : 'pie';
    const legendPosition: ApexLegend['position'] = isLarge ? 'right' : 'bottom';
    const titleText = raw.some(d => d && d.avg_approval_days !== undefined)
      ? 'Average Approval Time (days) per Service'
      : 'District-wise Application Distribution';
    const pairs = labels.map((lab, i) => ({ lab, val: series[i] }));
    pairs.sort((a, b) => b.val - a.val);
    const sortedLabels = pairs.map(p => p.lab);
    const sortedSeries = pairs.map(p => p.val);

    const responsive: ApexResponsive[] = [
      {
        breakpoint: 1280,
        options: {
          chart: { height: isLarge ? 520 : 420 },
          legend: { position: legendPosition }
        }
      },
      {
        breakpoint: 768,
        options: {
          chart: { height: 420 },
          legend: { position: 'bottom' }
        }
      },
      {
        breakpoint: 480,
        options: {
          chart: { height: 320 },
          legend: { position: 'bottom' }
        }
      }
    ];
    const colors = [
      '#0f766e', '#0ea5e9', '#7c3aed', '#06b6d4', '#fb923c',
      '#ef4444', '#10b981', '#f97316', '#6366f1', '#ef6aa2',
      '#38424b', '#8b5cf6', '#06b6a4', '#f59e0b', '#3b82f6', '#16a34a'
    ];
    const tooltip: ApexTooltip = {
      enabled: true,
      y: {
        formatter: (val: number) => (Number.isFinite(val) ? `${val}` : `${val}`)
      }
    };
    this.chartOptions = {
      series: sortedSeries as ApexNonAxisChartSeries,
      chart: {
        type: chartType as 'pie' | 'donut',
        height: isLarge ? 520 : 380,
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 700,
          animateGradually: { enabled: true, delay: 45 },
          dynamicAnimation: { enabled: true, speed: 420 }
        },
        toolbar: { show: true },
        foreColor: '#374151'
      } as ApexChart,
      labels: sortedLabels,
      colors,
      legend: {
        show: true,
        position: legendPosition,
        fontSize: '13px',
        markers: { width: 12, height: 12, radius: 3 },
        formatter: function (label: string, opts?: any) {
          try {
            const w = opts?.w ?? {};
            const s = (w?.globals?.series ?? []) as number[];
            const idx = opts?.seriesIndex ?? 0;
            const val = s[idx] ?? 0;
            const total = s.reduce((a: number, b: number) => a + b, 0) || 1;
            const pct = ((val / total) * 100).toFixed(1);
            return `${label} — ${val} (${pct}%)`;
          } catch {
            return label;
          }
        }
      } as ApexLegend,
      responsive,
      title: {
        text: titleText,
        align: 'left',
        style: { fontSize: '18px', fontWeight: '600', color: '#0f172a' }
      } as ApexTitleSubtitle,
      tooltip
    };
    this.visible = true;

    try { this.cdr.detectChanges(); } catch { }
  }
}
