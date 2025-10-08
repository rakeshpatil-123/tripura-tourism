// grievance.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DynamicTableComponent, TableColumn } from '../../../shared/component/table/table.component';
import { IlogiSelectComponent } from '../../../customInputComponents/ilogi-select/ilogi-select.component';
import { IlogiInputDateComponent } from '../../../customInputComponents/ilogi-input-date/ilogi-input-date.component';


@Component({
  selector: 'app-grievance',
  templateUrl: './grievance.component.html',
  styleUrls: ['./grievance.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DynamicTableComponent,
    IlogiSelectComponent,
    IlogiInputDateComponent,
  ],
})
export class GrievanceComponent implements OnInit {
  selectedDepartment: string = '';
  fromDate: string = '';
  toDate: string = '';

  departments = [
    { id: '', name: 'Select' },
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

  tableData: any[] = [];
  columns: TableColumn[] = [];

  ngOnInit(): void {
    this.defineColumns();
    this.loadMockData();
  }

  defineColumns(): void {
    this.columns = [
      { key: 'slNo', label: 'Sl. No.', type: 'text', width: '80px', class: 'first-col' },
      { key: 'nocDescription', label: 'NOC Description', type: 'text', width: '200px', class: 'last-col wrap-text' },
      { key: 'timeLimit', label: 'Time limit', type: 'text', width: '120px', class: 'last-col' },
      { key: 'totalReceived', label: 'Total Grievance Received', type: 'number', width: '160px', class: 'last-col' },
      { key: 'totalResponded', label: 'Total Grievance Responded', type: 'number', width: '160px', class: 'last-col' },
      { key: 'avgTime', label: 'Average Time to Respond', type: 'text', width: '160px', class: 'last-col' },
      { key: 'medianTime', label: 'Median Time to Respond', type: 'text', width: '160px', class: 'last-col' },
      { key: 'minTime', label: 'Minimum Time to Respond', type: 'text', width: '160px', class: 'last-col' },
      { key: 'maxTime', label: 'Maximum Time to Respond', type: 'text', width: '160px', class: 'last-col' },
    ];
  }

  loadMockData(): void {
    this.tableData = [
      {
        slNo: 1,
        nocDescription: 'Electrical Safety Compliance',
        timeLimit: '7 days',
        totalReceived: 120,
        totalResponded: 110,
        avgTime: '3d 4h',
        medianTime: '2d 8h',
        minTime: '1d 2h',
        maxTime: '6d 5h',
      },
      {
        slNo: 2,
        nocDescription: 'Pollution Control Clearance',
        timeLimit: '10 days',
        totalReceived: 89,
        totalResponded: 85,
        avgTime: '5d 1h',
        medianTime: '4d 6h',
        minTime: '2d 3h',
        maxTime: '9d 12h',
      },
      {
        slNo: 3,
        nocDescription: 'Factory License Renewal',
        timeLimit: '15 days',
        totalReceived: 203,
        totalResponded: 190,
        avgTime: '7d 8h',
        medianTime: '6d 10h',
        minTime: '3d 1h',
        maxTime: '14d 9h',
      },
    ];
  }

  onSearch(): void {
    console.log('Search with:', {
      department: this.selectedDepartment,
      fromDate: this.fromDate,
      toDate: this.toDate,
    });
  }

  onReset(): void {
    this.selectedDepartment = '';
    this.fromDate = '';
    this.toDate = '';
  }
}