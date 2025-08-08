import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatPaginatorModule } from '@angular/material/paginator';

import {
  TableColumn,
  DynamicTableComponent,
} from '../../../shared/component/table/table.component';
import { IlogiSelectComponent } from '../../../customInputComponents/ilogi-select/ilogi-select.component';
import { ButtonComponent } from '../../../shared/component/button-component/button.component';
import { MatTabGroup, MatTab } from '@angular/material/tabs';

interface ApplicationOption {
  id: string;
  name: string;
}

interface Appeal {
  id: number;
  appealId: string;
  appealDate: string;
  applicationId: string;
  applicationName: string;
  applicationDate: string;
  rejectedOn: string;
  status: string;
}

@Component({
  selector: 'app-appeal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatPaginatorModule,
    IlogiSelectComponent,
    ButtonComponent,
    DynamicTableComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './appeal.component.html',
  styleUrls: ['./appeal.component.scss'],
})
export class AppealComponent implements OnInit {
  filterForm: FormGroup;

  applicationOptions: ApplicationOption[] = [
    { id: '1', name: 'Application Type A' },
    { id: '2', name: 'Application Type B' },
    { id: '3', name: 'Application Type C' },
  ];
  statusOptions = [
    { id: 'Submitted', name: 'Submitted' },
    { id: 'ReSubmitted', name: 'ReSubmitted' },
  ];

  appealListData: Appeal[] = [];

  appealColumns: TableColumn[] = [
    { key: 'id', label: 'Sl No.', type: 'number', sortable: true },
    { key: 'appealId', label: 'Appeal ID', type: 'text', sortable: true },
    { key: 'appealDate', label: 'Appeal date', type: 'date', sortable: true },
    {
      key: 'applicationId',
      label: 'Application ID',
      type: 'text',
      sortable: true,
    },
    {
      key: 'applicationName',
      label: 'Application Name',
      type: 'text',
      sortable: true,
    },
    {
      key: 'applicationDate',
      label: 'Applied on \n(Application Date)',
      type: 'date',
      sortable: true,
    },
    {
      key: 'rejectedOn',
      label: 'Application \n Rejected on',
      type: 'date',
      sortable: true,
    },
    { key: 'status', label: 'Status', type: 'status', sortable: true },
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
          handler: (row: Appeal) => this.viewAppealDetails(row),
        },
        {
          label: 'Edit',
          icon: 'edit',
          color: 'primary',
          action: 'edit',
          handler: (row: Appeal) => this.editAppeal(row),
        },
      ],
    },
  ];

  mockAppealListData: Appeal[] = [];

  constructor(private fb: FormBuilder) {
    this.filterForm = this.fb.group({
      applicationId: [''],
      status: [''],
    });
  }

  ngOnInit(): void {}

  loadAppealList() {
    this.appealListData = this.mockAppealListData;
    console.log('Appeal List loaded:', this.appealListData);
  }

  onSearch() {
    console.log('Search triggered with filters:', this.filterForm.value);

    this.loadAppealList();
  }

  onReset() {
    this.filterForm.reset();
    console.log('Filters reset');

    this.appealListData = [];
  }

  createNewAppeal() {
    console.log('Create New Appeal button clicked');

    alert('Navigate to Create New Appeal Form');
  }

  viewAppealDetails(row: Appeal) {
    console.log('View Appeal Details:', row);
    alert(`View details for Appeal ID: ${row.appealId}`);
  }

  editAppeal(row: Appeal) {
    console.log('Edit Appeal:', row);
    alert(`Edit Appeal ID: ${row.appealId}`);
  }
}
