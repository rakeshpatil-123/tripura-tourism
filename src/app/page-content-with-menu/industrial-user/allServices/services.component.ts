import { Component } from '@angular/core';
import { DynamicTableComponent } from '../../../shared/component/table/table.component';
import { GenericService } from '../../../_service/generic/generic.service';
import { Router } from '@angular/router';
import { LoaderComponent } from '../../../page-template/loader/loader.component';
import { IlogiSelectComponent } from '../../../customInputComponents/ilogi-select/ilogi-select.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-services',
  imports: [
    DynamicTableComponent,
    LoaderComponent,
    IlogiSelectComponent,
    FormsModule,
  ],
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.scss'],
  standalone: true,
})
export class ServicesComponent {
  ApplicationData: any[] = [];
  ApplicationColumns: any[] = [];
  allServicesData: any[] = [];
  filterLabel = 'Filter by NOC Type';
  filterPlaceholder = 'Select NOC Type';
  departmentOptions: Array<{ id: any; name: string }> = [];
  nocTypeOptions: Array<{ id: any; name: string }> = [];

  selectedNocType: string | null = null;
  selectedDepartment: string | null = null;
  isLoading: boolean = false;
  constructor(private apiService: GenericService, private router: Router) {}

  ngOnInit(): void {
    this.allServices();
  }

  

