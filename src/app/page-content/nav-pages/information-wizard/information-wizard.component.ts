import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-information-wizard',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './information-wizard.component.html',
  styleUrls: ['./information-wizard.component.scss']
})
export class InformationWizardComponent {
  selectedDepartment: string = '';
  selectedService: string = '';
  selectedRisk: string = '';
  selectedLocation: string = '';
  selectedInvestor: string = '';
  selectedEmployees: string = '';
  selectedHp: string = '';

  departments: string[] = [
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

  services: string[] = [];
  riskCategories: string[] = ['High', 'Medium', 'Low'];
  locations: string[] = ['Location A', 'Location B', 'Location C']; // Mock data, replace with actual data
  investors: string[] = ['Investor 1', 'Investor 2', 'Investor 3']; // Mock data, replace with actual data
  employeeRanges: string[] = ['0-5', '5-15', '15-50', 'More than 100'];
  hpOptions: string[] = ['10 HP', '20 HP', '30 HP', '50 HP']; // Mock data, replace with actual data

  onDepartmentChange() {
    // Mock data for services based on department (replace with actual API/service call)
    this.services = this.selectedDepartment 
      ? [`Service 1 for ${this.selectedDepartment}`, `Service 2 for ${this.selectedDepartment}`] 
      : [];
    this.selectedService = ''; // Reset service when department changes
  }

  resetForm() {
    this.selectedDepartment = '';
    this.selectedService = '';
    this.selectedRisk = '';
    this.selectedLocation = '';
    this.selectedInvestor = '';
    this.selectedEmployees = '';
    this.selectedHp = '';
    this.services = [];
  }

  search() {
    // Implement search logic here
    console.log({
      department: this.selectedDepartment,
      service: this.selectedService,
      risk: this.selectedRisk,
      location: this.selectedLocation,
      investor: this.selectedInvestor,
      employees: this.selectedEmployees,
      hp: this.selectedHp
    });
  }
}