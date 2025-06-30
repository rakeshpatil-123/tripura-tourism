import { Component } from '@angular/core';
import { SideBarMenu } from "./side-bar-menu/side-bar-menu";
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-page-content-with-menu',
  standalone: true,
  imports: [CommonModule, RouterModule, SideBarMenu],
  templateUrl: './page-content-with-menu.html',
  styleUrl: './page-content-with-menu.scss'
})
export class PageContentWithMenu {
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
