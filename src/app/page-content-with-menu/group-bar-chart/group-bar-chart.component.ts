import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild,
  AfterViewInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  NgApexchartsModule,
  ChartComponent,
  ApexChart,
  ApexAxisChartSeries,
  ApexXAxis,
  ApexYAxis,
  ApexDataLabels,
  ApexPlotOptions,
  ApexGrid,
  ApexTitleSubtitle,
  ApexLegend,
  ApexTooltip,
  ApexStroke,
  ApexFill,
  ApexResponsive
} from 'ng-apexcharts';

export type GroupedHorizontalOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  colors: string[];
  grid: ApexGrid;
  title: ApexTitleSubtitle;
  legend: ApexLegend;
  tooltip: ApexTooltip;
  stroke: ApexStroke;
  fill: ApexFill;
  responsive?: ApexResponsive[];
};

interface DistrictCount {
  district_name: string;
  count: number;
}

interface ServiceEntry {
  service_name: string;
  districts: DistrictCount[];
}

@Component({
  selector: 'app-group-bar-chart',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './group-bar-chart.component.html',
  styleUrls: ['./group-bar-chart.component.scss']
})
export class GroupBarChartComponent implements OnChanges, AfterViewInit {
  @Input() data: ServiceEntry[] | null = null;
  @ViewChild('chart') chart!: ChartComponent;

  public chartOptions: Partial<GroupedHorizontalOptions> | null = null;

  private services: string[] = [];
  private districts: string[] = [];
  private colorMap: Record<string, string> = {};
  private maxCount = 1;
  private paddingForHeader = 100;
  private cardMaxHeight = 1200;

  ngAfterViewInit() {
    if (this.chartOptions && this.chart) {
      try { this.chart.updateOptions(this.chartOptions as any); } catch { /* ignore */ }
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      this.prepareChartData();
      if (this.chart && this.chartOptions) {
        try { this.chart.updateOptions(this.chartOptions as any); } catch { /* ignore */ }
      }
    }
  }

