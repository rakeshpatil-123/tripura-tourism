import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stats-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stats-card.component.html',
  styleUrls: ['./stats-card.component.scss']
})
export class StatsCardComponent implements OnInit {
  @Input() title: string = 'Full';
  @Input() value: string = "50";
  @Input() type: 'total' | 'approved' | 'pending' | 'rejected' = 'total';
  @Input() iconClass: string = 'fas fa-file-alt';

  animatedValue: number = 0;
  private duration: number = 1000; // Animation duration in ms

  ngOnInit(): void {
    const target = parseInt(this.value, 10);
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / this.duration, 1);
      this.animatedValue = Math.floor(progress * target);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        this.animatedValue = target;
      }
    };

    requestAnimationFrame(animate);
  }
}
