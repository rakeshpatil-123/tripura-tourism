import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-help-floating-button',
  templateUrl: './help-floating-button.component.html',
  styleUrls: ['./help-floating-button.component.scss']
})
export class HelpFloatingButtonComponent {
  @Output() toggleSidebarEvent = new EventEmitter<boolean>();

  toggleSidebar() {
    this.toggleSidebarEvent.emit(true);
  }
}