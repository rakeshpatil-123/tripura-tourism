import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

interface Story {
  image: string;
  alt: string;
  category: string;
  categoryBgColor: string;
  categoryTextColor: string;
  date: string;
  readTime: string;
  title: string;
  description: string;
  tags: string[];
  tagBgColor: string;
  tagTextColor: string;
}

interface Article {
  iconSvg: string;
  iconSvgSafe?: SafeHtml;
  iconBgColor: string;
  iconTextColor: string;
  date: string;
  readTime: string;
  category: string;
  categoryBgColor: string;
  categoryTextColor: string;
  title: string;
  description: string;
  tags: string[];
}

interface Filter {
  label: string;
  iconSvg: string;
  iconSvgSafe?: SafeHtml;
  count: number;
  active: boolean;
}

@Component({
  selector: 'app-latest-news-updates',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './latest-news-updates.component.html',
  styleUrls: ['./latest-news-updates.component.scss']
})
export class LatestNewsUpdatesComponent implements OnInit {
  stories: Story[] = [
    {
      image: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
      alt: 'Tripura Launches Enhanced Single Window Portal SWAGAT 3.0',
      category: 'Announcements',
      categoryBgColor: 'bg-purple-100',
      categoryTextColor: 'text-purple-800',
      date: 'Dec 15, 2024',
      readTime: '3 min read',
      title: 'Tripura Launches Enhanced Single Window Portal SWAGAT 3.0',
      description: 'Next-generation portal introduces AI-powered application processing and real-time video consultations with department officials.',
      tags: ['Digital Innovation', 'AI Technology', 'Government Services'],
      tagBgColor: 'bg-white/20 lg:bg-gray-100',
      tagTextColor: 'text-white lg:text-gray-700'
    },
    {
      image: 'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
      alt: 'Record ₹500 Crore Investment Approved in Q4 2024',
      category: 'Achievements',
      categoryBgColor: 'bg-green-100',
      categoryTextColor: 'text-green-800',
      date: 'Dec 12, 2024',
      readTime: '4 min read',
      title: 'Record ₹500 Crore Investment Approved in Q4 2024',
      description: 'Tripura achieves highest quarterly investment approval, with major projects in IT, renewable energy, and agro-processing sectors.',
      tags: ['Investment', 'Economic Growth', 'Quarterly Results'],
      tagBgColor: 'bg-white/20 lg:bg-gray-100',
      tagTextColor: 'text-white lg:text-gray-700'
    },
    {
      image: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
      alt: 'New Industrial Policy 2025 Offers Enhanced Incentives',
      category: 'Policy',
      categoryBgColor: 'bg-blue-100',
      categoryTextColor: 'text-blue-800',
      date: 'Dec 10, 2024',
      readTime: '5 min read',
      title: 'New Industrial Policy 2025 Offers Enhanced Incentives',
      description: 'Comprehensive policy framework introduces sector-specific incentives, streamlined approvals, and dedicated support for MSMEs.',
      tags: ['Industrial Policy', 'MSME Support', 'Incentives'],
      tagBgColor: 'bg-white/20 lg:bg-gray-100',
      tagTextColor: 'text-white lg:text-gray-700'
    }
  ];

