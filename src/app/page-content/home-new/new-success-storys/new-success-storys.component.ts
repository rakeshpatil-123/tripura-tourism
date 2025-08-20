import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Metric {
  icon: string;
  value: string;
  title: string;
  subtitle: string;
  gradientFrom: string;
  gradientTo: string;
}

@Component({
  selector: 'app-new-success-storys',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './new-success-storys.component.html',
  styleUrls: ['./new-success-storys.component.scss']
})
export class NewSuccessStorysComponent {
  metrics: Metric[] = [
    {
      icon: 'trending-up',
      value: '+300%',
      title: 'Investment Growth',
      subtitle: 'YoY',
      gradientFrom: 'from-green-500',
      gradientTo: 'to-emerald-500'
    },
    {
      icon: 'users',
      value: '2,500+',
      title: 'Active Investors',
      subtitle: 'Companies',
      gradientFrom: 'from-blue-500',
      gradientTo: 'to-cyan-500'
    },
    {
      icon: 'building',
      value: '15+',
      title: 'Industrial Parks',
      subtitle: 'Locations',
      gradientFrom: 'from-purple-500',
      gradientTo: 'to-indigo-500'
    }
  ];

  onExploreClick(): void {
    console.log('Explore Investment Opportunities clicked');
  }
}