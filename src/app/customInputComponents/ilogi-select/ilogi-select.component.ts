


import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
  forwardRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { FloatLabelModule } from 'primeng/floatlabel';
import { MultiSelectModule } from 'primeng/multiselect';

export interface SelectOption {
  id: any;
  name: string;
}

@Component({
  selector: 'app-ilogi-select',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    FloatLabelModule,
    SelectModule, 
    MultiSelectModule
  ],
  templateUrl: './ilogi-select.component.html',
  styleUrls: ['./ilogi-select.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => IlogiSelectComponent),
      multi: true,
    },
  ],
})
export class IlogiSelectComponent
  implements OnInit, AfterViewInit, ControlValueAccessor, OnChanges
{
  @ViewChild('searchInput') searchInputRef!: ElementRef<HTMLInputElement>;
  @Input() submitted = false;
  @Input() fieldLabel: string = '';
  @Input() hideLabel = false;
  @Input() fieldId: string = '';
  @Input() fieldExactVal: any = null;
  @Input() errorMessages: { [key: string]: string } = {};
  @Input() placeholder = '';
  @Input() mandatory = false;
  @Input() readonly = false;
  @Input() selectOptions: SelectOption[] = [{ id: '', name: 'Select' }];
  filteredOptions: SelectOption[] = [];
  @Input() enableSearch: boolean = false;
  searchTerm: string = '';
  @Input() errors: { [key: string]: any } | null = null;
  @Input() multiple: boolean = false;
  @Input('multi') set multiAttr(val: any) {
    if (val === '' || val === true || val === 'true') {
      this.multiple = true;
    } else if (val === false || val === 'false') {
      this.multiple = false;
    }
  }
  @Output() change = new EventEmitter<{ value: any }>();
  @Output() blur = new EventEmitter<void>();

  errorFieldId = '';
  isHovered = false;
  value: any = null;
  isDisabled = false;

  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    if (this.fieldId) {
      this.errorFieldId = `invalid-input-${this.fieldId}`;
    }
    this.filteredOptions = this.selectOptions ? [...this.selectOptions] : [];
  }

  ngAfterViewInit() {
    this.cdr.detectChanges();
  }

  get hasErrors(): boolean {
    return !!this.errors && Object.keys(this.errors).length > 0;
  }
  onSearch(term: string): void {
    if (!this.enableSearch) return;
    this.searchTerm = term;
    const lowerTerm = term.toLowerCase();
    this.filteredOptions = this.selectOptions.filter((opt) =>
      opt.name.toLowerCase().includes(lowerTerm)
    );
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectOptions']) {
      this.filteredOptions = [...this.selectOptions];
      this.cdr.detectChanges();
    }
  }

  onDropdownShow(): void {
    this.filteredOptions = this.selectOptions ? [...this.selectOptions] : [];
    this.searchTerm = '';
    if (this.enableSearch) {
      setTimeout(() => {
        this.searchInputRef?.nativeElement.focus();
      }, 100);
    }
  }

  // writeValue(value: any): void {
  //   this.value = value;
  //   this.cdr.detectChanges();
  // }
  //   writeValue(value: any): void {
  //   if (value !== undefined && value !== null) {
  //   this.value = value;
  //   setTimeout(() => {
  //     this.value = value;
  //     this.cdr.detectChanges();
  //   });
  //   }
  // }
  writeValue(value: any): void {
  if (value === undefined) {
  this.value = this.multiple ? [] : null;
      this.cdr.detectChanges();
      return;
    }
    this.value = value;
    if (this.multiple) {
      if (!Array.isArray(this.value)) {
        this.value = this.value ? [this.value] : [];
      }
    } else {
      if (Array.isArray(this.value)) {
        this.value = this.value.length ? this.value[0] : null;
      }
    }
    setTimeout(() => this.cdr.detectChanges());
}

  registerOnChange(fn: (value: any) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
    this.cdr.detectChanges();
  }

  showErrorOnFieldHover(): void {
    this.isHovered = true;
  }

  hideErrorOnFieldHoverOut(): void {
    this.isHovered = false;
  }

  onChangeControl(value: any): void {
    if (!this.readonly && !this.isDisabled) {
      this.value = value;
      this.onChange(this.value);
      this.onTouched();
      this.change.emit({ value });
      this.cdr.detectChanges();
    }
  }

  onBlur(): void {
    this.onTouched();
    this.blur.emit();
  }

  // getDisplayName(value: any): string {
  //   if (value === null || value === undefined) return '';

  //   const option = this.selectOptions.find((opt) => opt.id === value);
  //   return option ? option.name : '';
  // }
  getDisplayName(value: any): string {
    if (value === null || value === undefined) return '';
    if (this.multiple && Array.isArray(value)) {
      const names = value
        .map((val: any) => {
          const opt = this.selectOptions.find((o) => o.id === val);
          return opt ? opt.name : '';
        })
        .filter((n) => !!n);
      return names.join(', ');
    }
    const option = this.selectOptions.find((opt) => opt.id === value);
    return option ? option.name : '';
  }
}
