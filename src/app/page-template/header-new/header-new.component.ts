import { ChangeDetectorRef, Component, OnDestroy, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { GenericService } from '../../_service/generic/generic.service';

declare var google: any; // let TS know about Google Translate

@Component({
  selector: 'app-header-new',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header-new.component.html',
  styleUrl: './header-new.component.scss'
})
export class HeaderNewComponent implements OnInit, OnDestroy, AfterViewInit {
  logoPath = '../SWAAGAT 2.0 Logo Recreated.png';
  protected isLoggedIn: boolean = false;
  private loginSubscription!: Subscription;

  constructor(
    private genericService: GenericService,
    private cdRef: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit() {
    this.checkToken();

    this.loginSubscription = this.genericService.getLoginStatus().subscribe((status) => {
      this.isLoggedIn = status;
      this.cdRef.detectChanges();
    });
  }

  ngAfterViewInit(): void {
    // Re-run Google Translate init after Angular renders
    setTimeout(() => {
      if (typeof google !== 'undefined' && google.translate) {
        new google.translate.TranslateElement(
          {
            pageLanguage: 'en',
            includedLanguages:
              'hi,bn,te,mr,ta,ur,gu,kn,ml,pa,or,as,mai,ne,ks,sd,sa,doi,mni,bo,brx,sat,kok',
            layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
          },
          'google_translate_element'
        );
      }
    }, 500);
  }

  checkToken() {
    const token = localStorage.getItem('token');
    this.isLoggedIn = !!token;
  }

  logout() {
    this.genericService.logoutUser();
    localStorage.removeItem('token');
    this.isLoggedIn = false;
    // window.location.href = '/';
    window.location.href = this.getRedirectUrl('/');
  }
  private getRedirectUrl(path: string): string {
    const { origin, pathname } = window.location;
    const basePath = pathname.startsWith('/new') ? '/new' : '';
    const normalized = path.startsWith('/') ? path : `/${path}`;
    return `${origin}${basePath}${normalized}`;
  }

  navigateToRegister() {
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/page/registration']).then(
        (success: boolean) => {
        },
        (error: any) => {
          window.location.href = this.getRedirectUrl('/page/registration');
        }
      );
    }).catch(() => {
      window.location.href = this.getRedirectUrl('/page/registration');
    });
  }

  ngOnDestroy() {
    if (this.loginSubscription) {
      this.loginSubscription.unsubscribe();
    }
  }
}