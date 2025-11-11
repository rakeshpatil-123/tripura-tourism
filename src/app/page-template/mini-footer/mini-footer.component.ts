import { Component } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-mini-footer',
  standalone: true,
  imports: [CommonModule, RouterModule, DatePipe],
  templateUrl: './mini-footer.component.html',
  styleUrls: ['./mini-footer.component.scss']
})
export class MiniFooterComponent {
  // Calculate yesterday's date
  lastUpdatedDate: Date = this.getYesterdayDate();

  getYesterdayDate(): Date {
    const date = new Date();
    
    // Subtract 24 hours (more reliable than setDate for month boundaries)
    date.setTime(date.getTime() - 24 * 60 * 60 * 1000);
    
    // Reset time to midnight to avoid timezone issues
    date.setHours(0, 0, 0, 0);
    
    return date;
  }

  get lastUpdated(): string {
    const datePipe = new DatePipe('en-US');
    return datePipe.transform(this.lastUpdatedDate, 'MMMM d, y') || '';
  }
}