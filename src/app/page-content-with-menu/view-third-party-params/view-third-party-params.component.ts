import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { finalize } from 'rxjs';
import { GenericService } from '../../_service/generic/generic.service';
import { LoaderService } from '../../_service/loader/loader.service';
import { MatIconModule } from "@angular/material/icon";
import { CommonModule } from '@angular/common';
import { MatCardModule } from "@angular/material/card";
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-view-third-party-params',
  templateUrl: './view-third-party-params.component.html',
  styleUrls: ['./view-third-party-params.component.scss'],
  imports: [MatDialogModule, MatIconModule, CommonModule, MatCardModule, MatButtonModule]
})
export class ViewThirdPartyParamsComponent implements OnInit {
  serviceDetails: any = {};
  serviceDetailsList: { label: string, value: any }[] = [];

  constructor(
    private genericService: GenericService,
    private loaderService: LoaderService,
    private dialogRef: MatDialogRef<ViewThirdPartyParamsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { service: any, mode: 'view' }
  ) { }

  ngOnInit(): void {
    if (this.data?.service?.id) {
      this.loadViewDetails(this.data.service.id);
    }
  }
  loadViewDetails(id: number) {
    this.loaderService.showLoader();
    this.genericService.viewThirdPartyParams(id)
      .pipe(finalize(() => this.loaderService.hideLoader()))
      .subscribe({
        next: (res: any) => {
          if (res?.status === 1 && res.data) {
            this.serviceDetails = res.data;
            this.prepareDetailsList(res.data);
          } else {
            this.dialogRef.close();
          }
        },
        error: () => this.dialogRef.close()
      });
  }
  prepareDetailsList(data: any) {
    this.serviceDetailsList = [
      { label: 'ID', value: data.id },
      { label: 'Service ID', value: data.service_id },
      { label: 'Param Name', value: data.param_name || '-' },
      { label: 'Param Type', value: data.param_type || '-' },
      { label: 'Param Required', value: data.param_required || '-' },
      { label: 'Default Value', value: data.default_value || '-' },
      { label: 'Default Source Table', value: data.default_source_table || '-' },
      { label: 'Default Source Column', value: data.default_source_column || '-' },
      { label: 'Data Source', value: data.data_source || '-' },
      { label: 'Description', value: data.description || '-' },
      { label: 'Created At', value: data.created_at || '-' },
      { label: 'Updated At', value: data.updated_at || '-' },
      { label: 'Created By', value: data.created_by || '-' },
      { label: 'Updated By', value: data.updated_by || '-' },
    ];
  }
  close(): void {
    this.dialogRef.close();
  }
  formatKey(key: string): string {
    return key.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
  }
}
