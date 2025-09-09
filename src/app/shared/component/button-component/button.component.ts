import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';

export type ButtonType = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'designer';
export type ButtonSize = 'small' | 'medium' | 'large' | 'xlarge' | 'xxlarge';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-button',
  template: `
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
  `,
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
      `btn--${this.type}`,
      `btn--${this.size}`
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
}