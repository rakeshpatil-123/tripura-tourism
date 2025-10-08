// registration-report.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DynamicTableComponent, TableColumn } from '../../../shared/component/table/table.component';
import { IlogiSelectComponent } from '../../../customInputComponents/ilogi-select/ilogi-select.component';
import { IlogiInputDateComponent } from '../../../customInputComponents/ilogi-input-date/ilogi-input-date.component';

@Component({
  selector: 'app-registration-report',
  templateUrl: './registration-report.component.html',
  styleUrls: ['./registration-report.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DynamicTableComponent,
    IlogiSelectComponent,
    IlogiInputDateComponent,
  ],
})
export class RegistrationReportComponent implements OnInit {
  selectedDepartment: string = '';
  selectedService: string = '';
  fromDate: string = '';
  toDate: string = '';

  // Department options
  departments = [
    { id: '', name: 'Select' },
    { id: '5564', name: 'Industries & Commerce' },
    { id: '5718', name: 'Jalboard Tripura' },
    { id: '5712', name: 'Bidyut Bandhu' },
    { id: '5719', name: 'Revenue Department' },
    { id: '5711', name: 'PWD (Water Resources)' },
    { id: '103', name: 'Directorate of Fire Service' },
    { id: '99', name: 'Drugs Control Administration' },
    { id: '100', name: 'Electrical Inspectorate' },
    { id: '102', name: 'Excise Department' },
    { id: '96', name: 'Factories & Boilers Organisation' },
    { id: '98', name: 'Directorate of Labour' },
    { id: '313', name: 'Land Records & Settlement' },
    { id: '108', name: 'Legal Metrology' },
    { id: '109', name: 'PWD (Drinking water and Sanitation)' },
    { id: '137', name: 'Taxes Organization' },
    { id: '97', name: 'Tripura State Pollution Control Board' },
    { id: '101', name: 'Tripura State Electricity Corporation Ltd' },
    { id: '104', name: 'Tripura Forest Department' },
    { id: '110', name: 'Urban Development Department' },
  ];

  // Mock service options
  services = [
    { id: '', name: 'Select' },
    { id: '1', name: 'Factory Registration' },
    { id: '2', name: 'Trade License Renewal' },
    { id: '3', name: 'Pollution Certificate' },
    { id: '4', name: 'Electrical License' },
    { id: '5', name: 'Fire Safety Certificate' },
  ];

  // Table data
  tableData: any[] = [];

  // Table columns
  columns: TableColumn[] = [];

  ngOnInit(): void {
    this.defineColumns();
    this.loadMockData();
  }

  defineColumns(): void {
    this.columns = [
      {
        key: 'type',
        label: 'Type',
        type: 'text',
        width: '150px',
        class: 'first-col',
      },
      {
        key: 'timeLimit',
        label: 'Time Limit',
        type: 'text',
        width: '120px',
        class: 'last-col',
      },
      {
        key: 'totalReceived',
        label: 'Total Number of applications received',
        type: 'number',
        width: '180px',
        class: 'last-col',
      },
      {
        key: 'femaleOwnersReceived',
        label: 'Total Number of applications received from businesses with female owners',
        type: 'number',
        width: '220px',
        class: 'last-col',
      },
      {
        key: 'totalApproved',
        label: 'Total Number of applications approved',
        type: 'number',
        width: '180px',
        class: 'last-col',
      },
      {
        key: 'femaleOwnersApproved',
        label: 'Total Number of applications approved of businesses with female owners',
        type: 'number',
        width: '220px',
        class: 'last-col',
      },
      {
        key: 'avgTime',
        label: 'Average time taken to obtain registration/renewal',
        type: 'text',
        width: '200px',
        class: 'last-col',
      },
      {
        key: 'medianTime',
        label: 'Median time taken to obtain registration/renewal',
        type: 'text',
        width: '200px',
        class: 'last-col',
      },
      {
        key: 'minTime',
        label: 'Minimum time taken to obtain registration/renewal',
        type: 'text',
        width: '200px',
        class: 'last-col',
      },
      {
        key: 'maxTime',
        label: 'Maximum time taken to obtain registration/renewal',
        type: 'text',
        width: '200px',
        class: 'last-col',
      },
      {
        key: 'avgFee',
        label: 'Average Fee taken to obtain registration/renewal',
        type: 'currency',
        width: '200px',
        class: 'last-col',
      },
    ];
  }

  loadMockData(): void {
    this.tableData = [
      {
        type: 'New Registration',
        timeLimit: '15 days',
        totalReceived: 156,
        femaleOwnersReceived: 42,
        totalApproved: 142,
        femaleOwnersApproved: 38,
        avgTime: '12 days',
        medianTime: '10 days',
        minTime: '5 days',
        maxTime: '14 days',
        avgFee: 2500,
      },
      {
        type: 'Renewal',
        timeLimit: '10 days',
        totalReceived: 203,
        femaleOwnersReceived: 58,
        totalApproved: 195,
        femaleOwnersApproved: 55,
        avgTime: '8 days',
        medianTime: '7 days',
        minTime: '3 days',
        maxTime: '10 days',
        avgFee: 1500,
      },
      {
        type: 'Amendment',
        timeLimit: '7 days',
        totalReceived: 89,
        femaleOwnersReceived: 24,
        totalApproved: 85,
        femaleOwnersApproved: 22,
        avgTime: '5 days',
        medianTime: '4 days',
        minTime: '2 days',
        maxTime: '7 days',
        avgFee: 1000,
      },
    ];
  }

  onDepartmentChange(): void {
    // Reset service when department changes
    this.selectedService = '';
    // In real app: load services based on selected department
  }

  onSearch(): void {
    console.log('Search with:', {
      department: this.selectedDepartment,
      service: this.selectedService,
      fromDate: this.fromDate,
      toDate: this.toDate,
    });
    // Later: filter table or call API
  }

  onReset(): void {
    this.selectedDepartment = '';
    this.selectedService = '';
    this.fromDate = '';
    this.toDate = '';
    // Optionally reload original data
  }
}