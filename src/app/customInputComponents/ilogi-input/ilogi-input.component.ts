// import {
//   Component,
//   Input,
//   Output,
//   EventEmitter,
//   OnInit,
//   forwardRef,
// } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import {
//   ReactiveFormsModule,
//   ControlValueAccessor,
//   NG_VALUE_ACCESSOR,
// } from '@angular/forms';
// import { MatInputModule } from '@angular/material/input';
// import { BlockCopyPasteDirective } from '../../directives/block-copy-paste.directive';

// @Component({
//   selector: 'app-ilogi-input',
//   standalone: true,
//   imports: [
//     CommonModule,
//     ReactiveFormsModule,
//     MatInputModule,
//     BlockCopyPasteDirective,
//   ],
//   templateUrl: './ilogi-input.component.html',
//   styleUrls: ['./ilogi-input.component.scss'],
//   providers: [
//     {
//       provide: NG_VALUE_ACCESSOR,
//       useExisting: forwardRef(() => IlogiInputComponent),
//       multi: true,
//     },
//   ],
// })
// export class IlogiInputComponent implements OnInit, ControlValueAccessor {
//   @Input() submitted = false;
//   @Input() fieldLabel: string = '';
//   @Input() hideLabel = false;
//   @Input() fieldId: string = '';
//   @Input() pipe: string = '';
//   @Input() fieldExactVal: string | number | undefined;
//   @Input() errorMessages: { [key: string]: string } = {};
//   @Input() type = 'text';
//   @Input() placeholder = '';
//   @Input() mandatory = false;
//   @Input() appBlockCopyPaste = false;
//   @Input() readonly = false;
//   @Input() maxlength?: string | null | number = '255';
//   @Input() rows?: string | null | number = '2';
//   @Input() errors: { [key: string]: any } | null = null;

//   @Output() blur = new EventEmitter<Event>();

//   errorFieldId = '';
//   isHovered = false;
//   value: any;
//   isDisabled = false;

//   private onChange: (value: any) => void = () => {};
//   private onTouched: () => void = () => {};

//   ngOnInit() {
//     if (this.fieldId) {
//       this.errorFieldId = `invalid-input-${this.fieldId}`;
//     }
//   }

//   get hasErrors(): boolean {
//     return !!this.errors && Object.keys(this.errors).length > 0;
//   }

//   writeValue(value: any): void {
//     this.value = value ?? '';
//   }

//   registerOnChange(fn: (value: any) => void): void {
//     this.onChange = fn;
//   }

//   registerOnTouched(fn: () => void): void {
//     this.onTouched = fn;
//   }

//   setDisabledState(isDisabled: boolean): void {
//     this.isDisabled = isDisabled;
//   }

//   onInputChange(event: Event): void {
//     const input = event.target as HTMLInputElement | HTMLTextAreaElement;
//     this.value = input.value;
//     this.onChange(this.value);
//     this.onTouched();
//   }

//   showErrorOnFieldHover() {
//     this.isHovered = true;
//   }

//   hideErrorOnFieldHoverOut() {
//     this.isHovered = false;
//   }

//   changeBlur(event: Event) {
//     if (!this.readonly) {
//       this.blur.emit(event);
//       this.onTouched();
//     }
//   }

//   checkIsNaN(value: any): boolean {
//     return isNaN(Number(value));
//   }
// }

import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  forwardRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';

// ✅ PrimeNG imports
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { FloatLabelModule } from 'primeng/floatlabel';

import { BlockCopyPasteDirective } from '../../directives/block-copy-paste.directive';

@Component({
  selector: 'app-ilogi-input',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,       // ✅ PrimeNG Input
    TextareaModule,   // ✅ PrimeNG Textarea
    FloatLabelModule,      // ✅ PrimeNG Float Label
    BlockCopyPasteDirective,
  ],
  templateUrl: './ilogi-input.component.html',
  styleUrls: ['./ilogi-input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => IlogiInputComponent),
      multi: true,
    },
  ],
})
export class IlogiInputComponent implements OnInit, ControlValueAccessor {
  @Input() submitted = false;
  @Input() fieldLabel: string = '';
  @Input() hideLabel = false;
  @Input() fieldId: string = '';
  @Input() pipe: string = '';
  @Input() fieldExactVal: string | number | undefined;
  @Input() errorMessages: { [key: string]: string } = {};
  @Input() type = 'text';
  @Input() placeholder = '';
  @Input() mandatory = false;
  @Input() appBlockCopyPaste = false;
  @Input() readonly = false;
  @Input() maxlength?: string | null | number = '255';
  @Input() rows?: string | null | number = '2';
  @Input() errors: { [key: string]: any } | null = null;

  @Output() blur = new EventEmitter<Event>();

  errorFieldId = '';
  isHovered = false;
  value: any;
  isDisabled = false;

  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};

  ngOnInit() {
    if (this.fieldId) {
      this.errorFieldId = `invalid-input-${this.fieldId}`;
    }
  }

  get hasErrors(): boolean {
    return !!this.errors && Object.keys(this.errors).length > 0;
  }

  writeValue(value: any): void {
    this.value = value ?? '';
  }

  registerOnChange(fn: (value: any) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  onInputChange(event: Event): void {
    const input = event.target as HTMLInputElement | HTMLTextAreaElement;
    this.value = input.value;
    this.onChange(this.value);
    this.onTouched();
  }

  showErrorOnFieldHover() {
    this.isHovered = true;
  }

  hideErrorOnFieldHoverOut() {
    this.isHovered = false;
  }

  changeBlur(event: Event) {
    if (!this.readonly) {
      this.blur.emit(event);
      this.onTouched();
    }
  }

  checkIsNaN(value: any): boolean {
    return isNaN(Number(value));
  }
}
