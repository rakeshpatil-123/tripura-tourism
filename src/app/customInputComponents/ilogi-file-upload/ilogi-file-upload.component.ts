import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-ilogi-file-upload',
  templateUrl: './ilogi-file-upload.component.html',
  styleUrls: ['./ilogi-file-upload.component.scss'],
  imports: [ReactiveFormsModule, CommonModule]
})
export class IlogiFileUploadComponent {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  @Input() name: string = 'file';
  @Input() label: string = 'Choose file';
  @Input() accept: string = '';
  @Input() maxFileSize: number = 5 * 1024 * 1024; // 5MB
  @Input() disabled: boolean = false;

  @Output() fileSelected = new EventEmitter<File>();
  @Output() fileCleared = new EventEmitter<void>();

  selectedFile: File | null = null;
  error: string | null = null;

  onButtonClick(): void {
    if (this.disabled) return;
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.error = null;

    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      if (file.size > this.maxFileSize) {
        const maxSizeMB = (this.maxFileSize / (1024 * 1024)).toFixed(1);
        this.error = `File size exceeds ${maxSizeMB} MB`;
        input.value = ''; // reset input
        return;
      }

      this.selectedFile = file;
      this.fileSelected.emit(file);
    }
  }

  clearFile(): void {
    this.selectedFile = null;
    this.fileInput.nativeElement.value = '';
    this.fileCleared.emit();
  }
}