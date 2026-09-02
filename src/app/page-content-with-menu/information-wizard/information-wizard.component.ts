import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { IlogiSelectComponent } from '../../customInputComponents/ilogi-select/ilogi-select.component';
interface FeeSlab {
  sl: number;
  className: string;
  fee: string;
}
interface ServiceInfo {
  id: string;
  name: string;
  timeline: string;
  process: string[];
  requiredDocuments: string[];
  feeType: 'table' | 'text' | 'free';
  feeTable?: FeeSlab[];
  feeText?: string;
}
@Component({
  selector: 'app-information-wizard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IlogiSelectComponent],
  templateUrl: './information-wizard.component.html',
  styleUrls: ['./information-wizard.component.scss']
})
export class InformationWizardComponent {
  serviceFilters: { id: string; name: string }[] = [
    { id: 'all', name: 'All Services' },
    { id: 'homestay', name: 'Registration & Renewal of Homestays' },
    { id: 'hotel-resort', name: 'Registration & Renewal of Hotel/Resort' },
    { id: 'tour-operator', name: 'Tour Operators / Travel Agents Registration' },
    { id: 'tourist-guide', name: 'Tourist Guide Service' }
  ];
  filterForm: FormGroup;
  constructor(private fb: FormBuilder) {
    this.filterForm = this.fb.group({
      service_filter: [null]
    });
  }
  private readonly commonProcessWithInspection: string[] = [
    'Applicant is to submit the application Form along with required documents.',
    'Verification of the document & Spot Inspection if required.',
    'After having satisfaction, application with its enclosures will be forwarded to the Licensing Authority.',
    'Any dissatisfaction with the application to be communicated to the applicant.',
    'Received corrected application submitted to licensing Authority.',
    'Payment raised by the department considering the application details.',
    'License issued.'
  ];
  private readonly commonProcessWithoutInspection: string[] = [
    'Applicant is to submit the application Form along with required documents.',
    'Verification of the document.',
    'After having satisfaction, application with its enclosures will be forwarded to the Licensing Authority.',
    'Any dissatisfaction with the application to be communicated to the applicant.',
    'Received corrected application submitted to licensing Authority.',
    'Payment raised by the department considering the application details.',
    'License issued.'
  ];
  private readonly empanelmentFeeText =
    'The one time new empanelment fee for tour operators, travel agent and hoteliers will be ' +
    'Rs. 10,000/- (Rupees ten thousand) only and will be valid for a period of 5 (five) years. ' +
    'Further, on payment of Rs. 5,000/- (Rupees five thousand) only as renewal fee, the ' +
    'empanelment period will be extended for another 3 (three) years based on satisfactory ' +
    'performance of the operators.';
  services: ServiceInfo[] = [
    {
      id: 'homestay',
      name: 'Registration & Renewal of Homestays',
      timeline: '15 days',
      process: this.commonProcessWithInspection,
      requiredDocuments: [
        'Authorised Signature',
        'AADHAAR',
        'PAN card',
        'Trade License (Not Mandatory)',
        'Building Plan (In case of AMC area) (Not Mandatory)',
        "Applicant's Photograph (color)",
        'Front view, Room Interior, Kitchen View, Lounge, Wash Room, Lobby Photographs (Minimum of 1 photograph for each type)'
      ],
      feeType: 'table',
      feeTable: [
        { sl: 1, className: 'Class-A (Gold House)', fee: 'Rs. 4,000' },
        { sl: 2, className: 'Class-B (Silver House)', fee: 'Rs. 3,000' },
        { sl: 3, className: 'Class-C (Bronze House)', fee: 'Rs. 2,000' }
      ]
    },
    {
      id: 'hotel-resort',
      name: 'Registration & Renewal of Hotel/Resort',
      timeline: '15 days',
      process: this.commonProcessWithInspection,
      requiredDocuments: [
        'Authorised Signature',
        'AADHAAR',
        'PAN card',
        'Trade License (Not Mandatory)',
        "Applicant's Photograph (color)",
        'Front view, Room Interior, Kitchen View, Lounge, Wash Room, Lobby Photographs (Minimum of 1 photograph for each type)'
      ],
      feeType: 'text',
      feeText: this.empanelmentFeeText
    },
    {
      id: 'tour-operator',
      name: 'Online Application for New/Renewal of Registration of Tour Operators / Travel Agents',
      timeline: '15 days',
      process: this.commonProcessWithoutInspection,
      requiredDocuments: [
        'Signature of Applicant',
        'AADHAAR',
        'PAN card',
        'Trade License (Not Mandatory)',
        "Applicant's Photograph (color)"
      ],
      feeType: 'text',
      feeText: this.empanelmentFeeText
    },
    {
      id: 'tourist-guide',
      name: 'Online Application Form for Tourist Guide Service',
      timeline: '15 days',
      process: this.commonProcessWithoutInspection,
      requiredDocuments: [
        'Signature of Applicant',
        'AADHAAR',
        'PAN card',
        'Address Proof',
        "Applicant's Photograph (color)"
      ],
      feeType: 'free'
    }
  ];
  get filteredServices(): ServiceInfo[] {
    const selectedFilterId = this.filterForm.get('service_filter')?.value;

    if (!selectedFilterId) {
      return [];
    }
    if (selectedFilterId === 'all') {
      return this.services;
    }
    return this.services.filter(service => service.id === selectedFilterId);
  }

  get hasSelection(): boolean {
    return !!this.filterForm.get('service_filter')?.value;
  }

  trackByServiceId(_index: number, service: ServiceInfo): string {
    return service.id;
  }
}
