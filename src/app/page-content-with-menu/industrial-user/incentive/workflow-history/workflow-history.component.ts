import { Component } from '@angular/core';
import { DynamicTableComponent } from '../../../../shared/component/table/table.component';
import { GenericService } from '../../../../_service/generic/generic.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-workflow-history',
  imports: [DynamicTableComponent],
  templateUrl: './workflow-history.component.html',
  styleUrl: './workflow-history.component.scss',
})
export class WorkflowHistoryComponent {
  applications: any[] = [];
  
  columns = [
    { key: 'date', label: 'Date' },
    { key: 'from_status', label: 'From Status' },
    { key: 'to_status', label: 'To Status' },
    { key: 'remarks', label: 'Remarks' },
    { key: 'user_name', label: 'User' },
  ];

  application_id: string | null = null;

  constructor(
    private apiService: GenericService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.application_id = this.route.snapshot.paramMap.get('applicationId');
    if (!this.application_id) {
      this.apiService.openSnackBar('Application ID is missing.', 'error');
      return;
    }
    this.fetchWorkflowHistory();
  }

  private fetchWorkflowHistory(): void {
    this.apiService
      .getByConditions(
        { application_id: this.application_id },
        'api/user/incentive/application-workflow-history'
      )
      .subscribe({
        next: (res: any) => {
          if (res?.status === 1 && Array.isArray(res.data)) {
            this.applications = res.data.map((item: any) => ({
              ...item,
              user_name: item.user_name || '—',
              remarks: item.remarks || '—'
            }));
          } else {
            this.applications = [];
            this.apiService.openSnackBar(res?.message || 'No workflow history found.', 'info');
          }
        },
        error: (err) => {
          console.error('Error fetching workflow history:', err);
          this.applications = [];
          this.apiService.openSnackBar('Failed to load workflow history.', 'error');
        },
      });
  }
}