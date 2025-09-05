import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { GenericService } from '../../_service/generic/generic.service';
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AddApprovalFlowComponent } from '../add-approval-flow/add-approval-flow.component';

@Component({
  selector: 'app-view-approval-flow-dialog',
  templateUrl: './view-approval-flow-dialog.component.html',
  styleUrls: ['./view-approval-flow-dialog.component.scss'],
  imports: [MatIconModule, MatPaginatorModule, MatInputModule, ReactiveFormsModule, MatSort, CommonModule, MatTableModule, MatPaginatorModule]
})
export class ViewApprovalFlowDialogComponent implements OnInit {
  displayedColumns: string[] = ['step_number', 'step_type', 'department_id', 'hierarchy_level', 'actions'];
  dataSource = new MatTableDataSource<any>([]);
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private dialogRef: MatDialogRef<ViewApprovalFlowDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialog: MatDialog,
    private genericService: GenericService,
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
    const serviceId = this.data.service?.id;
    if (!serviceId) return;

    this.genericService.getApprovalFlow(serviceId).subscribe({
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
    row.service = this.data.service;
    const dialogRef = this.dialog.open(AddApprovalFlowComponent, {
      width: '75%',
      maxWidth: '27vw',
      height: 'auto',
      maxHeight: '96vh',
      panelClass: 'center-dialog',
      data: { row, mode: 'edit' },
    });

    dialogRef.afterClosed().subscribe((result) => {
      this.loadApprovalFlow();
    });
  }

  deleteFlow(row: any) {
    if (confirm(`Are you sure you want to delete ${row.step_type} step?`)) {
      this.genericService.deleteApprovalFlow(row.id).subscribe({
        next: (res: any) => {
          if (res.status === 1) {
            this.genericService.openSnackBar(res.message || 'Flow deleted successfully!', 'Success');
            this.loadApprovalFlow();
            this.dataSource.data = this.dataSource.data.filter(f => f.id !== row.id);
          } else {
            this.genericService.openSnackBar(res.message || 'Failed to delete flow', 'Close');
          }
        },
        error: () => {
          this.genericService.openSnackBar('Something went wrong. Try again.', 'Close');
        }
      });
    }
  }
  closeDialog(): void {
    this.dialogRef.close();
  }

}
