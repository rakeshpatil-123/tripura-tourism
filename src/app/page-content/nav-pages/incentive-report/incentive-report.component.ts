






// incentive.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DynamicTableComponent, TableColumn } from '../../../shared/component/table/table.component';
import { IlogiInputDateComponent } from '../../../customInputComponents/ilogi-input-date/ilogi-input-date.component';

@Component({
  selector: 'app-incentive',
  templateUrl: './incentive-report.component.html',
  styleUrls: ['./incentive-report.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DynamicTableComponent,
    IlogiInputDateComponent,
  ],
})
export class IncentiveReportComponent implements OnInit {
  fromDate: string = '';
  toDate: string = '';

  // Summary count
  totalIncentiveCompanies: number = 0;

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
        key: 'incentiveName',
        label: 'Incentive Name',
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
        label: 'Total Number of Applications Received',
        type: 'number',
        width: '180px',
        class: 'last-col',
      },
      {
        key: 'totalProcessed',
        label: 'Total Number of Applications Processed',
        type: 'number',
        width: '180px',
        class: 'last-col',
      },
      {
        key: 'totalApproved',
        label: 'Total Number of Applications Approved',
        type: 'number',
        width: '180px',
        class: 'last-col',
      },
      {
        key: 'avgTime',
        label: 'Average time taken to grant approval',
        type: 'text',
        width: '200px',
        class: 'last-col',
      },
      {
        key: 'medianTime',
        label: 'Median time taken to grant approval',
        type: 'text',
        width: '200px',
        class: 'last-col',
      },
      {
        key: 'minFee',
        label: 'Minimum fee taken to grant approval',
        type: 'currency',
        width: '200px',
        class: 'last-col',
      },
      {
        key: 'maxFee',
        label: 'Maximum fee taken to grant approval',
        type: 'currency',
        width: '200px',
        class: 'last-col',
      },
    ];
  }

  loadMockData(): void {
    this.tableData = [
      {
        slNo: 1,
        incentiveName: 'Capital Investment Subsidy',
        timeLimit: '30 days',
        totalReceived: 156,
        totalProcessed: 142,
        totalApproved: 135,
        avgTime: '22 days',
        medianTime: '20 days',
        minFee: 5000,
        maxFee: 500000,
      },
      {
        slNo: 2,
        incentiveName: 'Employment Generation Incentive',
        timeLimit: '45 days',
        totalReceived: 89,
        totalProcessed: 85,
        totalApproved: 78,
        avgTime: '35 days',
        medianTime: '32 days',
        minFee: 0,
        maxFee: 200000,
      },
      {
        slNo: 3,
        incentiveName: 'Power Tariff Subsidy',
        timeLimit: '15 days',
        totalReceived: 203,
        totalProcessed: 195,
        totalApproved: 190,
        avgTime: '12 days',
        medianTime: '10 days',
        minFee: 0,
        maxFee: 100000,
      },
    ];

    // Calculate total companies (sum of approved applications)
    this.totalIncentiveCompanies = this.tableData.reduce(
      (sum, row) => sum + row.totalApproved,
      0
    );
  }

  onSearch(): void {
    console.log('Search with:', {
      fromDate: this.fromDate,
      toDate: this.toDate,
    });
    // Later: call API with date filters
  }

  onReset(): void {
    this.fromDate = '';
    this.toDate = '';
    // Optionally reload original data
  }
}