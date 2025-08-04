// footer.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface FooterLink {
  title: string;
  url: string;
  external?: boolean;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

interface SocialLink {
  platform: string;
  url: string;
  icon: string;
}

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
  newsletterEmail = '';

  footerSections: FooterSection[] = [
    {
      title: 'Services',
      links: [
        { title: 'Online Applications', url: '/services/applications' },
        { title: 'Document Services', url: '/services/documents' },
        { title: 'Tax Services', url: '/services/tax' },
        { title: 'Citizen Services', url: '/services/citizen' },
        { title: 'Business Services', url: '/services/business' }
      ]
    },
    {
      title: 'Information',
      links: [
        { title: 'Government Directory', url: '/directory' },
        { title: 'Public Notices', url: '/notices' },
        { title: 'Tenders', url: '/tenders' },
        { title: 'Employment', url: '/jobs' },
        { title: 'News & Updates', url: '/news' }
      ]
    }
  ];

  socialLinks: SocialLink[] = [
    {
      platform: 'Facebook',
      url: 'https://facebook.com/government',
      icon: '📘'
    },
    {
      platform: 'Twitter',
      url: 'https://twitter.com/government',
      icon: '🐦'
    },
    {
      platform: 'YouTube',
      url: 'https://youtube.com/government',
      icon: '📺'
    },
    {
      platform: 'LinkedIn',
      url: 'https://linkedin.com/company/government',
      icon: '💼'
    }
  ];

  onNewsletterSubmit(event: Event) {
    event.preventDefault();
    if (this.newsletterEmail) {
      // Handle newsletter subscription
      console.log('Newsletter subscription:', this.newsletterEmail);
      // Add your API call here
      alert('Thank you for subscribing to our newsletter!');
      this.newsletterEmail = '';
    }
  }
}