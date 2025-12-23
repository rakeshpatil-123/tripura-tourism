import { Component, OnDestroy, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../../shared/component/button-component/button.component';

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
  imports: [CommonModule, ButtonComponent],
  templateUrl: './new-slider.component.html',
  styleUrls: ['./new-slider.component.scss']
})
export class NewSliderComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('dotContainer') dotContainer!: ElementRef;

  slides: Slide[] = [
    { src: 'https://images.unsplash.com/photo-1695150854909-a00039a284b8?q=80&w=1229&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', alt: 'Tripura Energy Infrastructure' },
    { src: 'https://images.unsplash.com/photo-1651942365480-dde2faa3e094?q=80&w=1632&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', alt: 'Industrial Processing Setup' },
    { src: 'https://images.unsplash.com/photo-1651942365746-b1a70d76f952?q=80&w=1632&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', alt: 'Modern Factory Interior' },
    { src: 'https://images.unsplash.com/photo-1516937941344-00b4e0337589?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', alt: 'Automated Production Line' }
  ];

  stats: Stat[] = [
    // { value: '19', label: 'Tribal Communities' },
    // { value: '₹500 Cr', label: 'Tourism Potential' },
    // { value: '15,000+', label: 'Artisans' }
  ];

  currentSlide = 0;
  private intervalId: any;

  ngOnInit(): void {
    this.startAutoSlide();
  }

  ngAfterViewInit(): void {
    this.createRandomDots();
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

  createRandomDots(): void {
    const container = this.dotContainer.nativeElement;
    const numDots = 20;

    for (let i = 0; i < numDots; i++) {
      const dot = document.createElement('div');
      dot.className = 'random-dot';
      dot.style.left = `${Math.random() * 100}%`;
      dot.style.top = `${Math.random() * 100}%`;
      dot.style.animationDelay = `${Math.random() * 5}s`;
      dot.style.animationDuration = `${3 + Math.random() * 3}s`;
      container.appendChild(dot);
    }
  }
  redirectToLogin():void {
    window.location.href = 'page/login';
  }

  onInvestClick(): void {
    console.log('Apply Now clicked');
  }
}