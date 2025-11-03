// shared/components/confirmation-modal/confirmation-modal.component.ts
import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-confirmation-modal',
  templateUrl: './confirmation-modal.component.html',
  styleUrls: ['./confirmation-modal.component.scss'],
  imports: [CommonModule],
  standalone: true,
})
export class ConfirmationModalComponent {
  @Input() isVisible = false;
  @Input() title = 'Confirm Deletion';
  @Input() message = 'Are you sure you want to delete this item? This action cannot be undone.';
  @Input() confirmButtonText = 'Delete';
  @Input() cancelButtonText = 'Cancel';
        class="btn"
  @Input() confirmButtonClass = 'btn btn-danger'; // e.g., 'btn btn-danger'
  @Input() cancelButtonClass = 'btn btn-outline-secondary';

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>(); 

  onConfirm(): void {
    this.confirm.emit();
    this.closeModal();
  }

  onCancel(): void {
    this.cancel.emit();
    this.closeModal();
  }

  closeModal(): void {
    this.close.emit();
  }
}