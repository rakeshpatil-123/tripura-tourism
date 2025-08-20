import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Slide {
  src: string;
  alt: string;
}

interface Stat {
  value: string;
  label: string;
}

@Component({
  selector: 'app-new-slider',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './new-slider.component.html',
  styleUrls: ['./new-slider.component.scss']
})
export class NewSliderComponent implements OnInit, OnDestroy {
  slides: Slide[] = [
  { src: 'https://images.unsplash.com/photo-1695150854909-a00039a284b8?q=80&w=1229&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', alt: 'Tripura Energy Infrastructure' },
  { src: 'https://images.unsplash.com/photo-1651942365480-dde2faa3e094?q=80&w=1632&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', alt: 'Industrial Processing Setup' },
  { src: 'https://images.unsplash.com/photo-1651942365746-b1a70d76f952?q=80&w=1632&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', alt: 'Modern Factory Interior' },
  { src: 'https://images.unsplash.com/photo-1516937941344-00b4e0337589?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', alt: 'Automated Production Line' }
];

  stats: Stat[] = [
    { value: '19', label: 'Tribal Communities' },
    { value: '₹500 Cr', label: 'Tourism Potential' },
    { value: '15,000+', label: 'Artisans' }
  ];

  currentSlide = 4;
  private intervalId: any;

  ngOnInit(): void {
    this.startAutoSlide();
  }

  ngOnDestroy(): void {
    this.stopAutoSlide();
  }

  startAutoSlide(): void {
    this.stopAutoSlide();
    this.intervalId = setInterval(() => {
      this.nextSlide();
    }, 5000);
  }

  stopAutoSlide(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  setSlide(index: number): void {
    this.currentSlide = index;
    this.stopAutoSlide();
    this.startAutoSlide();
  }

  nextSlide(): void {
    this.currentSlide = (this.currentSlide + 1) % this.slides.length;
  }

  onInvestClick(): void {
    console.log('Submit Intent to Invest clicked');
  }

  onWatchDemoClick(): void {
    console.log('Watch Demo clicked');
  }
}
