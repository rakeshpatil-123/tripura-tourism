import { CommonModule } from '@angular/common';
import { Component, Input, ChangeDetectionStrategy, OnInit } from '@angular/core';

export interface DestinationCard {
  id?: string | number;
  name: string;
  location?: string;
  price: number;           // numeric price
  currency?: string;       // default ₹
  rating?: number;         // 0-5
  reviews?: number;        // integer
  image: string;           // url or assets path
  badge?: string;          // e.g., "Popular", "New"
}

@Component({
  selector: 'app-choose-destination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './choose-destination.component.html',
  styleUrls: ['./choose-destination.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChooseDestinationComponent implements OnInit {
  @Input() titleMain = 'Choose Your Destination';
  @Input() titleSub = 'Live Where You Want';

  @Input() cards: DestinationCard[] = []; // you can pass 3 items via parent

  // default sample cards (replace images/price with your values)
  private defaultCards: DestinationCard[] = [
    {
      id: 1,
      name: 'Geetanjali Guest House',
      location: 'Agartala, Tripura',
      price: 2464,
      currency: '₹',
      rating: 4.6,
      reviews: 1,
      image: 'assets/images/Bashgram.png',
      badge: 'Popular'
    },
    {
      id: 2,
      name: 'Palm Grove Residency',
      location: 'Unakoti Hills',
      price: 3540,
      currency: '₹',
      rating: 4.8,
      reviews: 12,
      image: 'assets/images/Neermahal-Festival.png',
      badge: 'Top Rated'
    },
    {
      id: 3,
      name: 'Lakeside Retreat',
      location: 'Dumboor Lake',
      price: 1999,
      currency: '₹',
      rating: 4.4,
      reviews: 8,
      image: 'assets/images/Dumboor-Lake-Dhalai-District.png',
      badge: ''
    }
  ];

  ngOnInit(): void {
    // If parent didn't provide cards, use defaults
    if (!this.cards || this.cards.length === 0) {
      this.cards = this.defaultCards;
    } else {
      // ensure only three cards (user asked for only three)
      if (this.cards.length > 3) this.cards = this.cards.slice(0, 3);
    }
  }

  // format price
  priceLabel(c: DestinationCard): string {
    return `${c.currency ?? '₹'}${c.price?.toLocaleString() ?? ''}`;
  }

  // create an accessible label for the CTA
  ctaLabel(c: DestinationCard) {
    return `Explore ${c.name}`;
  }

  trackById(_: number, item: DestinationCard) {
    return item.id ?? item.name;
  }
}
