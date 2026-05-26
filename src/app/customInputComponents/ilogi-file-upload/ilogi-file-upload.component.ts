import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
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
export class IlogiFileUploadComponent implements ControlValueAccessor, OnChanges {
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

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['fileUrl']) {
      this.updateDisplayedFileUrl();
    }
  }
  private updateDisplayedFileUrl(): void {
    if (this.fileUrl) {
      this.localFileUrl = this.fileUrl;
    } else if (!this.selectedFile) {
      this.localFileUrl = null;
    }
  }
  onChange = (file: File | null) => { };
  onTouched = () => { };

  writeValue(file: File | null): void {
    if (file instanceof File) {
      this.selectedFile = file;
      const fakeUrl = (file as any)?._url;
      if (fakeUrl) {
        this.fileUrl = fakeUrl;
        this.localFileUrl = fakeUrl;
      }
    } else {
      this.selectedFile = null;
      if (!this.fileUrl) {
        this.localFileUrl = null;
      }
    }
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
    this.fileInput?.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    if (this.disabled) return;
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
      if (this.localFileUrl?.startsWith('blob:')) {
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

  if (this.localFileUrl?.startsWith('blob:')) {
    URL.revokeObjectURL(this.localFileUrl);
  }
  this.localFileUrl = null;

  this.selectedFile = null;
  this.fileUrl = null;
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

getFileNameFromUrl(url: string): string {
  return url.split('/').pop() || 'file';
}
}
