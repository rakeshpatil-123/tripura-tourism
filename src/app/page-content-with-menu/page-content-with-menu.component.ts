import { Component, ElementRef, HostListener, Renderer2 } from '@angular/core';
import { SidebarComponent } from "./side-bar-menu/side-bar-menu.component";
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-page-content-with-menu',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent],
  templateUrl: './page-content-with-menu.component.html',
  styleUrl: './page-content-with-menu.component.scss'
})
export class PageContentWithMenuComponent {
  isMenuOpen: boolean = false; // Default to collapsed on desktop, or closed on mobile

  constructor(private renderer: Renderer2, private el: ElementRef) { } // Inject Renderer2 and ElementRef

  ngOnInit(): void {
    // You might want to initialize isMenuOpen based on screen width
    this.checkScreenSize();
  }

  onSidebarToggle() {
    this.isMenuOpen = !this.isMenuOpen;
    this.toggleBodyOverflow(); // Call the new method to manage body class
  }

  // Listen for window resize to adjust initial menu state or behavior
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkScreenSize();
    this.toggleBodyOverflow(); // Re-evaluate body class on resize
  }

  private checkScreenSize() {
    if (window.innerWidth <= 768) {
      // On mobile, the menu starts closed
      this.isMenuOpen = false;
    } else {
      // On desktop, you might want it to start open or remember user preference
      // For now, let's assume it starts open on desktop if not explicitly collapsed
      this.isMenuOpen = true; // Or false based on your desktop default
    }
  }

  // New method to add/remove 'menu-open' class to body
  private toggleBodyOverflow() {
    if (window.innerWidth <= 768) {
      if (this.isMenuOpen) {
        this.renderer.addClass(document.body, 'menu-open');
      } else {
        this.renderer.removeClass(document.body, 'menu-open');
      }
    } else {
      // Ensure body class is removed on desktop if it somehow got applied
      this.renderer.removeClass(document.body, 'menu-open');
    }
  }
}
