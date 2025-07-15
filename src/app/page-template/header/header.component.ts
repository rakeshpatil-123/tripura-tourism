import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Subscription } from 'rxjs';
import { LayoutService } from '../../_service/layout.service';
import { CommonModule } from '@angular/common';

@Component({
  imports: [CommonModule],
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  isMenuOpen: boolean = false;
  isSidebarOpen: boolean = false;
  isScrolled: boolean = false;
  isMobile: boolean = false;
  private layoutSub: Subscription | undefined;
  
  constructor(private layoutService: LayoutService ) { }

  ngOnInit(): void {
    this.checkScreenSize();
    
    this.layoutSub = this.layoutService.sidebarOpen$.subscribe(isOpen => {
      this.isSidebarOpen = isOpen;
      
      // Add/remove body class to prevent scrolling when sidebar is open on mobile
      if (this.isMobile) {
        if (this.isSidebarOpen) {
          document.body.classList.add('sidebar-open');
        } else {
          document.body.classList.remove('sidebar-open');
        }
      }
    });
    
    window.addEventListener('resize', this.checkScreenSize.bind(this));
  }
  
  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
    
    // Add/remove body class to prevent scrolling when menu is open
    if (this.isMenuOpen) {
      document.body.classList.add('menu-open');
    } else {
      document.body.classList.remove('menu-open');
    }
    
    // Close sidebar if it's open when toggling nav menu
    if (this.isMenuOpen && this.isSidebarOpen) {
      this.closeSidebar();
    }
  }
  
  closeMenu() {
    if (this.isMenuOpen) {
      this.isMenuOpen = false;
      document.body.classList.remove('menu-open');
    }
  }
  
  toggleSidebar() {
    this.layoutService.toggleSidebar();
    
    // Close the nav menu if it's open when toggling sidebar
    if (this.isMenuOpen) {
      this.closeMenu();
    }
  }
  
  closeSidebar() {
    if (this.isSidebarOpen) {
      this.layoutService.closeSidebar();
      if (this.isMobile) {
        document.body.classList.remove('sidebar-open');
      }
    }
  }
  
  private checkScreenSize(): void {
    this.isMobile = window.innerWidth <= 768;
    
    // Close mobile menu and sidebar when resizing to desktop
    if (!this.isMobile) {
      if (this.isMenuOpen) {
        this.closeMenu();
      }
      // Don't auto-close sidebar on desktop resize
      document.body.classList.remove('menu-open', 'sidebar-open');
    }
  }
  
  @HostListener('window:resize')
  onResize() {
    this.checkScreenSize();
  }
  
  ngOnDestroy(): void {
    if (this.layoutSub) this.layoutSub.unsubscribe();
    window.removeEventListener('resize', this.checkScreenSize.bind(this));
    // Clean up body classes
    document.body.classList.remove('menu-open', 'sidebar-open');
  }
}