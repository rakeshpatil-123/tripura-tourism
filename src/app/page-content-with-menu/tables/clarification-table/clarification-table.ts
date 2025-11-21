import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import * as XLSX from 'xlsx';
import { IlogiSelectComponent } from '../../../customInputComponents/ilogi-select/ilogi-select.component';
import { IlogiInputComponent } from '../../../customInputComponents/ilogi-input/ilogi-input.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-clarification-table',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IlogiInputComponent,
    IlogiSelectComponent
  ],
  templateUrl: './clarification-table.html',
  styleUrl: './clarification-table.scss'
})
export class ClarificationTableComponent implements OnChanges {

  @Input() data: any[] | null = [];
  clarificationData: any[] = [];
  filteredData: any[] = [];
  displayedData: any[] = [];
  showAll = false;
  initialDisplayCount = 5;
  pageSize = 5;
  currentPage = 1;
  totalPages = 0;
  filterForm = new FormGroup({
    searchText: new FormControl(''),
    selectedStatus: new FormControl('')
  });
  statusOptions = [
    { id: '', name: 'All' },
    { id: 'uploaded', name: 'Uploaded' },
    { id: 'missing', name: 'Clarification Required' }
  ];

  constructor() {
    this.filterForm.valueChanges.subscribe(() => {
      this.applyFilters();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.data) {
      this.prepareData();
      this.applyFilters();
    }
  }

  prepareData(): void {
    if (!this.data || this.data.length === 0) {
      this.clarificationData = [];
      return;
    }

    this.clarificationData = this.data.map(item => {
      const isUploaded = !!item.status_file;

      return {
        applicationId: item.applicationId || item.application_id || 'N/A',
        noc: item.NOC_letter_number || 'N/A',
        status: isUploaded ? 'uploaded' : 'missing',
        documentName: isUploaded ? item.status_file.split('/').pop() : null,
        status_file: item.status_file
      };
    });
  }
  get totalPagesArray() {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }
  updateDisplayedData(): void {
    this.totalPages = Math.ceil(this.filteredData.length / this.pageSize);

    if (this.currentPage > this.totalPages) {
      this.currentPage = 1;
    }

    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;

    this.displayedData = this.filteredData.slice(startIndex, endIndex);
  }
  goToPage(page: number): void {
    this.currentPage = page;
    this.updateDisplayedData();
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updateDisplayedData();
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updateDisplayedData();
    }
  }
  applyFilters(): void {
    const { searchText, selectedStatus } = this.filterForm.value;
    let filtered = [...this.clarificationData];

    if (searchText?.trim()) {
      const s = searchText.trim().toLowerCase();
      filtered = filtered.filter(item => (item.applicationId + '').toLowerCase().includes(s));
    }

    if (selectedStatus) {
      filtered = filtered.filter(item => item.status === selectedStatus);
    }
    this.filteredData = filtered;

    this.currentPage = 1;
    setTimeout(() => {
      this.updateDisplayedData();
    }, 50);
  }
  clearFilters(): void {
    this.filterForm.reset({
      searchText: '',
      selectedStatus: ''
    });
  }

  toggleViewAll(): void {
    this.showAll = !this.showAll;
    this.updateDisplayedData();
  }

  openFile(url: string): void {
    if (url) window.open(url, '_blank');
  }
  trackById(index: number, item: any) {
    return item.applicationId;
  }



  exportToExcel(): void {
    Swal.fire({
      title: 'Export Clarifications?',
      text: 'This will generate an Excel file containing all filtered records.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Download!',
      cancelButtonText: 'Cancel',
      background: '#1e1e2f',
      color: '#ffffff',
      confirmButtonColor: '#6a5acd',
      cancelButtonColor: '#ff4757',
      allowOutsideClick: false,
      allowEscapeKey: false,
      backdrop: `
      rgba(0,0,0,0.8)
      url("https://i.gifer.com/7VE.gif")
      center top
      no-repeat
    `,
      showClass: {
        popup: 'animate__animated animate__zoomIn animate__faster'
      },
      hideClass: {
        popup: 'animate__animated animate__zoomOut animate__faster'
      }
    }).then((result) => {
      if (result.isConfirmed) {

        const exportData = this.filteredData.map(item => ({
          'Application ID': item.applicationId,
          'NOC Number': item.noc,
          'Status': item.status === 'uploaded' ? 'Document Uploaded' : 'Clarification Required',
          'Document Name': item.documentName || 'N/A',
          'File URL': item.status_file || 'N/A'
        }));

        const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
        ws['!cols'] = [
          { wch: 25 },
          { wch: 20 },
          { wch: 22 },
          { wch: 30 },
          { wch: 60 }
        ];

        const wb: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Clarifications');

        const filename = `clarifications-${new Date().toISOString().split('T')[0]}.xlsx`;
        setTimeout(() => {
          XLSX.writeFile(wb, filename);

          Swal.fire({
            title: 'Download Complete!',
            html: `
            <b>${filename}</b><br><br>
            Your Excel report has been successfully generated.
          `,
            icon: 'success',
            background: '#ffffff',
            confirmButtonColor: '#2ed573',
            color: '#2f3542',
            backdrop: `
            rgba(0,0,0,0.4)
            url("https://i.gifer.com/6V2.gif")
            center
            no-repeat
          `,
            showClass: {
              popup: 'animate__animated animate__fadeInDown'
            },
            hideClass: {
              popup: 'animate__animated animate__fadeOutUp'
            }
          });
        }, 200);

      }
    });
  }
}
