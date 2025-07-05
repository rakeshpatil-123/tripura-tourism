export interface ValidationRule {
  type: 'required' | 'email' | 'minLength' | 'maxLength' | 'pattern' | 'custom';
  value?: any;
  message: string;
  customValidator?: (value: any) => boolean;
}

export interface FormFieldOption {
  value: any;
  label: string;
  disabled?: boolean;
}

export interface FormFieldConfig {
  id: string;
  type: 'text' | 'email' | 'date' | 'custom' | 'select' | 'checkbox' | 'radio' | 'textarea';
  label?: string;
  placeholder?: string;
  mandatory?: boolean;
  priority?: number; 
  validations?: ValidationRule[];
  customComponent?: any;
  customProps?: any;
  options?: FormFieldOption[]; 
  disabled?: boolean;
}

export interface FormConfig {
  fields: FormFieldConfig[];
  submitButtonText?: string;
  submitButtonType?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
  submitButtonSize?: 'small' | 'medium' | 'large';
  onSubmit: (formData: any) => void;
  onValidationChange?: (isValid: boolean) => void;
}