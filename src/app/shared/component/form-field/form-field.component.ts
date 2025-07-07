import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, forwardRef, Injector } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormControl, Validators, AbstractControl } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { ValidationRule, FormFieldConfig } from '../../models/form.models';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { IlogiInputDateComponent } from "../../../customInputComponents/ilogi-input-date/ilogi-input-date.component";
import { IlogiInputComponent } from "../../../customInputComponents/ilogi-input/ilogi-input.component";

@Component({
  imports: [CommonModule, ReactiveFormsModule, IlogiInputDateComponent],
  standalone: true,
  selector: 'app-form-field',
  template: `
    <div class="form-field-container" [attr.data-priority]="config.priority || 999">
      <label *ngIf="config.label" [for]="config.id" class="form-label">
        {{ config.label }}
        <span *ngIf="config.mandatory" class="required-indicator">*</span>
        <span *ngIf="showPriorityIndicator && config.priority" class="priority-indicator">
          Priority: {{ config.priority }}
        </span>
      </label>
      
      <!-- Text Input -->
      <input
        *ngIf="config.type === 'text'"
        [id]="config.id"
        type="text"
        class="form-input"
        [class.error]="hasError"
        [class.success]="isValid && control.value"
        [class.high-priority]="isHighPriority"
        [placeholder]="config.placeholder || ''"
        [formControl]="control"
        [attr.data-priority]="config.priority"
        (blur)="onBlur()"
        (focus)="onFocus()"
      />
      
      <!-- Textarea -->
      <textarea
        *ngIf="config.type === 'textarea'"
        [id]="config.id"
        class="form-textarea"
        [class.error]="hasError"
        [class.success]="isValid && control.value"
        [class.high-priority]="isHighPriority"
        [placeholder]="config.placeholder || 'Enter text here...'"
        [formControl]="control"
        [attr.data-priority]="config.priority"
        (blur)="onBlur()"
        (focus)="onFocus()"
      ></textarea>

      <!-- Email Input -->
      <input
        *ngIf="config.type === 'email'"
        [id]="config.id"
        type="email"
        class="form-input"
        [class.error]="hasError"
        [class.success]="isValid && control.value"
        [class.high-priority]="isHighPriority"
        [placeholder]="config.placeholder || 'Enter email address'"
        [formControl]="control"
        [attr.data-priority]="config.priority"
        (blur)="onBlur()"
        (focus)="onFocus()"
      />
      
      <!-- Date Input -->
      <app-ilogi-input-date
        *ngIf="config.type === 'date'"
        [id]="config.id"
        [formControl]="control"
        [placeholder]="config.placeholder || 'Select date'"
        [class.error]="hasError"
        [class.success]="isValid && control.value"
        [class.high-priority]="isHighPriority"
        [attr.data-priority]="config.priority"
        (blur)="onBlur()"
        (focus)="onFocus()"
      ></app-ilogi-input-date>
      
      <!-- Select Dropdown -->
      <select
        *ngIf="config.type === 'select'"
        [id]="config.id"
        class="form-select"
        [class.error]="hasError"
        [class.success]="isValid && control.value"
        [class.high-priority]="isHighPriority"
        [formControl]="control"
        [attr.data-priority]="config.priority"
        (blur)="onBlur()"
        (focus)="onFocus()"
      >
        <option value="" disabled>{{ config.placeholder || 'Select an option' }}</option>
        <option *ngFor="let option of config.options" [value]="option.value">
          {{ option.label }}
        </option>
      </select>
      
      <!-- Checkbox -->
      <div *ngIf="config.type === 'checkbox'" class="checkbox-container">
        <input
          [id]="config.id"
          type="checkbox"
          class="form-checkbox"
          [class.error]="hasError"
          [class.high-priority]="isHighPriority"
          [formControl]="control"
          [attr.data-priority]="config.priority"
          (blur)="onBlur()"
          (focus)="onFocus()"
        />
        <label [for]="config.id" class="checkbox-label">
          {{ config.placeholder || config.label }}
        </label>
      </div>
      
      <!-- Radio Group -->
      <div *ngIf="config.type === 'radio'" class="radio-group" [attr.data-priority]="config.priority">
        <div *ngFor="let option of config.options" class="radio-item">
          <input
            [id]="config.id + '_' + option.value"
            type="radio"
            [name]="config.id"
            [value]="option.value"
            class="form-radio"
            [class.error]="hasError"
            [class.high-priority]="isHighPriority"
            [formControl]="control"
            (blur)="onBlur()"
            (focus)="onFocus()"
          />
          <label [for]="config.id + '_' + option.value" class="radio-label">
            {{ option.label }}
          </label>
        </div>
      </div>
      
      <!-- Custom Component -->
      <ng-container *ngIf="config.type === 'custom' && config.customComponent">
        <ng-container *ngComponentOutlet="config.customComponent; injector: customInjector"></ng-container>
      </ng-container>
      
      <!-- Error Messages -->
      <div *ngIf="hasError && (control.dirty || control.touched)" class="error-messages">
        <span *ngFor="let error of errorMessages" class="error-message">
          {{ error }}
        </span>
      </div>
      
      <!-- Validation Success Indicator -->
      <div *ngIf="isValid && control.value && showValidationSuccess" class="success-message">
        <span class="success-icon">✓</span>
        <span>Valid</span>
      </div>
    </div>
  `,
  styleUrls: ['./form-field.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FormFieldComponent),
      multi: true
    }
  ]
})
export class FormFieldComponent implements ControlValueAccessor, OnInit, OnDestroy {
  @Input() config!: FormFieldConfig;
  @Input() showPriorityIndicator: boolean = false; // Option to show priority numbers
  @Input() showValidationSuccess: boolean = true; // Option to show success indicators
  @Input() highPriorityThreshold: number = 3; // Fields with priority <= this are considered high priority
  @Output() validationChange = new EventEmitter<boolean>();
  
