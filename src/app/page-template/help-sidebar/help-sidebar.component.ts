import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms'; // ✅ Import FormsModule

@Component({
  selector: 'app-help-sidebar',
  standalone: true, // ✅ Make it standalone
  imports: [FormsModule], // ✅ Import FormsModule here
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
}