import { Component } from '@angular/core';
import { DynamicTableComponent } from '../../../shared/component/table/table.component';
import { GenericService } from '../../../_service/generic/generic.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-inspection-view',
  imports: [DynamicTableComponent],
  templateUrl: './inspection-view.component.html',
  styleUrl: './inspection-view.component.scss'
})
export class InspectionViewComponent {

   inspectionRows: any[] = [];
  inspection_id: number | null = null;

inspectionColumns: any[] = [
  { key: 'request_id', label: 'Request ID', type: 'text' },
  { key: 'proposed_date', label: 'Proposed Date', type: 'text' },
  { key: 'inspection_date', label: 'Inspection Date', type: 'text' },
  { key: 'department_name', label: 'Department', type: 'text' },
  { key: 'inspector', label: 'Inspector', type: 'text' },
  { key: 'reason_for_request', label: 'Request Reason', type: 'text' },
  { key: 'status', label: 'Status', type: 'text' },
  { key: 'remarks', label: 'Remarks', type: 'text' },
  { key: 'created_at', label: 'Created At', type: 'text' },
  { key: 'updated_at', label: 'Updated At', type: 'text' },
  { key: 'created_by', label: 'Created By', type: 'text' },
  { key: 'updated_by', label: 'Updated By', type: 'text' },
];
constructor(private apiService: GenericService, private route : ActivatedRoute){}


ngOnInit(): void{
    const inspectionId = this.route.snapshot.paramMap.get('inspectionId');
    if (inspectionId) {
      this.inspection_id = +inspectionId;
      this.loadInspectionDetails();
    }

}

private loadInspectionDetails(): void {
  const payload = { inspection_id: this.inspection_id };
  this.apiService.getByConditions(payload, 'api/inspection/inspection-view').subscribe({
    next: (res: any) => {
      if (res?.status === 1 ) {
        this.inspectionRows = [res.data];
      } else {
         this.inspectionRows = [];
      }
    },
    error: (err) => {
      console.error('Failed to load inspection details:', err);
       this.inspectionRows = [];
    }
  }); 
}
}