import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';
import { HeaderComponent } from './page-template/header/header.component';
import { LoaderComponent } from './page-template/loader/loader.component';
import { FooterComponent } from './page-template/footer/footer.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { LoaderService } from './_service/loader/loader.service';
import { ExternalServicesRedirectionTrackingComponent } from './page-content-with-menu/external-services-redirection-tracking/external-services-redirection-tracking.component';
import { CommonModule } from '@angular/common';
import { GenericService } from './_service/generic/generic.service';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, HeaderComponent, LoaderComponent, FooterComponent , FontAwesomeModule, ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnDestroy {
  protected title = 'swaagat_2';
  showLoader: boolean = true;
  isLoggedIn: boolean = false; 
  private loaderSubscription!: Subscription;

  constructor(
    private loaderService: LoaderService,
    private cdRef: ChangeDetectorRef,
    private genericService: GenericService

  ) { }
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
