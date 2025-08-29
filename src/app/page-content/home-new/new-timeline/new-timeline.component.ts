import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

interface Step {
  icon: string;
  iconSvg: string;
  iconSvgSafe?: SafeHtml;
  title: string;
  description: string;
  days: string;
  duration: string;
  keyActivities: string[];
  requiredDocs: string[];
  isActive: boolean;
}

@Component({
  selector: 'app-new-timeline',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './new-timeline.component.html',
  styleUrls: ['./new-timeline.component.scss']
})
export class NewTimelineComponent implements OnInit {
  steps: Step[] = [
    {
      icon: 'file-text',
      iconSvg: `<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path><path d="M14 2v4a2 2 0 0 0 2 2h4"></path><path d="M10 9H8"></path><path d="M16 13H8"></path><path d="M16 17H8"></path>`,
      title: 'Initial Inquiry',
      description: 'Submit your initial investment inquiry through our online portal with basic project details.',
      days: 'Day 1',
      duration: '1 Day',
      keyActivities: [
        'Online registration on SWAGAT 2.0 portal',
        'Submit preliminary project information',
        'Receive acknowledgment and unique ID',
        'Access to dedicated relationship manager'
      ],
      requiredDocs: ['Project concept note', 'Promoter details', 'Financial capacity proof'],
      isActive: true
    },
    {
      icon: 'users',
      iconSvg: `<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>`,
      title: 'Pre-Investment Support',
      description: 'Get comprehensive support for project planning, site selection, and feasibility analysis.',
      days: 'Day 2-5',
      duration: '3-4 Days',
      keyActivities: [],
      requiredDocs: [],
      isActive: false
    },
    {
      icon: 'circle',
      iconSvg: `<circle cx="12" cy="12" r="10"></circle>`,
      title: 'Application Submission',
      description: 'Submit comprehensive investment proposal through Common Application Form (CAF).',
      days: 'Day 6-8',
      duration: '2-3 Days',
      keyActivities: [],
      requiredDocs: [],
      isActive: false
    },
    {
      icon: 'shield',
      iconSvg: `<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path>`,
      title: 'Document Verification',
      description: 'Comprehensive verification of all submitted documents by respective departments.',
      days: 'Day 9-12',
      duration: '3-4 Days',
      keyActivities: [],
      requiredDocs: [],
      isActive: false
    },
    {
      icon: 'map-pin',
      iconSvg: `<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle>`,
      title: 'Land Allocation',
      description: 'Selection and allocation of suitable land based on project requirements and availability.',
      days: 'Day 13-16',
      duration: '3-4 Days',
      keyActivities: [],
      requiredDocs: [],
      isActive: false
    },
    {
      icon: 'check-circle',
      iconSvg: `<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><path d="m9 11 3 3L22 4"></path>`,
      title: 'Clearances & Approvals',
      description: 'Obtain all necessary clearances from relevant departments through single window.',
      days: 'Day 17-22',
      duration: '5-6 Days',
      keyActivities: [],
      requiredDocs: [],
      isActive: false
    },
    {
      icon: 'banknote',
      iconSvg: `<rect width="20" height="12" x="2" y="6" rx="2"></rect><circle cx="12" cy="12" r="2"></circle><path d="M6 12h.01M18 12h.01"></path>`,
      title: 'Financial Incentives',
      description: 'Processing and approval of applicable financial incentives and subsidies.',
      days: 'Day 23-26',
      duration: '3-4 Days',
      keyActivities: [],
      requiredDocs: [],
      isActive: false
    },
    {
      icon: 'rocket',
      iconSvg: `<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"></path><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"></path>`,
      title: 'Project Commencement',
      description: 'Final approval and commencement certificate for project implementation.',
      days: 'Day 27-30',
      duration: '3-4 Days',
      keyActivities: [],
      requiredDocs: [],
      isActive: false
    }
  ];

  selectedStep: Step = this.steps[0];
  progressWidth: string = '12.5%';

  clockSvg = `<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>`;
  checkCircleSvg = `<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><path d="m9 11 3 3L22 4"></path>`;
  arrowRightSvg = `<path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path>`;

  clockSvgSafe: SafeHtml | undefined;
  checkCircleSvgSafe: SafeHtml | undefined;
  arrowRightSvgSafe: SafeHtml | undefined;

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    this.steps.forEach(step => {
      step.iconSvgSafe = this.sanitizer.bypassSecurityTrustHtml(step.iconSvg);
    });
    this.clockSvgSafe = this.sanitizer.bypassSecurityTrustHtml(this.clockSvg);
    this.checkCircleSvgSafe = this.sanitizer.bypassSecurityTrustHtml(this.checkCircleSvg);
    this.arrowRightSvgSafe = this.sanitizer.bypassSecurityTrustHtml(this.arrowRightSvg);
    this.selectStep(this.steps[0], 0);
  }

  selectStep(step: Step, index: number): void {
    this.steps.forEach(s => (s.isActive = false));
    step.isActive = true;
    this.selectedStep = { ...step };
    this.progressWidth = `${(index + 1) * 12.5}%`;
    console.log(`Selected step: ${step.title}`);
  }

  contactSupport(): void {
    console.log('Contacting support');
  }

  beginApplication(): void {
    console.log('Beginning application');
  }

  downloadGuide(): void {
    console.log('Downloading process guide');
  }
}