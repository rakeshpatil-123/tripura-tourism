import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  ElementRef,
  AfterViewInit,
  OnDestroy,
  ChangeDetectionStrategy,
  NgZone,
  OnInit
} from '@angular/core';

export interface MarqueeItem {
  id?: string | number;
  name?: string;         // group name (optional)
  images: string[];      // image paths or urls
  subtitle?: string;
}

/** single-image card structure */
export interface CardEntry {
  id?: string | number;
  src: string;
  name: string;          // place name shown at top of card
  subtitle?: string;
}

@Component({
  selector: 'app-marquee-cards',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './marquee-cards.component.html',
  styleUrls: ['./marquee-cards.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarqueeCardsComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() items: MarqueeItem[] = [];
  @Input() cardWidth = 260;
  @Input() cardHeight = 320;
  @Input() gap = 18;
  @Input() speed = 30;

  /** flattened cards: each image becomes one card */
  public processedCards: CardEntry[] = [];

  private io?: IntersectionObserver;
  private paused = false;

  constructor(private el: ElementRef<HTMLElement>, private ngZone: NgZone) {}

  ngOnInit(): void {
    // fallback sample if none provided
    if (!this.items || this.items.length === 0) {
      this.items = [
        {
          id: 'group1',
          name: 'Tripura Tourism',
          images: [
            'assets/images/Bashgram.png',
            'assets/images/Durga-Bari.png',
            'assets/images/Bhubaneswari-Temple.png',
            'assets/images/Butterfly-Park-in-Tripura.png',
            'assets/images/Dumboor-Lake-Dhalai-District.png',
            'assets/images/Durga-Bari-Tea-Garden.jpg',
            'assets/images/Garia-Puja.png',
            'assets/images/Jagannath-Bari.png',
            'assets/images/Kasba-Kali-Temple.png',
            'assets/images/Laxmi-Narayan-Temple.png',
            'assets/images/Neermahal-Festival.png',
            'assets/images/Pilak-Festival.png',
            'assets/images/Pous-Sankranti-Fair.png',
            'assets/images/Purbasa-Tripura.jpg',
            'assets/images/Sanaiya-Waterfalls.jpg',
            'assets/images/Trishna-Wildlife-Sanctuary.png',
            'assets/images/Vanghmun.jpg'
          ],
          subtitle: 'Explore Tripura'
        }
      ];
    }

    // flatten each image into a card. Name is prettified filename; subtitle uses parent item name if available.
    const cards: CardEntry[] = [];
    this.items.forEach((it, groupIndex) => {
      const images = (it.images && it.images.length) ? it.images : ['assets/placeholder.png'];
      images.forEach((src, idx) => {
        cards.push({
          id: `${it.id ?? groupIndex}-${idx}`,
          src,
          name: this.prettifyNameFromPath(src) || (it.name || `Place ${idx + 1}`),
          subtitle: it.name || it.subtitle
        });
      });
    });

    this.processedCards = cards;
  }

  ngAfterViewInit(): void {
    // IntersectionObserver to pause when offscreen
    if ('IntersectionObserver' in window) {
      this.ngZone.runOutsideAngular(() => {
        this.io = new IntersectionObserver(
          (entries) => entries.forEach(e => this.setPaused(!e.isIntersecting || e.intersectionRatio <= 0)),
          { threshold: [0, 0.01, 0.5] }
        );
        this.io.observe(this.el.nativeElement);
      });
    }

    const host = this.el.nativeElement;
    host.style.setProperty('--card-width', `${this.cardWidth}px`);
    host.style.setProperty('--card-height', `${this.cardHeight}px`);
    host.style.setProperty('--card-gap', `${this.gap}px`);
    host.style.setProperty('--marquee-speed', `${this.speed}`);
  }

  ngOnDestroy(): void {
    if (this.io) {
      this.io.disconnect();
      this.io = undefined;
    }
  }

  setPaused(val: boolean): void {
    if (this.paused === val) return;
    this.paused = val;
    const host = this.el.nativeElement;
    if (val) host.classList.add('paused'); else host.classList.remove('paused');
  }

  onTrackMouseEnter(): void { this.setPaused(true); }
  onTrackMouseLeave(): void { this.setPaused(false); }

  trackById(index: number, item: CardEntry): string | number {
    return item.id ?? item.src ?? index;
  }

  private prettifyNameFromPath(path: string): string {
    if (!path) return '';
    const last = path.split('/').pop() || path;
    const noExt = last.replace(/\.[^/.]+$/, '');
    const words = noExt.replace(/[_\-]+/g, ' ').replace(/\d+/g, '').replace(/\s+/g, ' ').trim();
    return words.split(' ').filter(Boolean).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || noExt;
  }
}
