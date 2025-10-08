// central-inspection-agency.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DynamicTableComponent, TableColumn } from '../../../shared/component/table/table.component';
import { IlogiSelectComponent } from '../../../customInputComponents/ilogi-select/ilogi-select.component';

@Component({
  selector: 'app-central-inspection-agency',
  templateUrl: './central-inspection-agency.component.html',
  styleUrls: ['./central-inspection-agency.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DynamicTableComponent,
    IlogiSelectComponent,
  ],
})
export class CentralInspectionAgencyComponent implements OnInit {
  selectedYear: string = '';
  selectedMonth: string = '';

  // Year options (2021-2030)
  years = [
    { id: '', name: 'Select' },
    { id: '2021', name: '2021' },
    { id: '2022', name: '2022' },
    { id: '2023', name: '2023' },
    { id: '2024', name: '2024' },
    { id: '2025', name: '2025' },
    { id: '2026', name: '2026' },
    { id: '2027', name: '2027' },
    { id: '2028', name: '2028' },
    { id: '2029', name: '2029' },
    { id: '2030', name: '2030' },
  ];

  // Month options
  months = [
    { id: '', name: 'Select' },
    { id: '01', name: 'Jan' },
    { id: '02', name: 'Feb' },
    { id: '03', name: 'Mar' },
    { id: '04', name: 'Apr' }, // Fixed typo: was "App"
    { id: '05', name: 'May' },
    { id: '06', name: 'Jun' },
    { id: '07', name: 'Jul' },
    { id: '08', name: 'Aug' },
    { id: '09', name: 'Sep' },
    { id: '10', name: 'Oct' },
    { id: '11', name: 'Nov' },
    { id: '12', name: 'Dec' },
  ];

  // Table data — single row
  tableData: any[] = [];

  // 10 columns
  columns: TableColumn[] = [];

  ngOnInit(): void {
    this.defineColumns();
    this.loadMockData();
  }

  defineColumns(): void {
    this.columns = [
      {
        key: 'totalInspections',
        label: 'Total Number of Inspections Conducted',
        type: 'number',
        width: '180px',
      },
      {
        key: 'completedInspections',
        label: 'Total Number of Inspections Completed',
        type: 'number',
        width: '180px',
      },
      {
        key: 'avgTime',
        label: 'Average Time Taken for Conducting Inspections',
        type: 'text',
        width: '200px',
      },
      {
        key: 'medianTime',
        label: 'Median Time Taken for Conducting Inspections',
        type: 'text',
        width: '200px',
      },
      {
        key: 'minTime',
        label: 'Minimum Time Taken for Conducting Inspections',
        type: 'text',
        width: '200px',
      },
      {
        key: 'maxTime',
        label: 'Maximum Time Taken for Conducting Inspections',
        type: 'text',
        width: '200px',
      },
      {
        key: 'timeLimit',
        label: 'Time Limit Prescribed as per the Public Service Guarantee Act',
        type: 'text',
        width: '220px',
      },
      {
        key: 'avgFee',
        label: 'Average Fee Taken by the Department for Completion of Entire Process of Inspection',
        type: 'currency',
        width: '220px',
      },
      {
        key: 'selfCertExempt',
        label: 'Total Number of Companies that Provided Self-Certifications and Were Exempted from Inspections',
        type: 'number',
        width: '240px',
      },
      {
        key: 'thirdPartyCertExempt',
        label: 'Total Number of Companies that Provided Third Party Certifications and Were Exempted from Inspections',
        type: 'number',
        width: '240px',
      },
    ];
  }

  loadMockData(): void {
    this.tableData = [
      {
        totalInspections: 156,
        completedInspections: 142,
        avgTime: '4 days 3 hours',
        medianTime: '3 days 7 hours',
        minTime: '1 day 5 hours',
        maxTime: '8 days 2 hours',
        timeLimit: '7 working days',
        avgFee: 2500,
        selfCertExempt: 34,
        thirdPartyCertExempt: 18,
      },
    ];
  }

  onSearch(): void {
    console.log('Search with:', {
      year: this.selectedYear,
      month: this.selectedMonth,
    });
    // Later: filter or call API based on year/month
  }
}