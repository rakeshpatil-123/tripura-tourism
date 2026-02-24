import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  AfterViewInit,
  OnDestroy,
  ElementRef,
  NgZone,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';

export interface Testimonial {
  text: string;
  author: string;
  byline?: string;     // e.g. "by Rohan Saha"
  location?: string;
  avatar?: string;     // optional image path
}

@Component({
  selector: 'app-testimonials',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './testimonials.component.html',
  styleUrls: ['./testimonials.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TestimonialsComponent implements AfterViewInit, OnDestroy {
  @Input() testimonials: any[] = [];

  // internal: visisble toggle to start animations
  inView = false;
  private io?: IntersectionObserver;

  // sensible defaults — your three testimonials (from user)
  private defaultTestimonials: any[] = [
    {
      text:
        "Agartala, a cultural extravaganza! Ujjayanta Palace, vibrant bazaars, and mesmerizing Tripuri dance performances. A city that beautifully preserves its rich heritage.",
      author: "Rohan Saha",
      byline: "Traveler",
      location: "Agartala"
    },
    {
      text:
        "A hidden gem in the Northeast, Tripura's serene landscapes and warm hospitality stole our hearts. From ancient temples to the untouched beauty of Neermahal, every moment was a delight. Can't wait to return!",
      author: "Amrita Roy",
      byline: "Backpacker",
      location: "Tripura"
    },
    {
      text:
        "Sepahijala Wildlife Sanctuary - a paradise for nature lovers. Diverse flora and fauna, boat rides on Rudrasagar Lake, and a treetop walkway. Commendable conservation efforts.",
      author: "Vikram Deb",
      byline: "Nature Enthusiast",
      location: "Sepahijala"
    }
  ];

  constructor(
    private host: ElementRef<HTMLElement>,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {
    // default if parent didn't pass testimonials
    if (!this.testimonials || this.testimonials.length === 0) {
      this.testimonials = this.defaultTestimonials;
    }
  }

  ngAfterViewInit(): void {
    // IntersectionObserver to trigger reveal when section enters viewport
    if ('IntersectionObserver' in window) {
      this.ngZone.runOutsideAngular(() => {
        this.io = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting && entry.intersectionRatio > 0.08) {
                this.ngZone.run(() => {
                  this.inView = true;
                  this.cdr.markForCheck();
                });
                // once visible, we can disconnect if we want one-time reveal
                if (this.io) {
                  this.io.disconnect();
                  this.io = undefined;
                }
              }
            });
          },
          { threshold: [0, 0.05, 0.1, 0.2] }
        );
        this.io.observe(this.host.nativeElement);
      });
    } else {
      // fallback: reveal after mount
      this.inView = true;
      this.cdr.markForCheck();
    }
  }

  ngOnDestroy(): void {
    if (this.io) this.io.disconnect();
  }

  // helper - create initials for avatar fallback
  initials(name: string): string {
    if (!name) return '';
    const parts = name.trim().split(/\s+/).slice(0, 2);
    return parts.map(p => p.charAt(0).toUpperCase()).join('');
  }
}
