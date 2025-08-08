import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';

import {
  TableColumn,
  DynamicTableComponent,
} from '../../../shared/component/table/table.component';

import { Department, Inspection, InspectionRequest } from './inspection.model';
import { IlogiInputDateComponent } from '../../../customInputComponents/ilogi-input-date/ilogi-input-date.component';
import { IlogiSelectComponent } from '../../../customInputComponents/ilogi-select/ilogi-select.component';
import { ButtonComponent } from '../../../shared/component/button-component/button.component';
import { IlogiInputComponent } from '../../../customInputComponents/ilogi-input/ilogi-input.component';

@Component({
  selector: 'app-inspection',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTabsModule,
    MatIconModule,
    MatMenuModule,
    MatButtonModule,

    IlogiInputDateComponent,
    IlogiSelectComponent,
    ButtonComponent,

    DynamicTableComponent,
  ],
  templateUrl: './inspection.component.html',
  styleUrls: ['./inspection.component.scss'],
})
export class InspectionComponent implements OnInit {
  filterForm: FormGroup;

  departments: Department[] = [];
  inspectionListData: Inspection[] = [];
  inspectionRequestListData: InspectionRequest[] = [];

  inspectionColumns: TableColumn[] = [
    {
      key: 'inspection_id',
      label: 'Inspection ID',
      type: 'text',
      sortable: true,
    },
    {
      key: 'inspection_date',
      label: 'Inspection Date',
      type: 'date',
      sortable: true,
    },
    {
      key: 'inspection_type',
      label: 'Inspection Type',
      type: 'text',
      sortable: true,
    },
    {
      key: 'inspection_for',
      label: 'Inspection For',
      type: 'text',
      sortable: true,
    },
    { key: 'department', label: 'Department', type: 'text', sortable: true },
    { key: 'status', label: 'Status', type: 'status', sortable: true },
    { key: 'inspector', label: 'Inspector', type: 'text', sortable: true },
    {
      key: 'actions',
      label: 'Action',
      type: 'action',
      sortable: false,
      actions: [
        {
          label: 'View Details',
          icon: 'visibility',
          color: 'primary',
          action: 'view_details',
          handler: (row: Inspection) => this.viewInspectionDetails(row),
        },
        {
          label: 'Download Report',
          icon: 'download',
          color: 'accent',
          action: 'download_report',
          handler: (row: Inspection) => this.downloadInspectionReport(row),
        },
      ],
    },
  ];

  requestColumns: TableColumn[] = [
    { key: 'RequestId', label: 'Request ID', type: 'text', sortable: true },
    {
      key: 'ProposedDate',
      label: 'Proposed Inspection Date',
      type: 'date',
      sortable: true,
    },
    {
      key: 'InspectionType',
      label: 'Inspection Type',
      type: 'text',
      sortable: true,
    },
    {
      key: 'IndustryName',
      label: 'Industry Name',
      type: 'link',
      linkText: (row: InspectionRequest) => row.IndustryName,

      linkHref: (row: InspectionRequest) =>
        `#/dashboard/organization/add-organization/${row.IndustryId}/${row.unique_no}`,
      sortable: true,
    },
    { key: 'inspector', label: 'Inspector', type: 'text', sortable: true },
    { key: 'status', label: 'Status', type: 'status', sortable: true },
    {
      key: 'actions',
      label: 'Action',
      type: 'action',
      sortable: false,
      actions: [
        {
          label: 'View Details',
          color: 'primary',
          action: 'view_details',
          handler: (row: InspectionRequest) => this.viewRequestDetails(row),
        },
        {
          label: 'Edit',
          color: 'primary',
          action: 'edit',
          handler: (row: InspectionRequest) => this.editRequest(row),
        },
        {
          label: 'Cancel',
          color: 'warn',
          action: 'cancel',
          handler: (row: InspectionRequest) => this.cancelRequest(row),
        },
      ],
    },
  ];

  mockDepartments: Department[] = [
    { id: '96', name: 'Factories & Boilers Organisation' },
    { id: '98', name: 'Directorate of Labour' },
    { id: '108', name: 'Legal Metrology' },
    { id: '97', name: 'Tripura State Pollution Control Board' },
  ];

  mockInspectionList: Inspection[] = [
    {
      id: '420942',
      inspection_id: 'INS-03-000383',
      inspection_date: '2024-09-30',
      department_type: 'Dept',
      inspection_type: 'On Request',
      inspection_for: 'The Equal Remuneration Act, 1976',
      departmentId: '98',
      department: 'Directorate of Labour',
      status: 'Date Confirmed',
      inspector: 'Gomati_Labsct@5',
      download_report: '',
      targetComplianceDate: '',
      targetShowCauseDate: '',
      download_compliance_report: '',
      download_show_cause_notice: '',
      download_show_cause_reply: '',
      download_legal_notice: '',
    },
  ];

