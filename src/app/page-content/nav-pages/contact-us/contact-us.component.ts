import { Component } from '@angular/core';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faLocationDot, faPhone, faFax, faEnvelope, faGlobe } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contact-us',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './contact-us.component.html',
  styleUrls: ['./contact-us.component.scss']
})
export class ContactUsComponent {
  showNotification = false;
  faLocationDot = faLocationDot;
  faPhone = faPhone;
  faFax = faFax;
  faEnvelope = faEnvelope;
  faGlobe = faGlobe;

  constructor(library: FaIconLibrary) {
    library.addIcons(faLocationDot, faPhone, faFax, faEnvelope, faGlobe);
  }

  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      this.showNotification = true;
      setTimeout(() => {
        this.showNotification = false;
      }, 2000);
    }).catch(err => {
      console.error('Could not copy text: ', err);
    });
  }

  handleKeydown(event: KeyboardEvent, text: string): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.copyToClipboard(text);
    }
  }
}