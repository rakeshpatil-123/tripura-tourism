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
  templateUrl: './claim.component.html',
  styleUrls: ['./claim.component.scss'],
  standalone: true,
  imports: [CommonModule, DynamicTableComponent, FormsModule, CommonModule],
})
export class ClaimComponent implements OnInit {
  schemes: SelectOption[] = [];
  selectedSchemeId: number | null = null;
  applications: any[] = [];
  columns: any[] = [];

  constructor(private appiService: GenericService, private router: Router) {}

  ngOnInit(): void {
    this.defineColumns();
    this.loadEligibilityProforma();
  }

  loadEligibilityProforma(): void {
    this.appiService
      .getByConditions({}, 'api/user/incentive/claim-proforma-list')
      .subscribe({
        next: (res: any) => {
          if (res?.status === 1 && Array.isArray(res.data)) {
            this.applications = res.data.map((item: any, index: number) => ({
              slNo: index + 1,
              applicationCode: item.application_code || '—',
              title: item.application_type || '—',
              applicationNo: item.application_no || '—',
              // claimType: item.claim_type || '_',
              // maxClaimCount: item.max_claim_count || '_',
              description: item.proforma_details || '_',
              status: item.workflow_status || 'Not Applied',
              appliedOn: item.applied_on || '_',
              approvedOn: item.approved_on || '_',
              ProformaId: item.proforma_id || '_',
              approvedAmount: item.approved_amount || '_',
              claimedAmount: item.claimed_amount || '_',
              schemeId: item.scheme_id || '_',
              applicationId: item.application_id || '_',
              isEdit: item.is_editable || false,
              isReapply: item.can_reapply || false,
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
        key: 'title',
        label: 'Proforma Title',
        type: 'text',
        width: '200px',
        class: 'wrap-text',
      },
      // {
      //   key: 'proformaType',
      //   label: 'Proforma Type',
      //   type: 'text',
      //   width: '150px',
      // },
      // {
      //   key: 'claimType',
      //   label: 'Claim Type',
      //   type: 'text',
      //   width: '120px',
      // },
      // {
      //   key: 'maxClaimCount',
      //   label: 'Max Claim Count',
      //   type: 'text',
      //   width: '150px',
      // },
      {
        key: 'description',
        label: 'Description',
        type: 'text',
        width: '150px',
      },
      {
        key: 'appliedOn',
        label: 'Applied On',
        type: 'text',
        width: '150px',
      },
      {
        key: 'claimedAmount',
        label: 'Caimed Amount',
        type: 'text',
        width: '150px',
      },
      {
        key: 'approvedAmount',
        label: 'Approved Amount',
        type: 'text',
        width: '150px',
      },
      {
        key: 'approvedOn',
        label: 'Approved On',
        type: 'text',
        width: '150px',
      },
      {
        key: 'status',
        label: 'Status',
        type: 'text',
        width: '180px',
     
      },
      {
        key: 'applicationNo',
        label: 'Application No',
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
        key: 'actions',
        label: 'Action',
        type: 'action',
        width: '120px',
        actions: [
          {
            label: 'Re Apply',
            color: 'primary',
            visible: (row: any) => row.isReapply === true ,
            onClick: (row: any) => {

              const navigationCommands = [
                '/dashboard/proforma-questionnaire-view',
                row.ProformaId,
                row.schemeId,
              ];

              const queryParams: any = {
                proforma_type: "claim",
              };

              // if (
              //   row.applicationId &&
              //   row.applicationId !== '_' &&
              //   row.applicationId !== null
              // ) {
              //   queryParams.applicationId = row.applicationId;
              // }

              this.router.navigate(navigationCommands, { queryParams });
            },
          },
          {
            label: 'Apply',
            color: 'primary',
            visible: (row: any) => row.isEdit === true ,
            onClick: (row: any) => {
              console.log(row.proformaType);

              const navigationCommands = [
                '/dashboard/proforma-questionnaire-view',
                row.ProformaId,
                row.schemeId,
              ];

              const queryParams: any = {
                proforma_type: "claim",
              };

              if (
                row.applicationId &&
                row.applicationId !== '_' &&
                row.applicationId !== null
              ) {
                queryParams.applicationId = row.applicationId;
              }

              this.router.navigate(navigationCommands, { queryParams });
            },
          },
          {
            label: 'View',
            visible: (row: any) => row.isEdit === false ,

            color: 'primary',
            onClick: (row: any) => {
              console.log(row.proformaType);

              const navigationCommands = [
                '/dashboard/proforma-questionnaire-view',
                row.ProformaId,
                row.schemeId,
              ];

              const queryParams: any = {
                proforma_type: row.proformaType,
              };

              if (
                row.applicationId &&
                row.applicationId !== '_' &&
                row.applicationId !== null
              ) {
                queryParams.applicationId = row.applicationId;
              }

              this.router.navigate(navigationCommands, { queryParams });
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
