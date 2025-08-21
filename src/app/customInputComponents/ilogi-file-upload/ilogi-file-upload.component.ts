// ilogi-file-upload.component.ts
import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, Output, ViewChild, forwardRef } from '@angular/core';
import { ReactiveFormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-ilogi-file-upload',
  templateUrl: './ilogi-file-upload.component.html',
  styleUrls: ['./ilogi-file-upload.component.scss'],
  imports: [ReactiveFormsModule, CommonModule],
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => IlogiFileUploadComponent),
      multi: true
    }
  ]
})
export class IlogiFileUploadComponent implements ControlValueAccessor {
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

  // Callbacks required by ControlValueAccessor
  onChange = (file: File | null) => {};
  onTouched = () => {};

  // Write value from form model
  writeValue(file: File | null): void {
    this.selectedFile = file;
  }

  // Register callback for value changes
  registerOnChange(fn: (file: File | null) => void): void {
    this.onChange = fn;
  }

  // Register callback for touch
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  // Disable the control
  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

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
      this.onChange(file);        // Notify Angular form
      this.onTouched();           // Mark as touched
      this.fileSelected.emit(file);
    }
  }

  clearFile(): void {
    this.selectedFile = null;
    this.fileInput.nativeElement.value = '';
    this.onChange(null);          // Update form value
    this.fileCleared.emit();
  }
}