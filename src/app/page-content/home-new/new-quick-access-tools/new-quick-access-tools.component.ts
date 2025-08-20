import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

interface Tool {
  bgColor: string;
  hoverBgColor: string;
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
  styleUrls: ['./new-quick-access-tools.component.scss']
})
export class NewQuickAccessToolsComponent implements OnInit {
  tools: Tool[] = [
    {
      bgColor: 'bg-blue-500',
      hoverBgColor: 'hover:bg-blue-600',
      title: 'Check Application Status',
      description: 'Track your application progress in real-time',
      badge: '1,234',
      iconSvg: `<circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path>`
    },
    {
      bgColor: 'bg-green-500',
      hoverBgColor: 'hover:bg-green-600',
      title: 'Download Forms',
      description: 'Access all required forms and documents',
      badge: '45',
      iconSvg: `<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" x2="12" y1="15" y2="3"></line>`
    },
    {
      bgColor: 'bg-indigo-500',
      hoverBgColor: 'hover:bg-indigo-600',
      title: 'Track Approvals',
      description: 'Monitor approval timelines and stages',
      badge: '32',
      iconSvg: `<rect width="8" height="4" x="8" y="2" rx="1" ry="1"></rect><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><path d="m9 14 2 2 4-4"></path>`
    },
    {
      bgColor: 'bg-purple-500',
      hoverBgColor: 'hover:bg-purple-600',
      title: 'Submit Query',
      description: 'Get help with your applications',
      badge: '24/7',
      iconSvg: `<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path><path d="M14 2v4a2 2 0 0 0 2 2h4"></path><path d="M10 9H8"></path><path d="M16 13H8"></path><path d="M16 17H8"></path>`
    },
    {
      bgColor: 'bg-pink-500',
      hoverBgColor: 'hover:bg-pink-600',
      title: 'Land Availability',
      description: 'View available industrial plots via GIS',
      badge: '108',
      iconSvg: `<polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"></polygon><line x1="9" x2="9" y1="3" y2="18"></line><line x1="15" x2="15" y1="6" y2="21"></line>`
    },
    {
      bgColor: 'bg-yellow-500',
      hoverBgColor: 'hover:bg-yellow-600',
      title: 'Investor Dashboard',
      description: 'Complete investment tracking portal',
      badge: 'NEW',
      iconSvg: `<rect width="7" height="9" x="3" y="3" rx="1"></rect><rect width="7" height="5" x="14" y="3" rx="1"></rect><rect width="7" height="9" x="14" y="12" rx="1"></rect><rect width="7" height="5" x="3" y="16" rx="1"></rect>`
    },
    {
      bgColor: 'bg-cyan-500',
      hoverBgColor: 'hover:bg-cyan-600',
      title: 'Know Your Approvals',
      description: 'KYA - Find required approvals for your business',
      badge: 'Tool',
      iconSvg: `<circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path>`
    },
    {
      bgColor: 'bg-red-500',
      hoverBgColor: 'hover:bg-red-600',
      title: 'Submit Grievance',
      description: 'Lodge complaints and track resolution',
      badge: 'Open',
      iconSvg: `<path d="m22 2-7 20-4-9-9-4Z"></path><path d="M22 2 11 13"></path>`
    }
  ];

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    this.tools.forEach(tool => {
      tool.iconSvgSafe = this.sanitizer.bypassSecurityTrustHtml(tool.iconSvg);
    });
  }

  onToolClick(tool: Tool): void {
    console.log(`Clicked tool: ${tool.title}`);
    // Add navigation or action logic here
  }
}
