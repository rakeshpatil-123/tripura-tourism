import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

interface ClaimStatus {
  type: string;
  submitted: number;
  approved: number;
  received: number;
  pending: number;
}

@Component({
  selector: 'app-claim-status-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './claim-status-table.component.html',
  styleUrls: ['./claim-status-table.component.scss'],
})
export class ClaimStatusTableComponent {
  @Input() title: string = 'Claim Status';
  @Input() data: ClaimStatus[] = [
    { type: 'Proforma I', submitted: 0, approved: 0, received: 0, pending: 0 },
    { type: 'Proforma II', submitted: 0, approved: 0, received: 0, pending: 0 },
    {
      type: 'Proforma III',
      submitted: 0,
      approved: 0,
      received: 0,
      pending: 0,
    },
  ];
}
