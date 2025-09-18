import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { GenericService } from '../../_service/generic/generic.service';
import { MatInputModule } from "@angular/material/input";
import { MatButton, MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { AddDepartmentDialogComponent } from '../add-department-dialog/add-department-dialog.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-departments',
  templateUrl: './departments.component.html',
  styleUrls: ['./departments.component.scss'],
  imports: [MatInputModule, MatTableModule, MatTableModule, MatPaginatorModule, MatSortModule, MatButton, MatIconModule, MatFormFieldModule, ReactiveFormsModule, MatButtonModule, MatTooltipModule]
})
export class DepartmentsComponent implements OnInit {
  departments: any[] = [];
  displayedColumns: string[] = ['id', 'name', 'details', 'actions'];
  dataSource = new MatTableDataSource<any>();
  departmentForm!: FormGroup;
  isEditMode = false;
  editingDepartmentId: number | null = null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private http: HttpClient,
    private genericService: GenericService,
    private fb: FormBuilder,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.departmentForm = this.fb.group({
      name: ['', Validators.required]
    });
    this.getAllDepartmentList();
  }
  addDepartment(mode: 'add' | 'edit' | 'view', element?: any): void {
    const dialogRef = this.dialog.open(AddDepartmentDialogComponent, {
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

    dialogRef.afterClosed().subscribe((result) => {
      this.getAllDepartmentList();
    });
  }

  getAllDepartmentList(): void {
    this.genericService.getAllDepartmentNames().subscribe({
      next: (res: any) => {
        if (res?.status === 1 && Array.isArray(res.data)) {
          this.dataSource.data = res.data || [];
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
          this.departments = res.data;
        } else {
          this.departments = [];
        }
      },
      error: (err) => {
        this.genericService.openSnackBar('Failed to load departments', 'Close')
        this.departments = [];
      }
    }
    )
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  deleteDepartment(dept: any): void {
    Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to delete the department "${dept.name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel',
      reverseButtons: true,
      focusCancel: true,
      showClass: {
        popup: 'animate__animated animate__fadeInDown'
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOutUp'
      },
      customClass: {
        confirmButton: 'swal2-confirm-btn',
        cancelButton: 'swal2-cancel-btn'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.genericService.deleteDepartment(dept.id).subscribe({
          next: () => {
            Swal.fire(
              'Deleted!',
            `Department "${dept.name}" has been deleted.`,
            'success'
          );
          this.getAllDepartmentList();
        },
        error: (error) => {
          const errorMsg = error?.error?.message || 'Failed to delete department';
            Swal.fire('Error', errorMsg, 'error');
        }
      });
    }
  });
  }


}
