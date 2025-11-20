import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Approval {
  'S.No'?: number;
  'Risk Category'?: string;
  'Industry Sector'?: string;
  'Questions'?: string;
  'Department'?: string;
  'Approval Name'?: string;
  'Stage of Business'?: string;
  'SLA (days)'?: number;
  'Steps'?: number;
  'Documents Required'?: string;
  'Fees(INR)'?: string | number;
  'Legal Provision'?: string;
  'For More Information'?: string;
}

@Component({
  selector: 'app-kya',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './kya.component.html',
  styleUrl: './kya.component.scss'
})
export class KYAComponent {
  // Form data
  location: string = '';
  selectedSector: string = '';
  riskCategory: string = '';
  employees: string = '';
  firmSize: string = '';
  applicantType: string = '';
  showApprovals: boolean = false;
  selectedStage: string = 'all';

  // Dropdown options
  locations: string[] = ['Tripura', 'Agartala', 'Dharmanagar', 'Udaipur'];
  firmSizes: string[] = ['Micro', 'Small', 'Medium', 'Large'];
  applicantTypes: string[] = ['Domestic', 'Foreign', 'Joint Venture'];
  businessStages: string[] = [
    'All Stages',
    'Pre-establishment',
    'Post-establishment',
    'Pre-operation',
    'CFE',
    'CFO'
  ];

  // Industry sectors and approvals data
  industrySectors: string[] = [
    'Health Care Facilities (HCFS)',
    'Hotels/Banquet Halls having room facility ( Up to 20 rooms )',
    'Manufacturing of Automobiles (integrated facilities)',
    'Battery Manufacturing',
    'Compressed Biogas (CBG)/Bio-CNG Plants',
    'Manufacturing of Solar module/ non-conventional energy apparatus',
    'Brick Manufacturing',
    'Cement Plants: Stand-alone grinding units without Captive Power Plant'
  ];

