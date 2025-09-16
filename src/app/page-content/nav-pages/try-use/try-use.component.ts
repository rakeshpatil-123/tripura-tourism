import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../../shared/component/button-component/button.component';

@Component({
  selector: 'app-try-use',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ButtonComponent],
  templateUrl: './try-use.component.html',
  styleUrls: ['./try-use.component.scss']
})
export class TryUseComponent implements OnInit, OnDestroy {
  // Loading states for different buttons
  isLoading = false;
  isLoading2 = false;
  isLoading3 = false;
  
  // Action log to track button clicks
  actionLog: string[] = [];
  
  // Form data
  formText = '';

  // Code examples for each section
  buttonTypesHtml = `
<div class="button-group">
  <app-button text="Primary" type="primary" (clicked)="onButtonClick('Primary clicked')"></app-button>
  <app-button text="Secondary" type="secondary" (clicked)="onButtonClick('Secondary clicked')"></app-button>
  <app-button text="Outline" type="outline" (clicked)="onButtonClick('Outline clicked')"></app-button>
  <app-button text="Ghost" type="ghost" (clicked)="onButtonClick('Ghost clicked')"></app-button>
  <app-button text="Danger" type="danger" (clicked)="onButtonClick('Danger clicked')"></app-button>
  <app-button text="Success" type="success" (clicked)="onButtonClick('Success clicked')"></app-button>
  <app-button text="Designer" type="designer" (clicked)="onButtonClick('Designer clicked')"></app-button>
</div>`;

  buttonSizesHtml = `
<div class="button-group">
  <app-button text="Small" type="designer" size="small" (clicked)="bngPrint()"></app-button>
  <app-button text="Medium" type="designer" size="medium" (clicked)="bngPrint2()"></app-button>
  <app-button text="Large" type="designer" size="large" (clicked)="tryNewFunction()"></app-button>
  <app-button text="XLarge" type="designer" size="xlarge" (clicked)="tryXLargeFunction()"></app-button>
  <app-button text="XXLarge" type="designer" size="xxlarge" (clicked)="tryXXLargeFunction()"></app-button>
</div>`;

  buttonSizesTs = `
bngPrint(): void {
  console.log("bng - Small button clicked!");
  this.addToLog('bngPrint() method called - Small button clicked');
}

bngPrint2(): void {
  console.log("bng - mid button clicked!");
  this.addToLog('bngPrint() method called - mid button clicked');
}

tryNewFunction(): void {
  console.log("hiiii");
  this.addToLog('Large button clicked - Hi!');
}

tryXLargeFunction(): void {
  console.log("XLarge button clicked!");
  this.addToLog('XLarge button clicked');
}

tryXXLargeFunction(): void {
  console.log("XXLarge button clicked!");
  this.addToLog('XXLarge button clicked');
}`;

  buttonsWithIconsHtml = `
<div class="button-group">
  <app-button text="Search" icon="search" type="primary" (clicked)="onButtonClick('Search clicked')"></app-button>
  <app-button text="Edit" icon="edit" type="secondary" (clicked)="onButtonClick('Edit clicked')"></app-button>
  <app-button icon="trash" type="danger" ariaLabel="Delete item" (clicked)="onButtonClick('Delete clicked')"></app-button>
  <app-button text="Download" icon="download" type="success" (clicked)="onButtonClick('Download clicked')"></app-button>
</div>`;

  fullWidthDisabledHtml = `
<div class="button-group full-width-demo">
  <app-button text="Full Width Button" type="primary" [fullWidth]="true" (clicked)="onButtonClick('Full width clicked')"></app-button>
  <app-button text="Disabled Button" type="secondary" [disabled]="true"></app-button>
  <app-button text="Disabled Primary" type="primary" [disabled]="true"></app-button>
</div>`;

  loadingStateHtml = `
<div class="button-group">
  <app-button 
    text="Save Changes" 
    type="success" 
    [loading]="isLoading" 
    (clicked)="toggleLoading()">
  </app-button>
  <app-button 
    text="Submit Form" 
    type="primary" 
    htmlType="submit" 
    [loading]="isLoading2"
    (clicked)="toggleLoading2()">
  </app-button>
  <app-button 
    icon="refresh-cw" 
    type="outline" 
    [loading]="isLoading3"
    (clicked)="toggleLoading3()"
    ariaLabel="Refresh data">
  </app-button>
</div>`;