  allServices(): void {
    this.isLoading = true;
    this.apiService.getByConditions({}, 'api/fetch-all-services').subscribe({
      next: (response: any) => {
        if (response?.status === 1 && Array.isArray(response.data)) {
          this.allServicesData = response.data.map(
            (item: any, index: number) => ({
              ...item,
              sl_no: index + 1,
              allow_repeat_application_display:
                item.allow_repeat_application === 'yes' ? 'Yes' : 'No',
              service_mode: (item.service_mode || '')
                .replace(/\//g, '')
                .replace(/_/g, ' ')
                .split(' ')
                .map(
                  (word: any) =>
                    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                )
                .join(' ')
                .trim(),
            })
          );

          const departments = [
            ...new Set(response.data.map((item: any) => item.department_name)),
          ] as string[];
          this.departmentOptions = departments.map((name) => ({
            id: name,
            name: name,
          }));
          this.departmentOptions.unshift({ id: null, name: 'All Departments' });

          const uniqueNocTypes = [
            ...new Set(response.data.map((item: any) => item.noc_type)),
          ] as string[];

          const NOC_TYPE_ORDER = ['CFE', 'CFO', 'Special', 'Renewal', 'Others'];

          uniqueNocTypes.sort((a, b) => {
            const idxA = NOC_TYPE_ORDER.indexOf(a);
            const idxB = NOC_TYPE_ORDER.indexOf(b);
            const prioA = idxA === -1 ? 9999 : idxA;
            const prioB = idxB === -1 ? 9999 : idxB;
            return prioA - prioB;
          });

          this.nocTypeOptions = uniqueNocTypes.map((type) => ({
            id: type,
            name: type,
          }));
          this.nocTypeOptions.unshift({ id: null, name: 'All NOC Types' });

          this.applyFilters();
          this.createColumns(this.allServicesData);
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching services:', error);
        this.isLoading = false;
      },
    });
  }

  applyFilters(): void {
    let filtered = this.allServicesData;

    if (this.selectedDepartment) {
      filtered = filtered.filter(
        (item) => item.department_name === this.selectedDepartment
      );
    }

    if (this.selectedNocType) {
      filtered = filtered.filter(
        (item) => item.noc_type === this.selectedNocType
      );
    }

    this.ApplicationData = filtered.map((item, index) => ({
      ...item,
      sl_no: index + 1,
    }));
  }
  onDepartmentChange(value: string | null): void {
    this.selectedDepartment = value;
    this.applyFilters();
  }
  onNocTypeChange(value: string | null): void {
    this.selectedNocType = value;
    this.applyFilters();
  }

  createColumns(data: any[]): void {
    if (data.length === 0) return;

    const sample = data[0];
    const columns: any[] = [];

    const excludeKeys = new Set([
      'actions',
      'department_id',
      'verification_token',
      'allow_repeat_application',
      'application_id',
      'application_status',
      'created_by',
      'updated_by',
      'status',
      'is_special',
      'allow_repeat_application_display',
      'noc_payment_type',
      'id',
      'sl_no',
    ]);

    columns.push({
      key: 'sl_no',
      label: 'Sl No.',
      type: 'text',
      width: '60px',
    });

    Object.keys(sample).forEach((key) => {
      if (excludeKeys.has(key)) return;

      const label = this.formatLabel(key);

      let type: any;
      if (key === 'created_by' || key === 'updated_by') {
        type = 'text';
      } else if (key.includes('date')) {
        type = 'date';
      } else if (key.includes('email') || key.includes('href')) {
        type = 'link';
      } else if (['target_days'].includes(key)) {
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
      key: 'apply_icon',
      label: 'Apply',
      type: 'button',
      buttonText:(row: any) =>{
    return row.application_status === 'draft' && row.allow_repeat_application === 'no'
      ? 'Edit Draft'
      : 'Apply';
  },
      width: '60px',
      onClick: (row: any) => {
        this.onApply(row);
        console.log(row.application_status);
        console.log(row.allow_repeat_application);
        
      },
      cellClass: (value: any, row: any) => {
        const shouldShow =
          row.application_id === null ||
          row.application_status === 'send_back' ||
          row.application_status === 'extra_payment' ||
          row.allow_repeat_application === 'yes' ||
           (row.application_status === 'draft' && row.allow_repeat_application === 'no');
        return shouldShow ? '' : 'd-none';
      },
    });

    columns.push({
      key: 'view',
      label: 'View',
      type: 'icon',
      icon: 'visibility',
      width: '60px',
      onClick: (row: any) => {
        console.log(row.service_mode);
        
        const queryParams: any = {};
        if (row.service_mode === 'Third Party') {
          queryParams.service = 'third_party';
        }
        if (
          row.allow_repeat_application === 'yes' &&
          row.application_id !== null
        ) {
          this.router.navigate(['/dashboard/repeat-application', row.id]);
        } else if (
          row.application_status !== null &&
          row.allow_repeat_application !== 'yes'
        ) {
          this.router.navigate(
            ['/dashboard/user-app-view', row.id, row.application_id],
            {
              queryParams: queryParams,
            }
          );
        }
      },

      // && row.application_status !== 'send_back'
      cellClass: (value: any, row: any) => {
        const shouldShow =
          (row.allow_repeat_application === 'yes' &&
            row.application_id !== null) ||
          row.application_status !== null;
        return shouldShow ? '' : 'd-none';
      },
    });

    this.ApplicationColumns = columns;
  }

  formatLabel(key: string): string {
    // if (key === 'id') {
    //   return 'Sl No.';
    // }
    return key
      .replace(/_([a-z])/g, (match, letter) => ` ${letter.toUpperCase()}`)
      .replace(/^./, (str) => str.toUpperCase());
  }

  getColumnWidth(key: string): string {
    switch (key) {
      case 'service_title_or_description':
        return '200px';
      case 'id':
        return '60px';
      case 'actions':
        return '120px';
      default:
        return '140px';
    }
  }

  onApply(row: any): void {
    if (row.service_mode === 'Third Party') {
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

    const queryParams: any = {};
    if (row.allow_repeat_application === 'no') {
      queryParams.application_status = row.application_status;
    }

    if (row.application_id !== null && row.allow_repeat_application === 'no') {
      queryParams.appid2 = row.application_id;
    }

    this.router.navigate(['dashboard/service-application', row.id], {
      queryParams: queryParams,
    });
  }

  handleRowAction(event: any): void {
    console.log('Row action emitted:', event);
  }

  // close(){
  //   window.close();
  // }
}
