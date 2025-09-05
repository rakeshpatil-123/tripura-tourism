import { Component } from '@angular/core';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faInfoCircle, faFileAlt, faLightbulb, faBook, faExternalLinkAlt, faDownload } from '@fortawesome/free-solid-svg-icons';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-incentive',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './incentive.component.html',
  styleUrls: ['./incentive.component.scss']
})
export class IncentiveComponent {
  accordionSections = [
    { id: 'general-info', title: 'General Information', icon: faInfoCircle, isOpen: false },
    { id: 'eligibility-certificates', title: 'Eligibility Certificates', icon: faFileAlt, isOpen: false },
    { id: 'benefit-claims', title: 'Benefit Claims', icon: faLightbulb, isOpen: false },
    { id: 'user-manual', title: 'User Manual & Guidelines', icon: faBook, isOpen: false },
    { id: 'apply-online', title: 'Apply Online', icon: faExternalLinkAlt, isOpen: false }
  ];

  constructor(library: FaIconLibrary) {
    library.addIcons(faInfoCircle, faFileAlt, faLightbulb, faBook, faExternalLinkAlt, faDownload);
  }

  toggleAccordion(index: number) {
    this.accordionSections = this.accordionSections.map((section, i) => ({
      ...section,
      isOpen: i === index ? !section.isOpen : false
    }));
  }
}