  private prepareChartData() {
    const raw = Array.isArray(this.data) ? this.data : [];
    this.services = raw.map(r => (r.service_name || '(No name)'));
    const dSet = new Set<string>();
    for (const s of raw) {
      for (const d of (s.districts || [])) {
        const name = (d.district_name && d.district_name.trim()) ? d.district_name.trim() : 'Unknown';
        dSet.add(name);
      }
    }
    this.districts = Array.from(dSet).sort((a, b) => a.localeCompare(b));
    this.colorMap = {};
    for (let i = 0; i < this.districts.length; i++) {
      this.colorMap[this.districts[i]] = this.generateColor(i, this.districts.length);
    }
    let max = 1;
    for (const s of raw) {
      for (const d of (s.districts || [])) {
        max = Math.max(max, Number(d.count || 0));
      }
    }
    this.maxCount = Math.max(1, max);
    const series: ApexAxisChartSeries = this.districts.map(dName => {
      const dataArr = raw.map(svc => {
        const found = (svc.districts || []).find(dd => {
          const nn = (dd.district_name && dd.district_name.trim()) ? dd.district_name.trim() : 'Unknown';
          return nn === dName;
        });
        return Number(found?.count ?? 0);
      });
      return { name: dName, data: dataArr };
    });
    const numDistricts = Math.max(1, this.districts.length);
    const numServices = Math.max(1, this.services.length);
    let perBarPx: number;
    if (numDistricts <= 2) perBarPx = 30;
    else if (numDistricts <= 4) perBarPx = 22;
    else if (numDistricts <= 6) perBarPx = 16;
    else if (numDistricts <= 10) perBarPx = 12;
    else perBarPx = 10;
    const gapBetweenBars = numDistricts > 8 ? 3 : 5;
    const perServiceHeight =
      (perBarPx * numDistricts) +
      ((numDistricts - 1) * gapBetweenBars) +
      10;
    let desiredHeight = Math.max(300, numServices * perServiceHeight + this.paddingForHeader);
    desiredHeight = Math.min(desiredHeight, this.cardMaxHeight);

    const barHeightPx = `${perBarPx}px`;
    const colors = this.districts.map(d => this.colorMap[d]);

    const tooltip: ApexTooltip = {
      shared: false,
      y: {
        formatter: (val: any, opts?: any) => {
          const seriesName = opts?.w?.globals?.seriesNames?.[opts.seriesIndex] ?? '';
          const serviceName = this.services?.[opts.dataPointIndex] ?? '';
          return `${serviceName} — ${seriesName}: ${this.formatNumberFull(val)}`;
        }
      }
    };
    const responsive: ApexResponsive[] = [
      {
        breakpoint: 1000,
        options: {
          plotOptions: {
            bar: { barHeight: `${Math.max(8, Math.floor(perBarPx * 0.85))}px` } // reduced more
          },
          chart: {
            height: Math.min(
              this.cardMaxHeight,
              Math.max(360, Math.floor(desiredHeight * 0.85))
            )
          }
        }
      },
      {
        breakpoint: 560,
        options: {
          plotOptions: {
            bar: { barHeight: `${Math.max(6, Math.floor(perBarPx * 0.70))}px` } // more compact
          },
          chart: {
            height: Math.min(
              this.cardMaxHeight,
              Math.max(320, Math.floor(desiredHeight * 0.70))
            )
          }
        }
      }
    ];
    const dataLabels: ApexDataLabels = {
      enabled: true,
      offsetX: -8,
      style: { colors: ['#fff'], fontSize: '11px', fontWeight: '700' },
      formatter: (val: any) => this.formatNumberCompact(val)
    };
    this.chartOptions = {
      series,
      chart: {
        type: 'bar',
        height: desiredHeight,
        stacked: false,
        animations: {
          enabled: true,
          speed: 600,
          animateGradually: { enabled: true, delay: 80 },
          dynamicAnimation: { enabled: true, speed: 420 }
        },
        toolbar: { show: false }
      },
      plotOptions: {
        bar: {
          horizontal: true,
          barHeight: barHeightPx,
          distributed: false,
          borderRadius: 6,
          rangeBarOverlap: false
        }
      },
      dataLabels,
      colors,
      grid: {
        borderColor: '#e6eef6',
        xaxis: { lines: { show: true } },
        yaxis: { lines: { show: false } }
      },
      xaxis: {
        categories: this.services,
        title: { text: 'Application Count', style: { fontWeight: 600 } },
        labels: {
          style: { fontSize: '12px' },
          formatter: (v: any) => String(this.formatNumberFull(v))
        },
        tickAmount: Math.min(6, Math.ceil(this.maxCount / 1))
      },
      yaxis: {
        title: { text: 'Services', style: { fontWeight: 600 } },
        labels: { style: { fontSize: '12px' } },
        reversed: false
      },
      title: {
        text: 'Applications per Service (district-wise)',
        align: 'left',
        style: { fontSize: '15px', fontWeight: 700, color: '#0f172a' }
      },
      legend: {
        position: 'top',
        horizontalAlign: 'right',
        offsetY: 0,
        markers: {
          shape: 'square',
          strokeWidth: 0,
          offsetX: 0
        } as any
      } as ApexLegend,
      tooltip,
      stroke: { width: 1, colors: ['#ffffff'] },
      fill: { opacity: 1 },
      responsive
    };

    if (this.chart) {
      try { this.chart.updateOptions(this.chartOptions as any); } catch { /* ignore */ }
    }
  }

  private generateColor(index: number, total: number) {
    if (total <= 1) return 'hsl(220 78% 56%)';
    const hue = Math.round(((index / Math.max(1, total - 1)) * 260 + 10) % 360);
    const sat = 72;
    const light = 54 - (index % 3) * 3;
    return `hsl(${hue} ${sat}% ${light}%)`;
  }

  private formatNumberFull(n: any) {
    const num = Number(n || 0);
    return new Intl.NumberFormat('en-IN').format(num);
  }

  private formatNumberCompact(n: any) {
    const num = Number(n || 0);
    if (num < 1000) return String(num);
    const nf = new Intl.NumberFormat('en', { notation: 'compact', compactDisplay: 'short', maximumFractionDigits: 1 });
    return nf.format(num);
  }
}
