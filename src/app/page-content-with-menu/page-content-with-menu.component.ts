import { Component } from '@angular/core';
import { SideBarMenuComponent } from "./side-bar-menu/side-bar-menu.component";
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-page-content-with-menu',
  standalone: true,
  imports: [CommonModule, RouterModule, SideBarMenuComponent],
  templateUrl: './page-content-with-menu.component.html',
  styleUrl: './page-content-with-menu.component.scss'
})
export class PageContentWithMenuComponent {
  isMenuOpen: boolean = true;

  constructor(
    private router: Router,
  ) {

  }

  ngOnInit() {
  }

  onSidebarToggle() {
    this.isMenuOpen = !this.isMenuOpen;
  }
}
