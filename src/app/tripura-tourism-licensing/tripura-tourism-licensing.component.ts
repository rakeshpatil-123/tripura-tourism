import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';

export interface LicensingService {
  id: number | string;
  title: string;
  subtitle: string;
  department: string;
  type: 'Special' | 'Native' | 'Online';
  actionLabel: string;
  icon: string;
  badge?: string;
  status?: string;
}

export interface NocService {
  title: string;
  subtitle: string;
  description: string;
  actionLabel: string;
}

@Component({
  selector: 'app-tripura-tourism-licensing',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tripura-tourism-licensing.component.html',
  styleUrls: ['./tripura-tourism-licensing.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TripuraTourismLicensingComponent implements OnInit {
  @Input() pageTitle = 'Tripura Tourism Licensing Services';
  @Input() pageSubtitle =
    'A single window for registration, renewal, applications, and NOC-related tourism services in Tripura';

  @Input() services: LicensingService[] = [];

  @Input() nocService: NocService = {
    title: 'NOC for Tourism Licensing Services',
    subtitle: 'No Objection Certificate support for eligible tourism services',
    description:
      'Use this section for NOC-related processing linked to homestays, tour operators, travel agents, tourist guides, and hotels & resorts.',
    actionLabel: 'Apply for NOC'
  };

  stats = [
    { label: 'Services Online', value: '04+' },
    { label: 'Registration Types', value: '03' },
    { label: 'Renewal Support', value: 'Yes' },
    { label: 'NOC Processing', value: 'Available' }
  ];

  documentChecklist = [
    'Identity proof and address proof',
    'Ownership / lease documents',
    'Photographs and property details',
    'Required certificates and declarations',
    'Service-specific application form'
  ];

  steps = [
    {
      step: '01',
      title: 'Choose the service',
      desc: 'Select the licensing or renewal service you need from the portal.'
    },
    {
      step: '02',
      title: 'Fill application details',
      desc: 'Complete the form with accurate business and property information.'
    },
    {
      step: '03',
      title: 'Upload documents',
      desc: 'Attach the required supporting documents in the correct format.'
    },
    {
      step: '04',
      title: 'Submit and track',
      desc: 'Submit the application and track its progress from the dashboard.'
    }
  ];

  ngOnInit(): void {
    if (!this.services || this.services.length === 0) {
      this.services = [
        {
          id: 1,
          title: 'Registration & Renewal of Homestays',
          subtitle: 'Apply for new registration or renewal under Tripura Tourism.',
          department: 'Tripura Tourism Development Corporation Limited',
          type: 'Special',
          actionLabel: 'Start Homestay Application',
          icon: '🏡',
          badge: 'Popular',
          status: 'Open'
        },
        {
          id: 2,
          title: 'Tour Operator / Travel Agent Registration',
          subtitle: 'New registration and renewal application for tourism operators.',
          department: 'Tripura Tourism Development Corporation Limited',
          type: 'Native',
          actionLabel: 'Apply as Operator',
          icon: '🧭',
          badge: 'Online',
          status: 'Open'
        },
        {
          id: 3,
          title: 'Tourist Guide Service Application',
          subtitle: 'Apply online for Tourist Guide service under the tourism department.',
          department: 'Tripura Tourism Development Corporation Limited',
          type: 'Special',
          actionLabel: 'Apply as Guide',
          icon: '🎒',
          badge: 'Service',
          status: 'Open'
        },
        {
          id: 4,
          title: 'Registration & Renewal of Hotels & Resorts',
          subtitle: 'Licensing and renewal support for hotels and resorts in Tripura.',
          department: 'Tripura Tourism Development Corporation Limited',
          type: 'Native',
          actionLabel: 'Register Hotel / Resort',
          icon: '🏨',
          badge: 'Licensed',
          status: 'Open'
        }
      ];
    }
  }

  trackById(_: number, item: LicensingService): string | number {
    return item.id;
  }

  actionText(item: LicensingService): string {
    return item.actionLabel;
  }
private getRedirectUrl(path: string): string {
  if (!path) return path;

  const { origin, pathname } = window.location;

  // detect if app is inside /onlineservice
  let basePath = '';
  if (pathname.startsWith('/onlineservice')) {
    basePath = '/onlineservice';
  }

  // normalize path
  const normalized = path.startsWith('/') ? path : `/${path}`;

  return `${origin}${basePath}${normalized}`;
}
goTo(path: string): void {
  if (!path) return;

  const url = this.getRedirectUrl(path);

  window.location.href = url;
}


}
