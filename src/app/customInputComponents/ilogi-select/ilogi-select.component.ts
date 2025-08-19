// import {
//   AfterViewInit,
//   ChangeDetectorRef,
//   Component,
//   EventEmitter,
//   Input,
//   OnInit,
//   Output,
//   forwardRef,
// } from '@angular/core';
// import { SHARED_IMPORTS } from '../../shared/shared-imports';
// import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
// import { MatSelectModule } from '@angular/material/select';
// import { MatFormFieldModule } from '@angular/material/form-field';
// import { CommonModule } from '@angular/common';

// export interface SelectOption {
//   id: any;
//   name: string;
// }

// @Component({
//   selector: 'app-ilogi-select',
//   standalone: true,
//   imports: [
//     ...SHARED_IMPORTS,
//     MatSelectModule,
//     MatFormFieldModule,
//     CommonModule,
//   ],
//   templateUrl: './ilogi-select.component.html',
//   styleUrls: ['./ilogi-select.component.scss'],
//   providers: [
//     {
//       provide: NG_VALUE_ACCESSOR,
//       useExisting: forwardRef(() => IlogiSelectComponent),
//       multi: true,
//     },
//   ],
// })
// export class IlogiSelectComponent
//   implements OnInit, AfterViewInit, ControlValueAccessor
// {
//   @Input() submitted = false;
//   @Input() fieldLabel: string = '';
//   @Input() hideLabel = false;
//   @Input() fieldId: string = '';
//   @Input() fieldExactVal: any = null;
//   @Input() errorMessages: { [key: string]: string } = {};
//   @Input() placeholder = '';
//   @Input() mandatory = false;
//   @Input() readonly = false;
//   @Input() selectOptions: SelectOption[] = [{ id: '', name: 'Select' }];
//   @Input() errors: { [key: string]: any } | null = null;

//   @Output() change = new EventEmitter<{ value: any }>();
//   @Output() blur = new EventEmitter<void>(); // Add blur output

//   errorFieldId = '';
//   isHovered = false;
//   value: any = null;
//   isDisabled = false;

//   private onChange: (value: any) => void = () => {};
//   private onTouched: () => void = () => {};

//   constructor(private cdr: ChangeDetectorRef) {}

//   ngOnInit() {
//     if (this.fieldId) {
//       this.errorFieldId = `invalid-input-${this.fieldId}`;
//     }
//   }

//   ngAfterViewInit() {
//     this.cdr.detectChanges();
//   }

//   get hasErrors(): boolean {
//     return !!this.errors && Object.keys(this.errors).length > 0;
//   }

//   writeValue(value: any): void {
//     this.value = value;
//     this.cdr.detectChanges();
//   }

//   registerOnChange(fn: (value: any) => void): void {
//     this.onChange = fn;
//   }

//   registerOnTouched(fn: () => void): void {
//     this.onTouched = fn;
//   }

//   setDisabledState(isDisabled: boolean): void {
//     this.isDisabled = isDisabled;
//     this.cdr.detectChanges();
//   }

//   showErrorOnFieldHover(): void {
//     this.isHovered = true;
//   }

//   hideErrorOnFieldHoverOut(): void {
//     this.isHovered = false;
//   }

//   onChangeControl(value: any): void {
//     if (!this.readonly && !this.isDisabled) {
//       this.value = value;
//       this.onChange(this.value);
//       this.onTouched();
//       this.change.emit({ value });
//       this.cdr.detectChanges();
//     }
//   }

//   onBlur(): void {
//     this.onTouched();
//     this.blur.emit();
//   }

//   getDisplayName(value: any): string {
//     if (value === null || value === undefined) return '';

//     const option = this.selectOptions.find((opt) => opt.id === value);
//     return option ? option.name : '';
//   }
// }


import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  forwardRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { FloatLabelModule } from 'primeng/floatlabel';

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
  implements OnInit, AfterViewInit, ControlValueAccessor
{
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
  @Input() errors: { [key: string]: any } | null = null;

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
  }

  ngAfterViewInit() {
    this.cdr.detectChanges();
  }

  get hasErrors(): boolean {
    return !!this.errors && Object.keys(this.errors).length > 0;
  }

  writeValue(value: any): void {
    this.value = value;
    this.cdr.detectChanges();
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

  getDisplayName(value: any): string {
    if (value === null || value === undefined) return '';

    const option = this.selectOptions.find((opt) => opt.id === value);
    return option ? option.name : '';
  }
}