  // Sample approvals database
  approvalsDatabase: Approval[] = [
    {
      'S.No': 1.0,
      'Risk Category': 'Green',
      'Industry Sector': 'Health Care Facilities (HCFS)',
      'Questions': 'Do you wish to apply for building plan approval?',
      'Department': 'Urban Development Department',
      'Approval Name': 'Building Plan Approval',
      'Stage of Business': 'Pre-establishment',
      'SLA (days)': 30,
      'Steps': 8,
      'Documents Required': 'Khatian Parcha\nRegistered Deed\nTax Updated Receipt Copy\nPlanner Declaration\nPlanner Signature Specimen Copy\nSoil Testing Report\nPlanner Design Calculation\nClearance from Fire Dept.\nClearance from Electricity Dept.',
      'Fees(INR)': 300,
      'Legal Provision': 'Tripura Building Rules, 2014'
    },
    {
      'Risk Category': 'Green',
      'Industry Sector': 'Health Care Facilities (HCFS)',
      'Questions': 'Do you wish to apply for consent to establish your industry under the Water and Air Act, 1974 (Green Category)?',
      'Department': 'Tripura State Pollution Control Board',
      'Approval Name': 'Consent to Establish',
      'Stage of Business': 'Pre-establishment',
      'SLA (days)': 21,
      'Steps': 2,
      'Documents Required': 'Land Documents/ Land Diversion/ Agreement Paper/ Parcha etc.\nNo Objection Certificate from surrounding neighbours and land owner.\nSite Plan of the unit.\nDetail project Report including cost of Capital Investment',
      'Fees(INR)': '2000*',
      'Legal Provision': 'Water and Air Act, 1974'
    },
    {
      'Risk Category': 'Green',
      'Industry Sector': 'Health Care Facilities (HCFS)',
      'Questions': 'Do you wish to apply for consent to operate your industry under the Water and Air Act, 1974 (Green Category)?',
      'Department': 'Tripura State Pollution Control Board',
      'Approval Name': 'Consent to Operate',
      'Stage of Business': 'Post-establishment',
      'SLA (days)': 21,
      'Steps': 2,
      'Fees(INR)': '2000*'
    },
    {
      'Risk Category': 'Green',
      'Industry Sector': 'Health Care Facilities (HCFS)',
      'Questions': 'Do you wish to apply for approval of your new factory plan drawing?',
      'Department': 'Factories & Boilers',
      'Approval Name': 'New Factory Plan Drawing Approval',
      'Stage of Business': 'Pre-establishment',
      'SLA (days)': 15,
      'Steps': 6,
      'Fees(INR)': 150,
      'Legal Provision': 'The Factories Act,1948'
    },
    {
      'Risk Category': 'Green',
      'Industry Sector': 'Health Care Facilities (HCFS)',
      'Questions': 'Do you wish to apply for registration or renewal of your factory license?',
      'Department': 'Factories & Boilers',
      'Approval Name': 'Registration and Grant or Renewal of Factory License',
      'Stage of Business': 'Post-establishment',
      'SLA (days)': 15,
      'Steps': 6,
      'Fees(INR)': 'As per prescribed Schedule, TFR 2007',
      'Legal Provision': 'The Factories Act,1948'
    },
    {
      'Risk Category': 'Green',
      'Industry Sector': 'Health Care Facilities (HCFS)',
      'Questions': 'Do you wish to apply for a Wholesale Drug License?',
      'Department': 'Drugs Control',
      'Approval Name': 'Wholesale Drug License',
      'Stage of Business': 'Pre-operation',
      'SLA (days)': 20,
      'Steps': 5,
      'Fees(INR)': 3000,
      'Legal Provision': 'Drug Rules, 1945, Rule.64'
    },
    {
      'S.No': 2.0,
      'Risk Category': 'Green',
      'Industry Sector': 'Hotels/Banquet Halls having room facility ( Up to 20 rooms )',
      'Questions': 'Do you wish to apply for building plan approval?',
      'Department': 'Urban Development Department',
      'Approval Name': 'Building Plan Approval',
      'Stage of Business': 'Pre-establishment',
      'SLA (days)': 30,
      'Steps': 8,
      'Fees(INR)': '25-300',
      'Legal Provision': 'Tripura Building Rules, 2014'
    },
    {
      'Risk Category': 'Green',
      'Industry Sector': 'Hotels/Banquet Halls having room facility ( Up to 20 rooms )',
      'Questions': 'Do you want to apply for hotel registration?',
      'Department': 'Tourism',
      'Approval Name': 'Hotel registration',
      'Stage of Business': 'Pre-Establishment',
      'SLA (days)': 15,
      'Steps': 3,
      'Fees(INR)': '5000',
      'Legal Provision': 'Tripura Tourism Trade Act'
    },
    {
      'S.No': 3.0,
      'Risk Category': 'Red',
      'Industry Sector': 'Manufacturing of Automobiles (integrated facilities)',
      'Questions': 'Do you wish to apply for building plan approval?',
      'Department': 'Urban Development Department',
      'Approval Name': 'Building Plan Approval',
      'Stage of Business': 'Pre-establishment',
      'SLA (days)': 30,
      'Steps': 8,
      'Fees(INR)': '25-300',
      'Legal Provision': 'Tripura Building Rules, 2014'
    },
    {
      'Risk Category': 'Red',
      'Industry Sector': 'Manufacturing of Automobiles (integrated facilities)',
      'Questions': 'Do you wish to apply for consent to establish your red-category industry under the Water and Air Act, 1974?',
      'Department': 'Tripura State Pollution Control Board',
      'Approval Name': 'Consent to Establish',
      'Stage of Business': 'Pre-establishment',
      'SLA (days)': 21,
      'Steps': 2,
      'Fees(INR)': 'Fee Structure as per Matrix'
    },
    {
      'S.No': 4.0,
      'Risk Category': 'Red',
      'Industry Sector': 'Battery Manufacturing',
      'Questions': 'Do you wish to apply for building plan approval?',
      'Department': 'Urban Development Department',
      'Approval Name': 'Building Plan Approval',
      'Stage of Business': 'Pre-establishment',
      'SLA (days)': 30,
      'Steps': 8,
      'Fees(INR)': '25-300',
      'Legal Provision': 'Tripura Building Rules, 2014'
    },
    {
      'Risk Category': 'Red',
      'Industry Sector': 'Battery Manufacturing',
      'Questions': 'Do you need Authorisation under Battery Waste',
      'Department': 'Tripura State Pollution Control Board',
      'Approval Name': 'Authorisation under Battery Waste',
      'Stage of Business': 'Pre-establishment',
      'SLA (days)': 21,
      'Steps': 2,
      'Fees(INR)': 0,
      'Legal Provision': 'The Factories Act,1948'
    },
    {
      'S.No': 5.0,
      'Risk Category': 'White',
      'Industry Sector': 'Compressed Biogas (CBG)/Bio-CNG Plants',
      'Questions': 'Do you wish to get Building Plan approval?',
      'Department': 'Urban Development Department',
      'Approval Name': 'Building Plan Approval',
      'Stage of Business': 'Pre-Establishment',
      'SLA (days)': 30,
      'Steps': 8,
      'Fees(INR)': '25-300',
      'Legal Provision': 'Tripura Building Rules, 2014'
    },
    {
      'S.No': 7.0,
      'Risk Category': 'Orange',
      'Industry Sector': 'Brick Manufacturing',
      'Questions': 'Do you wish to apply for Building Plan Approval?',
      'Department': 'Urban Development Department',
      'Approval Name': 'Building Plan Approval',
      'Stage of Business': 'Pre-Establishment',
      'SLA (days)': 30,
      'Steps': 8,
      'Fees(INR)': '25-300',
      'Legal Provision': 'Tripura Building Rules, 2014'
    },
    {
      'S.No': 8.0,
      'Risk Category': 'Orange',
      'Industry Sector': 'Cement Plants: Stand-alone grinding units without Captive Power Plant',
      'Questions': 'Do you wish to apply for Building Plan Approval?',
      'Department': 'Urban Development Department',
      'Approval Name': 'Building Plan Approval',
      'Stage of Business': 'Pre-Establishment',
      'SLA (days)': 30,
      'Steps': 8,
      'Fees(INR)': '25-300',
      'Legal Provision': 'Tripura Building Rules, 2014'
    }
  ];

