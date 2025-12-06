import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as XLSX from 'xlsx';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-sales-report',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sales-report.component.html',
  styleUrls: ['./sales-report.component.scss']
})
export class SalesReportComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  originalJson: any = null;
  previewData: any[] = [];
  filteredData: any[] = [];
  displayedColumns: string[] = [];

  searchTerm = '';
  replaceFrom = '';
  replaceTo = '';
  fileName = '';

  constructor(private sanitizer: DomSanitizer) { }

  ngOnInit(): void { }
  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files && input.files[0];
    if (!file) return;
    this.fileName = file.name;

    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      try {
        const text = (e.target as FileReader).result as string;
        const parsed = JSON.parse(text);
        this.originalJson = parsed;
        this.resetPreview();
      } catch (err) {
        alert('Invalid JSON file: ' + (err as Error)?.message);
        this.originalJson = null;
        this.previewData = [];
        this.filteredData = [];
        this.displayedColumns = [];
      }
    };
    reader.readAsText(file);
    try { input.value = ''; } catch { }
  }
  resetPreview() {
    const arr = Array.isArray(this.originalJson) ? this.originalJson : [this.originalJson];
    this.previewData = this.normalizeData(arr);
    this.filteredData = [...this.previewData];
    this.buildColumns();
  }
  normalizeData(arr: any[]): any[] {
    return arr.map(item => {
      if (item === null || item === undefined) {
        return { value: '' };
      }

      if (typeof item !== 'object') {
        return { value: String(item) };
      }

      const row: any = {};
      for (const key of Object.keys(item)) {
        const val = item[key];
        if (val === null || val === undefined) row[key] = '';
        else if (typeof val === 'object') {
          try {
            row[key] = JSON.stringify(val);
          } catch {
            row[key] = String(val);
          }
        } else {
          row[key] = String(val);
        }
      }
      return row;
    });
  }
  buildColumns() {
    const set = new Set<string>();
    this.previewData.forEach(r => {
      if (r && typeof r === 'object') {
        Object.keys(r).forEach(k => set.add(k));
      }
    });
    this.displayedColumns = Array.from(set);
    if (this.displayedColumns.length === 0 && this.previewData.length > 0) {
      this.displayedColumns = Object.keys(this.previewData[0]);
    }
  }
  search() {
    const q = this.searchTerm?.trim();
    if (!q) {
      this.filteredData = [...this.previewData];
      return;
    }
    const low = q.toLowerCase();
    this.filteredData = this.previewData.filter(row =>
      this.displayedColumns.some(col => {
        const val = row[col];
        return val && String(val).toLowerCase().includes(low);
      })
    );
  }

  replaceAll() {
    const from = (this.replaceFrom ?? '').toString();
    const to = (this.replaceTo ?? '').toString();

    if (!from) {
      alert('Please enter the text/number to replace (Replace from).');
      return;
    }

    try {
      this.originalJson = this.deepReplace(this.originalJson, from, to);
      this.resetPreview();
      if (this.searchTerm && this.searchTerm.trim()) this.search();
    } catch (err) {
      console.error('replaceAll error', err);
      alert('An error occurred while performing replace. See console for details.');
    }
  }
  private deepReplace(obj: any, from: string, to: string): any {
    if (obj === null || obj === undefined) return obj;

    // Try to parse 'from' and 'to' as numbers to allow numeric replacement
    const fromNum = Number(from);
    const toNum = Number(to);
    const fromIsNumeric = !Number.isNaN(fromNum);
    const toIsNumeric = !Number.isNaN(toNum);

    // If value is a number: check for exact numeric equality replacement
    if (typeof obj === 'number') {
      if (fromIsNumeric && obj === fromNum) {
        return toIsNumeric ? toNum : to; // if to is numeric keep number; otherwise return string
      }
      return obj; // unchanged
    }

    // If value is a string: do substring replacement (case-insensitive)
    if (typeof obj === 'string') {
      try {
        const re = new RegExp(this.escapeRegExp(from), 'gi');
        const replaced = obj.replace(re, to);
        return replaced;
      } catch {
        // fallback simple replace
        return obj.split(from).join(to);
      }
    }
    if (Array.isArray(obj)) {
      return obj.map(v => this.deepReplace(v, from, to));
    }
    if (typeof obj === 'object') {
      const out: any = Array.isArray(obj) ? [] : {};
      for (const k of Object.keys(obj)) {
        out[k] = this.deepReplace(obj[k], from, to);
      }
      return out;
    }
    return obj;
  }
  private escapeRegExp(s: string) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
  getHighlighted(value: any): SafeHtml {
    const text = value == null ? '' : String(value);
    const q = this.searchTerm?.trim();
    if (!q) return this.sanitizer.bypassSecurityTrustHtml(this.escapeHtml(text));

    try {
      const re = new RegExp(this.escapeRegExp(q), 'gi');
      const replaced = this.escapeHtml(text).replace(re, match => `<mark>${match}</mark>`);
      return this.sanitizer.bypassSecurityTrustHtml(replaced);
    } catch {
      return this.sanitizer.bypassSecurityTrustHtml(this.escapeHtml(text));
    }
  }

  private escapeHtml(unsafe: string) {
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  exportExcelFile() {
    if (!this.previewData || this.previewData.length === 0) {
      alert('Nothing to export — import a JSON file first.');
      return;
    }

    const dataToExport = (this.filteredData && this.filteredData.length) ? this.filteredData : this.previewData;
    const normalized = dataToExport.map(row => {
      const out: any = {};
      this.displayedColumns.forEach(col => out[col] = row[col] ?? '');
      return out;
    });
    const ws = XLSX.utils.json_to_sheet(normalized);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    try {
      const wbArray: any = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([wbArray], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = (this.fileName || 'export').replace(/\.json$/i, '') + '.xlsx';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export error', err);
      try {
        const outName = (this.fileName || 'export').replace(/\.json$/i, '') + '.xlsx';
        XLSX.writeFile(wb, outName);
      } catch (err2) {
        console.error('Fallback writeFile failed', err2);
        alert('Failed to export file. See console for details.');
      }
    }
  }
}
