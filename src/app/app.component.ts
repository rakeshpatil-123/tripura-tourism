import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd, RouterLink } from '@angular/router';
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
import { MarqueeCardsComponent } from "./page-content-with-menu/marquee-cards/marquee-cards.component";
import { ImageZoomCardComponent } from "./page-content-with-menu/image-zoom-card/image-zoom-card.component";
import { ChooseDestinationComponent } from "./page-content-with-menu/choose-destination/choose-destination.component";
import { TestimonialsComponent } from "./page-content-with-menu/testimonials/testimonials.component";

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
    RouterLink,
    NewNavComponent,
    PageContentComponent,
    MiniFooterComponent,
    LogoFooterComponent,
    HelpFloatingButtonComponent,
    HelpSidebarComponent,
    MarqueeCardsComponent,
    ImageZoomCardComponent,
    ChooseDestinationComponent,
    TestimonialsComponent
],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnDestroy {
  protected title = 'swaagat_2';
  showLoader: boolean = true;
  isLoggedIn: boolean = false;
  currentUrl: string = '';
  currentPath: any = '';
  helpSidebarOpen = false; // Controls sidebar visibility
rawTestimonials: any[] = [
  {
    name: 'Rohan Saha',
    place: 'Agartala, Tripura',
    text: `Agartala is truly a cultural extravaganza that captures the soul of Tripura.
    Walking through the grand Ujjayanta Palace felt like stepping back into history, while
    the vibrant local bazaars reflected the warmth and simplicity of the people.
    The traditional Tripuri dance performances were mesmerizing, full of energy, rhythm,
    and deep cultural meaning. Every corner of the city speaks of heritage, art, and pride.
    Agartala beautifully preserves its roots while welcoming visitors with open arms.`
  },
  {
    name: 'Amrita Roy',
    place: 'Kolkata, India',
    text: `Tripura is a hidden gem of the Northeast that left an everlasting impression on us.
    The serene landscapes, calm surroundings, and warm hospitality made every moment special.
    From ancient temples echoing spiritual calm to the breathtaking beauty of Neermahal
    standing gracefully on water, the journey felt magical. The simplicity of life,
    untouched nature, and welcoming locals made us feel at home.
    Tripura is a destination we would love to return to again and again.`
  },
  {
    name: 'Vikram Deb',
    place: 'Assam, India',
    text: `Sepahijala Wildlife Sanctuary is nothing short of a paradise for nature lovers.
    The rich diversity of flora and fauna is truly impressive, offering a peaceful escape
    into the lap of nature. The boat ride on Rudrasagar Lake was calm and refreshing,
    while the treetop walkway gave a thrilling yet safe experience above the forest canopy.
    The sanctuary reflects commendable conservation efforts and thoughtful planning.
    It is a must-visit destination for anyone who loves wildlife and eco-tourism.`
  }
];


  myTestimonials: any[] = this.rawTestimonials.map(t => ({
    author: t.name,
    text: t.text,
    location: t.place
  }));

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
    this.currentPath = this.router.url;

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.currentPath = event.urlAfterRedirects;
      });
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