  // Methods
  onSectorChange(sector: string): void {
    this.selectedSector = sector;
    this.riskCategory = this.getRiskCategory(sector);
  }

  getRiskCategory(sector: string): string {
    const sectorData = this.approvalsDatabase.find(
      item => item['Industry Sector'] === sector
    );
    return sectorData ? sectorData['Risk Category'] || '' : '';
  }

  getApprovals(): Approval[] {
    return this.approvalsDatabase.filter(
      item => item['Industry Sector'] === this.selectedSector
    );
  }

  get filteredApprovals(): Approval[] {
    const approvals = this.getApprovals();
    if (this.selectedStage === 'all' || this.selectedStage === 'All Stages') {
      return approvals;
    }
    return approvals.filter(
      approval => approval['Stage of Business'] === this.selectedStage
    );
  }

  getRiskColorClass(risk: string): string {
    const colors: { [key: string]: string } = {
      'Green': 'risk-green',
      'Orange': 'risk-orange',
      'Red': 'risk-red',
      'White': 'risk-white'
    };
    return colors[risk] || 'risk-default';
  }

  getStageColorClass(stage: string): string {
    const colors: { [key: string]: string } = {
      'Pre-establishment': 'stage-pre-establishment',
      'Pre-Establishment': 'stage-pre-establishment',
      'Post-establishment': 'stage-post-establishment',
      'Pre-operation': 'stage-pre-operation',
      'Pre-Operation': 'stage-pre-operation',
      'Post-operation': 'stage-post-operation',
      'CFE': 'stage-cfe',
      'CFO': 'stage-cfo',
      'OTHERS': 'stage-others',
      'Others': 'stage-others'
    };
    return colors[stage] || 'stage-default';
  }

  getDocumentsList(documents: string): string[] {
    return documents ? documents.split('\n').filter(doc => doc.trim()) : [];
  }

  getDisplayedDocuments(documents: string): string[] {
    const docs = this.getDocumentsList(documents);
    return docs.slice(0, 3);
  }

  getRemainingDocumentsCount(documents: string): number {
    const docs = this.getDocumentsList(documents);
    return docs.length > 3 ? docs.length - 3 : 0;
  }

  viewApprovals(): void {
    if (this.selectedSector) {
      this.showApprovals = true;
    }
  }

  backToForm(): void {
    this.showApprovals = false;
  }

  onStageFilterChange(stage: string): void {
    this.selectedStage = stage;
  }
}