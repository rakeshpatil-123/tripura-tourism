import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faUndo, faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-investor-query',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule],
  templateUrl: './investor-query.component.html',
  styleUrls: ['./investor-query.component.scss']
})
export class InvestorQueryComponent {
  queryTopics: string[] = [
    'Investment in Hospitability',
    'Support given to start-ups',
    'Raw material availability',
    'Power/Gas availability',
    'Land Allotment',
    'Investment in Tourism Sector',
    'Investment in Rubber Sector',
    'Other Query',
    'Approval Process for new Investment',
    'Investment in Health Sector',
    'Investment in Food Processing Sector',
    'Investment in Bamboo Sector',
    'Investment in any other Sector',
    'Infrastructure availability',
    'Incentives available in state',
    'Focus sectors of state'
  ];

  states: string[] = [
    'Andhra Pradesh',
    'Arunachal Pradesh',
    'Assam',
    'Bihar',
    'Chhattisgarh',
    'Goa',
    'Gujarat',
    'Haryana',
    'Himachal Pradesh',
    'Jharkhand',
    'Karnataka',
    'Kerala',
    'Madhya Pradesh',
    'Maharashtra',
    'Manipur',
    'Meghalaya',
    'Mizoram',
    'Nagaland',
    'Odisha',
    'Punjab',
    'Rajasthan',
    'Sikkim',
    'Tamil Nadu',
    'Telangana',
    'Tripura',
    'Uttar Pradesh',
    'Uttarakhand',
    'West Bengal'
  ];

  sectors: string[] = [
    'Co-Operative Registrar',
    'Industries & Commerce',
    'Jalboard Tripura',
    'Bidyut Bandhu',
    'Revenue Department',
    'PWD (Water & Resources)',
    'Directorate of Fire Service',
    'Drugs Control Administration',
    'Electrical Inspectorate',
    'Excise Department',
    'Factories & Boilers Organisation',
    'Industries & Commerce (Incentive)',
    'IT & Admin',
    'Directorate of Labour',
    'Land Records & Settlement',
    'Legal Methodology',
    'Partnership Firm Registration',
    'PWD (Drinking Water & Sanitation)',
    'Taxes Organization',
    'Tripura State Pollution Control Board',
    'Tripura State Electricity Corporation Ltd',
    'Tripura Industrial Development Corporation Ltd',
    'Tripura Forest Department',
    'Urban Development Department'
  ];

  formData = {
    topic: '',
    cname: '',
    caddress: '',
    city: '',
    state: '',
    activities: '',
    interest: '',
    sector: '',
    aname: '',
    email: '',
    mobile: '',
    summary: '',
    details: '',
    file: null as File | null,
    ref: '',
    captcha: false
  };

  constructor(library: FaIconLibrary) {
    library.addIcons(faUndo, faPaperPlane);
  }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.formData.file = input.files[0];
    } else {
      this.formData.file = null;
    }
  }

  onReset() {
    this.formData = {
      topic: '',
      cname: '',
      caddress: '',
      city: '',
      state: '',
      activities: '',
      interest: '',
      sector: '',
      aname: '',
      email: '',
      mobile: '',
      summary: '',
      details: '',
      file: null,
      ref: '',
      captcha: false
    };
  }

  onSubmit() {
    if (!this.formData.captcha) {
      alert('Please complete the CAPTCHA verification');
      return;
    }

    // Mock submission
    alert(`Form submitted successfully! A confirmation email will be sent to ${this.formData.email}`);
    this.onReset();
  }
}