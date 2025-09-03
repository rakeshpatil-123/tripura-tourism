import { Component } from '@angular/core';

@Component({
  selector: 'app-contact-us',
  templateUrl: './contact-us.component.html',
  styleUrls: ['./contact-us.component.scss']
})
export class ContactUsComponent {
  showNotification = false;

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