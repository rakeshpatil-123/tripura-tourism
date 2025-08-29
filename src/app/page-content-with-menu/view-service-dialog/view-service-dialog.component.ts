import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { GenericService } from '../../_service/generic/generic.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-view-service-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    CommonModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
  ],
  templateUrl: './view-service-dialog.component.html',
  styleUrls: ['./view-service-dialog.component.scss'],
})
export class ViewServiceDialogComponent implements OnInit {
  serviceDetails: any;
  loading = true;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private genericService: GenericService
  ) {}

  ngOnInit(): void {
    this.genericService
      .getUpdationDataServiceAdmin({ service_id: this.data.id })
      .subscribe({
        next: (res: any) => {
          if (res.status === 1) {
            this.serviceDetails = res.data;
          }
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        },
      });
  }
}
