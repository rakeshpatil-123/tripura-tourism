import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

interface CheckboxOption {
  value: string;
  name: string;
}

@Component({
  selector: 'app-ilogi-checkbox',
  templateUrl: './ilogi-checkbox.component.html',
  styleUrls: ['./ilogi-checkbox.component.scss'],
  imports: [CommonModule, ReactiveFormsModule],
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => IlogiCheckboxComponent),
      multi: true
    }
  ]
})
export class IlogiCheckboxComponent implements ControlValueAccessor {
  @Input() fieldLabel: string = '';
  @Input() mandatory: boolean = false;
  @Input() checkboxOptions: CheckboxOption[] = [];
  
  selectedValues: string[] = [];
  isDisabled = false;
  showError = false;
  errorMessage = '';

  // ControlValueAccessor callbacks
  onChange = (value: string[]) => {};
  onTouched = () => {};

  writeValue(value: string[]): void {
    this.selectedValues = value || [];
  }

  registerOnChange(fn: (value: string[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  isSelected(value: string): boolean {
    return this.selectedValues.includes(value);
  }

  onCheckboxChange(value: string, event: any): void {
    if (this.isDisabled) return;
    
    const isChecked = event.target.checked;
    
    if (isChecked) {
      this.selectedValues = [...this.selectedValues, value];
    } else {
      this.selectedValues = this.selectedValues.filter(v => v !== value);
    }
    
    this.onChange(this.selectedValues);
    this.onTouched();
  }

  setShowError(show: boolean, message: string = ''): void {
    this.showError = show;
    this.errorMessage = message;
  }

isDropdownOpen = false;

toggleDropdown(): void {
  this.isDropdownOpen = !this.isDropdownOpen;
}

getSelectedNames(): string {
  const selected = this.checkboxOptions
    .filter(opt => this.selectedValues.includes(opt.value))
    .map(opt => opt.name);
  return selected.length > 0 ? selected.join(', ') : '';
}


}