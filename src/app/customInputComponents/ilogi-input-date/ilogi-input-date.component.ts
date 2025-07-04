import { AfterViewInit, ChangeDetectorRef, Component, Input, OnInit, forwardRef } from '@angular/core';
import { SHARED_IMPORTS } from '../../shared/shared-imports';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

@Component({
  selector: 'app-ilogi-input-date',
  standalone: true,
  imports: [...SHARED_IMPORTS, MatInputModule, MatDatepickerModule, MatNativeDateModule],
  templateUrl: './ilogi-input-date.component.html',
  styleUrls: ['./ilogi-input-date.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => IlogiInputDateComponent),
      multi: true
    }
  ]
})
export class IlogiInputDateComponent implements OnInit, AfterViewInit, ControlValueAccessor {
  @Input() submitted = false;
  @Input() fieldLabel: string = '';
  @Input() fieldId: string = '';
  @Input() errorMessages: { [key: string]: string } = {};
  @Input() placeholder = 'DD/MM/YYYY';
  @Input() mandatory = false;
  @Input() appBlockCopyPaste = false;
  @Input() readonly = false;
  @Input() errors: { [key: string]: any } | null = null;

  errorFieldId = '';
  isHovered = false;
  value: Date | null = null;
  isDisabled = false;

  private onChange: (value: any) => void = () => { };
  private onTouched: () => void = () => { };

  constructor(private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    if (this.fieldId) {
      this.errorFieldId = `invalid-input-${this.fieldId}`;
    }
  }

  ngAfterViewInit() {
    this.cdr.detectChanges();
  }

  writeValue(value: any): void {
    this.value = value ? new Date(value) : null;
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

  onDateChange(value: any): void {
    this.value = value;
    this.onChange(this.value);
    this.onTouched();
  }

  showErrorOnFieldHover() {
    this.isHovered = true;
  }

  hideErrorOnFieldHoverOut() {
    this.isHovered = false;
  }
}