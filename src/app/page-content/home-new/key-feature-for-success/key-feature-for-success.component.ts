import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

interface Feature {
  gradientFrom: string;
  gradientTo: string;
  icon: string;
  iconSvg: string;
  iconSvgSafe?: SafeHtml;
  title: string;
  description: string;
  checks: string[];
  statBg: string;
  statGradientFrom: string;
  statGradientTo: string;
  statValue: string;
  statLabel: string;
}

interface SmallFeature {
  icon: string;
  iconSvg: string;
  iconSvgSafe?: SafeHtml;
  title: string;
  description: string;
}

@Component({
  selector: 'app-key-feature-for-success',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './key-feature-for-success.component.html',
  styleUrls: ['./key-feature-for-success.component.scss']
})
export class KeyFeatureForSuccessComponent implements OnInit {
  checkSvg = `<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><path d="m9 11 3 3L22 4"></path>`;

  checkSvgSafe: SafeHtml | undefined;

  features: Feature[] = [
    {
      gradientFrom: 'orange-500',
      gradientTo: 'red-500',
      icon: 'file-text',
      iconSvg: `<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path><path d="M14 2v4a2 2 0 0 0 2 2h4"></path><path d="M10 9H8"></path><path d="M16 13H8"></path><path d="M16 17H8"></path>`,
      title: 'Common Application Form',
      description: 'Streamlined single application process for all government approvals and clearances with real-time validation.',
      checks: ['Single Form Submission', 'Auto-validation', 'Document Upload', 'Real-time Status'],
      statBg: 'orange-50',
      statGradientFrom: 'orange-500',
      statGradientTo: 'red-500',
      statValue: '85%',
      statLabel: 'Faster Processing'
    },
    {
      gradientFrom: 'green-500',
      gradientTo: 'emerald-500',
      icon: 'trending-up',
      iconSvg: `<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline>`,
      title: 'Track Applications',
      description: 'Real-time tracking of your application status with automated notifications, SMS alerts, and milestone updates.',
      checks: ['Live Tracking', 'SMS Notifications', 'Email Updates', 'Mobile App'],
      statBg: 'green-50',
      statGradientFrom: 'green-500',
      statGradientTo: 'emerald-500',
      statValue: '24/7',
      statLabel: 'Real-time Updates'
    },
    {
      gradientFrom: 'blue-500',
      gradientTo: 'cyan-500',
      icon: 'map-pin',
      iconSvg: `<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle>`,
      title: 'Land Bank Portal',
      description: 'Access comprehensive GIS-enabled land information, availability, virtual tours, and instant booking system.',
      checks: ['GIS Mapping', 'Virtual Tours', 'Instant Booking', 'Price Calculator'],
      statBg: 'blue-50',
      statGradientFrom: 'blue-500',
      statGradientTo: 'cyan-500',
      statValue: '500+',
      statLabel: 'Available Plots'
    }
  ];

  smallFeatures: SmallFeature[] = [
    {
      icon: 'zap',
      iconSvg: `<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>`,
      title: 'Lightning Fast',
      description: '15-day average approval time'
    },
    {
      icon: 'shield',
      iconSvg: `<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path>`,
      title: 'Secure & Trusted',
      description: 'Bank-grade security protocols'
    },
    {
      icon: 'clock',
      iconSvg: `<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>`,
      title: '24/7 Support',
      description: 'Round-the-clock assistance'
    }
  ];

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    this.features.forEach(feature => {
      feature.iconSvgSafe = this.sanitizer.bypassSecurityTrustHtml(feature.iconSvg);
    });
    this.smallFeatures.forEach(smallFeature => {
      smallFeature.iconSvgSafe = this.sanitizer.bypassSecurityTrustHtml(smallFeature.iconSvg);
    });
    this.checkSvgSafe = this.sanitizer.bypassSecurityTrustHtml(this.checkSvg);
  }

  onExplore(title: string): void {
    console.log(`Exploring feature: ${title}`);
    // Add logic to show/hide or navigate as needed
  }

  onStartApplication(): void {
    console.log('Starting application now');
    // Add navigation or modal show logic
  }

  onScheduleConsultation(): void {
    console.log('Scheduling consultation');
    // Add navigation or modal show logic
  }
}
