import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LayoutService {
  private sidebarOpen = new BehaviorSubject<boolean>(false);
  sidebarOpen$ = this.sidebarOpen.asObservable();

  constructor() { }

  toggleSidebar(): void {
    this.sidebarOpen.next(!this.sidebarOpen.value);
  }

  closeSidebar(): void {
    if (this.sidebarOpen.value) {
      this.sidebarOpen.next(false);
    }
  }
}