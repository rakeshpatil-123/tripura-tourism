// online-single-window-report.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DynamicTableComponent, TableColumn } from '../../../shared/component/table/table.component';
import { IlogiSelectComponent } from '../../../customInputComponents/ilogi-select/ilogi-select.component';
import { IlogiInputDateComponent } from '../../../customInputComponents/ilogi-input-date/ilogi-input-date.component';

@Component({
  selector: 'app-online-single-window-report',
  templateUrl: './online-single-window-report.component.html',
  styleUrls: ['./online-single-window-report.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DynamicTableComponent,
    IlogiSelectComponent,
    IlogiInputDateComponent,
  ],
})
export class OnlineSingleWindowReportComponent implements OnInit {
  selectedDepartment: string = '';
  selectedService: string = '';
  fromDate: string = '';
  toDate: string = '';

  // Department options
  departments = [
    { id: '', name: 'Select' },
    { id: 'all_departments', name: 'All Departments' },
    { id: '95', name: 'Co-Operative Registrar' },
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
    { id: '105', name: 'Industries & Commerce (Incentive)' },
    { id: '312', name: 'IT & Admin' },
    { id: '98', name: 'Directorate of Labour' },
    { id: '313', name: 'Land Records & Settlement' },
    { id: '108', name: 'Legal Metrology' },
    { id: '94', name: 'Partnership Firm Registration (I & C)' },
    { id: '109', name: 'PWD (Drinking water and Sanitation)' },
    { id: '137', name: 'Taxes Organization' },
    { id: '97', name: 'Tripura State Pollution Control Board' },
    { id: '101', name: 'Tripura State Electricity Corporation Ltd' },
    { id: '106', name: 'Tripura Industrial Development Corporation Limited' },
    { id: '104', name: 'Tripura Forest Department' },
    { id: '110', name: 'Urban Development Department' },
  ];

  // Mock service options (you can load dynamically later)
  services = [
    { id: '', name: 'Select' },
    { id: '1', name: 'Electrical NOC' },
    { id: '2', name: 'Pollution Clearance' },
    { id: '3', name: 'Factory License' },
    { id: '4', name: 'Trade License' },
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
        key: 'slNo',
        label: 'Sl. No.',
        type: 'number',
        width: '80px',
        class: 'first-col',
      },
      {
        key: 'nocDescription',
        label: 'NOC Description',
        type: 'text',
        width: '200px',
        class: 'last-col wrap-text',
      },
      {
        key: 'timeLimit',
        label: 'Time limit',
        type: 'text',
        width: '120px',
        class: 'last-col',
      },
      {
        key: 'totalReceived',
        label: 'Total number of applications received',
        type: 'number',
        width: '180px',
        class: 'last-col',
      },
      {
        key: 'totalProcessed',
        label: 'Total number of applications processed',
        type: 'number',
        width: '180px',
        class: 'last-col',
      },
      {
        key: 'totalApproved',
        label: 'Total number of applications approved',
        type: 'number',
        width: '180px',
        class: 'last-col',
      },
      {
        key: 'maxTime',
        label: 'Max time taken to grant approval',
        type: 'text',
        width: '180px',
        class: 'last-col',
      },
      {
        key: 'minTime',
        label: 'Min time taken to grant approval',
        type: 'text',
        width: '180px',
        class: 'last-col',
      },
      {
        key: 'avgTime',
        label: 'Average time taken to grant approval',
        type: 'text',
        width: '180px',
        class: 'last-col',
      },
      {
        key: 'medianTime',
        label: 'Median time taken to grant approval',
        type: 'text',
        width: '180px',
        class: 'last-col',
      },
      {
        key: 'avgFee',
        label: 'Average fee taken to grant approval',
        type: 'currency',
        width: '180px',
        class: 'last-col',
      },
    ];
  }

  loadMockData(): void {
    this.tableData = [
      {
        slNo: 1,
        nocDescription: 'Electrical Safety NOC',
        timeLimit: '7 days',
        totalReceived: 156,
        totalProcessed: 142,
        totalApproved: 138,
        maxTime: '6 days 8 hrs',
        minTime: '1 day 4 hrs',
        avgTime: '3 days 2 hrs',
        medianTime: '2 days 10 hrs',
        avgFee: 2500,
      },
      {
        slNo: 2,
        nocDescription: 'Pollution Control Clearance',
        timeLimit: '15 days',
        totalReceived: 89,
        totalProcessed: 85,
        totalApproved: 80,
        maxTime: '14 days 3 hrs',
        minTime: '5 days 1 hr',
        avgTime: '10 days 4 hrs',
        medianTime: '9 days 6 hrs',
        avgFee: 5000,
      },
      {
        slNo: 3,
        nocDescription: 'Factory License',
        timeLimit: '30 days',
        totalReceived: 203,
        totalProcessed: 195,
        totalApproved: 190,
        maxTime: '28 days 5 hrs',
        minTime: '10 days 2 hrs',
        avgTime: '22 days 3 hrs',
        medianTime: '20 days 8 hrs',
        avgFee: 10000,
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