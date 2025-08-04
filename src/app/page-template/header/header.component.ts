import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class HeaderComponent implements OnInit, OnDestroy {
  isMenuOpen: boolean = false;
  isSidebarOpen: boolean = false;
  isScrolled: boolean = false;
  isMobile: boolean = false;

  navItems = [
    { label: 'Home', link: 'home', active: true },
    { label: 'About', link: 'about', active: false },
    { label: 'Services', link: 'services', active: false },
    { label: 'Projects', link: 'projects', active: false },
    { label: 'Contact', link: 'contact', active: false }
  ];

  ngOnInit(): void {
    this.checkScreenSize();
    this.onScroll(); // Check initial scroll
    window.addEventListener('resize', this.checkScreenSize.bind(this));
    window.addEventListener('scroll', this.onScroll.bind(this));
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.isScrolled = window.scrollY > 10;
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;

    if (this.isMenuOpen) {
      document.body.classList.add('menu-open');
      // Close sidebar if open
      if (this.isSidebarOpen) this.closeSidebar();
    } else {
      document.body.classList.remove('menu-open');
    }
  }

  closeMenu(): void {
    if (this.isMenuOpen) {
      this.isMenuOpen = false;
      document.body.classList.remove('menu-open');
    }
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
    if (this.isSidebarOpen) {
      document.body.classList.add('sidebar-open');
      // Close menu if open
      if (this.isMenuOpen) this.closeMenu();
    } else {
      document.body.classList.remove('sidebar-open');
    }
  }

  closeSidebar(): void {
    if (this.isSidebarOpen) {
      this.isSidebarOpen = false;
      document.body.classList.remove('sidebar-open');
    }
  }

  private checkScreenSize(): void {
    const wasMobile = this.isMobile;
    this.isMobile = window.innerWidth <= 768;

    if (!this.isMobile && wasMobile) {
      // On resize to desktop: close everything
      this.closeMenu();
      this.closeSidebar();
    }
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.checkScreenSize.bind(this));
    window.removeEventListener('scroll', this.onScroll.bind(this));
    document.body.classList.remove('menu-open', 'sidebar-open');
  }
}