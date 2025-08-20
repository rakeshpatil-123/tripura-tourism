import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

interface Metric {
  iconSvg: string;
  iconSvgSafe?: SafeHtml;
  iconColor: string;
  value: string;
  title: string;
  description: string;
}

interface Testimonial {
  rating: number;
  ratingText: string;
  quote: string;
  author: string;
  company: string;
  sector: string;
  date: string;
  image: string;
  alt: string;
  investment: string;
  jobsCreated: string;
}

interface CaseStudy {
  title: string;
  challenge: string;
  solution: string;
  outcome: string;
  timeline: string;
  sector: string;
}

@Component({
  selector: 'app-user-experience-success-stories',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-experience-success-stories.component.html',
  styleUrls: ['./user-experience-success-stories.component.scss']
})
export class UserExperienceSuccessStoriesComponent implements OnInit {
  metrics: Metric[] = [
    {
      iconSvg: `<path d="M7 10v12"></path><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"></path>`,
      iconColor: 'text-green-600',
      value: '96%',
      title: 'Overall Satisfaction',
      description: 'Investors satisfied with services'
    },
    {
      iconSvg: `<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline>`,
      iconColor: 'text-blue-600',
      value: '4.8/5',
      title: 'Average Rating',
      description: 'Based on 1,200+ reviews'
    },
    {
      iconSvg: `<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>`,
      iconColor: 'text-orange-600',
      value: '89%',
      title: 'Recommendation Rate',
      description: 'Would recommend to others'
    },
    {
      iconSvg: `<circle cx="12" cy="8" r="6"></circle><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"></path>`,
      iconColor: 'text-purple-600',
      value: '15 Days',
      title: 'Avg. Processing Time',
      description: 'Faster than national average'
    }
  ];

  testimonials: Testimonial[] = [
    {
      rating: 5,
      ratingText: 'Excellent Experience',
      quote: 'SWAGAT 2.0 transformed our investment experience. The single window system reduced our approval time from 6 months to just 3 weeks. The transparency and real-time tracking gave us confidence throughout the process.',
      author: 'Rajesh Mehta',
      company: 'Mehta Agro Industries',
      sector: 'Agro-processing',
      date: 'November 2024',
      image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
      alt: 'Rajesh Mehta',
      investment: '₹50 Cr',
      jobsCreated: '1,200'
    },
    {
      rating: 5,
      ratingText: 'Outstanding Experience',
      quote: 'The digital integration and dedicated support team made establishing our IT center seamless. The KYA tool helped us understand all requirements upfront, eliminating surprises and delays.',
      author: 'Priya Singh',
      company: 'TechVision Solutions',
      sector: 'IT & Electronics',
      date: 'October 2024',
      image: 'https://images.pexels.com/photos/2381069/pexels-photo-2381069.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
      alt: 'Priya Singh',
      investment: '₹25 Cr',
      jobsCreated: '800'
    },
    {
      rating: 5,
      ratingText: 'Exceptional Experience',
      quote: 'The renewable energy incentives and streamlined clearance process exceeded our expectations. The land bank portal helped us identify the perfect location with all necessary infrastructure.',
      author: 'David Kumar',
      company: 'Green Energy Solutions',
      sector: 'Renewable Energy',
      date: 'September 2024',
      image: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
      alt: 'David Kumar',
      investment: '₹80 Cr',
      jobsCreated: '600'
    },
    {
      rating: 4,
      ratingText: 'Very Good Experience',
      quote: 'The handloom promotion scheme and technology support helped us modernize our operations while preserving traditional crafts. The market linkage assistance opened new export opportunities.',
      author: 'Anita Sharma',
      company: 'Tripura Textiles Ltd',
      sector: 'Textiles & Handloom',
      date: 'August 2024',
      image: 'https://images.pexels.com/photos/3785079/pexels-photo-3785079.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
      alt: 'Anita Sharma',
      investment: '₹15 Cr',
      jobsCreated: '500'
    }
  ];

  caseStudies: CaseStudy[] = [
    {
      title: 'IT Park Development Success',
      challenge: 'Need for modern IT infrastructure and skilled workforce',
      solution: 'Dedicated IT park with plug-and-play facilities and skill development programs',
      outcome: '15 companies established, 3,000 jobs created, ₹200 Cr investment',
      timeline: '18 months',
      sector: 'IT & Electronics'
    },
    {
      title: 'Agro-Processing Hub Creation',
      challenge: 'Value addition to agricultural produce and market access',
      solution: 'Integrated agro-processing facilities with cold chain and market linkage',
      outcome: '25% increase in farmer income, 50 processing units, ₹100 Cr turnover',
      timeline: '12 months',
      sector: 'Agro-processing'
    },
    {
      title: 'Renewable Energy Expansion',
      challenge: 'Clean energy generation and grid connectivity',
      solution: 'Solar park development with transmission infrastructure',
      outcome: '100 MW capacity, 40% renewable energy mix, ₹300 Cr investment',
      timeline: '24 months',
      sector: 'Renewable Energy'
    }
  ];

  starSvg = `<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>`;
  chevronLeftSvg = `<path d="m15 18-6-6 6-6"></path>`;
  chevronRightSvg = `<path d="m9 18 6-6-6-6"></path>`;
  messageSquareSvg = `<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>`;
  calendarSvg = `<path d="M8 2v4"></path><path d="M16 2v4"></path><rect width="18" height="18" x="3" y="4" rx="2"></rect><path d="M3 10h18"></path>`;

  starSvgSafe: SafeHtml | undefined;
  chevronLeftSvgSafe: SafeHtml | undefined;
  chevronRightSvgSafe: SafeHtml | undefined;
  messageSquareSvgSafe: SafeHtml | undefined;
  calendarSvgSafe: SafeHtml | undefined;

  currentSlide = 0;

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    this.metrics.forEach(metric => {
      metric.iconSvgSafe = this.sanitizer.bypassSecurityTrustHtml(metric.iconSvg);
    });
    this.starSvgSafe = this.sanitizer.bypassSecurityTrustHtml(this.starSvg);
    this.chevronLeftSvgSafe = this.sanitizer.bypassSecurityTrustHtml(this.chevronLeftSvg);
    this.chevronRightSvgSafe = this.sanitizer.bypassSecurityTrustHtml(this.chevronRightSvg);
    this.messageSquareSvgSafe = this.sanitizer.bypassSecurityTrustHtml(this.messageSquareSvg);
    this.calendarSvgSafe = this.sanitizer.bypassSecurityTrustHtml(this.calendarSvg);
  }

  prevSlide(): void {
    this.currentSlide = (this.currentSlide - 1 + this.testimonials.length) % this.testimonials.length;
    console.log(`Previous slide: ${this.currentSlide}`);
  }

  nextSlide(): void {
    this.currentSlide = (this.currentSlide + 1) % this.testimonials.length;
    console.log(`Next slide: ${this.currentSlide}`);
  }

  goToSlide(index: number): void {
    this.currentSlide = index;
    console.log(`Go to slide: ${index}`);
  }

  submitFeedback(formData: any): void {
    console.log('Feedback submitted:', formData);
    // Add form submission logic here
  }
}
