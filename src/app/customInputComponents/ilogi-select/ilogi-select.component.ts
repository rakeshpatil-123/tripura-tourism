import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, forwardRef } from '@angular/core';
import { SHARED_IMPORTS } from '../../shared/shared-imports';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-ilogi-select',
  standalone: true,
  imports: [...SHARED_IMPORTS, MatSelectModule, MatFormFieldModule],
  templateUrl: './ilogi-select.component.html',
  styleUrls: ['./ilogi-select.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => IlogiSelectComponent),
      multi: true
    }
  ]
})
export class IlogiSelectComponent implements OnInit, AfterViewInit, ControlValueAccessor {
  @Input() submitted = false;
  @Input() fieldLabel: string = '';
  @Input() hideLabel = false;
  @Input() fieldId: string = '';
  @Input() fieldExactVal: any = null;
  @Input() errorMessages: { [key: string]: string } = {};
  @Input() placeholder = '';
  @Input() mandatory = false;
  @Input() readonly = false;
  @Input() selectOptions?: { id: any; name: string }[] = [{ id: '', name: 'Select' }];
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

  getDisplayName(value: any): string {
    const option = this.selectOptions!.find(opt => opt.id === value);
    return option ? option.name : '';
  }
}