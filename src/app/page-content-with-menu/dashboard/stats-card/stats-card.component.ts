import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stats-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stats-card.component.html',
  styleUrls: ['./stats-card.component.scss']
})
export class StatsCardComponent {
  @Input() title: string = 'Full';
  @Input() value: string = "50";
  @Input() type: 'total' | 'approved' | 'pending' | 'rejected' = 'total';
  @Input() iconClass: string = 'fas fa-file-alt';
}