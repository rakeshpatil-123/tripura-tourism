import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { SidebarComponent } from "./side-bar-menu/side-bar-menu.component";
import { LayoutService } from '../_service/layout.service';

@Component({
  selector: 'app-page-content-with-menu',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent],
  templateUrl: './page-content-with-menu.component.html',
  styleUrl: './page-content-with-menu.component.scss'
})
export class PageContentWithMenuComponent implements OnInit, OnDestroy {
  isDesktopMenuOpen = true;   // Manages desktop collapsed state
  isMobileMenuVisible = false; // Manages mobile overlay visibility
  isMobile = false;
  private layoutSub: Subscription | undefined;

  constructor(private layoutService: LayoutService) {}

  ngOnInit(): void {
    this.checkScreenSize();
    
    this.layoutSub = this.layoutService.sidebarOpen$.subscribe(isOpen => {
      if (this.isMobile) {
        this.isMobileMenuVisible = isOpen;
      }
    });

    window.addEventListener('resize', this.checkScreenSize.bind(this));
  }

  private checkScreenSize(): void {
    const wasMobile = this.isMobile;
    this.isMobile = window.innerWidth <= 1024;
    
    if (wasMobile !== this.isMobile) {
      this.layoutService.closeSidebar();
      this.isDesktopMenuOpen = !this.isMobile;
    }
  }

  // Called by the sidebar's internal button
  handleSidebarToggle(): void {
    if (this.isMobile) {
      this.layoutService.closeSidebar();
    } else {
      this.isDesktopMenuOpen = !this.isDesktopMenuOpen;
    }
  }

  // Called when a nav link is clicked or backdrop is clicked
  closeMobileSidebar(): void {
      this.layoutService.closeSidebar();
  }

  ngOnDestroy(): void {
    if (this.layoutSub) this.layoutSub.unsubscribe();
    window.removeEventListener('resize', this.checkScreenSize.bind(this));
  }
}