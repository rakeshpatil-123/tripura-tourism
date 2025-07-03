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
  }
  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }
}