import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { GenericService } from '../../_service/generic/generic.service';

declare const google: any;

@Component({
  selector: 'app-header-new',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header-new.component.html',
  styleUrls: ['./header-new.component.scss']
})
export class HeaderNewComponent implements OnInit, AfterViewInit, OnDestroy {
  logoPath = '/assets/images/tripuratourismlogo.png';
  isLoggedIn: boolean = false;
  private loginSubscription!: Subscription;

  constructor(
    private genericService: GenericService,
    private cdRef: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.checkToken();

    // Subscribe to login status from service
    this.loginSubscription = this.genericService.getLoginStatus().subscribe((status: boolean) => {
      this.isLoggedIn = !!status;
      this.cdRef.detectChanges();
    });
  }

  ngAfterViewInit(): void {
    // Initialize Google Translate after render (if available)
    setTimeout(() => {
      try {
        if (typeof google !== 'undefined' && google?.translate) {
          new google.translate.TranslateElement(
            {
              pageLanguage: 'en',
              includedLanguages:
                'hi,bn,te,mr,ta,ur,gu,kn,ml,pa,or,as,mai,ne,ks,sd,sa,doi,mni,bo,brx,sat,kok',
              layout: google.translate.TranslateElement.InlineLayout.SIMPLE
            },
            'google_translate_element'
          );
        }
      } catch (e) {
        // fail silently if google script not loaded yet
        // console.warn('Google translate init failed', e);
      }
    }, 600);
  }

  checkToken(): void {
    const token = localStorage.getItem('token');
    this.isLoggedIn = !!token;
  }

  logout(): void {
    try {
      this.genericService.logoutUser();
    } catch (e) {
      // ignore if service method absent
    }
    localStorage.removeItem('token');
    this.isLoggedIn = false;
    // prefer SPA navigation but handle base path fallback
    const redirect = this.getRedirectUrl('/');
    window.location.href = redirect;
  }

  navigateToLogin(): void {
    this.router.navigateByUrl('/page/login').catch(() => {
      window.location.href = this.getRedirectUrl('/page/login');
    });
  }

  navigateToRegister(): void {
    // attempt SPA navigation, fallback to full reload
    this.router.navigateByUrl('/page/registration').catch(() => {
      window.location.href = this.getRedirectUrl('/page/registration');
    });
  }

  private getRedirectUrl(path: string): string {
    const { origin, pathname } = window.location;
    const basePath = pathname.startsWith('/new') ? '/new' : '';
    const normalized = path.startsWith('/') ? path : `/${path}`;
    return `${origin}${basePath}${normalized}`;
  }

  ngOnDestroy(): void {
    if (this.loginSubscription) {
      this.loginSubscription.unsubscribe();
    }
  }
}
