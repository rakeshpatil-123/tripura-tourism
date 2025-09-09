import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../../shared/component/button-component/button.component';

interface Testimonial {
  experience: string;
  rating: number;
  text: string;
  author: string;
  title: string;
  industry: string;
  date: string;
  investment: string;
  jobsCreated: string;
  badgeClass: string;
}

interface FeedbackForm {
  name: string;
  company: string;
  rating: number;
  experience: string;
}

@Component({
  selector: 'app-user-experience-success-stories',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent],
  templateUrl: './user-experience-success-stories.component.html',
  styleUrls: ['./user-experience-success-stories.component.scss'],
})
export class UserExperienceSuccessStoriesComponent {
 currentSlide: number = 0;
  
  testimonials: Testimonial[] = [
    {
      experience: 'Excellent Experience',
      rating: 5,
      text: 'SWAAGAT 2.0 transformed our investment experience. The single window system reduced our approval time from 6 months to just 3 weeks. The transparency and real-time tracking gave us confidence throughout the process.',
      author: 'Rajesh Mehta',
      title: 'CEO, Mehta Agro Industries',
      industry: 'Agro-processing',
      date: 'November 2024',
      investment: '₹50 Cr',
      jobsCreated: '1,200',
      badgeClass: 'excellent'
    },
    {
      experience: 'Outstanding Experience',
      rating: 5,
      text: 'The digital integration and dedicated support team made establishing our IT center seamless. The KYA tool helped us understand all requirements upfront, eliminating surprises and delays.',
      author: 'Priya Singh',
      title: 'CEO, TechVision Solutions',
      industry: 'IT & Electronics',
      date: 'October 2024',
      investment: '₹25 Cr',
      jobsCreated: '800',
      badgeClass: 'outstanding'
    },
    {
      experience: 'Exceptional Experience',
      rating: 5,
      text: 'The renewable energy incentives and streamlined clearance process exceeded our expectations. The land bank portal helped us identify the perfect location with all necessary infrastructure.',
      author: 'David Kumar',
      title: 'CEO, Green Energy Solutions',
      industry: 'Renewable Energy',
      date: 'September 2024',
      investment: '₹80 Cr',
      jobsCreated: '600',
      badgeClass: 'exceptional'
    },
    {
      experience: 'Very Good Experience',
      rating: 4,
      text: 'The handloom promotion scheme and technology support helped us modernize our operations while preserving traditional crafts. The market linkage assistance opened new export opportunities.',
      author: 'Anita Sharma',
      title: 'CEO, Tripura Textiles Ltd',
      industry: 'Textiles & Handloom',
      date: 'August 2024',
      investment: '₹15 Cr',
      jobsCreated: '500',
      badgeClass: 'very-good'
    }
  ];

  feedbackForm: FeedbackForm = {
    name: '',
    company: '',
    rating: 5,
    experience: ''
  };

  nextSlide(): void {
    if (this.currentSlide < this.testimonials.length - 1) {
      this.currentSlide++;
    }
  }

  previousSlide(): void {
    if (this.currentSlide > 0) {
      this.currentSlide--;
    }
  }

  goToSlide(index: number): void {
    if (index >= 0 && index < this.testimonials.length) {
      this.currentSlide = index;
    }
  }

  getRatingStars(rating: number): boolean[] {
    return Array(5).fill(false).map((_, index) => index < rating);
  }

  setRating(rating: number): void {
    if (rating >= 1 && rating <= 5) {
      this.feedbackForm.rating = rating;
    }
  }

  submitFeedback(): void {
    if (!this.feedbackForm.name.trim()) {
      alert('Please enter your name');
      return;
    }

    if (!this.feedbackForm.company.trim()) {
      alert('Please enter your company name');
      return;
    }

    if (!this.feedbackForm.experience.trim()) {
      alert('Please share your experience');
      return;
    }

    console.log('Feedback submitted:', {
      ...this.feedbackForm,
      submittedAt: new Date().toISOString()
    });

    alert('Thank you for your feedback! Your input helps us improve our services.');
    
    this.resetForm();
  }

  private resetForm(): void {
    this.feedbackForm = {
      name: '',
      company: '',
      rating: 5,
      experience: ''
    };
  }
}
