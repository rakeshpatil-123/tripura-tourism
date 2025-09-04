import { Component } from '@angular/core';
import { DynamicTableComponent } from '../../../shared/component/table/table.component';
import { GenericService } from '../../../_service/generic/generic.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-services',
  imports: [DynamicTableComponent],
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.scss'],
  standalone: true
})
export class ServicesComponent {
  ApplicationData: any[] = [];
  ApplicationColumns: any[] = [];

  constructor(private apiService: GenericService, private router: Router) {}

  ngOnInit(): void {
    this.allServices();
  }

  allServices(): void {
    this.apiService.getByConditions({}, 'api/fetch-all-services').subscribe({
      next: (response) => {
        if (response?.status === 1 && Array.isArray(response.data)) {
          this.ApplicationData = [...response.data];
          this.createColumns(response.data);
        } else {
          console.warn('Invalid data format or empty response');
        }
      },
      error: (error) => {
        console.error('Error fetching services:', error);
      }
    });
  }

  createColumns(data: any[]): void {
    if (data.length === 0) return;

    const sample = data[0];
    const columns: any[] = [];

    Object.keys(sample).forEach(key => {
      if (key === 'actions') return;

      const label = this.formatLabel(key);

      let type: any;
      if (key.includes('date')) type = 'date';
      else if (key.includes('email') || key.includes('href')) type = 'link';
      else if (['id', 'department_id', 'target_days'].includes(key)) type = 'number';
      else if (key === 'allow_repeat_application') type = 'boolean';
      else type = 'text';

      columns.push({
        key,
        label,
        type,
        sortable: true,
        width: this.getColumnWidth(key)
      });
    });

    columns.push({
      key: 'actions',
      label: 'Actions',
      type: 'action',
      actions: [
        {
          label: 'Apply',
          icon: 'add',
          color: 'primary',
          onClick: (row: any) => {
            this.onApply(row);
          }
        }
      ]
    });

    this.ApplicationColumns = columns;
  }

  formatLabel(key: string): string {
    return key
      .replace(/_([a-z])/g, (match, letter) => ` ${letter.toUpperCase()}`)
      .replace(/^./, str => str.toUpperCase());
  }

  getColumnWidth(key: string): string {
    switch (key) {
      case 'service_title_or_description': return '200px';
      case 'actions': return '100px';
      default: return '120px';
    }
  }

  onApply(row: any): void {

    console.log(row, "details");
    
     this.router.navigate(['dashboard/service-application', row.id]);
 
  }

  handleRowAction(event: any) {
  console.log('Row action emitted:', event);
}
}