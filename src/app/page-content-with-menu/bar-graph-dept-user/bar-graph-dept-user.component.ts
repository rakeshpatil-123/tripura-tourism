import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  AfterViewInit,
  OnDestroy,
  HostBinding,
  ViewChildren,
  ElementRef,
  QueryList,
  ChangeDetectorRef,
  NgZone,
  ElementRef as NgElementRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  trigger,
  transition,
  style,
  animate,
  query,
  stagger
} from '@angular/animations';

export interface ApprovalItem {
  service_id: number;
  service_name: string;
  avg_approval_days: number;
  pct?: number;
  delayMs?: number;
}

@Component({
  selector: 'app-bar-graph-dept-user',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bar-graph-dept-user.component.html',
  styleUrls: ['./bar-graph-dept-user.component.scss'],
  animations: [
    trigger('listAnim', [
      transition('* => *', [
        query(
          ':enter',
          [
            style({ opacity: 0, transform: 'translateY(12px) scale(.995)' }),
            stagger(90, [
              animate(
                '420ms cubic-bezier(.2,.9,.2,1)',
                style({ opacity: 1, transform: 'translateY(0) scale(1)' })
              )
            ])
          ],
          { optional: true }
        )
      ])
    ])
  ]
})
export class BarGraphDeptUserComponent implements OnChanges, AfterViewInit, OnDestroy {
  @Input() data: ApprovalItem[] = [];

  items: ApprovalItem[] = [];

  @HostBinding('class.in-view') inView = false;

  private observer?: IntersectionObserver;
  private _animatedOnce = false;

  @ViewChildren('barFill', { read: NgElementRef }) barFillEls!: QueryList<ElementRef<HTMLElement>>;
  @ViewChildren('barValue', { read: NgElementRef }) barValueEls!: QueryList<ElementRef<HTMLElement>>;

  constructor(
    private host: ElementRef<HTMLElement>,
    private cd: ChangeDetectorRef,
    private ngZone: NgZone
  ) { }

  ngOnChanges(changes: SimpleChanges) {
    if ('data' in changes) {
      this.prepareItems();
      this._animatedOnce = false;
      setTimeout(() => this.startAnimationsIfReady(), 20);
    }
  }

  ngAfterViewInit() {
    if ('IntersectionObserver' in window) {
      this.observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting && !this._animatedOnce) {
              this.startAnimationsIfReady();
              break;
            }
          }
        },
        { root: null, rootMargin: '0px 0px -12% 0px', threshold: 0.12 }
      );
      try {
        const el = this.host.nativeElement;
        this.observer.observe(el);
      } catch {
        this.startAnimationsIfReady();
      }
    } else {
      this.startAnimationsIfReady();
    }
  }

  ngOnDestroy() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = undefined;
    }
  }

  private prepareItems() {
    const arr = Array.isArray(this.data) ? this.data.slice() : [];
    if (!arr.length) {
      this.items = [];
      return;
    }

    arr.sort((a, b) => (b.avg_approval_days || 0) - (a.avg_approval_days || 0));
    const max = Math.max(...arr.map(it => Math.max(0, it.avg_approval_days)), 1);

    this.items = arr.map((it, idx) => {
      const pct = +(((it.avg_approval_days || 0) / max) * 100).toFixed(2);
      return {
        ...it,
        pct,
        delayMs: 110 + idx * 90
      };
    });

    this.cd.markForCheck();
  }

  private startAnimationsIfReady() {
    if (this._animatedOnce) return;
    if (!this.items || !this.items.length) return;
    setTimeout(() => {
      this.ngZone.runOutsideAngular(() => {
        this.inView = true;
        this._animatedOnce = true;

        this.items.forEach((item, idx) => {
          const delay = item.delayMs ?? idx * 80;
          setTimeout(() => {
            const fillEl = this.barFillEls.toArray()[idx]?.nativeElement as HTMLElement | undefined;
            const valueEl = this.barValueEls.toArray()[idx]?.nativeElement as HTMLElement | undefined;

            if (fillEl) {
              fillEl.style.width = `${item.pct}%`;
              fillEl.classList.add('animate-filled');
            }

            if (valueEl) {
              this.animateNumberElement(valueEl, 0, item.avg_approval_days, 850);
            }
          }, delay);
        });
      });
    }, 30);
  }

  private animateNumberElement(el: HTMLElement, from: number, to: number, duration = 700) {
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.max(0, Math.min(1, (now - start) / duration));
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      const current = from + (to - from) * eased;
      el.textContent = this.formatDays(current);
      if (t < 1) requestAnimationFrame(tick);
      else el.textContent = this.formatDays(to);
    };
    requestAnimationFrame(tick);
  }

  formatDays(v: number) {
    if (v <= 0.01) return '1d';
    if (v < 1) return `${v.toFixed(2)}d`;
    if (Math.abs(v - Math.round(v)) < 0.01) return `${Math.round(v)}d`;
    return `${v.toFixed(1)}d`;
  }
  getSeverityClass(days: number | undefined): 'low' | 'mid' | 'high' {
    const v = typeof days === 'number' ? days : 0;
    if (v <= 2) return 'low';
    if (v <= 7) return 'mid';
    return 'high';
  }
  onKeyPress(e: KeyboardEvent, target: HTMLElement | null) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!target) return;
      target.classList.add('kbd-activ');
      target.focus();
      setTimeout(() => target.classList.remove('kbd-activ'), 260);
    }
  }
}
