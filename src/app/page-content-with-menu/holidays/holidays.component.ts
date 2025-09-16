import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { GenericService } from '../../_service/generic/generic.service';
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { AddHolidaysDialogComponent } from '../add-holidays-dialog/add-holidays-dialog.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import Swal from 'sweetalert2';

@Component({
  selector: 'app-holidays',
  templateUrl: './holidays.component.html',
  styleUrls: ['./holidays.component.scss'],
  imports: [MatInputModule, MatTableModule, MatPaginatorModule, MatSortModule, MatButton, MatIconModule, MatFormFieldModule, ReactiveFormsModule, MatButtonModule, CommonModule, MatTooltipModule, MatProgressSpinnerModule]
})
export class HolidaysComponent implements OnInit, AfterViewInit {
  holidays: any[] = [];
  displayedColumns: string[] = ['id', 'description', 'holiday_date', 'actions'];
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>([]);
  holidayForm!: FormGroup;
  isEditMode = false;
  isLoading: boolean = true;
  editingHolidayId: number | null = null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private genericService: GenericService,
    private fb: FormBuilder,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.holidayForm = this.fb.group({
      holiday_name: ['', Validators.required],
      date: ['', Validators.required]
    });
    this.getAllHolidays();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    if (this.dataSource.paginator) {
      this.dataSource.paginator.pageSize = 5;
    }
  }


  addHoliday(mode: 'add' | 'edit' | 'view', element?: any): void {
    const dialogRef = this.dialog.open(AddHolidaysDialogComponent, {
      width: '650px',
      maxWidth: '95vw',
      height: 'auto',
      maxHeight: '90vh',
      panelClass: 'custom-dialog-container',
      disableClose: true,
      data: { data: element, mode: mode },
      enterAnimationDuration: '300ms',
      exitAnimationDuration: '200ms',
    });

    dialogRef.afterClosed().subscribe(() => {
      this.getAllHolidays();
    });
  }

  getAllHolidays(): void {
    this.isLoading = true;
    this.genericService.viewHolidays({}).subscribe({
      next: (res: any) => {
        if (res?.status === 1 && Array.isArray(res.data)) {
          this.dataSource.data = res.data || [];
          this.holidays = res.data;
          this.isLoading = false;
        } else {
          this.holidays = [];
        }
      },
      error: () => {
        this.genericService.openSnackBar('Failed to load holidays', 'Close');
        this.holidays = [];
      }
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  deleteHoliday(holiday: any): void {
    Swal.fire({
      title: 'Are you sure?',
      html: `Do you want to delete the holiday <strong>"${holiday.description}"</strong>?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel',
      reverseButtons: true,
      focusCancel: true,
      showClass: {
        popup: 'animate__animated animate__zoomIn'
      },
      hideClass: {
        popup: 'animate__animated animate__zoomOut'
      },
      customClass: {
        confirmButton: 'swal2-confirm-btn',
        cancelButton: 'swal2-cancel-btn'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.genericService.deleteHoliday({ id: holiday.id }).subscribe({
          next: () => {
            Swal.fire({
              title: 'Deleted!',
              html: `Holiday <strong>"${holiday.description}"</strong> has been deleted.`,
              icon: 'success',
              showConfirmButton: false,
              timer: 1800,
              showClass: { popup: 'animate__animated animate__fadeIn' },
              hideClass: { popup: 'animate__animated animate__fadeOut' }
            });
            this.getAllHolidays();
          },
          error: (error) => {
            const errorMsg = error?.error?.message || 'Failed to delete holiday';
            Swal.fire('Error', errorMsg, 'error');
          }
        });
      }
    });
  }
}
