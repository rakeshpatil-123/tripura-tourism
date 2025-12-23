import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-logo-footer',
  standalone: true,
  imports: [CommonModule], // Required for *ngFor and *ngIf
  templateUrl: './logo-footer.component.html',
  styleUrl: './logo-footer.component.scss'
})
export class LogoFooterComponent implements OnInit {
  logos = [
    { src: 'assets/footer/logo-footer/Group780.jpg', alt: 'DIPP', link: 'https://dipp.gov.in/' },
    { src: 'assets/footer/logo-footer/log-1_10.jpg', alt: 'TIDC', link: 'https://tidc.tripura.gov.in/' },
    { src: 'assets/footer/logo-footer/Make_In_India.jpg', alt: 'Tripura Govt', link: 'https://tripura.gov.in/' },
    { src: 'assets/footer/logo-footer/MaskGroup15.jpg', alt: 'India Govt', link: 'https://www.india.gov.in/' },
    { src: 'assets/footer/logo-footer/StartupIndiaLogo1-02.jpg', alt: 'Startup India', link: 'https://www.startupindia.gov.in/' },
    { src: 'assets/footer/logo-footer/TIDC-LOGO-2.jpg', alt: 'TIDC Logo', link: 'https://tidc.tripura.gov.in/' },
    { src: 'assets/footer/logo-footer/tportal.jpg', alt: 'Make in India', link: 'https://www.makeinindia.com/' }
  ];

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.cdr.detectChanges(); 
  }

  trackByFn(index: number, logo: any): string {
    return logo.src; 
  }

  onImageError(event: Event, src: string) {
    console.error(`Failed to load image: ${src}`); 
  }
}