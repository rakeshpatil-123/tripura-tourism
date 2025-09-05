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
    'actions',
  ];
  constructor(
    private genericService: GenericService,
    private snackBar: MatSnackBar,
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
    this.genericService.getRenewalFeeRule(this.data.service.id).subscribe({
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
    const dialogRef = this.dialog.open(AddRenewalFeeRuleComponent, {
      width: '75%',
      maxWidth: '75vw',
      height: 'auto',
      maxHeight: '90vh',
      panelClass: 'center-dialog',
      data: { service: rule, mode: 'edit' },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'updated') {
        this.loadFeeRules();
      }
    });
  }


  deleteRule(id: number): void {
    if (!confirm('Are you sure you want to delete this rule?')) return;

    this.genericService.deleteRenewalFeeRule(id).subscribe({
      next: () => {
        this.snackBar.open('Rule deleted successfully', 'Close', { duration: 3000 });
        this.loadFeeRules();
      },
      error: () => {
        this.snackBar.open('Failed to delete rule', 'Close', { duration: 3000 });
      },
    });
  }

  close(): void {
    this.dialogRef.close();
  }
}
