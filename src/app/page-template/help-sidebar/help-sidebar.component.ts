import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-help-sidebar',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './help-sidebar.component.html',
  styleUrls: ['./help-sidebar.component.scss']
})
export class HelpSidebarComponent {
  @Input() isOpen = false;
  @Output() closeSidebarEvent = new EventEmitter<void>();

  isChatOpen = false;
  userMessage = '';

  closeSidebar() {
    this.isChatOpen = false;
    this.closeSidebarEvent.emit();
  }

  openChat() {
    this.isChatOpen = true;
  }

  closeChat() {
    this.isChatOpen = false;
  }

  sendMessage() {
    if (!this.userMessage.trim()) return;

    console.log('User message:', this.userMessage);
    this.userMessage = '';
  }

  // New methods for support modules
  callSupport() {
    console.log('Calling support...');
    // In a real app, this would initiate a call
    // window.open('tel:+1234567890');
  }

  sendEmail() {
    console.log('Opening email client...');
    // In a real app, this would open email client
    // window.open('mailto:support@example.com');
  }

  visitOffice() {
    console.log('Opening appointment booking...');
    // In a real app, this would open appointment booking page
  }
}