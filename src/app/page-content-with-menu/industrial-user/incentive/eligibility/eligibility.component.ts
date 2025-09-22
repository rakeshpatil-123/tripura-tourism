// eligibility.component.ts
import { Component, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';
import { DynamicTableComponent, TableColumn } from '../../../../shared/component/table/table.component';

@Component({
  selector: 'app-eligibility',
  templateUrl: './eligibility.component.html',
  styleUrls: ['./eligibility.component.scss'],
  standalone: true,
  imports: [CommonModule, DynamicTableComponent,],
})
export class EligibilityComponent implements OnInit {
  applications: any[] = [];
  columns: TableColumn[] = [];

  ngOnInit(): void {
    this.loadApplications();
    this.defineColumns();
  }

  loadApplications(): void {
    // Mock data — replace with API call later
    this.applications = [
      {
        slNo: 1,
        applicationCode: 'Proforma 1 A 2022',
        applicationType:
          'Application Form for obtaining Eligibility Certificate for availing incentive (except Procurement Preference and Exemption from Earnest Money and Security Deposits)',
        applicationId: 'INE-30-000065',
        appliedOn: '26/06/2024',
        certOrRejectedOn: '09/07/2024',
        status: 'Rejected By DIC GM',
        link: '#/incentive/apply-proforma1A2022/395304/399040',
      },
      {
        slNo: 2,
        applicationCode: 'Proforma 1 E 2022',
        applicationType:
          'Application Form for obtaining Incentives Eligibility Certificate for availing State Transport Subsidy for transportation of Secondary Raw Materials.',
        applicationId: '',
        appliedOn: '',
        certOrRejectedOn: '',
        status: '',
        link: '#/incentive/apply-proforma1E2022/395308/399040',
      },
      {
        slNo: 3,
        applicationCode: 'Proforma 1 D 2022',
        applicationType:
          'Application Form for obtaining Incentive Eligibility Certificate for availing incentive for units undergone substantial expansion (except Procurement Preference and Exemption from Earnest Money and Security Deposits)',
        applicationId: '',
        appliedOn: '',
        certOrRejectedOn: '',
        status: '',
        link: '#/incentive/apply-proforma1D2022/395420/399040',
      },
      {
        slNo: 4,
        applicationCode: 'Proforma 1 B 2022',
        applicationType:
          'Application Form for obtaining Eligibility Certificate for availing Procurement Preference benefit.',
        applicationId: '',
        appliedOn: '',
        certOrRejectedOn: '',
        status: '',
        link: '#/incentive/apply-proforma1B2022/395422/399040',
      },
      {
        slNo: 5,
        applicationCode: 'Proforma 1 C 2022',
        applicationType:
          'Application Form for obtaining Eligibility Certificate in respect of Exemption from Earnest Money and Bid Security Deposits benefit.',
        applicationId: '',
        appliedOn: '',
        certOrRejectedOn: '',
        status: '',
        link: '#/incentive/apply-proforma1C2022/395424/399040',
      },
    ];
  }

  defineColumns(): void {
    this.columns = [
      {
        key: 'slNo',
        label: 'Sl No.',
        type: 'text',
        width: '80px',
        class: 'input-large-custom2',
      },
      {
        key: 'applicationCode',
        label: 'Application Code',
        type: 'text',
        width: '150px',
        class: 'input-large-custom2',
      },
      {
        key: 'applicationType',
        label: 'Application Type',
        type: 'text',
        width: '100px',
        class: 'wrap-text input-large-custom2',
      },
      {
        key: 'applicationId',
        label: 'Application ID',
        type: 'link',
        linkHref: (row: any) => row.link,
        linkText: (row: any) => row.applicationId || '—',
        width: '150px',
      },
      {
        key: 'appliedOn',
        label: 'Applied On',
        type: 'text',
        width: '120px',
      },
      {
        key: 'certOrRejectedOn',
        label: 'Certificate Issued On / Rejected On',
        type: 'text',
        width: '150px',
        class: 'input-large-custom3',
      },
      {
        key: 'status',
        label: 'Status',
        type: 'text',
        width: '180px',
        class: 'input-large-custom2',
        cellClass: (value: string) => {
          if (value.includes('Rejected')) return 'status-rejected';
          if (value.includes('Approved')) return 'status-approved';
          return '';
        },
      },
      {
        key: 'actions',
        label: 'Action',
        type: 'action',
        width: '100px',
        actions: [
          {
            label: 'Apply',
            // icon: 'visibility',
            color: 'primary',
            onClick: (row: any) => {
              window.open(row.link, '_blank');
            },
          },
          {
            label: 'Details',
            // icon: 'edit',
            color: 'accent',
            visible: (row: any) => !!row.applicationId, // Only show if has ID
            onClick: (row: any) => {
              console.log('Edit:', row);
            },
          },
        ],
      },
    ];
  }
}