  articles: Article[] = [
    {
      iconSvg: `<rect width="16" height="20" x="4" y="2" rx="2" ry="2"></rect><path d="M9 22v-4h6v4"></path><path d="M8 6h.01"></path><path d="M16 6h.01"></path><path d="M12 6h.01"></path><path d="M12 10h.01"></path><path d="M12 14h.01"></path><path d="M16 10h.01"></path><path d="M16 14h.01"></path><path d="M8 10h.01"></path><path d="M8 14h.01"></path>`,
      iconBgColor: 'bg-orange-100',
      iconTextColor: 'text-orange-800',
      date: 'Dec 8, 2024',
      readTime: '2 min read',
      category: 'Infrastructure',
      categoryBgColor: 'bg-orange-100',
      categoryTextColor: 'text-orange-800',
      title: 'Agartala IT Park Phase 2 Construction Begins',
      description: 'Second phase will add 50,000 sq ft of plug-and-play office space for technology companies.',
      tags: ['IT Infrastructure', 'Construction', 'Technology Hub']
    },
    {
      iconSvg: `<circle cx="12" cy="8" r="6"></circle><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"></path>`,
      iconBgColor: 'bg-green-100',
      iconTextColor: 'text-green-800',
      date: 'Dec 5, 2024',
      readTime: '3 min read',
      category: 'Achievements',
      categoryBgColor: 'bg-green-100',
      categoryTextColor: 'text-green-800',
      title: 'Zero Pendency Achieved in Environmental Clearances',
      description: 'Environment Department successfully clears all pending applications, setting new efficiency benchmark.',
      tags: ['Environmental Clearance', 'Efficiency', 'Zero Pendency']
    },
    {
      iconSvg: `<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline>`,
      iconBgColor: 'bg-blue-100',
      iconTextColor: 'text-blue-800',
      date: 'Dec 3, 2024',
      readTime: '4 min read',
      category: 'Policy',
      categoryBgColor: 'bg-blue-100',
      categoryTextColor: 'text-blue-800',
      title: 'New Renewable Energy Policy Launched',
      description: 'Policy offers attractive tariffs and grid connectivity support for solar and wind projects.',
      tags: ['Renewable Energy', 'Solar Power', 'Grid Connectivity']
    },
    {
      iconSvg: `<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>`,
      iconBgColor: 'bg-green-100',
      iconTextColor: 'text-green-800',
      date: 'Dec 1, 2024',
      readTime: '2 min read',
      category: 'Achievements',
      categoryBgColor: 'bg-green-100',
      categoryTextColor: 'text-green-800',
      title: 'Investor Satisfaction Survey Results Released',
      description: '96.8% satisfaction rate achieved, highest in Northeast India for government services.',
      tags: ['Satisfaction Survey', 'Service Quality', 'Northeast India']
    },
    {
      iconSvg: `<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path><path d="M14 2v4a2 2 0 0 0 2 2h4"></path><path d="M10 9H8"></path><path d="M16 13H8"></path><path d="M16 17H8"></path>`,
      iconBgColor: 'bg-orange-100',
      iconTextColor: 'text-orange-800',
      date: 'Nov 28, 2024',
      readTime: '3 min read',
      category: 'Infrastructure',
      categoryBgColor: 'bg-orange-100',
      categoryTextColor: 'text-orange-800',
      title: 'Digital Land Records Integration Completed',
      description: 'All land records now digitized and integrated with investment portal for seamless processing.',
      tags: ['Digital Records', 'Land Management', 'Integration']
    },
    {
      iconSvg: `<rect width="16" height="20" x="4" y="2" rx="2" ry="2"></rect><path d="M9 22v-4h6v4"></path><path d="M8 6h.01"></path><path d="M16 6h.01"></path><path d="M12 6h.01"></path><path d="M12 10h.01"></path><path d="M12 14h.01"></path><path d="M16 10h.01"></path><path d="M16 14h.01"></path><path d="M8 10h.01"></path><path d="M8 14h.01"></path>`,
      iconBgColor: 'bg-orange-100',
      iconTextColor: 'text-orange-800',
      date: 'Nov 25, 2024',
      readTime: '3 min read',
      category: 'Infrastructure',
      categoryBgColor: 'bg-orange-100',
      categoryTextColor: 'text-orange-800',
      title: 'Skill Development Centers Inaugurated',
      description: 'Five new centers launched to train workforce for emerging industries and technologies.',
      tags: ['Skill Development', 'Training', 'Workforce']
    }
  ];

