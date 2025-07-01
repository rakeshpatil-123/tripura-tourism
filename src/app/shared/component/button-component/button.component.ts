import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';

export type ButtonType = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'small' | 'medium' | 'large';

@Component({
  imports: [CommonModule],
  selector: 'app-button',
  template: `
    <button 
      [class]="getButtonClasses()" 
      [disabled]="disabled"
      (click)="handleClick()"
      [type]="htmlType">
      <i *ngIf="icon" [class]="'feather-' + icon"></i>
      <span *ngIf="text" [class.ml-2]="icon">{{ text }}</span>
      <ng-content></ng-content>
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
  @Input() disabled: boolean = false;
  @Input() fullWidth: boolean = false;
  @Input() htmlType: 'button' | 'submit' | 'reset' = 'button';

  @Output() clicked = new EventEmitter<void>();

  constructor(private router: Router) {}

  handleClick(): void {
    if (this.disabled) return;

    if (this.route) {
      this.router.navigate([this.route]);
    }

    this.clicked.emit();
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

    if (this.disabled) {
      classes.push('btn--disabled');
    }

    return classes.join(' ');
  }
}