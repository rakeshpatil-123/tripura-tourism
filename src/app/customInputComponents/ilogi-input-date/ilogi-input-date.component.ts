import { AfterViewInit, ChangeDetectorRef, Component, Input, OnInit, forwardRef } from '@angular/core';
import { SHARED_IMPORTS } from '../../shared/shared-imports';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { DatePipe, formatDate } from '@angular/common';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import moment from 'moment';
import { CUSTOM_DATE_FORMATS, CustomDateAdapter } from '../../shared/utils/dateformator';

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
    {
      provide: DateAdapter,
      useClass: CustomDateAdapter,
      deps: [MAT_DATE_LOCALE]
    },
    {
      provide: MAT_DATE_FORMATS,
      useValue: CUSTOM_DATE_FORMATS
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

  // New inputs for dynamic date range and custom messages
  @Input() monthsRange: number = 6; // Default to 6 months
  @Input() futureDateErrorMessage: string = 'Future dates are not allowed. Please select a date within the allowed range.';
  @Input() pastDateErrorMessage: string = 'Date must be within the allowed range. Please select a more recent date.';
  @Input() allowFutureDates: boolean = false; // Option to allow future dates
  @Input() futureMonthsRange: number = 0; // How many months in future to allow

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
    // Initial setup - will be updated in ngOnInit
    this.maxDate = new Date();
    this.minDate = new Date();
  }

  ngOnInit() {
    if (this.fieldId) {
      this.errorFieldId = `invalid-input-${this.fieldId}`;
    }

    // Set up date range based on inputs
    this.setupDateRange();
  }

  ngAfterViewInit() {
    this.cdr.detectChanges();
  }

  private setupDateRange(): void {
    const today = new Date();

    // Set max date
    if (this.allowFutureDates && this.futureMonthsRange > 0) {
      this.maxDate = new Date();
      this.maxDate.setMonth(this.maxDate.getMonth() + this.futureMonthsRange);
    } else {
      this.maxDate = new Date(); // Today
    }

    // Set min date
    this.minDate = new Date();
    this.minDate.setMonth(this.minDate.getMonth() - this.monthsRange);

    // Update error messages with dynamic range
    this.updateErrorMessages();
  }

  private updateErrorMessages(): void {
    if (this.futureDateErrorMessage.includes('allowed range')) {
      if (this.allowFutureDates && this.futureMonthsRange > 0) {
        this.futureDateErrorMessage = `Future dates beyond ${this.futureMonthsRange} months are not allowed. Please select a date within the allowed range.`;
      } else {
        this.futureDateErrorMessage = `Future dates are not allowed. Please select a date within the last ${this.monthsRange} months.`;
      }
    }

    if (this.pastDateErrorMessage.includes('allowed range')) {
      this.pastDateErrorMessage = `Date must be within the last ${this.monthsRange} months. Please select a more recent date.`;
    }
  }

  writeValue(value: any): void {
    if (value) {
      // Handle both string and Date inputs
      this.value = moment(value, 'DD-MM-YYYY', true).isValid() ? moment(value, 'DD-MM-YYYY').toDate() : null;
    } else {
      this.value = null;
    }
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
      const selectedDate = moment(value).toDate();
      const today = new Date();
      today.setHours(23, 59, 59, 999); // Set to end of day for comparison

      const pastLimitDate = new Date();
      pastLimitDate.setMonth(pastLimitDate.getMonth() - this.monthsRange);
      pastLimitDate.setHours(0, 0, 0, 0); // Set to start of day for comparison

      // Check future date validation
      if (!this.allowFutureDates && selectedDate > today) {
        this.dateRangeError = this.futureDateErrorMessage;
        this.value = null;
        this.updateDisplayValue();
        this.onChange(this.value);
        this.onTouched();
        this.cdr.detectChanges();
        return;
      } else if (this.allowFutureDates && this.futureMonthsRange > 0) {
        const futureLimitDate = new Date();
        futureLimitDate.setMonth(futureLimitDate.getMonth() + this.futureMonthsRange);
        futureLimitDate.setHours(23, 59, 59, 999);

        if (selectedDate > futureLimitDate) {
          this.dateRangeError = this.futureDateErrorMessage;
          this.value = null;
          this.updateDisplayValue();
          this.onChange(this.value);
          this.onTouched();
          this.cdr.detectChanges();
          return;
        }
      }

      // Check past date validation
      if (selectedDate < pastLimitDate) {
        this.dateRangeError = this.pastDateErrorMessage;
        this.value = null;
        this.updateDisplayValue();
        this.onChange(this.value);
        this.onTouched();
        this.cdr.detectChanges();
        return;
      }
    }

    // If validation passes, set the value
    this.value = value ? moment(value).toDate() : null;
    this.updateDisplayValue();
    this.onChange(this.value);
    this.onTouched();
    this.cdr.detectChanges();
  }

  private updateDisplayValue(): void {
    if (this.value) {
      // Use moment for consistent DD-MM-YYYY formatting
      this.displayValue = moment(this.value).format('DD-MM-YYYY');
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