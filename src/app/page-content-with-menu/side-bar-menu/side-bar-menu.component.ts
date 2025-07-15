import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './side-bar-menu.component.html',
  styleUrls: ['./side-bar-menu.component.scss']
})
export class SidebarComponent implements OnInit {
  @Input() isCollapsed = false;
  @Input() isVisible = false;
  @Output() onToggle = new EventEmitter<void>();
  @Output() onNavigate = new EventEmitter<void>();

  expandedSubmenu: string | null = null;

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Initialize component
  }

  toggleSubmenu(submenuId: string): void {
    if (this.isCollapsed) {
      // On collapsed sidebar, clicking a parent should expand the sidebar
      this.onToggle.emit();
      setTimeout(() => {
        this.expandedSubmenu = submenuId;
      }, 300); // Wait for sidebar to expand
    } else {
      this.expandedSubmenu = this.expandedSubmenu === submenuId ? null : submenuId;
    }
  }

  navigate(path: string): void {
    this.router.navigate([path]);
    this.onNavigate.emit();
  }
}