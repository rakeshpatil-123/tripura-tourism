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
import { SHARED_IMPORTS } from '../../shared/shared-imports';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {
  MatNativeDateModule,
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
} from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule, DatePipe, formatDate } from '@angular/common';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import moment from 'moment';
import {
  CUSTOM_DATE_FORMATS,
  CustomDateAdapter,
} from '../../shared/utils/dateformator';

@Component({
  selector: 'app-ilogi-input-date',
  standalone: true,
  imports: [
    ...SHARED_IMPORTS,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    CommonModule,
  ],
  templateUrl: './ilogi-input-date.component.html',
  styleUrls: ['./ilogi-input-date.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => IlogiInputDateComponent),
      multi: true,
    },
    {
      provide: DateAdapter,
      useClass: CustomDateAdapter,
      deps: [MAT_DATE_LOCALE],
    },
    {
      provide: MAT_DATE_FORMATS,
      useValue: CUSTOM_DATE_FORMATS,
    },
    DatePipe,
  ],
})
export class IlogiInputDateComponent
  implements OnInit, AfterViewInit, ControlValueAccessor
{
  @Input() submitted = false;
  @Input() fieldLabel: string = '';
  @Input() fieldId: string = '';
  @Input() errorMessages: { [key: string]: string } = {};
  @Input() placeholder = 'DD-MM-YYYY';
  @Input() mandatory = false;
  @Input() readonly = false;
  @Input() errors: { [key: string]: any } | null = null;

  // New inputs for dynamic date range and custom messages
  @Input() monthsRange: number = 6;
  @Input() futureDateErrorMessage: string =
    'Future dates are not allowed. Please select a date within the allowed range.';
  @Input() pastDateErrorMessage: string =
    'Date must be within the allowed range. Please select a more recent date.';
  @Input() allowFutureDates: boolean = false;
  @Input() futureMonthsRange: number = 0;

  // Output for blur event
  @Output() blur = new EventEmitter<Event>();

  errorFieldId = '';
  isHovered = false;
  value: Date | null = null;
  isDisabled = false;
  dateRangeError = '';

  // Date range properties
  minDate: Date = new Date();
  maxDate: Date = new Date();

  // ControlValueAccessor callbacks
  private onChange: (value: Date | null) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(private cdr: ChangeDetectorRef, private datePipe: DatePipe) {}

  ngOnInit() {
    if (this.fieldId) {
      this.errorFieldId = `invalid-input-${this.fieldId}`;
    }
    this.setupDateRange();
  }

  ngAfterViewInit() {
    this.cdr.detectChanges();
  }

  get hasErrors(): boolean {
    return !!this.errors && Object.keys(this.errors).length > 0;
  }

  private setupDateRange(): void {
    const today = new Date();

    // Set max date
    if (this.allowFutureDates && this.futureMonthsRange > 0) {
      this.maxDate = new Date();
      this.maxDate.setMonth(this.maxDate.getMonth() + this.futureMonthsRange);
    } else {
      this.maxDate = new Date();
    }

    // Set min date
    this.minDate = new Date();
    this.minDate.setMonth(this.minDate.getMonth() - this.monthsRange);

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

  // ControlValueAccessor implementation
  writeValue(value: Date | string | null): void {
    if (value) {
      if (typeof value === 'string') {
        this.value = moment(value, ['DD-MM-YYYY', 'YYYY-MM-DD'], true).isValid()
          ? moment(value, ['DD-MM-YYYY', 'YYYY-MM-DD']).toDate()
          : null;
      } else if (value instanceof Date) {
        this.value = value;
      } else {
        this.value = null;
      }
    } else {
      this.value = null;
    }
    this.cdr.detectChanges();
  }

  registerOnChange(fn: (value: Date | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
    this.cdr.detectChanges();
  }

  // Handle date changes from date picker
  onDateChange(value: Date | null): void {
    this.dateRangeError = '';
    this.onTouched(); // Mark as touched when user interacts

    if (value) {
      const selectedDate = new Date(value);
      const today = new Date();
      today.setHours(23, 59, 59, 999);

      const pastLimitDate = new Date();
      pastLimitDate.setMonth(pastLimitDate.getMonth() - this.monthsRange);
      pastLimitDate.setHours(0, 0, 0, 0);

      // Check future date validation
      if (!this.allowFutureDates && selectedDate > today) {
        this.dateRangeError = this.futureDateErrorMessage;
        this.value = null;
        this.onChange(null);
        this.cdr.detectChanges();
        return;
      } else if (this.allowFutureDates && this.futureMonthsRange > 0) {
        const futureLimitDate = new Date();
        futureLimitDate.setMonth(
          futureLimitDate.getMonth() + this.futureMonthsRange
        );
        futureLimitDate.setHours(23, 59, 59, 999);

        if (selectedDate > futureLimitDate) {
          this.dateRangeError = this.futureDateErrorMessage;
          this.value = null;
          this.onChange(null);
          this.cdr.detectChanges();
          return;
        }
      }

      // Check past date validation
      if (selectedDate < pastLimitDate) {
        this.dateRangeError = this.pastDateErrorMessage;
        this.value = null;
        this.onChange(null);
        this.cdr.detectChanges();
        return;
      }
    }

    // If validation passes, set the value
    this.value = value;
    this.onChange(this.value); // Notify Angular forms of the change
    this.cdr.detectChanges();
  }

  // Handle blur event
  onBlur(event: Event): void {
    this.onTouched(); // Mark as touched when field loses focus
    this.blur.emit(event); // Emit custom blur event
  }

  // Hover effects for error display
  showErrorOnFieldHover(): void {
    this.isHovered = true;
  }

  hideErrorOnFieldHoverOut(): void {
    this.isHovered = false;
  }

  // Utility method to format date for display
  formatDate(date: Date | null): string {
    if (!date) return '';
    return this.datePipe.transform(date, 'dd/MM/yyyy') || '';
  }
}
