import { Component } from '@angular/core';
import { CardData, DynamicCardContainerComponent } from '../../shared/dynamic-card-container/dynamic-card-container.component';
import { ServiceItem, ServicesCardComponent } from '../../shared/services-card/services-card.component';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import {  HeroSectionComponent } from "./landing-page/landing-page";
import { AboutComponent } from "./about/about.component";
import { AnalyticsSectionComponent } from "./analytics-section/analytics-section.component";
import { SupportComponent } from "./support/support.component";
import { TimelineCardComponent } from "../../shared/timeline-card/timeline-card.component";
@Component({
  selector: 'app-home',
  imports: [DynamicCardContainerComponent, ServicesCardComponent, AboutComponent, AnalyticsSectionComponent, SupportComponent, HeroSectionComponent, TimelineCardComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {

  constructor(private sanitizer: DomSanitizer) {

    this.cardData = [
  {
    title: 'UI/UX Design',
    description: 'Beautiful, user-centered design.',
    features: ['Wireframing', 'Prototyping'],
    buttonText: 'Learn More',
    icon: this.sanitize(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 19l7-7 3 3-7 7-3-3z"></path>
        <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path>
        <path d="M2 2l7.586 7.586"></path>
        <circle cx="11" cy="11" r="2"></circle>
      </svg>
    `),
  },
  {
    title: 'Web Development',
    description: 'Modern, scalable web apps.',
    features: ['React', 'Angular', 'Node.js' , ],
    buttonText: 'Build',
    icon: this.sanitize(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
        <line x1="8" y1="21" x2="16" y2="21"></line>
        <line x1="12" y1="17" x2="12" y2="21"></line>
      </svg>
    `),
  },
  {
    title: 'UI/UX Design',
    description: 'Beautiful, user-centered design.',
    features: ['Wireframing', 'Prototyping'],
    buttonText: 'Learn More',
    icon: this.sanitize(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 19l7-7 3 3-7 7-3-3z"></path>
        <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path>
        <path d="M2 2l7.586 7.586"></path>
        <circle cx="11" cy="11" r="2"></circle>
      </svg>
    `),
  },
  {
    title: 'Web Development',
    description: 'Modern, scalable web apps.',
    features: ['React', 'Angular', 'Node.js'],
    buttonText: 'Build',
    icon: this.sanitize(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
        <line x1="8" y1="21" x2="16" y2="21"></line>
        <line x1="12" y1="17" x2="12" y2="21"></line>
      </svg>
    `),
  },

  // ... more cards
];

}

sanitize(svg: string): SafeHtml {
  return this.sanitizer.bypassSecurityTrustHtml(svg);
}
ourServices: ServiceItem[] = [];
cardData: CardData[] = [];


}