  loadingStateTs = `
// Class properties
isLoading = false;
isLoading2 = false;
isLoading3 = false;

// Methods
toggleLoading(): void {
  this.isLoading = true;
  this.addToLog('Save Changes clicked - Loading started');
  
  setTimeout(() => {
    this.isLoading = false;
    this.addToLog('Save Changes completed - Loading finished');
  }, 2000);
}

toggleLoading2(): void {
  this.isLoading2 = true;
  this.addToLog('Submit Form clicked - Loading started');
  
  setTimeout(() => {
    this.isLoading2 = false;
    this.addToLog('Submit Form completed - Loading finished');
  }, 1500);
}

toggleLoading3(): void {
  this.isLoading3 = true;
  this.addToLog('Refresh clicked - Loading started');
  
  setTimeout(() => {
    this.isLoading3 = false;
    this.addToLog('Refresh completed - Loading finished');
  }, 1000);
}`;

  navigationHtml = `
<div class="button-group">
  <app-button text="Go to Home" type="ghost" route="/" (clicked)="onButtonClick('Home navigation clicked')"></app-button>
  <app-button 
    text="About Us" 
    type="outline" 
    route="page/about-us" 
    [queryParams]="{ id: 123, tab: 'settings' }"
    (clicked)="onButtonClick('Profile navigation clicked')">
  </app-button>
</div>`;

  tooltipsHtml = `
<div class="button-group">
  <app-button 
    text="Hover Me" 
    type="primary" 
    tooltip="This is a primary button with tooltip"
    (clicked)="onButtonClick('Tooltip button clicked')">
  </app-button>
  <app-button 
    text="Danger Action" 
    type="danger" 
    tooltip="Be careful with this destructive action"
    (clicked)="onButtonClick('Danger tooltip clicked')">
  </app-button>
  <app-button 
    icon="info" 
    type="ghost" 
    tooltip="Information button"
    ariaLabel="Show information"
    (clicked)="onButtonClick('Info button clicked')">
  </app-button>
</div>`;

  customContentHtml = `
<div class="button-group">
  <app-button type="primary" (clicked)="onButtonClick('Custom star clicked')">
    <span>Custom</span>
    <i class="feather-star"></i>
  </app-button>
  <app-button type="success" (clicked)="onButtonClick('Custom done clicked')">
    <i class="feather-check"></i>
    <span style="margin-left: 8px;">Done</span>
  </app-button>
</div>`;

  formIntegrationHtml = `
<form (ngSubmit)="onFormSubmit()" class="demo-form">
  <input 
    type="text" 
    placeholder="Enter some text..." 
    class="demo-input"
    [(ngModel)]="formText"
    name="formText">
  <div class="button-group">
    <app-button text="Submit" type="primary" htmlType="submit"></app-button>
    <app-button text="Reset" type="secondary" htmlType="reset" (clicked)="onFormReset()"></app-button>
    <app-button text="Cancel" type="ghost" htmlType="button" (clicked)="onCancel()"></app-button>
  </div>
</form>`;

  formIntegrationTs = `
// Class properties
formText = '';

// Methods
onFormSubmit(): void {
  this.addToLog(\`Form submitted with text: "\${this.formText}"\`);
  console.log('Form submitted with:', this.formText);
}

onFormReset(): void {
  this.formText = '';
  this.addToLog('Form reset - Input cleared');
  console.log('Form reset');
}

onCancel(): void {
  this.formText = '';
  this.addToLog('Form cancelled - Input cleared');
  console.log('Form cancelled');
}`;

