import { Component } from '@angular/core';
import { DynamicTableComponent } from '../../../shared/component/table/table.component';
import { GenericService } from '../../../_service/generic/generic.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-services',
  imports: [DynamicTableComponent],
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.scss'],
  standalone: true,
})
export class ServicesComponent {
  ApplicationData: any[] = [];
  ApplicationColumns: any[] = [];

  filterLabel = 'Filter by NOC Type';
  filterPlaceholder = 'Select NOC Type';
  filterOptions: Array<{ id: any; name: string }> = [];
  selectedNocType: any = null;

  constructor(private apiService: GenericService, private router: Router) {}

  ngOnInit(): void {
    this.allServices();
  }

  
  allServices(): void {
  this.apiService.getByConditions({}, 'api/fetch-all-services').subscribe({
    next: (response: any) => {
      if (response?.status === 1 && Array.isArray(response.data)) {
        this.ApplicationData = response.data.map((item: any) => ({
          ...item,
          allow_repeat_application_display:
            item.allow_repeat_application === 'yes' ? 'Yes' : 'No',
        }));

        const nocTypes = [...new Set(response.data.map((item: any) => item.noc_type))] as string[];
        this.filterOptions = nocTypes.map((type) => ({ id: type, name: type }));
        this.filterOptions.unshift({ id: null, name: 'All NOC Types' });

        this.createColumns(this.ApplicationData);
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
    if (
      key === 'actions' ||
      key === 'department_id' ||
      key === 'verification_token' ||
      key === 'allow_repeat_application' 
    )
      return;


    const label = this.formatLabel(key);

    let type: any;
    if (key === 'created_by' || key === 'updated_by') {
      type = 'text';
    } else if (key.includes('date')) {
      type = 'date';
    } else if (key.includes('email') || key.includes('href')) {
      type = 'link';
    } else if (['id', 'target_days'].includes(key)) {
      type = 'number';
    } else if (key === 'allow_repeat_application_display') { 
      type = 'text';
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

    columns.push({
      key: 'actions',
      label: 'Actions',
      type: 'action',
      actions: [
        {
          label: 'View Applications',
          color: 'primary',
          visible: (row: any) =>
            row.allow_repeat_application === 'yes' &&
            row.application_id !== null,
          onClick: (row: any) => {
            this.router.navigate(['/dashboard/repeat-application', row.id]);
          },
        },
        {
          label: (row: any) => {
            if (
              row.application_status === 'send_back' &&
              row.allow_repeat_application !== 'yes'
            ) {
              return 'Re-apply';
            }
            return 'Apply';
          },
          color: 'primary',
          visible: (row: any) => {
            return (
              row.application_id === null ||
              row.application_status === 'send_back' ||
              row.allow_repeat_application === 'yes'
            );
          },
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
        this.router.navigate([
          '/dashboard/user-app-view',
          row.id,
          row.application_id,
        ]);
      },
      cellClass: (value: any, row: any) => {
        const shouldShow =
          row.application_status !== null &&
          row.application_status !== 'send_back' &&
          row.allow_repeat_application !== 'yes';
        return shouldShow ? '' : 'd-none';
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
    if (row.service_mode === 'third_party') {
      this.apiService
        .getThirdPartyRedirect(`api/user/third-party-apply/${row.id}`)
        .subscribe({
          next: (html) => {
            const temp = document.createElement('div');
            temp.innerHTML = html;
            document.body.appendChild(temp);
            const form = temp.querySelector('form');
            if (form) form.submit();
          },
          error: (err) => {
            this.apiService.openSnackBar('Redirect failed.', 'error');
          },
        });
      return;
    }

    const queryParams: any = {
      application_status: row.application_status,
    };

    if (row.application_id != null) {
      queryParams.appid2 = row.application_id;
    }

    this.router.navigate(['dashboard/service-application', row.id], {
      queryParams: queryParams,
    });
  }

  handleRowAction(event: any): void {
    console.log('Row action emitted:', event);
  }
}
