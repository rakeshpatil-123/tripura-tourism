import { Component, AfterViewInit, ElementRef, ViewChildren, QueryList, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { trigger, state, style, animate, transition } from '@angular/animations';

interface Tool {
  bgColor: string;
  title: string;
  description: string;
  badge: string;
  iconSvg: string;
  iconSvgSafe?: SafeHtml;
}

@Component({
  selector: 'app-new-quick-access-tools',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './new-quick-access-tools.component.html',
  styleUrls: ['./new-quick-access-tools.component.scss'],
  animations: [
    trigger('cardAnimation', [
      state('hidden', style({
        opacity: 0,
        transform: 'translateY(100px)'
      })),
      state('visible', style({
        opacity: 1,
        transform: 'translateY(0)'
      })),
      transition('hidden => visible', [
        animate('700ms {{delay}}s ease-out')
      ], { params: { delay: 0 } }),
      transition('visible => hidden', [
        animate('300ms ease-in')
      ])
    ])
  ]
})
export class NewQuickAccessToolsComponent implements OnInit, AfterViewInit {
  @ViewChildren('toolCard') toolCards!: QueryList<ElementRef>;
  cardState: string = 'hidden';

  tools: Tool[] = [
    {
      bgColor: 'blue',
      title: 'CIS (Inspections)',
      description: 'Schedule, conduct, and track site inspections.',
      badge: 'Inspections',
      iconSvg: `<path d="M9 12l2 2 4-4"></path><path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"></path>`
    },
    {
      bgColor: 'green',
      title: 'Investor Dashboard',
      description: 'Monitor investments, approvals, and incentives.',
      badge: 'Live',
      iconSvg: `<path d="M3 12h4l3 9 4-17 3 11h4"></path>`
    },
    {
      bgColor: 'indigo',
      title: 'Incentive Dashboard',
      description: 'Track incentive applications and disbursements.',
      badge: 'Active',
      iconSvg: `<path d="M20 12V8H6a2 2 0 0 1-2-2 2 2 0 0 1 2-2h12v4"></path><path d="M4 6v12c0 1.1.9 2 2 2h14v-4"></path><path d="M18 12v6"></path><path d="M18 18h.01"></path>`
    },
    {
      bgColor: 'purple',
      title: 'Queries Module',
      description: 'Raise and resolve investor queries efficiently.',
      badge: 'Support',
      iconSvg: `<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>`
    },
    {
      bgColor: 'pink',
      title: 'Grievances Module',
      description: 'Submit and track grievance resolution status.',
      badge: 'Open',
      iconSvg: `<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line>`
    },
    {
      bgColor: 'yellow',
      title: 'User Feedback and Feedback Dashboard',
      description: 'Collect, analyze, and act on user feedback.',
      badge: 'Insights',
      iconSvg: `<path d="M3 3v18h18"></path><rect x="7" y="15" width="4" height="6"></rect><rect x="12" y="10" width="4" height="11"></rect><rect x="17" y="13" width="4" height="8"></rect>`
    }
  ];

  constructor(
    private sanitizer: DomSanitizer,
    private el: ElementRef
  ) {}
  ngOnInit(): void {

  }

  ngAfterViewInit(): void {
    this.tools.forEach(tool => {
      tool.iconSvgSafe = this.sanitizer.bypassSecurityTrustHtml(tool.iconSvg);
    });

    this.setupIntersectionObserver();
  }

  setupIntersectionObserver() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.cardState = 'visible';
          } else {
            this.cardState = 'hidden';
          }
        });
      },
      { threshold: 0.4 }
    );
    observer.observe(this.el.nativeElement);
  }

  onToolClick(tool: Tool): void {
    console.log(`Navigating to: ${tool.title}`);
    // Add routing logic here
  }
}