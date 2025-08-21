import { Component, ElementRef, AfterViewInit, ViewChildren, QueryList } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { gsap } from 'gsap';

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
  styleUrls: ['./new-success-storys.component.scss'],
  animations: [
    trigger('cardAnimation', [
      state('hidden', style({
        opacity: 0,
        transform: 'translateY(100px)'
      })),
      state('visible', style({
        opacity: 1,
        transform: 'translateY(0)'
      })),
      transition('hidden => visible', [
        animate('700ms {{delay}}s ease-out')
      ], { params: { delay: 0 } }),
      transition('visible => hidden', [
        animate('300ms ease-in')
      ])
    ])
  ]
})
export class NewSuccessStorysComponent implements AfterViewInit {
  @ViewChildren('metricCard') metricCards!: QueryList<ElementRef>;
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

  cardState: string = 'hidden';

  constructor(private el: ElementRef) {}

  ngAfterViewInit() {
    this.setupIntersectionObserver();
  }

  setupIntersectionObserver() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            console.log('Component is 40% visible, triggering animations');
            this.cardState = 'visible';
            this.animateNumbers();
          } else {
            console.log('Component out of view, resetting animations');
            this.cardState = 'hidden';
            this.resetAnimations();
          }
        });
      },
      { threshold: 0.4 }
    );
    observer.observe(this.el.nativeElement);
  }

  animateNumbers() {
    this.metricCards.forEach((card, index) => {
      const valueElement = card.nativeElement.querySelector('.value');

      if (!valueElement) {
        console.warn(`Value element not found for card ${index}`);
        return;
      }

      const valueText = this.metrics[index].value.replace(/[^0-9]/g, '');
      const valueNumber = parseInt(valueText, 10);

      // Number animation
      gsap.fromTo(
        valueElement,
        { textContent: 0 },
        {
          textContent: valueNumber,
          duration: 2,
          ease: 'power1.out',
          snap: { textContent: 1 },
          onUpdate: function () {
            valueElement.textContent = `+${Math.round(
              parseFloat(this['targets']()[0].textContent)
            )}${index === 0 ? '%' : index === 1 ? '+' : ''}`;
          },
          delay: index * 0.2,
          onComplete: () => console.log(`Number animation for card ${index} completed`)
        }
      );
    });
  }

  resetAnimations() {
    this.metricCards.forEach((card, index) => {
      const valueElement = card.nativeElement.querySelector('.value');

      if (valueElement) {
        valueElement.textContent = '0';
      }
    });
  }

  onExploreClick(): void {
    console.log('Explore Investment Opportunities clicked');
  }
}