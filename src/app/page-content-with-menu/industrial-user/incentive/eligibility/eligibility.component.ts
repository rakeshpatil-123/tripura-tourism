// eligibility.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DynamicTableComponent } from '../../../../shared/component/table/table.component';
import { GenericService } from '../../../../_service/generic/generic.service';
import {
  IlogiSelectComponent,
  SelectOption,
} from '../../../../customInputComponents/ilogi-select/ilogi-select.component';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-eligibility',
  templateUrl: './eligibility.component.html',
  styleUrls: ['./eligibility.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    DynamicTableComponent,
    IlogiSelectComponent,
    FormsModule,
    CommonModule,
  ],
})
export class EligibilityComponent implements OnInit {
  schemes: SelectOption[] = [];
  selectedSchemeId: number | null = null;
  applications: any[] = [];
  columns: any[] = []; 

  constructor(private appiService: GenericService, private router: Router) {}

  ngOnInit(): void {
    this.defineColumns();
    this.loadSchemes();
  }

  loadSchemes(): void {
    this.appiService
      .getByConditions({}, 'api/user/incentive/scheme-list')
      .subscribe({
        next: (res: any) => {
          if (res?.status === 1 && Array.isArray(res.data)) {
            this.schemes = res.data.map((item: any) => ({
              id: item.id,
              name: item.title,
            }));
            
            if (this.schemes.length > 0) {
              this.selectedSchemeId = this.schemes[0].id;
              if (this.selectedSchemeId !== null) {
                this.loadEligibilityProforma(this.selectedSchemeId);
              }
            }
          } else {
            this.schemes = [];
            this.applications = [];
          }
        },
        error: (err: any) => {
          this.appiService.openSnackBar('Failed to load schemes', 'Close');
          this.schemes = [];
          this.applications = [];
        },
      });
  }
  onSchemeChange(schemeId: number | null): void {
    // console.log(schemeId, "scheme id");
    
    if (schemeId !== null) {
      this.selectedSchemeId = schemeId;
      this.loadEligibilityProforma(schemeId);
    }
  }

  loadEligibilityProforma(schemeId: number): void {
    const payload = { scheme_id: schemeId };

    this.appiService
      .getByConditions(payload, 'api/user/incentive/eligibility-proforma-list')
      .subscribe({
        next: (res: any) => {
          if (res?.status === 1 && Array.isArray(res.data)) {
            this.applications = res.data.map((item: any, index: number) => ({
              slNo: index + 1,
              applicationNumber: item.application_no || '—',
              applicationType: item.application_type || '—',
              applicationId: item.application_id || '_',
              appliedOn: item.applied_on || '_',
              certOrRejectedOn: item.certificate_issued_or_rejected_on || '_',
              status: item.workflow_status || 'Not Applied',
              applicationCode: item.application_code || '_',
              isEdit: item.is_editable || false,
              proforma_id: item.proforma_id,
              link: '',
            }));
          } else {
            this.applications = [];
            this.appiService.openSnackBar(
              res?.message || 'No eligibility data found',
              'Close'
            );
          }
        },
        error: (err: any) => {
          this.applications = [];
          this.appiService.openSnackBar(
            'Failed to load eligibility proforma',
            'Close'
          );
        },
      });
  }

  defineColumns(): void {
    this.columns = [
      {
        key: 'slNo',
        label: 'Sl No.',
        type: 'text',
        width: '80px',
      },
      {
        key: 'applicationType',
        label: 'Proforma Name',
        type: 'text',
        width: '200px',
        class: 'wrap-text',
      },
      {
        key: 'appliedOn',
        label: 'Applied On',
        type: 'text',
        width: '120px',
      },
      {
        key: 'status',
        label: 'Status',
        type: 'text',
        width: '180px',
        cellClass: (value: string) => {
          if (value?.includes('Rejected')) return 'status-rejected';
          if (value?.includes('Approved')) return 'status-approved';
          return '';
        },
      },
      {
        key: 'certOrRejectedOn',
        label: 'Certificate Issued / Rejected On',
        type: 'text',
        width: '150px',
      },
      {
        key: 'applicationNumber',
        label: 'Application Number',
        type: 'text',
        width: '150px',
      },
      {
        key: 'applicationCode',
        label: 'Application Code',
        type: 'text',
        width: '150px',
      },
      {
        key: 'applicationId',
        label: 'Application ID',
        type: 'text',
        width: '150px',
      },
      {
        key: 'actions',
        label: 'Action',
        type: 'action',
        width: '120px',
        actions: [
          {
            label: 'Apply',
            visible: (row: any) => row.isEdit === true,
            color: 'primary',
            onClick: (row: any) => {
              const navigationCommands = [
                '/dashboard/proforma-questionnaire-view',
                row.proforma_id,
                this.selectedSchemeId,
              ];

              const navigationExtras: any = {};

              if (
                row.applicationId &&
                row.applicationId !== '_' &&
                row.applicationId !== null
              ) {
                navigationExtras.queryParams = {
                  applicationId: row.applicationId,
                };
              }

              this.router.navigate(navigationCommands, navigationExtras);
            },
          },
          {
            label: 'View',
            visible: (row: any) => row.isEdit === false,
            color: 'primary',
            onClick: (row: any) => {
              const navigationCommands = [
                '/dashboard/proforma-questionnaire-view',
                row.proforma_id,
                this.selectedSchemeId,
              ];

              const navigationExtras: any = {};

              if (
                row.applicationId &&
                row.applicationId !== '_' &&
                row.applicationId !== null
              ) {
                navigationExtras.queryParams = {
                  applicationId: row.applicationId,
                };
              }

              this.router.navigate(navigationCommands, navigationExtras);
            },
          },
          {
            label: 'History',
            visible: (row: any) => row.applicationId && row.applicationId !== '_' && row.applicationId !== null,
            color: 'accent',
             onClick: (row: any) => {this.router.navigate(['/dashboard/workflow-history', row.applicationId]);}
          }
        ],
      },
    ];
  }

  getSelectedSchemeName(): string {
    if (this.selectedSchemeId === null) return '—';
    const scheme = this.schemes.find((s) => s.id === this.selectedSchemeId);
    return scheme ? scheme.name : '—';
  }
}
