import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { AnimationCounterService } from '../../../shared/utils/animated-counter';

@Component({
  selector: 'app-stats-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stats-card.component.html',
  styleUrls: ['./stats-card.component.scss'],
})
export class StatsCardComponent implements OnInit {
  @Input() title: string = 'Full';
  @Input() value: string = '50';
  @Input() type: 'total' | 'approved' | 'pending' | 'rejected' = 'total';
  @Input() iconClass: string = 'fas fa-file-alt';

  private animationSubscription: Subscription | null = null;

  constructor(private animationService: AnimationCounterService) {}
  animatedValue: number = 0;
  private duration: number = 1000; // Animation duration in ms

  ngOnInit(): void {
    this.startAnimation(0, parseInt(this.value, 10), this.duration);
  }

  startAnimation(start: number, target: number, duration: number): void {
    if (this.animationSubscription) {
      this.animationSubscription.unsubscribe();
    }

    this.animationSubscription = this.animationService
      .animateValue(start, target, duration)
      .subscribe((value) => {
        this.animatedValue = value;
      });
  }
}
