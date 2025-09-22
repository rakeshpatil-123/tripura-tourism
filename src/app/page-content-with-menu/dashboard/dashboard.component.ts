import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BarChartComponent } from './bar-chart/bar-chart.component';
import { ClarificationRequiredTableComponent } from './certification-required-table/certification-required-table.component';
import { ClaimStatusTableComponent } from './claim-status-table/claim-status-table.component';
import { DonutChartComponent } from './donut-chart/donut-chart.component';
import { StatsCardComponent } from './stats-card/stats-card.component';
import { ButtonComponent } from '../../shared/component/button-component/button.component';
import { TimelineCardComponent } from '../../shared/timeline-card/timeline-card.component';
import { TableColumn } from '../../shared/component/table/table.component';
import { GenericService } from '../../_service/generic/generic.service';

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
    ButtonComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  deptId: any;
  totalApplicationsCount: number = 0;
  totalPendingApplicationCount: number = 0;
  totalApprovedApplication: number = 0;
  totalNOCIssuedDepartment: number = 0;
  barChartData = [
    { label: 'CFO', approved: 3.5, rejected: 1 },
    { label: 'CTO', approved: 5, rejected: 0 },
    { label: 'Panchayat', approved: 0, rejected: 1 },
    { label: 'Electrical', approved: 0, rejected: 0 },
    { label: 'Other', approved: 2.5, rejected: 0 },
  ];

  donutChartData = [
    { label: 'Approved', value: 86, color: '#198754' },
    { label: 'Pending', value: 28, color: '#ffc107' },
    { label: 'Rejected', value: 10, color: '#dc3545' },
  ];

  claimStatusData = [
    { type: 'Proforma I', submitted: 0, approved: 0, received: 0, pending: 0 },
    { type: 'Proforma II', submitted: 0, approved: 0, received: 0, pending: 0 },
    {
      type: 'Proforma III',
      submitted: 0,
      approved: 0,
      received: 0,
      pending: 0,
    },
  ];

  constructor(private genericService: GenericService) { }

  ngOnInit(): void {
    this.deptId = this.genericService.decryptLocalStorageItem('deptId') || '';
    if (this.deptId) {
      this.getNocIssuedList();
      this.getDashboardData();
    }
  }

  getDashboardData(): void {
    this.genericService.getDashboardData(this.deptId).subscribe({
      next: (res: any) => {
        this.totalApplicationsCount = res.total_applications_for_this_department || 0;
        this.totalApprovedApplication = res.total_count_approved_application_in_department || 0;
        this.totalPendingApplicationCount = res.total_count_pending_application_in_department || 0;
        this.totalNOCIssuedDepartment = res.number_of_NOC_issued_by_department || 0;
      },
    });
  }
  getNocIssuedList(): void {
    this.genericService.getNocIssuedList(this.deptId).subscribe({
      next: (res: any) => {
        if (res?.list_of_NOC_issued_by_department?.data) {
          this.clarificationRequiredData = res.list_of_NOC_issued_by_department.data.map((item: any) => ({
            applicationId: item.application_id.toString(),
            department: 'Department of Industries',
            noc: `Application for NOC of ${item.name_of_unit}`,
            clarification: '',
            isDocumentMissing: false
          }));
        }
      },
    });
  }

  clarificationRequiredData = [
    {
      applicationId: 'CFO-SA-000111',
      department: 'Electrical Inspectorate',
      noc: 'Application for NOC from Electrical Inspectorate',
      clarification: '',
      isDocumentMissing: true,
    },
    {
      applicationId: 'PFR-94-000187',
      department: 'Partnership Firm Registration (L & C)',
      noc: 'Application for Partnership Firm Registration',
      clarification:
        'Kindly upload all the documents properly as mentioned in the portal.',
      isDocumentMissing: false,
    },
  ];

  tableData = [
    {
      id: 1,
      name: 'John Michael',
      email: 'john.michael@example.com',
      department: 'Engineering',
      status: true,
      salary: 95000,
      joinDate: '2022-01-15',
    },
    {
      id: 2,
      name: 'Alexa Liras',
      email: 'alexa@example.com',
      department: 'Marketing',
      status: false,
      salary: 82000,
      joinDate: '2021-11-03',
    },
    {
      id: 3,
      name: 'Laurent Perrier',
      email: 'laurent@example.com',
      department: 'Sales',
      status: true,
      salary: 120000,
      joinDate: '2020-05-22',
    },
    {
      id: 4,
      name: 'Michael Levi',
      email: 'michael@example.com',
      department: 'Human Resources',
      status: true,
      salary: 78000,
      joinDate: '2023-03-10',
    },
    {
      id: 5,
      name: 'Richard Gran',
      email: 'richard@example.com',
      department: 'Engineering',
      status: false,
      salary: 92000,
      joinDate: '2022-08-17',
    },
    {
      id: 6,
      name: 'Miriam Ericson',
      email: 'miriam@example.com',
      department: 'Product',
      status: true,
      salary: 110000,
      joinDate: '2021-12-01',
    },
  ];

  tableColumns: TableColumn[] = [
    { key: 'id', label: 'ID', type: 'number', sortable: true, width: '80px' },
    { key: 'name', label: 'Full Name', sortable: true },
    { key: 'email', label: 'Email' },
    { key: 'department', label: 'Department', sortable: true },
    { key: 'status', label: 'Status', type: 'boolean', sortable: true },
    { key: 'salary', label: 'Salary', type: 'currency', sortable: true },
    { key: 'joinDate', label: 'Join Date', type: 'date', sortable: true },
  ];
}
