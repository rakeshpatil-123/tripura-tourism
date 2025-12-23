import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  forwardRef,
} from '@angular/core';
import {
  ReactiveFormsModule,
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-ilogi-file-upload',
  templateUrl: './ilogi-file-upload.component.html',
  styleUrls: ['./ilogi-file-upload.component.scss'],
  imports: [ReactiveFormsModule, CommonModule, MatIcon],
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => IlogiFileUploadComponent),
      multi: true,
    },
  ],
})
export class IlogiFileUploadComponent implements ControlValueAccessor {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  localFileUrl: string | null = null;
  @Input() name: string = 'file';
  @Input() label: string = 'Choose file';
  @Input() accept: string = '';
  @Input() maxFileSize: number = 5 * 1024 * 1024; // 5MB
  @Input() disabled: boolean = false;
  @Input() mandatory: boolean = false;
  @Input() fileUrl: string | null = null;

  @Output() fileSelected = new EventEmitter<File>();
  @Output() fileCleared = new EventEmitter<void>();
  @Output() onRemove = new EventEmitter<string>();

  selectedFile: File | null = null;
  error: string | null = null;

  onChange = (file: File | null) => {};
  onTouched = () => {};

  writeValue(file: File | null): void {
    this.selectedFile = file;
  }

  registerOnChange(fn: (file: File | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onButtonClick(): void {
    if (this.disabled) return;
    this.fileInput?.nativeElement.click(); // ✅ Safe call
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
      if (this.localFileUrl) {
        URL.revokeObjectURL(this.localFileUrl);
      }
      this.localFileUrl = URL.createObjectURL(file);
      this.selectedFile = file;
      this.onChange(file);
      this.onTouched();
      this.fileSelected.emit(file);
    }
  }

 clearFile(): void {
  if (this.fileInput?.nativeElement) {
    this.fileInput.nativeElement.value = '';
  }

  if (this.localFileUrl) {
    URL.revokeObjectURL(this.localFileUrl);
    this.localFileUrl = null;
  }

  this.selectedFile = null;
  this.onChange(null);
  this.onTouched();
  this.fileCleared.emit();
  this.onRemove.emit(this.name);
}
 previewFile(): void {
  const urlToOpen = this.localFileUrl || this.fileUrl;
  if (urlToOpen) {
    window.open(urlToOpen, '_blank');
  }
}
}
