import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-claim-status-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './claim-status-table.html',
  styleUrl: './claim-status-table.scss'
})
export class ClaimStatusTableComponent implements OnChanges {

  @Input() data: any[] = [];
  @Input() pagination: any;
  @Output() pageChange = new EventEmitter<number>();

  displayedData: any[] = [];

  ngOnChanges(): void {
    this.displayedData = this.data || [];
  }
  getPageNumbers(): number[] {
    if (!this.pagination) return [];
    const pages = [];
    for (let i = 1; i <= this.pagination.last_page; i++) {
      pages.push(i);
    }
    return pages;
  }

  changePage(page: number): void {
    this.pageChange.emit(page);
  }

  exportToExcel(): void {
    if (!this.displayedData || this.displayedData.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'No Data Found',
        text: 'There is no data available to export.',
        confirmButtonColor: '#003c5b',
        iconColor: '#fda00f'
      });
      return;
    }
    const exportData = this.displayedData.map(item => ({
      'Application ID': item.application_id,
      'Applicant Name': item.applicant_name,
      'Application Date': item.application_date,
      'Unit Name': item.name_of_unit
    }));
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
    ws['!cols'] = [
      { wch: 20 },
      { wch: 30 },
      { wch: 25 },
      { wch: 25 }
    ];
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'NOC Issued');
    const fileName = `noc-issued-${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
    setTimeout(() => {
      Swal.fire({
        title: 'Excel Exported!',
        text: 'Your file has been downloaded successfully.',
        icon: 'success',
        background: '#ffffff',
        iconColor: '#003c5b',
        color: '#003c5b',
        showConfirmButton: false,
        timer: 1700,
        timerProgressBar: true,
        backdrop: `
        rgba(0,0,0,0.35)
        left top
        no-repeat
      `,
        didOpen: (popup) => {
          popup.style.animation = "swalFadeIn 0.4s ease";
        }
      });
    }, 300);
  }
}