  mockInspectionRequestList: InspectionRequest[] = [
    {
      id: '421888',
      RequestId: 'REQ-01-000082',
      ProposedDate: '2024-09-26',
      InspectionType: 'On Request',
      InspectionFor: 'test',
      IndustryName: 'Dabu antar praice',
      IndustryId: '19344',
      unique_no: '2024M19344',
      RequestedBy: 'Debu entar praice',
      deptId: '96',
      deptName: 'Factories & Boilers Organisation',
      status: 'Pending',
      remarks: 'test',
      inspector: '',
    },
    {
      id: '421885',
      RequestId: 'REQ-01-000081',
      ProposedDate: '2024-09-30',
      InspectionType: 'On Request',
      InspectionFor: 'Inspection\n',
      IndustryName: 'Dabu antar praice',
      IndustryId: '19344',
      unique_no: '2024M19344',
      RequestedBy: 'Debu entar praice',
      deptId: '96',
      deptName: 'Factories & Boilers Organisation',
      status: 'Pending',
      remarks: null,
      inspector: '',
    },
    {
      id: '420939',
      RequestId: 'REQ-01-000080',
      ProposedDate: '2024-09-30',
      InspectionType: 'On Request',
      InspectionFor: 'For testing purpose',
      IndustryName: 'Dabu antar praice',
      IndustryId: '19344',
      unique_no: '2024M19344',
      RequestedBy: 'Debu entar praice',
      deptId: '98',
      deptName: 'Directorate of Labour',
      status: 'Approved',
      remarks: 'For testing purpose ...',
      inspector: ' D N',
    },
    {
      id: '420935',
      RequestId: 'REQ-01-000079',
      ProposedDate: '2024-09-21',
      InspectionType: 'On Request',
      InspectionFor: 'abcd',
      IndustryName: 'Dabu antar praice',
      IndustryId: '19344',
      unique_no: '2024M19344',
      RequestedBy: 'Debu entar praice',
      deptId: '96',
      deptName: 'Factories & Boilers Organisation',
      status: 'Pending',
      remarks: null,
      inspector: '',
    },
  ];

  constructor(private fb: FormBuilder) {
    this.filterForm = this.fb.group({
      from_dt: [''],
      to_dt: [''],
      deptId: [''],
    });
  }

  ngOnInit(): void {
    this.loadDepartments();
    this.loadInspectionList();
    this.loadInspectionRequestList();
  }

  loadDepartments() {
    this.departments = this.mockDepartments;
    console.log('Departments loaded:', this.departments);
  }

  handleRowAction(event: any) {
    console.log('Row action triggered:', event);
  }

  loadInspectionList() {
    this.inspectionListData = this.mockInspectionList;
    console.log('Inspection List loaded:', this.inspectionListData);
  }

  loadInspectionRequestList() {
    this.inspectionRequestListData = this.mockInspectionRequestList;
    console.log(
      'Inspection Request List loaded:',
      this.inspectionRequestListData
    );
  }

  onSearch() {
    console.log('Search triggered with filters:', this.filterForm.value);

    this.loadInspectionList();
  }

  onReset() {
    this.filterForm.reset();
    console.log('Filters reset');
    this.loadInspectionList();
    this.loadInspectionRequestList();
  }

  requestInspection() {
    console.log('Request for Inspection button clicked');

    alert('Navigate to Request Inspection Form');
  }

  viewInspectionDetails(row: Inspection) {
    console.log('View Inspection Details:', row);
    alert(`View details for Inspection ID: ${row.inspection_id}`);
  }

  downloadInspectionReport(row: Inspection) {
    console.log('Download Inspection Report:', row);
    alert(`Download report for Inspection ID: ${row.inspection_id}`);
  }

  viewRequestDetails(row: InspectionRequest) {
    console.log('View Request Details:', row);
    alert(`View details for Request ID: ${row.RequestId}`);
  }

  editRequest(row: InspectionRequest) {
    console.log('Edit Request:', row);
    alert(`Edit Request ID: ${row.RequestId}`);
  }

  cancelRequest(row: InspectionRequest) {
    console.log('Cancel Request:', row);
    alert(`Cancel Request ID: ${row.RequestId}`);
  }
}
