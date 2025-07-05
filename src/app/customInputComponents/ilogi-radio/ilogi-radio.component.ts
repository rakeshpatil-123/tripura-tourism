import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, forwardRef } from '@angular/core';
import { SHARED_IMPORTS } from '../../shared/shared-imports';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatRadioModule } from '@angular/material/radio';

@Component({
  selector: 'app-ilogi-radio',
  standalone: true,
  imports: [...SHARED_IMPORTS, MatRadioModule],
  templateUrl: './ilogi-radio.component.html',
  styleUrls: ['./ilogi-radio.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => IlogiRadioComponent),
      multi: true
    }
  ]
})
export class IlogiRadioComponent implements OnInit, AfterViewInit, ControlValueAccessor {
  @Input() submitted = false;
  @Input() fieldLabel: string = '';
  @Input() hideLabel = false;
  @Input() fieldId: string = '';
  @Input() fieldExactVal: any = null;
  @Input() errorMessages: { [key: string]: string } = {};
  @Input() mandatory = false;
  @Input() readonly = false;
  @Input() radioOptions = [
    { value: '1', name: 'Yes' },
    { value: '0', name: 'No' }
  ];
  @Input() errors: { [key: string]: any } | null = null;
  @Output() change = new EventEmitter<{ value: any }>();

  errorFieldId = '';
  isHovered = false;
  value: any = null;
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

  showErrorOnFieldHover() {
    this.isHovered = true;
  }

  hideErrorOnFieldHoverOut() {
    this.isHovered = false;
  }

  onChangeControl(value: any) {
    if (!this.readonly && !this.isDisabled) {
      this.value = value;
      this.onChange(this.value);
      this.onTouched();
      this.change.emit({ value });
      this.cdr.detectChanges();
    }
  }
}