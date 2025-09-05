import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IlogiInputComponent } from '../../../customInputComponents/ilogi-input/ilogi-input.component';

export interface StatusActionData {
  action: 'approve' | 'send_back' | 'reject';
}

export interface StatusActionResult {
  confirmed: boolean;
  remarks?: string;
}

@Component({
  selector: 'app-status-action-dialog',

  imports: [IlogiInputComponent],
  templateUrl: './status-action-dialog.component.html',
  styleUrls: ['./status-action-dialog.component.scss'],
  standalone: true,
})
export class StatusActionDialogComponent {
  @Input() data: StatusActionData | null = null;
  @Output() result = new EventEmitter<StatusActionResult>();

  remarks: string = '';
  isVisible: boolean = true; // Control visibility from parent

  getActionLabel(): string {
    const labels: Record<string, string> = {
      approve: 'Approve',
      send_back: 'Send Back',
      reject: 'Reject',
    };
    return labels[this.data?.action || ''] || 'Proceed';
  }

  onSubmit(): void {
    if (!this.remarks.trim()) return;
    this.result.emit({ confirmed: true, remarks: this.remarks.trim() });
    this.close();
  }

  onCancel(): void {
    this.result.emit({ confirmed: false });
    this.close();
  }

  close(): void {
    this.isVisible = false;
  }
}