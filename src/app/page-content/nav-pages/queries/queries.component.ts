// queries.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DynamicTableComponent, TableColumn } from '../../../shared/component/table/table.component';
import { IlogiSelectComponent } from '../../../customInputComponents/ilogi-select/ilogi-select.component';
import { IlogiInputDateComponent } from '../../../customInputComponents/ilogi-input-date/ilogi-input-date.component';

@Component({
  selector: 'app-queries',
  templateUrl: './queries.component.html',
  styleUrls: ['./queries.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DynamicTableComponent,
    IlogiSelectComponent,
    IlogiInputDateComponent,
  ],
})
export class QueriesComponent implements OnInit {
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

  // Table data — key/value pairs
  tableData: any[] = [];

  // Only 2 columns: Particulars & Details
  columns: TableColumn[] = [];

  ngOnInit(): void {
    this.defineColumns();
    this.loadMockData();
  }

  defineColumns(): void {
    this.columns = [
      {
        key: 'particulars',
        label: 'Particulars',
        type: 'text',
        width: '300px',
        class: 'first-col',
      },
      {
        key: 'details',
        label: 'Details',
        type: 'text',
        width: '200px',
        class: 'last-col',
      },
    ];
  }

  loadMockData(): void {
    this.tableData = [
      {
        particulars: 'Time Limit prescribed as per the Public Service Guarantee Act',
        details: '7 working days',
      },
      {
        particulars: 'Total Number of Queries Received',
        details: '245',
      },
      {
        particulars: 'Total Number of Queries responded',
        details: '230',
      },
      {
        particulars: 'Average time taken to respond to queries',
        details: '3 days 4 hours',
      },
      {
        particulars: 'Median time taken to respond to queries',
        details: '2 days 8 hours',
      },
      {
        particulars: 'Minimum time taken to respond to Query',
        details: '1 day 2 hours',
      },
      {
        particulars: 'Maximum time taken to respond to Query',
        details: '6 days 5 hours',
      },
    ];
  }

  onSearch(): void {
    console.log('Search with:', {
      department: this.selectedDepartment,
      fromDate: this.fromDate,
      toDate: this.toDate,
    });
    // Later: filter or call API
  }

  onReset(): void {
    this.selectedDepartment = '';
    this.fromDate = '';
    this.toDate = '';
    // Optionally reload original data
  }
}