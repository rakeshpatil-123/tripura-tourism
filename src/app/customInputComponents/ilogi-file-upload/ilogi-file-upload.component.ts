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
    selectedFileName: string | null = null;
    error: string | null = null;

    // ControlValueAccessor callbacks
    onChange = (file: File | null) => {};
    onTouched = () => {};

    writeValue(file: File | null): void {
      this.selectedFile = file;
    }
    ngOnChanges(changes: SimpleChanges): void {
      if (changes['fileUrl'] && this.fileUrl && !this.selectedFile) {
        const parts = this.fileUrl.split('/');
        this.selectedFileName = parts[parts.length - 1];
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

        this.selectedFile = file;
        this.selectedFileName = file.name;
        this.onChange(file);
        this.onTouched();
        this.fileSelected.emit(file);
      }
    }

    clearFile(): void {
      if (this.fileInput?.nativeElement) {
        this.fileInput.nativeElement.value = ''; // Only if exists
      }

      this.selectedFile = null;
      this.selectedFileName = null;
      this.onChange(null);
      this.onTouched();
      this.fileCleared.emit();

      this.onRemove.emit(this.name); // or use a better identifier if needed
    }
    previewFile(): void {
      if (this.fileUrl) {
        window.open(this.fileUrl, '_blank');
      }
    }
  }
