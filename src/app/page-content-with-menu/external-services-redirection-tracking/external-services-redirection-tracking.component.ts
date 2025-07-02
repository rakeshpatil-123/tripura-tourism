// src/app/external-services-redirection-tracking/external-services-redirection-tracking.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { LoaderService } from '../../_service/loader/loader.service';
import { LoaderComponent } from "../../page-template/loader/loader.component";

@Component({
  selector: 'app-external-services-redirection-tracking',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatSortModule],
  templateUrl: './external-services-redirection-tracking.component.html',
  styleUrl: './external-services-redirection-tracking.component.scss'
})
export class ExternalServicesRedirectionTrackingComponent implements OnInit {
  constructor(private loaderService: LoaderService) { }
  public loading: boolean = true;

  ngOnInit() {
    this.loaderService.showLoader();
    setTimeout(() => this.loaderService.hideLoader(), 8000);
  }
}