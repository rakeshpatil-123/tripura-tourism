import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LayoutService {
  private sidebarOpenSubject = new BehaviorSubject<boolean>(false);
  sidebarOpen$ = this.sidebarOpenSubject.asObservable();
  
  private sidebarCollapsedSubject = new BehaviorSubject<boolean>(false);
  sidebarCollapsed$ = this.sidebarCollapsedSubject.asObservable();

  constructor() {}

  openSidebar(): void {
    this.sidebarOpenSubject.next(true);
    document.body.classList.add('sidebar-open');
  }

  closeSidebar(): void {
    this.sidebarOpenSubject.next(false);
    document.body.classList.remove('sidebar-open');
  }

  toggleSidebar(): void {
    const isOpen = this.sidebarOpenSubject.getValue();
    if (isOpen) {
      this.closeSidebar();
    } else {
      this.openSidebar();
    }
  }
  
  setSidebarCollapsed(isCollapsed: boolean): void {
    this.sidebarCollapsedSubject.next(isCollapsed);
  }
}