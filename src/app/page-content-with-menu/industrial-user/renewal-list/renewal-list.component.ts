import { Component, OnInit } from '@angular/core';
import { GenericService } from '../../../_service/generic/generic.service';
import { ActivatedRoute, Router } from '@angular/router';
import { DynamicTableComponent, TableColumn } from '../../../shared/component/table/table.component';

@Component({
  selector: 'app-renewal-list',
  imports: [DynamicTableComponent],
  templateUrl: './renewal-list.component.html',
  styleUrl: './renewal-list.component.scss',
})
export class RenewalListComponent implements OnInit {
  renewalData: any[] = [];
  serviceId: number | null = null;
  applicationId: number | null = null; 

  constructor(
    private apiService: GenericService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const sId = this.route.snapshot.paramMap.get('serviceId');
    const aId = this.route.snapshot.paramMap.get('appId');

    if (sId) this.serviceId = +sId;
    if (aId) this.applicationId = +aId;

    if (this.serviceId) {
      this.fetchRenewalList();
    }
  }

  columns: TableColumn[] = [
    {
      key: 'id',
      label: 'Cycle ID',
      type: 'number',
      sortable: true,
      width: '100px',
    },
    {
      key: 'renewal_title',
      label: 'Renewal Type',
      type: 'text',
      sortable: true,
      width: '180px',
    },
    {
      key: 'renewal_start_date',
      label: 'Renewal Start Date',
      type: 'date',
      sortable: true,
      width: '140px',
    },
    {
      key: 'renewal_end_date',
      label: 'Renewal End Date',
      type: 'date',
      sortable: true,
      width: '140px',
    },
    // {
    //   key: 'late_fee_applicable',
    //   label: 'Late Fee',
    //   type: 'text',
    //   sortable: true,
    //   width: '120px',
    //   format: (value) => (value === 'yes' ? 'Yes' : 'No'),
    // },
    {
      key: 'late_fee_amount',
      label: 'Late Fee',
      type: 'currency',
      sortable: true,
      width: '120px',
    },
    {
      key: 'renew',
      label: 'Action',
      type: 'button',
      width: '120px',
      buttonText: 'Renew',
      buttonColor: 'success',
    
      onClick: (row) => {
        this.router.navigate(['/dashboard/renewal-application-submission', this.serviceId, this.applicationId, row.id ], {
        
        });
      },
    },
  ];

  fetchRenewalList(): void {
    this.apiService
      .getByConditions({ service_id: this.serviceId }, 'api/user/service/renewal-cycles')
      .subscribe({
        next: (response: any) => {
          if (response?.status === 1 && Array.isArray(response.cycles)) {
            this.renewalData = response.cycles;
          } else {
            this.renewalData = [];
          }
        },
        error: () => {
          this.renewalData = [];
        },
      });
  }
}