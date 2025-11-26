import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  AfterViewInit,
  OnDestroy,
  HostBinding
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-bar-graph-dept-user',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bar-graph-dept-user.component.html',
  styleUrls: ['./bar-graph-dept-user.component.scss'],
})
export class BarGraphDeptUserComponent implements OnChanges, AfterViewInit, OnDestroy {
  @Input() data: Array<{ service_id: number; service_name: string; avg_approval_days: number; }> = [];
  items: Array<{
    service_id: number;
    service_name: string;
    avg_approval_days: number;
    pct: number;
    delayMs: number;
  }> = [];

  private observer?: IntersectionObserver;
  private _animatedOnce = false;
  @HostBinding('class.in-view') inView = false;

  constructor() { }

  ngOnChanges(changes: SimpleChanges) {
    if ('data' in changes) {
      this.prepareItems();
      if (!this._animatedOnce) {
        setTimeout(() => {
          this.startAnimationsIfReady();
        }, 40);
      }
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
        { root: null, rootMargin: '0px 0px -8% 0px', threshold: 0.12 }
      );
      try {
        const hostEl = document.querySelector('app-bar-graph-dept-user') as Element | null;
        if (hostEl) this.observer.observe(hostEl);
      } catch {
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

    const max = arr.reduce((m, it) => Math.max(m, (it.avg_approval_days || 0)), 0) || 1;
    arr.sort((a, b) => (b.avg_approval_days || 0) - (a.avg_approval_days || 0));

    this.items = arr.map((it, idx) => {
      const pct = +(((it.avg_approval_days || 0) / max) * 100).toFixed(2);
      const delayMs = 130 + idx * 110;
      return {
        service_id: it.service_id,
        service_name: it.service_name,
        avg_approval_days: +(it.avg_approval_days || 0),
        pct,
        delayMs
      };
    });
  }

  private startAnimationsIfReady() {
    if (this._animatedOnce) return;
    if (!this.items || !this.items.length) {
      return;
    }
    this.inView = true;
    this._animatedOnce = true;
    setTimeout(() => {
      this.items.forEach((item, index) => {
        const startDelay = item.delayMs + 60;
        this.animateNumberAfterDelay(item.service_id, 0, item.avg_approval_days, 700, startDelay);
      });
    }, 80);
  }
  private animateNumberAfterDelay(serviceId: number, from: number, to: number, duration = 600, delay = 0) {
    setTimeout(() => {
      this.animateNumber(serviceId, from, to, duration);
    }, delay);
  }

  private animateNumber(serviceId: number, from: number, to: number, duration = 600) {
    const selector = `#bar-value-${serviceId}`;
    const el = document.querySelector(selector) as HTMLElement | null;
    if (!el) {
      return;
    }

    const start = performance.now();

    const step = (now: number) => {
      const t = Math.max(0, Math.min(1, (now - start) / duration));
      const eased = 1 - Math.pow(1 - t, 3);
      const current = from + (to - from) * eased;
      el.textContent = this.formatDays(current);
      if (t < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = this.formatDays(to);
      }
    };

    requestAnimationFrame(step);
  }

  formatDays(v: number) {
    if (Math.abs(v - Math.round(v)) < 0.005) return `${Math.round(v)}d`;
    return `${+v.toFixed(2)}d`;
  }
  onKeyPress(e: KeyboardEvent, el: any) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const element = (el as HTMLElement) || null;
      if (element) {
        try {
          element.focus();
          element.classList.add('kbd-activ');
          setTimeout(() => element.classList.remove('kbd-activ'), 300);
        } catch {
        }
      }
    }
  }
}
