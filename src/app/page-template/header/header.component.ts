import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutService } from '../../_service/layout.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  isMobile = false;
  isMobileMenuOpen = false;
  
  constructor(private layoutService: LayoutService) {
    this.checkScreenSize();
  }
  
  @HostListener('window:resize')
  onResize() {
    this.checkScreenSize();
  }
  
  private checkScreenSize() {
    this.isMobile = window.innerWidth <= 1024;
  }
  
  toggleSidebar(): void {
    this.layoutService.toggleSidebar();
  }
  
  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    
    if (this.isMobileMenuOpen) {
      document.body.classList.add('header-mobile-menu-open');
    } else {
      document.body.classList.remove('header-mobile-menu-open');
    }
  }
  
  closeMobileMenu(): void {
    if (this.isMobileMenuOpen) {
      this.isMobileMenuOpen = false;
      document.body.classList.remove('header-mobile-menu-open');
    }
  }
  
  handleHeaderItemClick(): void {
    if (this.isMobile && this.isMobileMenuOpen) {
      this.closeMobileMenu();
    }
  }
}