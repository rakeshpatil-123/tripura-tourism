import { Component, Input, OnInit, OnDestroy, ViewChildren, QueryList, forwardRef } from '@angular/core';
import { FormBuilder, FormGroup, NG_VALUE_ACCESSOR, ControlValueAccessor, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { FormConfig, FormFieldConfig } from '../../models/form.models';
import { FormFieldComponent } from '../form-field/form-field.component';
import { ButtonComponent } from "../button-component/button.component";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dynamic-form',
  template: `
    <form [formGroup]="formGroup" (ngSubmit)="onSubmit()" class="dynamic-form">
      <div class="form-fields">
        <app-form-field
          *ngFor="let field of config.fields; trackBy: trackByFieldId"
          [config]="field"
          [formControlName]="field.id"
          (validationChange)="onFieldValidationChange($event, field.id)"
        ></app-form-field>
      </div>
      
      <div class="form-actions">
        <app-button
          [htmlType]="'submit'"
          [type]="config.submitButtonType || 'primary'"
          [size]="config.submitButtonSize || 'medium'"
          [disabled]="!isFormValid"
        >
          {{ config.submitButtonText || 'Submit' }}
        </app-button>
      </div>
    </form>
  `,
  styleUrls: ['./dynamic-form.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DynamicFormComponent),
      multi: true
    }
  ],
  imports: [CommonModule,ReactiveFormsModule, FormFieldComponent, ButtonComponent]
})
export class DynamicFormComponent implements ControlValueAccessor, OnInit, OnDestroy {
  @Input() config!: FormConfig;
  @ViewChildren(FormFieldComponent) fieldComponents!: QueryList<FormFieldComponent>;
  
  formGroup!: FormGroup;
  private fieldValidationStates: { [key: string]: boolean } = {};
  private destroy$ = new Subject<void>();
  
  private onChange = (value: any) => {};
  private onTouched = () => {};

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.initializeForm();
    this.setupFormValueChanges();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm() {
    const formControls: { [key: string]: any } = {};
    
    this.config.fields.forEach(field => {
      formControls[field.id] = [''];
      this.fieldValidationStates[field.id] = !field.mandatory;
    });
    
    this.formGroup = this.fb.group(formControls);
  }

  private setupFormValueChanges() {
    this.formGroup.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(value => {
        this.onChange(value);
        this.updateValidationState();
      });
  }

  onFieldValidationChange(isValid: boolean, fieldId: string) {
    this.fieldValidationStates[fieldId] = isValid;
    this.updateValidationState();
  }

  private updateValidationState() {
    const isValid = Object.values(this.fieldValidationStates).every(valid => valid);
    if (this.config.onValidationChange) {
      this.config.onValidationChange(isValid);
    }
  }

  get isFormValid(): boolean {
    return this.formGroup.valid && Object.values(this.fieldValidationStates).every(valid => valid);
  }

  onSubmit() {
    if (this.isFormValid) {
      this.config.onSubmit(this.formGroup.value);
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.formGroup.controls).forEach(key => {
        this.formGroup.get(key)?.markAsTouched();
      });
    }
  }

  trackByFieldId(index: number, field: FormFieldConfig): string {
    return field.id;
  }

  // Add field dynamically
  addField(fieldConfig: FormFieldConfig) {
    this.config.fields.push(fieldConfig);
    this.formGroup.addControl(fieldConfig.id, this.fb.control(''));
    this.fieldValidationStates[fieldConfig.id] = !fieldConfig.mandatory;
  }

  // Remove field dynamically
  removeField(fieldId: string) {
    this.config.fields = this.config.fields.filter(field => field.id !== fieldId);
    this.formGroup.removeControl(fieldId);
    delete this.fieldValidationStates[fieldId];
  }

  // Update field configuration
  updateField(fieldId: string, newConfig: Partial<FormFieldConfig>) {
    const fieldIndex = this.config.fields.findIndex(field => field.id === fieldId);
    if (fieldIndex !== -1) {
      this.config.fields[fieldIndex] = { ...this.config.fields[fieldIndex], ...newConfig };
    }
  }

  // Get current form data
  getFormData() {
    return this.formGroup.value;
  }

  // Reset form
  resetForm() {
    this.formGroup.reset();
    Object.keys(this.fieldValidationStates).forEach(key => {
      this.fieldValidationStates[key] = !this.config.fields.find(f => f.id === key)?.mandatory;
    });
  }

  // ControlValueAccessor implementation
  writeValue(value: any): void {
    if (value) {
      this.formGroup.patchValue(value, { emitEvent: false });
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    if (isDisabled) {
      this.formGroup.disable();
    } else {
      this.formGroup.enable();
    }
  }
}