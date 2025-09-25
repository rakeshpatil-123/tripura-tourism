import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HelpService {
  private helpSidebarSubject = new BehaviorSubject<boolean>(false);
  public helpSidebar$ = this.helpSidebarSubject.asObservable();

  constructor() { }

  openHelpSidebar(): void {
    this.helpSidebarSubject.next(true);
  }

  closeHelpSidebar(): void {
    this.helpSidebarSubject.next(false);
  }

  toggleHelpSidebar(): void {
    this.helpSidebarSubject.next(!this.helpSidebarSubject.value);
  }

  get isHelpSidebarOpen(): boolean {
    return this.helpSidebarSubject.value;
  }
}