  buttonComponentTs = `
import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';

export type ButtonType = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'designer';
export type ButtonSize = 'small' | 'medium' | 'large' | 'xlarge' | 'xxlarge';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-button',
  template: \`
    <button 
      [class]="getButtonClasses()" 
      [disabled]="disabled || loading"
      (click)="handleClick($event)"
      [type]="htmlType"
      [attr.aria-label]="ariaLabel || text || 'Button'"
      [title]="tooltip">
      
      <!-- Loading spinner -->
      <span *ngIf="loading" class="spinner" aria-hidden="true"></span>
      
      <!-- Icon (only show if not loading) -->
      <i *ngIf="icon && !loading" [class]="'feather-' + icon" aria-hidden="true"></i>
      
      <!-- Button text (only show if not loading and text exists) -->
      <span *ngIf="text && !loading" [class.ml-2]="icon">{{ text }}</span>
      
      <!-- Custom content (only show if not loading and no text) -->
      <ng-content *ngIf="!loading && !text"></ng-content>
    </button>
  \`,
  styleUrls: ['./button.component.scss']
})
export class ButtonComponent {
  @Input() type: ButtonType = 'primary';
  @Input() size: ButtonSize = 'medium';
  @Input() text: string = '';
  @Input() icon: string = '';
  @Input() route: string = '';
  @Input() queryParams?: { [key: string]: any };
  @Input() disabled: boolean = false;
  @Input() fullWidth: boolean = false;
  @Input() htmlType: 'button' | 'submit' | 'reset' = 'button';
  @Input() loading: boolean = false;
  @Input() tooltip: string = '';
  @Input() ariaLabel: string = '';

  @Output() clicked = new EventEmitter<MouseEvent>();

  constructor(private router: Router) {}

  handleClick(event: MouseEvent): void {
    if (this.disabled || this.loading) {
      event.preventDefault();
      return;
    }

    // Handle navigation if route is provided
    if (this.route) {
      try {
        if (this.queryParams) {
          this.router.navigate([this.route], { queryParams: this.queryParams });
        } else {
          this.router.navigate([this.route]);
        }
      } catch (error) {
        console.warn('Navigation failed:', error);
      }
    }

    // Always emit the clicked event
    this.clicked.emit(event);
  }

  getButtonClasses(): string {
    const classes = [
      'btn',
      \`btn--\${this.type}\`,
      \`btn--\${this.size}\`
    ];

    if (this.fullWidth) {
      classes.push('btn--full-width');
    }

    if (this.disabled || this.loading) {
      classes.push('btn--disabled');
    }

    if (this.loading) {
      classes.push('btn--loading');
    }

    return classes.join(' ');
  }
}`;

