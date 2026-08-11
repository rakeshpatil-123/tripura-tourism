import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { HeaderNewComponent } from './page-template/header-new/header-new.component';
import { NewNavComponent } from './page-template/new-nav/new-nav.component';
import { LoaderComponent } from './page-template/loader/loader.component';
import { FooterComponent } from './page-template/footer/footer.component';
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import {
  faMapMarkedAlt,
  faHotel,
  faUserTie,
  faHiking,
  faUserPlus,
  faFileAlt,
  faCloudUploadAlt,
  faCreditCard,
  faCheckCircle,
  faShieldAlt,
  faLandmark,
  faGlobe
} from '@fortawesome/free-solid-svg-icons';
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
import { TripuraTourismLicensingComponent } from "./tripura-tourism-licensing/tripura-tourism-licensing.component";
import { TripuraNocDashboardComponent } from "./tripura-noc-dashboard/tripura-noc-dashboard.component";

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
    TestimonialsComponent,
    TripuraTourismLicensingComponent,
    TripuraNocDashboardComponent
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
  helpSidebarOpen = false;
  showOtherComponents = false; // Toggle to show old components if needed

  // Hero background image
  heroBackgroundImage = 'assets/images/newBanner2.jpeg';
  // License Categories Data
  licenseCategories = [
    {
      icon: 'map-marked-alt',
      title: 'Tour Operator / Agency',
      description: 'Registered to plan and organize tours.'
    },
    {
      icon: 'hotel',
      title: 'Accommodation',
      description: 'Hotels, Homestays, Guesthouses.'
    },
    {
      icon: 'user-tie',
      title: 'Tourist Guide',
      description: 'Certified local expert storytellers.'
    },
    {
      icon: 'hiking',
      title: 'Adventure Tourism',
      description: 'Trekking, river rafting, and more.'
    }
  ];

  // Process Steps Data
  processSteps = [
    {
      text: '1. Register & Log In',
      icon: 'user-plus'
    },
    {
      text: '2. Select License',
      icon: 'file-alt'
    },
    {
      text: '3. Submit Documents',
      icon: 'cloud-upload-alt'
    },
    {
      text: '4. Pay Fee',
      icon: 'credit-card'
    },
    {
      text: '5. Receive License',
      icon: 'check-circle'
    }
  ];

  // Why Get Licensed Benefits
  whyBenefits = [
    {
      title: 'Build Trust',
      description: 'Show you operate with integrity.',
      icon: 'shield-alt'
    },
    {
      title: 'Government Support',
      description: 'Access grants, incentives, and training.',
      icon: 'landmark'
    },
    {
      title: 'Listing On Official Site',
      description: 'Be discovered by tourists.',
      icon: 'globe'
    }
  ];

  // Testimonials Data (keeping from original)
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
  private helpSidebarSubscription!: Subscription;

  constructor(
    private loaderService: LoaderService,
    private cdRef: ChangeDetectorRef,
    private genericService: GenericService,
    private helpService: HelpService,
    private router : Router,
    private library: FaIconLibrary
  ) {
    // Add FontAwesome icons to library
    library.addIcons(
      faMapMarkedAlt,
      faHotel,
      faUserTie,
      faHiking,
      faUserPlus,
      faFileAlt,
      faCloudUploadAlt,
      faCreditCard,
      faCheckCircle,
      faShieldAlt,
      faLandmark,
      faGlobe
    );
  }

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
    this.helpSidebarSubscription.unsubscribe();
  }

  openHelpSidebar() {
    this.helpService.openHelpSidebar();
  }

  goTo(path: string): void {
  window.location.href = this.getRedirectUrl(path);
}

  getRedirectUrl(path: string): string {
  if (!path) return path;

  // external URLs untouched
  if (/^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(path)) return path;

  const cleanPath = path.startsWith('/') ? path : '/' + path;

  const baseEl = document.querySelector('base');
  const baseHref = (baseEl?.getAttribute('href') || '').replace(/\/$/, '');

  return `${baseHref}${cleanPath}`;
}


  closeHelpSidebar() {
    this.helpService.closeHelpSidebar();
  }

  navigateToLogin() {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    if (token) {
      // If logged in, redirect to dashboard
      this.router.navigate(['/dashboard/home']);
    } else {
      // If not logged in, redirect to login page
      this.router.navigate(['/page/login']);
    }
  }
}
