import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

// Interface for news item structure
interface NewsItem {
  isUrgent: boolean;
  category: {
    iconClass: string;
    iconSvg: string;
    badgeClass: string;
    badgeText: string;
  };
  text: string;
  date: string;
}

@Component({
  selector: 'app-new-notification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './new-notification.component.html',
  styleUrls: ['./new-notification.component.scss']
})
export class NewNotificationComponent implements OnInit, OnDestroy {
  newsItems: NewsItem[] = [
    {
      isUrgent: true,
      category: {
        iconClass: 'red',
        iconSvg: '<circle cx="12" cy="8" r="6"></circle><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"></path>',
        badgeClass: 'red',
        badgeText: 'Policy Update'
      },
      text: '🚀 New Industrial Policy 2024 launched with enhanced incentives for IT sector',
      date: 'Dec 15, 2024'
    },
    {
      isUrgent: false,
      category: {
        iconClass: 'blue',
        iconSvg: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>',
        badgeClass: 'blue',
        badgeText: 'Service Enhancement'
      },
      text: '⚡ Single Window Clearance now available for projects above ₹10 Cr',
      date: 'Dec 12, 2024'
    },
    {
      isUrgent: false,
      category: {
        iconClass: 'green',
        iconSvg: '<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline>',
        badgeClass: 'green',
        badgeText: 'Infrastructure'
      },
      text: '🏭 New Industrial Park inaugurated in Agartala with plug-and-play facilities',
      date: 'Dec 10, 2024'
    },
    {
      isUrgent: false,
      category: {
        iconClass: 'purple',
        iconSvg: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>',
        badgeClass: 'purple',
        badgeText: 'Digital Initiative'
      },
      text: '💻 Online Land Allotment System now integrated with Revenue Department',
      date: 'Dec 8, 2024'
    },
    {
      isUrgent: false,
      category: {
        iconClass: 'orange',
        iconSvg: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path>',
        badgeClass: 'orange',
        badgeText: 'Service Update'
      },
      text: '🕒 Investment Promotion Cell extends working hours for investor support',
      date: 'Dec 5, 2024'
    }
  ];

  currentIndex = 0;
  isPaused = false;
  private intervalId: any;

  ngOnInit(): void {
    this.startAutoPlay();
  }

  ngOnDestroy(): void {
    this.stopAutoPlay();
  }

  startAutoPlay(): void {
    this.stopAutoPlay(); // Clear any existing interval
    this.intervalId = setInterval(() => {
      this.next();
    }, 3000); // Auto-slide every 3 seconds
  }

  stopAutoPlay(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  togglePause(): void {
    this.isPaused = !this.isPaused;
    if (this.isPaused) {
      this.stopAutoPlay();
    } else {
      this.startAutoPlay();
    }
  }

  setIndex(index: number): void {
    this.currentIndex = index;
  }

  next(): void {
    this.currentIndex = (this.currentIndex + 1) % this.newsItems.length;
  }

  onCardClick(news: NewsItem): void {
    // Placeholder for card click action (e.g., navigate or open modal)
    console.log('News card clicked:', news.text);
  }

  onExternalLinkClick(news: NewsItem): void {
    // Placeholder for external link action (e.g., open URL if available)
    console.log('External link clicked for:', news.text);
  }
}
