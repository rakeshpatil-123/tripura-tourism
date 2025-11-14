import { Component, Inject, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { GenericService } from '../../_service/generic/generic.service';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { CommonModule, DatePipe } from '@angular/common';
import { MatIconModule } from "@angular/material/icon";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatButtonModule } from '@angular/material/button';
import { ServiceFeeRuleDialogComponent } from '../service-fee-rule-dialog/service-fee-rule-dialog.component';

@Component({
  selector: 'app-view-service-fee-rule',
  templateUrl: './view-service-fee-rule.component.html',
  styleUrls: ['./view-service-fee-rule.component.scss'],
  imports: [
    MatPaginatorModule,
    MatIconModule,
    MatProgressSpinnerModule,
    CommonModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  providers: [DatePipe],
})
export class ViewServiceFeeRuleComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = [
    'sr_no',
    'id',
    'fee_type',
    'question_label',
    'condition_operator',
    'condition_value_start',
    'condition_value_end',
    'fixed_calculated_fee',
    'per_unit_fee',
    'priority',
    'status',
    'actions',
    'created_at',
    'updated_at',
    'created_by',
    'updated_by'
  ];

  dataSource = new MatTableDataSource<any>([]);
  loading = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private genericService: GenericService,
    private dialogRef: MatDialogRef<ViewServiceFeeRuleComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { service: any },
    private datePipe: DatePipe,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.loadRules();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.paginator.pageSize = 5;
    this.paginator.page.subscribe(() => {
      this.dataSource._updateChangeSubscription();
    });
  }

  loadRules(): void {
    this.loading = true;
    this.genericService.getServiceFeeRule(this.data.service.id).subscribe({
      next: (res) => {
        this.loading = false;
        if (res?.status === 1 && Array.isArray(res.data)) {
          this.dataSource.data = res.data.map((r: any) => ({
            ...r,
            fixed_fee:
              r.fixed_fee && r.fixed_fee !== 'null' ? r.fixed_fee : '-',
            calculated_fee:
              r.calculated_fee && r.calculated_fee !== 'null'
                ? r.calculated_fee
                : '-',
            fixed_calculated_fee:
              r.fixed_calculated_fee && r.fixed_calculated_fee !== 'null'
                ? r.fixed_calculated_fee
                : '-',
            per_unit_fee:
              r.per_unit_fee && r.per_unit_fee !== 'null'
                ? r.per_unit_fee
                : '-',
            condition_value_end:
              r.condition_value_end && r.condition_value_end !== 'null'
                ? r.condition_value_end
                : '-',
            created_at: this.datePipe.transform(r.created_at, 'short'),
            updated_at: this.datePipe.transform(r.updated_at, 'short'),
          }));
          this.dataSource._updateChangeSubscription();
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
        } else {
          this.dataSource.data = [];
        }
      },
      error: () => {
        this.loading = false;
        this.dataSource.data = [];
      },
    });
  }
  openUpdateDialog(row: any) {
    const dialogRef = this.dialog.open(ServiceFeeRuleDialogComponent, {
      width: '75%',
      maxWidth: '90vw',
      height: 'auto',
      maxHeight: '90vh',
      panelClass: 'center-dialog',
      data: { service: this.data.service, mode: 'edit', rules: row },
    });

    dialogRef.afterClosed().subscribe((result: string) => {
      if (result === 'updated') {
        this.loadRules();
      }
    });
  }

  deleteRule(id: number) {
    if (confirm('Are you sure you want to delete this rule ?')) {
      this.genericService.deleteServiceFeeRule(id).subscribe({
        next: (res) => {
          this.loadRules();
        },
        error: (err) => {
          console.error('Delete failed', err);
        }
      });
    }
  }

  close() {
    this.dialogRef.close();
  }
} 