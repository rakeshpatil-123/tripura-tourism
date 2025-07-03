// src/app/external-services-redirection-tracking/external-services-redirection-tracking.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { LoaderService } from '../../_service/loader/loader.service';
import { LoaderComponent } from "../../page-template/loader/loader.component";
import { IlogiInputComponent } from '../../customInputComponents/ilogi-input/ilogi-input.component';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-external-services-redirection-tracking',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatSortModule, IlogiInputComponent, ReactiveFormsModule],
  templateUrl: './external-services-redirection-tracking.component.html',
  styleUrl: './external-services-redirection-tracking.component.scss'
})
export class ExternalServicesRedirectionTrackingComponent implements OnInit {
  form = new FormGroup({
    registrationCertificateNo: new FormControl<string>('', [Validators.required])
  });
  submitted = false;
  errorMessages = {
    registrationCertificateNo: { required: 'Registration Certificate No. is required' }
  };
  loading = true;

  constructor(private loaderService: LoaderService) { }

  ngOnInit() {
    this.loaderService.showLoader();
    setTimeout(() => {
      this.loaderService.hideLoader();
      this.loading = false;
    }, 8000);
  }

  onSubmit() {
    this.submitted = true;
    if (this.form.valid) {
      console.log(this.form.value);
    }
  }
}