  control = new FormControl('');
  customInjector: Injector | undefined;
  private destroy$ = new Subject<void>();
  
  private onChange = (value: any) => {};
  private onTouched = () => {};

  constructor(private injector: Injector) {}

  ngOnInit() {
    this.setupValidation();
    this.setupValueChanges();
    this.setupCustomComponent();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupValidation() {
    const validators: any[] = [];
    
    if (this.config.mandatory) {
      validators.push(Validators.required);
    }
    
    if (this.config.validations) {
      this.config.validations.forEach(rule => {
        switch (rule.type) {
          case 'required':
            validators.push(Validators.required);
            break;
          case 'email':
            validators.push(Validators.email);
            break;
          case 'minLength':
            validators.push(Validators.minLength(rule.value));
            break;
          case 'maxLength':
            validators.push(Validators.maxLength(rule.value));
            break;
          case 'pattern':
            validators.push(Validators.pattern(rule.value));
            break;
          case 'custom':
            if (rule.customValidator) {
              validators.push(this.customValidator(rule.customValidator, rule.message));
            }
            break;
        }
      });
    }
    
    this.control.setValidators(validators);
  }

  private setupValueChanges() {
    this.control.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(value => {
        this.onChange(value);
        this.validationChange.emit(this.isValid);
      });
  }

  private setupCustomComponent() {
    if (this.config.type === 'custom' && this.config.customComponent) {
      // Create custom injector with additional providers if needed
      this.customInjector = Injector.create({
        providers: [
          { provide: 'FormFieldConfig', useValue: this.config },
          { provide: FormControl, useValue: this.control }
        ],
        parent: this.injector
      });
    }
  }

  private customValidator(validatorFn: (value: any) => boolean, message: string) {
    return (control: AbstractControl) => {
      if (!control.value) return null;
      return validatorFn(control.value) ? null : { custom: { message } };
    };
  }

  get hasError(): boolean {
    return this.control.invalid && (this.control.dirty || this.control.touched);
  }

  get isValid(): boolean {
    return this.control.valid && !!this.control.value;
  }

  get isHighPriority(): boolean {
    return this.config.priority ? this.config.priority <= this.highPriorityThreshold : false;
  }

  get errorMessages(): string[] {
    const errors: string[] = [];
    
    if (this.control.errors) {
      // Check for custom validation messages first
      if (this.config.validations) {
        this.config.validations.forEach(rule => {
          const errorKey = this.getErrorKeyForValidationType(rule.type);
          if (this.control.errors![errorKey]) {
            errors.push(rule.message);
          }
        });
      }
      
      // Fallback to default error messages
      Object.keys(this.control.errors).forEach(key => {
        if (!errors.some(msg => msg)) { // Only add if no custom message was found
          switch (key) {
            case 'required':
              errors.push(`${this.config.label || 'This field'} is required`);
              break;
            case 'email':
              errors.push('Please enter a valid email address');
              break;
            case 'minlength':
              errors.push(`Minimum length is ${this.control.errors![key].requiredLength}`);
              break;
            case 'maxlength':
              errors.push(`Maximum length is ${this.control.errors![key].requiredLength}`);
              break;
            case 'pattern':
              errors.push('Please enter a valid format');
              break;
            case 'custom':
              errors.push(this.control.errors![key].message);
              break;
          }
        }
      });
    }
    
    return errors.filter(Boolean); // Remove empty messages
  }

  private getErrorKeyForValidationType(type: string): string {
    switch (type) {
      case 'minLength': return 'minlength';
      case 'maxLength': return 'maxlength';
      default: return type;
    }
  }

  onBlur() {
    this.onTouched();
  }

  onFocus() {
    // Handle focus events if needed
    // Could emit focus events for analytics or form behavior tracking
  }

  // ControlValueAccessor implementation
  writeValue(value: any): void {
    this.control.setValue(value, { emitEvent: false });
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    if (isDisabled) {
      this.control.disable();
    } else {
      this.control.enable();
    }
  }
}