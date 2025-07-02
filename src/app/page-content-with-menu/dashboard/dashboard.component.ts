import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BarChartComponent } from './bar-chart/bar-chart.component';
import { ClarificationRequiredTableComponent } from './certification-required-table/certification-required-table.component';
import { ClaimStatusTableComponent } from './claim-status-table/claim-status-table.component';
import { DonutChartComponent } from './donut-chart/donut-chart.component';
import { StatsCardComponent } from './stats-card/stats-card.component';
import { ButtonComponent } from "../../shared/component/button-component/button.component";

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    StatsCardComponent,
    BarChartComponent,
    DonutChartComponent,
    ClaimStatusTableComponent,
    ClarificationRequiredTableComponent,
    ButtonComponent
],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  barChartData = [
    { label: 'CFO', approved: 3.5, rejected: 1 },
    { label: 'CTO', approved: 5, rejected: 0 },
    { label: 'Panchayat', approved: 0, rejected: 1 },
    { label: 'Electrical', approved: 0, rejected: 0 },
    { label: 'Other', approved: 2.5, rejected: 0 }
  ];

  donutChartData = [
    { label: 'Approved', value: 86, color: '#198754' },
    { label: 'Pending', value: 28, color: '#ffc107' },
    { label: 'Rejected', value: 10, color: '#dc3545' }
  ];

  claimStatusData = [
    { type: 'Proforma I', submitted: 0, approved: 0, received: 0, pending: 0 },
    { type: 'Proforma II', submitted: 0, approved: 0, received: 0, pending: 0 },
    { type: 'Proforma III', submitted: 0, approved: 0, received: 0, pending: 0 }
  ];

  clarificationRequiredData = [
    {
      applicationId: 'CFO-SA-000111',
      department: 'Electrical Inspectorate',
      noc: 'Application for NOC from Electrical Inspectorate',
      clarification: '',
      isDocumentMissing: true
    },
    {
      applicationId: 'PFR-94-000187',
      department: 'Partnership Firm Registration (L & C)',
      noc: 'Application for Partnership Firm Registration',
      clarification: 'Kindly upload all the documents properly as mentioned in the portal.',
      isDocumentMissing: false
    }
  ];
}
