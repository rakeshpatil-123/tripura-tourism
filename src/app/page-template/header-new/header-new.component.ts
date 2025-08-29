import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { GenericService } from '../../_service/generic/generic.service';

@Component({
  selector: 'app-header-new',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header-new.component.html',
  styleUrl: './header-new.component.scss'
})
export class HeaderNewComponent implements OnInit, OnDestroy {
  logoPath = '../SWAAGAT 2.0 Logo Recreated.png';
  protected isLoggedIn: boolean = false;
  private loginSubscription!: Subscription;

  constructor(
    private genericService: GenericService,
    private cdRef: ChangeDetectorRef,
    private router: Router
  ) { }

  ngOnInit() {
    this.checkToken();

    this.loginSubscription = this.genericService.getLoginStatus().subscribe((status) => {
      this.isLoggedIn = status;
      this.cdRef.detectChanges();
    });
  }

  checkToken() {
    const token = localStorage.getItem('token');
    this.isLoggedIn = !!token;
  }

  logout() {
    localStorage.removeItem('token');
    this.isLoggedIn = false;
    this.genericService.setLoginStatus(false);
    this.router.navigate(['/auth/login']);
  }

  // New clean registration method
  navigateToRegister() {
    console.log('Navigating to registration page...');
    
    // Clear any existing navigation state
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/auth/registration']).then(
        (success: boolean) => {
          console.log('Registration navigation successful:', success);
        },
        (error: any) => {
          console.error('Registration navigation failed:', error);
          // Fallback: try direct URL navigation
          window.location.href = '/auth/registration';
        }
      );
    });
  }

  ngOnDestroy() {
    if (this.loginSubscription) {
      this.loginSubscription.unsubscribe();
    }
  }
}