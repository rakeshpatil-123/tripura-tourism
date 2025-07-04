import { AfterViewInit, ChangeDetectorRef, Component, Input, OnInit, forwardRef } from '@angular/core';
import { SHARED_IMPORTS } from '../../shared/shared-imports';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { DatePipe, formatDate } from '@angular/common';

@Component({
  selector: 'app-ilogi-input-date',
  standalone: true,
  imports: [...SHARED_IMPORTS, MatInputModule, MatDatepickerModule, MatNativeDateModule, MatIconModule],
  templateUrl: './ilogi-input-date.component.html',
  styleUrls: ['./ilogi-input-date.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => IlogiInputDateComponent),
      multi: true
    },
    DatePipe
  ]
})
export class IlogiInputDateComponent implements OnInit, AfterViewInit, ControlValueAccessor {
  @Input() submitted = false;
  @Input() fieldLabel: string = '';
  @Input() fieldId: string = '';
  @Input() errorMessages: { [key: string]: string } = {};
  @Input() placeholder = 'DD-MM-YYYY';
  @Input() mandatory = false;
  @Input() appBlockCopyPaste = false;
  @Input() readonly = true;
  @Input() errors: { [key: string]: any } | null = null;

  errorFieldId = '';
  isHovered = false;
  value: Date | null = null;
  displayValue: string = '';
  isDisabled = false;
  dateRangeError = '';

  // Date range properties
  minDate: Date;
  maxDate: Date;

  private onChange: (value: any) => void = () => { };
  private onTouched: () => void = () => { };

  constructor(private cdr: ChangeDetectorRef, private datePipe: DatePipe) {
    // Set date range: 6 months ago to today
    this.maxDate = new Date();
    this.minDate = new Date();
    this.minDate.setMonth(this.minDate.getMonth() - 6);
  }

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
    this.updateDisplayValue();
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
    this.dateRangeError = '';

    // Validate date range
    if (value) {
      const selectedDate = new Date(value);
      const today = new Date();
      today.setHours(23, 59, 59, 999); // Set to end of day for comparison
      
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      sixMonthsAgo.setHours(0, 0, 0, 0); // Set to start of day for comparison

      if (selectedDate > today) {
        this.dateRangeError = 'Future dates are not allowed. Please select a date within the last 6 months.';
        this.value = null;
        this.updateDisplayValue();
        this.onChange(this.value);
        this.onTouched();
        this.cdr.detectChanges();
        return;
      } else if (selectedDate < sixMonthsAgo) {
        this.dateRangeError = 'Date must be within the last 6 months. Please select a more recent date.';
        this.value = null;
        this.updateDisplayValue();
        this.onChange(this.value);
        this.onTouched();
        this.cdr.detectChanges();
        return;
      }
    }

    // If validation passes, set the value
    this.value = value;
    this.updateDisplayValue();
    this.onChange(this.value);
    this.onTouched();
    this.cdr.detectChanges();
  }

  private updateDisplayValue(): void {
    if (this.value) {
      // Format as DD-MM-YYYY
      const day = this.value.getDate().toString().padStart(2, '0');
      const month = (this.value.getMonth() + 1).toString().padStart(2, '0');
      const year = this.value.getFullYear();
      this.displayValue = `${day}-${month}-${year}`;
    } else {
      this.displayValue = '';
    }
  }

  showErrorOnFieldHover() {
    this.isHovered = true;
  }

  hideErrorOnFieldHoverOut() {
    this.isHovered = false;
  }
}