  buttonComponentScss = `
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-family: inherit;
  font-weight: 500;
  text-decoration: none;
  outline: none;
  position: relative;
  transition: all 0.2s ease-in-out;
  line-height: 1;
  white-space: nowrap;
  user-select: none;

  // Focus styles for accessibility
  &:focus-visible {
    outline: 2px solid #005fcc;
    outline-offset: 2px;
  }

  // Button types
  &--primary {
    background-color: #003c5b;
    color: white;
    
    &:hover:not(.btn--disabled):not(.btn--loading) { 
      background-color: #0056b3; 
    }
    
    &:active:not(.btn--disabled):not(.btn--loading) { 
      background-color: #004085; 
    }
  }

  &--secondary {
    background-color: #6c757d;
    color: white;
    
    &:hover:not(.btn--disabled):not(.btn--loading) { 
      background-color: #545b62; 
    }
    
    &:active:not(.btn--disabled):not(.btn--loading) { 
      background-color: #383d41; 
    }
  }

  &--outline {
    background: transparent;
    border: 1px solid #003c5b;
    color: #003c5b;
    
    &:hover:not(.btn--disabled):not(.btn--loading) { 
      background-color: #003c5b;
      color: white;
    }
    
    &:active:not(.btn--disabled):not(.btn--loading) { 
      background-color: #0056b3;
      border-color: #0056b3;
    }
  }

  &--ghost {
    background: transparent;
    color: #003c5b;
    
    &:hover:not(.btn--disabled):not(.btn--loading) { 
      background-color: rgba(0, 123, 255, 0.1); 
    }
    
    &:active:not(.btn--disabled):not(.btn--loading) { 
      background-color: rgba(0, 123, 255, 0.2); 
    }
  }

  &--danger {
    background-color: #dc3545;
    color: white;
    
    &:hover:not(.btn--disabled):not(.btn--loading) { 
      background-color: #c82333; 
    }
    
    &:active:not(.btn--disabled):not(.btn--loading) { 
      background-color: #a71d2a; 
    }
  }

  &--success {
    background-color: #28a745;
    color: white;
    
    &:hover:not(.btn--disabled):not(.btn--loading) { 
      background-color: #1e7e34; 
    }
    
    &:active:not(.btn--disabled):not(.btn--loading) { 
      background-color: #155724; 
    }
  }

  &--designer {
    background: linear-gradient(90deg, #0051b4, #01b1d4);
    color: white;
    box-shadow: 0 4px 6px rgba(0, 81, 180, 0.3);
    position: relative;
    overflow: hidden;
    
    &:hover:not(.btn--disabled):not(.btn--loading) {
      background: linear-gradient(90deg, #00429a, #0096b9);
      box-shadow: 0 6px 12px rgba(0, 81, 180, 0.4);
      transform: translateY(-1px);
    }
    
    &:active:not(.btn--disabled):not(.btn--loading) {
      transform: translateY(0);
    }
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
      transition: left 0.5s;
    }
    
    &:hover::before {
      left: 100%;
    }
  }

  // Button sizes
  &--small { 
    padding: 6px 12px; 
    font-size: 12px;
    min-height: 28px;
  }

  &--medium { 
    padding: 8px 16px; 
    font-size: 14px;
    min-height: 36px;
  }

  &--large { 
    padding: 12px 24px; 
    font-size: 16px;
    min-height: 44px;
  }

  &--xlarge { 
    padding: 14px 28px; 
    font-size: 18px;
    min-height: 52px;
  }

  &--xxlarge { 
    padding: 16px 32px; 
    font-size: 20px;
    min-height: 60px;
  }

  // Modifiers
  &--full-width { 
    width: 100%; 
  }

  &--disabled,
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    pointer-events: none;
  }

  &--loading {
    pointer-events: none;
  }

  // Icon spacing
  .ml-2 { 
    margin-left: 8px; 
  }

  i + span {
    margin-left: 8px;
  }

  // Spinner styles
  .spinner {
    border: 2px solid transparent;
    border-top: 2px solid currentColor;
    border-radius: 50%;
    width: 16px;
    height: 16px;
    animation: spin 1s linear infinite;
    display: inline-block;
    margin-right: 8px;

    &:only-child {
      margin-right: 0;
    }
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  // Responsive adjustments
  @media (max-width: 768px) {
    &--large {
      padding: 10px 20px;
      font-size: 15px;
    }
    
    &--medium {
      padding: 7px 14px;
      font-size: 13px;
    }

    &--xlarge {
      padding: 12px 24px;
      font-size: 16px;
    }

    &--xxlarge {
      padding: 14px 28px;
      font-size: 18px;
    }
  }
}`;

  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      this.addToLog('Code copied to clipboard successfully');
      console.log('Code copied');
    }).catch(err => {
      this.addToLog('Failed to copy code to clipboard');
      console.error('Failed to copy', err);
    });
  }

  bngPrint(): void {
    console.log("bng - Small button clicked!");
    this.addToLog('bngPrint() method called - Small button clicked');
  }

  bngPrint2(): void {
    console.log("bng - mid button clicked!");
    this.addToLog('bngPrint() method called - mid button clicked');
  }

  tryNewFunction(): void {
    console.log("hiiii");
    this.addToLog('Large button clicked - Hi!');
  }

  tryXLargeFunction(): void {
    console.log("XLarge button clicked!");
    this.addToLog('XLarge button clicked');
  }

  tryXXLargeFunction(): void {
    console.log("XXLarge button clicked!");
    this.addToLog('XXLarge button clicked');
  }

  toggleLoading(): void {
    this.isLoading = true;
    this.addToLog('Save Changes clicked - Loading started');
    setTimeout(() => {
      this.isLoading = false;
      this.addToLog('Save Changes completed - Loading finished');
    }, 2000);
  }

  toggleLoading2(): void {
    this.isLoading2 = true;
    this.addToLog('Submit Form clicked - Loading started');
    setTimeout(() => {
      this.isLoading2 = false;
      this.addToLog('Submit Form completed - Loading finished');
    }, 1500);
  }

  toggleLoading3(): void {
    this.isLoading3 = true;
    this.addToLog('Refresh clicked - Loading started');
    setTimeout(() => {
      this.isLoading3 = false;
      this.addToLog('Refresh completed - Loading finished');
    }, 1000);
  }

  onButtonClick(message: string): void {
    this.addToLog(message);
    console.log('Button clicked:', message);
  }

  onFormSubmit(): void {
    this.addToLog(`Form submitted with text: "${this.formText}"`);
    console.log('Form submitted with:', this.formText);
  }

  onFormReset(): void {
    this.formText = '';
    this.addToLog('Form reset - Input cleared');
    console.log('Form reset');
  }

  onCancel(): void {
    this.formText = '';
    this.addToLog('Form cancelled - Input cleared');
    console.log('Form cancelled');
  }

  private addToLog(message: string): void {
    const timestamp = new Date().toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    this.actionLog.unshift(`[${timestamp}] ${message}`);
    if (this.actionLog.length > 15) {
      this.actionLog = this.actionLog.slice(0, 15);
    }
  }

  clearLog(): void {
    this.actionLog = [];
    console.log('Action log cleared');
  }

  trackByIndex(index: number): number {
    return index;
  }

  ngOnInit(): void {
    this.addToLog('Component initialized');
    console.log('TryUseComponent initialized');
  }

  ngOnDestroy(): void {
    console.log('TryUseComponent destroyed');
  }
}