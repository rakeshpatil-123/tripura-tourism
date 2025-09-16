import { Component } from '@angular/core';
import { DynamicTableComponent } from '../../../shared/component/table/table.component';
import { GenericService } from '../../../_service/generic/generic.service';
import { Router } from '@angular/router';
import { IlogiSelectComponent } from '../../../customInputComponents/ilogi-select/ilogi-select.component';

@Component({
  selector: 'app-services',
  imports: [DynamicTableComponent, IlogiSelectComponent],
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.scss'],
  standalone: true,
})
export class ServicesComponent {
  ApplicationData: any[] = [];
  ApplicationColumns: any[] = [];

  // Filter properties
  filterLabel = 'Filter by NOC Type';
  filterPlaceholder = 'Select NOC Type';
  filterOptions: Array<{ id: any; name: string }> = [];
  selectedNocType: any = null; // Holds selected NOC type

  constructor(private apiService: GenericService, private router: Router) {}

  ngOnInit(): void {
    this.allServices();
  }

  allServices(): void {
    this.apiService.getByConditions({}, 'api/fetch-all-services').subscribe({
      next: (response: any) => {
        if (response?.status === 1 && Array.isArray(response.data)) {
          this.ApplicationData = [...response.data];

          // Extract unique noc_type values for filter dropdown
          const nocTypes = [
            ...new Set(response.data.map((item: any) => item.noc_type)),
          ] as string[];
          this.filterOptions = nocTypes.map((type) => ({
            id: type,
            name: type,
          }));

          // Add "All" option at the top
          this.filterOptions.unshift({ id: null, name: 'All NOC Types' });

          this.createColumns(response.data);
        } else {
          console.warn('Invalid data format or empty response');
        }
      },
      error: (error) => {
        console.error('Error fetching services:', error);
      },
    });
  }

  createColumns(data: any[]): void {
    if (data.length === 0) return;

    const sample = data[0];
    const columns: any[] = [];

    Object.keys(sample).forEach((key) => {
      // Skip internal or redundant fields
      if (key === 'actions' || key === 'department_id') return;

      const label = this.formatLabel(key);

      let type: any;
      if (key.includes('date')) {
        type = 'date';
      } else if (key.includes('email') || key.includes('href')) {
        type = 'link';
      } else if (['id', 'target_days'].includes(key)) {
        type = 'number';
      } else if (key === 'allow_repeat_application') {
        type = 'boolean';
      } else {
        type = 'text';
      }

      columns.push({
        key,
        label,
        type,
        sortable: true,
        width: this.getColumnWidth(key),
      });
    });

    // Add Actions column
    columns.push({
      key: 'actions',
      label: 'Actions',
      type: 'action',
      actions: [
        {
          label: 'Apply',
          color: 'primary',
          visible: (row: any) => row.application_status === null || row.application_status === 'send_back',
          onClick: (row: any) => {
            this.onApply(row);
          },
        },
      ],
    });

  columns.push({
  key: 'view',
  label: 'View',
  type: 'icon',
  icon: 'visibility',
  width: '60px',
  onClick: (row: any) => {
    this.router.navigate(['/dashboard/user-app-view', row.id, row.application_id]);
  },
  cellClass: (value: any, row: any) => {
    // 👇 Show ONLY if status is NOT null AND NOT 'send_back'
   const shouldShow = row.application_status !== null && row.application_status !== 'send_back';
    return shouldShow ? '' : 'd-none'; // Hide if condition not met
  },
});

    this.ApplicationColumns = columns;
  }

  formatLabel(key: string): string {
    return key
      .replace(/_([a-z])/g, (match, letter) => ` ${letter.toUpperCase()}`)
      .replace(/^./, (str) => str.toUpperCase());
  }

  getColumnWidth(key: string): string {
    switch (key) {
      case 'service_title_or_description':
        return '200px';
      case 'actions':
        return '120px';
      default:
        return '140px';
    }
  }

  onApply(row: any): void {
    console.log('Applying for service:', row.application_status);
    this.router.navigate(['dashboard/service-application', row.id],{
    queryParams: {
      application_status: row.application_status, 
    },
    
  });
  }

  handleRowAction(event: any): void {
    console.log('Row action emitted:', event);
  }
}
