import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { GenericService } from '../../_service/generic/generic.service';
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AddApprovalFlowComponent } from '../add-approval-flow/add-approval-flow.component';
import Swal from 'sweetalert2';
import { LoaderService } from '../../_service/loader/loader.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-view-approval-flow-dialog',
  templateUrl: './view-approval-flow-dialog.component.html',
  styleUrls: ['./view-approval-flow-dialog.component.scss'],
  imports: [MatIconModule, MatPaginatorModule, MatInputModule, ReactiveFormsModule, MatSort, CommonModule, MatTableModule, MatPaginatorModule]
})
export class ViewApprovalFlowDialogComponent implements OnInit {
  displayedColumns: string[] = ['step_number', 'step_type', 'department_name', 'hierarchy_level', 'created_by', 'updated_by', 'actions'];
  dataSource = new MatTableDataSource<any>([]);
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private dialogRef: MatDialogRef<ViewApprovalFlowDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialog: MatDialog,
    private genericService: GenericService,
    private loaderService: LoaderService
  ) { }

  ngOnInit(): void {
    this.loadApprovalFlow();
    if (this.data.service?.flows?.length) {
      this.dataSource.data = this.data.service.flows;
      setTimeout(() => {
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      });
    }
  }
  loadApprovalFlow(): void {
    this.loaderService.showLoader();
    const serviceId = this.data.service?.id;
    if (!serviceId) return;

    this.genericService.getApprovalFlow(serviceId).pipe(finalize(() => this.loaderService.hideLoader())).subscribe({
      next: (res: any) => {
        if (res.status === 1 && res.data?.length) {
          this.dataSource.data = res.data;
          setTimeout(() => {
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
          });
        } else {
          this.dataSource.data = [];
          this.genericService.openSnackBar(res.message || 'No approval flows found', 'Close');
        }
      },
      error: (err) => {
        console.error(err);
        this.genericService.openSnackBar('Failed to load approval flows', 'Close');
      }
    });
  }


  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  editFlow(row: any) {
    const service = this.data.service;
    this.dialogRef.close();
    setTimeout(() => {
      row.service = service;

      const dialogRef = this.dialog.open(AddApprovalFlowComponent, {
        width: '85vw',
        maxWidth: '900px',
        height: 'auto',
        maxHeight: '90vh',
        panelClass: ['approval-flow-dialog', 'dialog-slide-in'],
        enterAnimationDuration: '300ms',
        exitAnimationDuration: '200ms',
        data: { row, mode: 'edit' },
        autoFocus: false,
        disableClose: true
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          Swal.fire({
            icon: 'success',
            title: 'Approval Flow Updated!',
            text: 'Your changes have been saved successfully.',
            showConfirmButton: false,
            timer: 1500,
            timerProgressBar: true,
          }).then(() => {
            setTimeout(() => {
              this.viewApprovalFlow(service);
            }, 300);
          });
        }
      });
    }, 300);
  }


  deleteFlow(row: any) {
    this.dialog.closeAll();
    Swal.fire({
      title: `Delete ${row.step_type} Step?`,
      html: `<strong>Service:</strong> ${this.data.service.service_title_or_description}<br>
           <strong>Step:</strong> ${row.step_type}<br><br>
           This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      focusConfirm: false,
      reverseButtons: true,
      width: '400px',
      padding: '1.5rem',
      backdrop: true,
      allowOutsideClick: false
    }).then((result) => {
      if (result.isConfirmed) {
        this.loaderService.showLoader()
        this.genericService.deleteApprovalFlow(row.id).pipe(finalize(() => this.loaderService.hideLoader())).subscribe({
          next: (res: any) => {
            if (res.status === 1) {
              Swal.fire({
                icon: 'success',
                title: 'Deleted!',
                text: res.message || 'Flow deleted successfully!',
                timer: 2000,
                showConfirmButton: false
              });
              setTimeout(() => {
                this.viewApprovalFlow(this.data.service);
              }, 300);
            } else {
              Swal.fire({
                icon: 'error',
                title: 'Failed!',
                text: res.message || 'Failed to delete flow',
                timer: 2000,
                showConfirmButton: false
              });
            }
          },
          error: () => {
            Swal.fire({
              icon: 'error',
              title: 'Error!',
              text: 'Something went wrong. Try again.',
              timer: 2000,
              showConfirmButton: false
            });
          }
        });
      } else {
        this.viewApprovalFlow(this.data.service);
      }
    });
  }
  viewApprovalFlow(service: any): void {
    const dialogRef = this.dialog.open(ViewApprovalFlowDialogComponent, {
      width: '90vw',
      maxWidth: '1000px',
      height: '85vh',
      maxHeight: '800px',
      panelClass: 'custom-approval-dialog',
      enterAnimationDuration: '300ms',
      exitAnimationDuration: '200ms',
      data: { service },
    });
    dialogRef.afterClosed().subscribe((deletedStepId?: number) => {
      if (deletedStepId) {
        this.viewApprovalFlow(service);
      }
    });
  }
  closeDialog(): void {
    this.dialogRef.close();
  }

}
