import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-service-feedback',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './service-feedback.component.html',
  styleUrl: './service-feedback.component.scss'
})
export class ServiceFeedbackComponent {
  rating = 0;

  setRating(star: number) {
    this.rating = star;
  }
}
