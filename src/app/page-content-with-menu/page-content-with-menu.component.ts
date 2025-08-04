import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { SidebarComponent } from "./side-bar-menu/side-bar-menu.component";

@Component({
  selector: 'app-page-content-with-menu',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent],
  templateUrl: './page-content-with-menu.component.html',
  styleUrl: './page-content-with-menu.component.scss'
})
export class PageContentWithMenuComponent implements OnInit, OnDestroy {
  isDesktopMenuOpen = true;   // Manages desktop collapsed state - default expanded
  isMobileMenuVisible = false; // Manages mobile overlay visibility
  isMobile = false;
  private layoutSub: Subscription | undefined;

  constructor() {}

  ngOnInit(): void {
    this.checkScreenSize();
    

    window.addEventListener('resize', this.checkScreenSize.bind(this));
  }

  private checkScreenSize(): void {
    const wasMobile = this.isMobile;
    this.isMobile = window.innerWidth <= 1024;
    
    if (wasMobile !== this.isMobile) {
      this.isDesktopMenuOpen = !this.isMobile; // Expanded on desktop, collapsed on mobile
    }
  }

  // Called by the sidebar's internal button
  handleSidebarToggle(): void {
    if (this.isMobile) {
    } else {
      this.isDesktopMenuOpen = !this.isDesktopMenuOpen;
    }
  }

  // Called when a nav link is clicked or backdrop is clicked
  closeMobileSidebar(): void {
    if (this.isMobile) {
    }
  }

  ngOnDestroy(): void {
    if (this.layoutSub) this.layoutSub.unsubscribe();
    window.removeEventListener('resize', this.checkScreenSize.bind(this));
  }
}