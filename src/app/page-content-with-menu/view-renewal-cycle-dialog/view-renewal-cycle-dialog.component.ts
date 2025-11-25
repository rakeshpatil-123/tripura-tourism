// view-renewal-cycle-dialog.component.ts
import {
  Component,
  Inject,
  OnInit,
  ViewChild,
  AfterViewInit,
  ChangeDetectionStrategy,
} from '@angular/core';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialog,
} from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { DatePipe, CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
  animate,
  query,
  stagger,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';

import { GenericService } from '../../_service/generic/generic.service';
import { finalize } from 'rxjs';
import { RenewalCycleComponent } from '../renewal-cycle/renewal-cycle.component';

@Component({
  selector: 'app-view-renewal-cycle-dialog',
  templateUrl: './view-renewal-cycle-dialog.component.html',
  styleUrls: ['./view-renewal-cycle-dialog.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    CommonModule
  ],
  providers: [DatePipe],
  animations: [
    // Dialog content entrance
    trigger('fadeSlideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(8px) scale(.98)' }),
        animate(
          '200ms cubic-bezier(0.2, 0, 0, 1)',
          style({ opacity: 1, transform: 'translateY(0) scale(1)' }),
        ),
      ]),
    ]),
    // Staggered rows
    trigger('listStagger', [
      transition(':enter', [
        query('tr.mat-row', [
          style({ opacity: 0, transform: 'translateY(6px)' }),
          stagger(40, [
            animate(
              '160ms ease-out',
              style({ opacity: 1, transform: 'translateY(0)' }),
            ),
          ]),
        ], { optional: true }),
      ]),
    ]),
    // Row hover feedback
    trigger('rowHighlight', [
      state(
        'default',
        style({ backgroundColor: 'transparent' }),
      ),
      state(
        'hover',
        style({ backgroundColor: 'rgba(0,0,0,0.02)' }),
      ),
      transition('default <=> hover', animate('120ms ease-out')),
    ]),
  ],
})
export class ViewRenewalCycleDialogComponent
  implements OnInit, AfterViewInit {
  displayedColumns: string[] = [
    'id',
    'renewal_title',
    'renewal_period',
    'renewal_target_days',
    'renewal_window_days',
    'fixed_renewal_start_date',
    'fixed_renewal_end_date',
    'late_fee_applicable',
    'late_fee_fixed_amount',
    'allow_renewal_input_form',
    'late_fee_calculation_dynamic',
    'is_active',
    'created_at',
    'updated_at',
    'created_by',
    'updated_by',
    'actions',
  ];

  dataSource = new MatTableDataSource<any>([]);
  loading = false;
  errorMsg: string | null = null;
  hoverRowId: number | null = null;

  pageSize = 5;
  readonly pageSizeOptions = [5, 10, 15, 20];


  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private dialogRef: MatDialogRef<ViewRenewalCycleDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { service: any },
    private datePipe: DatePipe,
    private genericService: GenericService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.fetchRenewalCycles(this.data.service.id);
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.paginator.pageSize = this.pageSize;
  }

  close(): void {
    this.dialogRef.close();
  }
  formatEnum(value: string): string {
    if (!value) return '';
    return value
      .split('_')
      .map(v => v.charAt(0).toUpperCase() + v.slice(1))
      .join(' ');
  }

  fetchRenewalCycles(serviceId: number): void {

    this.errorMsg = null;
    this.genericService.getRenewalCycle(serviceId).pipe(
      finalize(() => {
        this.loading = false;
      })
    ).subscribe({

      next: (res) => {
        this.loading = false
        if (res?.status && Array.isArray(res.data)) {
          const mapped = res.data.map((cycle: any) => ({
            ...cycle,
            fixed_renewal_start_date: cycle.fixed_renewal_start_date
              ? this.datePipe.transform(cycle.fixed_renewal_start_date, 'shortDate')
              : '-',
            fixed_renewal_end_date: cycle.fixed_renewal_end_date
              ? this.datePipe.transform(cycle.fixed_renewal_end_date, 'shortDate')
              : '-',
            created_at: this.datePipe.transform(cycle.created_at, 'short'),
            updated_at: this.datePipe.transform(cycle.updated_at, 'short'),
            late_fee_fixed_amount:
              (cycle.late_fee_fixed_amount ?? '') !== '' ? cycle.late_fee_fixed_amount : '-',
            late_fee_calculated_amount:
              (cycle.late_fee_calculated_amount ?? '') !== '' ? cycle.late_fee_calculated_amount : '-',
          }));

          this.dataSource.data = mapped;
          if (this.paginator) {
            this.paginator.firstPage();
          }
        } else {
          this.dataSource.data = [];
          this.errorMsg = res?.message || 'Failed to fetch renewal cycles.';
        }
      },
      error: () => {
        this.dataSource.data = [];
        this.errorMsg = 'Something went wrong while fetching renewal cycles.';
      },
    });
  }

  deleteCycle(cycle: any) {
    if (!confirm(`Are you sure you want to delete "${cycle.renewal_title}"?`))
      return;

    this.genericService.deleteRenewalCycle(cycle.id).subscribe({
      next: (res: any) => {
        if (res?.status) {
          this.dataSource.data = this.dataSource.data.filter(
            (c) => c.id !== cycle.id
          );
          this.dataSource._updateChangeSubscription();
          this.genericService.openSnackBar(
            'Cycle deleted successfully',
            'Success'
          );
        } else {
          this.genericService.openSnackBar(
            res?.message || 'Failed to delete',
            'Error'
          );
        }
      },
      error: () =>
        this.genericService.openSnackBar('Something went wrong', 'Error'),
    });
  }

  updateCycle(cycle: any) {
    const dialogRef = this.dialog.open(RenewalCycleComponent, {
      width: '75%',
      maxWidth: '50vw',
      height: 'auto',
      maxHeight: '90vh',
      panelClass: 'center-dialog',
      data: { service: cycle, mode: 'edit', rules: [cycle] },
    });

    dialogRef.afterClosed().subscribe((updatedCycle: any) => {
      if (updatedCycle) {
        const index = this.dataSource.data.findIndex(
          (c) => c.id === updatedCycle.id
        );
        if (index !== -1) {
          this.dataSource.data[index] = { ...updatedCycle };
          this.dataSource._updateChangeSubscription();
        }
      }
    });
  }

  trackById = (_: number, item: any) => item?.id;

  rowState(row: any): 'default' | 'hover' {
    return this.hoverRowId === row?.id ? 'hover' : 'default';
  }
}
