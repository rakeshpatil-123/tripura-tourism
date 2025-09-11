import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { HeaderNewComponent } from './page-template/header-new/header-new.component';
import { NewNavComponent } from './page-template/new-nav/new-nav.component';
import { LoaderComponent } from './page-template/loader/loader.component';
import { FooterComponent } from './page-template/footer/footer.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { LoaderService } from './_service/loader/loader.service';
import { ExternalServicesRedirectionTrackingComponent } from './page-content-with-menu/external-services-redirection-tracking/external-services-redirection-tracking.component';
import { CommonModule } from '@angular/common';
import { GenericService } from './_service/generic/generic.service';
import { PageContentComponent } from "./page-content/page-content.component";
import { MiniFooterComponent } from './page-template/mini-footer/mini-footer.component';
import { LogoFooterComponent } from './page-template/logo-footer/logo-footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderNewComponent, LoaderComponent, FooterComponent, FontAwesomeModule, NewNavComponent, PageContentComponent, MiniFooterComponent, LogoFooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnDestroy {
  protected title = 'swaagat_2';
  showLoginLayout = false;
  showLoader: boolean = false;
  isLoggedIn: boolean = false; 
  private loaderSubscription!: Subscription;

  constructor(
    private loaderService: LoaderService,
    private cdRef: ChangeDetectorRef,
    private genericService: GenericService,
    private router: Router

  ) {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.showLoginLayout = event.url === '/page/login';
      });
  }
  ngOnInit() {
    this.loaderSubscription = this.loaderService.getLoaderStatus().subscribe((status) => {
      //  console.log('Loader status:', status); // Debug log
      this.showLoader = status;
      this.cdRef.detectChanges();
    });

      this.genericService.getLoginStatus().subscribe((status) => {
    this.isLoggedIn = status;
    this.cdRef.detectChanges();
  });

      this.checkToken();
  }

   checkToken() {
    const token = localStorage.getItem('token'); 
    // console.log(token);
    this.isLoggedIn = !!token; 
  }

  ngOnDestroy() {
    this.loaderSubscription.unsubscribe();
  }

}
