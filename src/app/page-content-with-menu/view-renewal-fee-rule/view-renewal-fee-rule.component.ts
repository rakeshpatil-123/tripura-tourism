import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GenericService } from '../../_service/generic/generic.service';
import { MatIconModule } from "@angular/material/icon";
import { CommonModule, DatePipe } from '@angular/common';
import { AddRenewalFeeRuleComponent } from '../add-renewal-fee-rule/add-renewal-fee-rule.component';
import { MatPaginator, MatPaginatorModule } from "@angular/material/paginator";
import { MatSort } from '@angular/material/sort';
import { LoaderService } from '../../_service/loader/loader.service';
import { finalize } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-view-renewal-fee-rule',
  templateUrl: './view-renewal-fee-rule.component.html',
  styleUrls: ['./view-renewal-fee-rule.component.scss'],
  imports: [MatIconModule, MatTableModule, DatePipe, MatPaginatorModule, CommonModule],
})
export class ViewRenewalFeeRuleComponent implements OnInit {
  dataSource = new MatTableDataSource<any>([]);
  displayedColumns: string[] = [
    'id',
    'feeType',
    'fixedFee',
    'condition',
    'calculatedFee',
    'perUnitFee',
    'priority',
    'status',
    'createdAt',
    'created_by',
    'updated_by',
    'actions',
  ];
  constructor(
    private genericService: GenericService,
    private snackBar: MatSnackBar,
    private loaderService: LoaderService,
    private dialogRef: MatDialogRef<ViewRenewalFeeRuleComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { service: any },
    private dialog: MatDialog
  ) { }
 @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit(): void {
    this.loadFeeRules();
  }
    ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }


loadFeeRules(): void {
  this.loaderService.showLoader();
    this.genericService.getRenewalFeeRule(this.data.service.id).pipe(finalize(()=>this.loaderService.hideLoader())).subscribe({
      next: (res: any) => {
        this.dataSource.data = res.data || [];
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      },
      error: () => {
        this.snackBar.open('Failed to load fee rules', 'Close', { duration: 3000 });
      },
    });
  }
  updateRule(rule: any): void {
    const serviceData = this.data.service;
    this.loaderService.showLoader();
    this.dialogRef.close();
    setTimeout(() => {
      this.loaderService.hideLoader();
      const editDialogRef = this.dialog.open(AddRenewalFeeRuleComponent, {
      width: '90vw',
      maxWidth: '1000px',
      height: '90vh',
      maxHeight: '95vh',
      panelClass: ['responsive-dialog', 'dialog-slide-in'],
      data: { service: rule, mode: 'edit' },
      disableClose: true,
      enterAnimationDuration: '300ms',
      exitAnimationDuration: '300ms',
      autoFocus: true,
    });
      editDialogRef.afterClosed().subscribe((result) => {
        if (result === 'updated') {
          Swal.fire({
            icon: 'success',
            title: 'Fee Rule Updated!',
            html: `<strong>The renewal fee rule has been updated successfully.</strong>`,
            timer: 1800,
            timerProgressBar: true,
            background: '#f0fdf4',
            color: '#065f46',
            iconColor: '#16a34a',
            showConfirmButton: false,
            showClass: {
              popup: 'animate__animated animate__fadeInDown animate__faster',
            },
            hideClass: {
              popup: 'animate__animated animate__fadeOutUp animate__faster',
            },
          }).then(() => {
            setTimeout(() => {
              this.dialog.open(ViewRenewalFeeRuleComponent, {
                width: '100vw',
                height: '100vh',
                maxWidth: '100vw',
                maxHeight: '100vh',
                panelClass: 'full-screen-dialog',
                data: { service: serviceData },
                disableClose: false,
                autoFocus: false,
                enterAnimationDuration: '300ms',
                exitAnimationDuration: '300ms',
              });
            }, 300);
          });
        }
      });
    }, 300);
  }


  deleteRule(id: number): void {
    const serviceData = this.data.service;
    this.dialogRef.close();

    Swal.fire({
      title: 'Are you sure?',
      text: 'This action will permanently delete the rule!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Delete it!',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
      focusCancel: true,
      background: '#fff7ed',
      color: '#78350f',
      iconColor: '#f97316',
      showClass: { popup: 'animate__animated animate__zoomIn animate__faster' },
      hideClass: { popup: 'animate__animated animate__zoomOut animate__faster' },
      confirmButtonColor: '#f97316',
      cancelButtonColor: '#9ca3af',
      allowOutsideClick: false,
      allowEscapeKey: false
    }).then((result) => {
      if (result.isConfirmed) {
        this.loaderService.showLoader();

        this.genericService.deleteRenewalFeeRule(id)
          .pipe(finalize(() => this.loaderService.hideLoader()))
          .subscribe({
            next: () => {
              Swal.fire({
                icon: 'success',
                title: 'Deleted!',
                text: 'The rule has been successfully deleted.',
                timer: 1800,
                timerProgressBar: true,
                showConfirmButton: false,
                background: '#ecfdf5',
                color: '#065f46',
                iconColor: '#10b981',
                showClass: { popup: 'animate__animated animate__fadeInDown animate__faster' },
                hideClass: { popup: 'animate__animated animate__fadeOutUp animate__faster' }
              }).then(() => {
                setTimeout(() => {
                  this.dialog.open(ViewRenewalFeeRuleComponent, {
                    width: '100vw',
                    height: '100vh',
                    maxWidth: '100vw',
                    maxHeight: '100vh',
                    panelClass: 'full-screen-dialog',
                    data: { service: serviceData },
                    disableClose: true
                  });
                }, 200);
              });
            },
            error: () => {
              Swal.fire({
                icon: 'error',
                title: 'Failed!',
                text: 'Unable to delete the rule. Please try again.',
                timer: 2000,
                timerProgressBar: true,
                showConfirmButton: false,
                background: '#fef2f2',
                color: '#991b1b',
                iconColor: '#dc2626',
                showClass: { popup: 'animate__animated animate__shakeX animate__faster' },
                hideClass: { popup: 'animate__animated animate__fadeOutUp animate__faster' }
              }).then(() => {
                setTimeout(() => {
                  this.dialog.open(ViewRenewalFeeRuleComponent, {
                    width: '100vw',
                    height: '100vh',
                    maxWidth: '100vw',
                    maxHeight: '100vh',
                    panelClass: 'full-screen-dialog',
                    data: { service: serviceData },
                    disableClose: true
                  });
                }, 200);
              });
            }
          });
      } else {
        setTimeout(() => {
          this.dialog.open(ViewRenewalFeeRuleComponent, {
            width: '100vw',
            height: '100vh',
            maxWidth: '100vw',
            maxHeight: '100vh',
            panelClass: 'full-screen-dialog',
            data: { service: serviceData },
            disableClose: true
          });
        }, 200);
      }
    });
  }

  close(): void {
    this.dialogRef.close();
  }
}
