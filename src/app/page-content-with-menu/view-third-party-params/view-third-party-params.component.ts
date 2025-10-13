import { Component, Inject, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogModule,
  MatDialog
} from '@angular/material/dialog';
import { finalize } from 'rxjs';
import { GenericService } from '../../_service/generic/generic.service';
import { LoaderService } from '../../_service/loader/loader.service';
import { MatIconModule } from "@angular/material/icon";
import { CommonModule } from '@angular/common';
import { MatCardModule } from "@angular/material/card";
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import Swal from 'sweetalert2';
import { ThirdPartyParamsComponent } from '../third-party-params/third-party-params.component';

@Component({
  selector: 'app-view-third-party-params',
  templateUrl: './view-third-party-params.component.html',
  styleUrls: ['./view-third-party-params.component.scss'],
  standalone: true,
  imports: [
    MatDialogModule,
    MatIconModule,
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatTableModule,
    MatTooltipModule,
    MatPaginatorModule,
    MatSortModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ]
})
export class ViewThirdPartyParamsComponent implements OnInit, AfterViewInit {
  serviceDetails: any = {};
  serviceDetailsList: any[] = [];
  dataSource = new MatTableDataSource<any>([]);
  noDataMessage: string | null = null;
  displayedColumns: string[] = [
    'sno',
    'param_name',
    'param_type',
    'param_required',
    'default_value',
    'data_source',
    'description',
    'created_at',
    'updated_at',
    'actions'
  ];
  loading = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private genericService: GenericService,
    private loaderService: LoaderService,
    private dialogRef: MatDialogRef<ViewThirdPartyParamsComponent>,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: { service: any, mode: 'view' }
  ) { }

  ngOnInit(): void {
    if (this.data?.service?.id) {
      this.loadViewDetails(this.data.service.id);
    }
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }



  loadViewDetails(id: number) {
    this.loading = true;
    this.noDataMessage = null;
    this.loaderService.showLoader();

    this.genericService.viewThirdPartyParams(id)
      .pipe(finalize(() => {
        this.loaderService.hideLoader();
        this.loading = false;
      }))
      .subscribe({
        next: (res: any) => {
          if (res?.status === 1 && res.data) {
            this.serviceDetailsList = Array.isArray(res.data) ? res.data : [res.data];
            this.serviceDetails = this.serviceDetailsList.length ? this.serviceDetailsList[0] : {};
            this.dataSource.data = this.serviceDetailsList;

            if (!this.serviceDetailsList.length) {
              this.noDataMessage = 'No parameters found for this service.';
            }
          } else {
            this.dataSource.data = [];
            this.serviceDetailsList = [];
            this.noDataMessage = res?.message || 'No data found for this service.';
          }
        },
        error: (err) => {
          this.dataSource.data = [];
          this.serviceDetailsList = [];
          this.noDataMessage =
            err?.error?.message || 'Unable to load data. Please try again later.';
        }
      });
  }


  onEdit(row: any): void {
    const dialogRef = this.dialog.open(ThirdPartyParamsComponent, {
      width: '70vw',
      maxWidth: '95vw',
      height: 'auto',
      maxHeight: '90vh',
      panelClass: 'custom-thirdparty-dialog',
      disableClose: true,
      autoFocus: false,
      data: {
        service: { id: row.service_id, name: this.data?.service?.name },
        mode: 'edit',
        parameter: row
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'updated' || result === 'created') {
        this.loadViewDetails(this.data.service.id);
        this.snackBar.open('Parameter saved successfully', 'Close', {
          duration: 2500,
          verticalPosition: 'top',
        });
      }
    });
  }


  onDelete(row: any) {
    this.dialogRef.close();
    setTimeout(() => {
      Swal.fire({
        title: `Delete "${row.param_name}"?`,
        text: 'This action cannot be undone.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete',
        cancelButtonText: 'Cancel',
        background: '#fff',
        heightAuto: false,
        customClass: {
          popup: 'swal2-top-dialog'
        }
      }).then((choice) => {
        if (choice.isConfirmed) {
          this.loaderService.showLoader();

          this.genericService
            .deleteThirdPartyParams(row.id)
            .pipe(finalize(() => this.loaderService.hideLoader()))
            .subscribe({
              next: (res: any) => {
                if (res?.status === 1) {
                  Swal.fire('Deleted!', 'Parameter deleted successfully.', 'success').then(() => {
                    this.dialog.open(ViewThirdPartyParamsComponent, {
                      width: '70vw',
                      height: '80vh',
                      maxWidth: '95vw',
                      maxHeight: '90vh',
                      panelClass: 'custom-dialog',
                      data: { service: this.data.service, mode: 'view' }
                    });
                  });
                } else {
                  Swal.fire('Error', res.message || 'Failed to delete parameter', 'error');
                }
              },
              error: () => {
                Swal.fire('Error', 'Something went wrong. Please try again.', 'error');
              },
            });
        }
      });
    }, 200);
  }

  close(): void {
    this.dialogRef.close();
  }

  formatDate(value?: string) {
    if (!value) return '-';
    try {
      return new Date(value).toLocaleString();
    } catch {
      return value;
    }
  }
  get pageIndex(): number {
    return this.paginator ? this.paginator.pageIndex : 0;
  }

  get pageSize(): number {
    return this.paginator ? this.paginator.pageSize : 6;
  }
}
