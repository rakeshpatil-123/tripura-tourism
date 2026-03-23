import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

export type NocStatus = 'Approved' | 'Pending' | 'Rejected' | 'Under Review';

export interface NocApplication {
  id: number | string;
  serviceName: string;
  department: string;
  nocType: 'Special' | 'Native' | 'Online' | string;
  serviceMode: 'Native' | 'Online' | 'Hybrid' | string;
  status: NocStatus;
  actionLabel?: string;
  referenceNo?: string;
}

export interface NocServiceCard {
  id: number | string;
  title: string;
  subtitle: string;
  department: string;
  icon: string;
  badge?: string;
  actionLabel: string;
}

export interface QueryCategory {
  label: string;
  value: string;
}

@Component({
  selector: 'app-tripura-noc-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tripura-noc-dashboard.component.html',
  styleUrls: ['./tripura-noc-dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TripuraNocDashboardComponent implements OnInit {
  @Input() pageTitle = 'Analytical View for Tripura NOC Services';
  @Input() pageSubtitle =
    'Manage NOC certificate services, track applications, and handle feedback or queries from one place';

  @Input() services: NocServiceCard[] = [];
  @Input() applications: NocApplication[] = [];

  queryCategories: QueryCategory[] = [
    { label: 'Homestays', value: 'Homestays' },
    { label: 'Tour Operators / Travel Agents', value: 'Tour Operators / Travel Agents' },
    { label: 'Tourist Guide', value: 'Tourist Guide' },
    { label: 'Hotels & Resorts', value: 'Hotels & Resorts' },
    { label: 'NOC Certificate', value: 'NOC Certificate' }
  ];

  supportHighlights = [
    {
      title: 'Fast response',
      text: 'Queries are routed to the right service team.'
    },
    {
      title: 'Clear guidance',
      text: 'Users get document and eligibility support.'
    },
    {
      title: 'Application tracking',
      text: 'Applicants can follow approval status easily.'
    }
  ];

  feedbackForm = {
    name: '',
    email: '',
    category: 'NOC Certificate',
    subject: '',
    message: ''
  };

  private defaultServices: NocServiceCard[] = [
    {
      id: 1,
      title: 'Registration & Renewal of Homestays',
      subtitle: 'New registration and renewal support for Tripura homestay providers.',
      department: 'Tripura Tourism Development Corporation Limited',
      icon: '🏡',
      badge: 'Special',
      actionLabel: 'Open Service'
    },
    {
      id: 2,
      title: 'Tour Operators / Travel Agents',
      subtitle: 'Online application for new registration and renewal.',
      department: 'Tripura Tourism Development Corporation Limited',
      icon: '🧭',
      badge: 'Online',
      actionLabel: 'Manage Applications'
    },
    {
      id: 3,
      title: 'Tourist Guide Service',
      subtitle: 'Application form and eligibility support for tourist guides.',
      department: 'Tripura Tourism Development Corporation Limited',
      icon: '🎒',
      badge: 'Special',
      actionLabel: 'Review Service'
    },
    {
      id: 4,
      title: 'Registration & Renewal of Hotels & Resorts',
      subtitle: 'Licensing and renewal support for hotels and resorts.',
      department: 'Tripura Tourism Development Corporation Limited',
      icon: '🏨',
      badge: 'Native',
      actionLabel: 'Open Service'
    }
  ];

  private defaultApplications: NocApplication[] = [
    {
      id: 76,
      serviceName: 'Registration & Renewal of Homestays',
      department: 'Tripura Tourism Development Corporation Limited',
      nocType: 'Special',
      serviceMode: 'Native',
      status: 'Pending',
      actionLabel: 'View'
    },
    {
      id: 75,
      serviceName: 'Online application for New / Renewal of Registration of Tour Operators / Travel Agents',
      department: 'Tripura Tourism Development Corporation Limited',
      nocType: 'Special',
      serviceMode: 'Native',
      status: 'Approved',
      actionLabel: 'View'
    },
    {
      id: 74,
      serviceName: 'Online application form for Tourist Guide service',
      department: 'Tripura Tourism Development Corporation Limited',
      nocType: 'Special',
      serviceMode: 'Native',
      status: 'Pending',
      actionLabel: 'View'
    },
    {
      id: 73,
      serviceName: 'Registration & Renewal of Hotels & Resorts',
      department: 'Tripura Tourism Development Corporation Limited',
      nocType: 'Special',
      serviceMode: 'Native',
      status: 'Approved',
      actionLabel: 'View'
    },
    {
      id: 72,
      serviceName: 'NOC Certificate Review / Clarification',
      department: 'Tripura Tourism Development Corporation Limited',
      nocType: 'Online',
      serviceMode: 'Online',
      status: 'Pending',
      actionLabel: 'View'
    }
  ];

  ngOnInit(): void {
    if (!this.services || this.services.length === 0) {
      this.services = this.defaultServices;
    }

    if (!this.applications || this.applications.length === 0) {
      this.applications = this.defaultApplications;
    }
  }

  get totalApplications(): number {
    return this.applications?.length ?? 0;
  }

  get approvedCount(): number {
    return this.applications.filter(a => a.status === 'Approved').length;
  }

  get pendingCount(): number {
    return this.applications.filter(a => a.status === 'Pending' || a.status === 'Under Review').length;
  }

  get rejectedCount(): number {
    return this.applications.filter(a => a.status === 'Rejected').length;
  }

  get approvalRate(): number {
    const total = this.totalApplications;
    return total ? Math.round((this.approvedCount / total) * 100) : 0;
  }

  get pendingRate(): number {
    const total = this.totalApplications;
    return total ? Math.round((this.pendingCount / total) * 100) : 0;
  }

  get rejectedRate(): number {
    const total = this.totalApplications;
    return total ? Math.round((this.rejectedCount / total) * 100) : 0;
  }

  trackById(_: number, item: { id: number | string }): number | string {
    return item.id;
  }

  statusClass(status: NocStatus): string {
    switch (status) {
      case 'Approved':
        return 'approved';
      case 'Pending':
      case 'Under Review':
        return 'pending';
      case 'Rejected':
        return 'rejected';
      default:
        return 'pending';
    }
  }



  resetForm(): void {
    this.feedbackForm = {
      name: '',
      email: '',
      category: 'NOC Certificate',
      subject: '',
      message: ''
    };
  }
  getRedirectUrl(path: string): string {
  if (!path) return path;

  // external URLs untouched
  if (/^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(path)) return path;

  const cleanPath = path.startsWith('/') ? path : '/' + path;

  const baseEl = document.querySelector('base');
  const baseHref = (baseEl?.getAttribute('href') || '').replace(/\/$/, '');

  return `${baseHref}${cleanPath}`;
}

goToLogin(): void {
  window.location.href = this.getRedirectUrl('/page/login');
}

goTo(path: string): void {
  window.location.href = this.getRedirectUrl(path);
}

showQuerySuccess(): void {
  const f = this.feedbackForm;

  Swal.fire({
    icon: 'success',
    title: 'Query Submitted Successfully',
    html: `
      <div style="text-align:left; line-height:1.8">
        <div><strong>Name:</strong> ${f.name || '-'}</div>
        <div><strong>Email:</strong> ${f.email || '-'}</div>
        <div><strong>Category:</strong> ${f.category || '-'}</div>
        <div><strong>Subject:</strong> ${f.subject || '-'}</div>
        <div><strong>Message:</strong> ${f.message || '-'}</div>
      </div>
    `,
    confirmButtonText: 'Okay',
    confirmButtonColor: '#1f6fff',
    background: '#ffffff',
    width: 620,
    padding: '24px',
    showClass: {
      popup: 'swal2-show'
    }
  });
}

submitQuery(): void {
  // Hook this to your API later
  console.log('Query submitted', this.feedbackForm);
  this.showQuerySuccess();
}

}
