import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';
import { HeaderComponent } from './page-template/header/header.component';
import { LoaderComponent } from './page-template/loader/loader.component';
import { FooterComponent } from './page-template/footer/footer.component';
import { LoaderService } from './_service/loader/loader.service';
import { ExternalServicesRedirectionTrackingComponent } from './page-content-with-menu/external-services-redirection-tracking/external-services-redirection-tracking.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, HeaderComponent, LoaderComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnDestroy {
  protected title = 'swaagat_2';
  showLoader: boolean = true;
  private loaderSubscription!: Subscription;

  constructor(
    private loaderService: LoaderService,
    private cdRef: ChangeDetectorRef

  ) { }
  ngOnInit() {
    this.loaderSubscription = this.loaderService.getLoaderStatus().subscribe((status) => {
      console.log('Loader status:', status); // Debug log
      this.showLoader = status;
      this.cdRef.detectChanges();
    });
  }

  ngOnDestroy() {
    this.loaderSubscription.unsubscribe();
  }

}
