import { Component, OnInit, HostListener } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  isMenuOpen: boolean = false;
  isScrolled: boolean = false;
  
  constructor() { }

  ngOnInit(): void {
    // Check initial scroll position
    this.checkScroll();
  }

  /**
   * Toggle mobile menu open/close state
   */
  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
    
    // Optional: Toggle body class to add overlay when menu is open
    if (this.isMenuOpen) {
      document.body.classList.add('menu-open');
    } else {
      document.body.classList.remove('menu-open');
    }
  }

  /**
   * Close menu when clicking outside
   */
  closeMenu(): void {
    if (this.isMenuOpen) {
      this.isMenuOpen = false;
      document.body.classList.remove('menu-open');
    }
  }

  /**
   * Listen for window scroll events to add/remove header styles
   */
  @HostListener('window:scroll', [])
  checkScroll(): void {
    this.isScrolled = window.scrollY > 30;
  }

  /**
   * Listen for window resize to close mobile menu on larger screens
   */
  @HostListener('window:resize', [])
  onResize(): void {
    if (window.innerWidth > 768 && this.isMenuOpen) {
      this.closeMenu();
    }
  }
}