  filters: Filter[] = [
    { label: 'All News', iconSvg: `<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path>`, count: 24, active: true },
    { label: 'Policy Updates', iconSvg: `<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path><path d="M14 2v4a2 2 0 0 0 2 2h4"></path><path d="M10 9H8"></path><path d="M16 13H8"></path><path d="M16 17H8"></path>`, count: 8, active: false },
    { label: 'Achievements', iconSvg: `<circle cx="12" cy="8" r="6"></circle><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"></path>`, count: 6, active: false },
    { label: 'Infrastructure', iconSvg: `<rect width="16" height="20" x="4" y="2" rx="2" ry="2"></rect><path d="M9 22v-4h6v4"></path><path d="M8 6h.01"></path><path d="M16 6h.01"></path><path d="M12 6h.01"></path><path d="M12 10h.01"></path><path d="M12 14h.01"></path><path d="M16 10h.01"></path><path d="M16 14h.01"></path><path d="M8 10h.01"></path><path d="M8 14h.01"></path>`, count: 5, active: false },
    { label: 'Announcements', iconSvg: `<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path>`, count: 5, active: false }
  ];

  bellSvg = `<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path>`;
  chevronLeftSvg = `<path d="m15 18-6-6 6-6"></path>`;
  chevronRightSvg = `<path d="m9 18 6-6-6-6"></path>`;
  arrowRightSvg = `<path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path>`;
  calendarSvg = `<path d="M8 2v4"></path><path d="M16 2v4"></path><rect width="18" height="18" x="3" y="4" rx="2"></rect><path d="M3 10h18"></path>`;
  clockSvg = `<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>`;

  bellSvgSafe: SafeHtml | undefined;
  chevronLeftSvgSafe: SafeHtml | undefined;
  chevronRightSvgSafe: SafeHtml | undefined;
  arrowRightSvgSafe: SafeHtml | undefined;
  calendarSvgSafe: SafeHtml | undefined;
  clockSvgSafe: SafeHtml | undefined;

  currentSlide = 0;

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    this.articles.forEach(article => {
      article.iconSvgSafe = this.sanitizer.bypassSecurityTrustHtml(article.iconSvg);
    });
    this.filters.forEach(filter => {
      filter.iconSvgSafe = this.sanitizer.bypassSecurityTrustHtml(filter.iconSvg);
    });
    this.bellSvgSafe = this.sanitizer.bypassSecurityTrustHtml(this.bellSvg);
    this.chevronLeftSvgSafe = this.sanitizer.bypassSecurityTrustHtml(this.chevronLeftSvg);
    this.chevronRightSvgSafe = this.sanitizer.bypassSecurityTrustHtml(this.chevronRightSvg);
    this.arrowRightSvgSafe = this.sanitizer.bypassSecurityTrustHtml(this.arrowRightSvg);
    this.calendarSvgSafe = this.sanitizer.bypassSecurityTrustHtml(this.calendarSvg);
    this.clockSvgSafe = this.sanitizer.bypassSecurityTrustHtml(this.clockSvg);
  }

  prevSlide(): void {
    this.currentSlide = (this.currentSlide - 1 + this.stories.length) % this.stories.length;
    console.log(`Previous slide: ${this.currentSlide}`);
  }

  nextSlide(): void {
    this.currentSlide = (this.currentSlide + 1) % this.stories.length;
    console.log(`Next slide: ${this.currentSlide}`);
  }

  goToSlide(index: number): void {
    this.currentSlide = index;
    console.log(`Go to slide: ${index}`);
  }

  selectFilter(label: string): void {
    this.filters.forEach(filter => (filter.active = filter.label === label));
    console.log(`Selected filter: ${label}`);
    // Add filtering logic here
  }

  readStory(title: string): void {
    console.log(`Reading story: ${title}`);
    // Add navigation or modal logic
  }

  subscribe(email: string): void {
    console.log(`Subscribing with email: ${email}`);
    // Add subscription logic
  }
}
