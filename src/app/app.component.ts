import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { HeaderNewComponent } from './page-template/header-new/header-new.component';
import { NewNavComponent } from './page-template/new-nav/new-nav.component';
import { LoaderComponent } from './page-template/loader/loader.component';
import { FooterComponent } from './page-template/footer/footer.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { LoaderService } from './_service/loader/loader.service';
import { HelpService } from './_service/help/help.service';
import { ExternalServicesRedirectionTrackingComponent } from './page-content-with-menu/external-services-redirection-tracking/external-services-redirection-tracking.component';
import { CommonModule } from '@angular/common';
import { GenericService } from './_service/generic/generic.service';
import { PageContentComponent } from "./page-content/page-content.component";
import { MiniFooterComponent } from './page-template/mini-footer/mini-footer.component';
import { LogoFooterComponent } from './page-template/logo-footer/logo-footer.component';
import { HelpFloatingButtonComponent } from "./page-template/help-floating-button/help-floating-button.component";
import { HelpSidebarComponent } from "./page-template/help-sidebar/help-sidebar.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    HeaderNewComponent,
    LoaderComponent,
    FooterComponent,
    FontAwesomeModule,
    NewNavComponent,
    PageContentComponent,
    MiniFooterComponent,
    LogoFooterComponent,
    HelpFloatingButtonComponent,
    HelpSidebarComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnDestroy {
  protected title = 'swaagat_2';
  showLoader: boolean = true;
  isLoggedIn: boolean = false;
  currentUrl: string = '';
  helpSidebarOpen = false; // Controls sidebar visibility

  private loaderSubscription!: Subscription;
  private helpSidebarSubscription!: Subscription; // Add help sidebar subscription

  constructor(
    private loaderService: LoaderService,
    private cdRef: ChangeDetectorRef,
    private genericService: GenericService,
    private helpService: HelpService, // Inject HelpService,
    private router : Router
  ) { }

  ngOnInit() {
    this.loaderSubscription = this.loaderService.getLoaderStatus().subscribe((status) => {
      this.showLoader = status;
      this.cdRef.detectChanges();
    });
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.currentUrl = event.url;
        this.cdRef.detectChanges();
      });

    this.genericService.getLoginStatus().subscribe((status) => {
      this.isLoggedIn = status;
      this.cdRef.detectChanges();
    });

    // Subscribe to help sidebar state changes
    this.helpSidebarSubscription = this.helpService.helpSidebar$.subscribe((isOpen) => {
      this.helpSidebarOpen = isOpen;
      this.cdRef.detectChanges();
    });

    this.checkToken();
  }

  checkToken() {
    const token = localStorage.getItem('token');
    this.isLoggedIn = !!token;
  }

  ngOnDestroy() {
    this.loaderSubscription.unsubscribe();
    this.helpSidebarSubscription.unsubscribe(); // Unsubscribe from help service
  }

  // Update these methods to use the service
  openHelpSidebar() {
    this.helpService.openHelpSidebar();
  }

  closeHelpSidebar() {
    this.helpService.closeHelpSidebar();
  }
}