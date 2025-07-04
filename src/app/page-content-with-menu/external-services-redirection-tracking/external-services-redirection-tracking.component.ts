import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { SHARED_IMPORTS } from '../../shared/shared-imports';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { LoaderService } from '../../_service/loader/loader.service';
import { CdkDrag } from '@angular/cdk/drag-drop';
import { IlogiInputDateComponent } from '../../customInputComponents/ilogi-input-date/ilogi-input-date.component';
import { IlogiInputComponent } from '../../customInputComponents/ilogi-input/ilogi-input.component';

@Component({
  selector: 'app-external-services-redirection-tracking',
  standalone: true,
  imports: [...SHARED_IMPORTS, CdkDrag, IlogiInputDateComponent, IlogiInputComponent],
  templateUrl: './external-services-redirection-tracking.component.html',
  styleUrls: ['./external-services-redirection-tracking.component.scss']
})
export class ExternalServicesRedirectionTrackingComponent implements OnInit {
  form = new FormGroup({
    registrationCertificateNo: new FormControl<string>('', [Validators.required]),
    dateOfIssue: new FormControl<Date | null>(null, [
      Validators.required,
      (control) => {
        if (control.value && control.value instanceof Date && control.value < new Date()) {
          return null;
        }
        return { custom: { status: true, message: 'Date must be in the past' } };
      }
    ])
  });
  submitted = false;
  errorMessages = {
    registrationCertificateNo: { required: 'Registration Certificate No. is required' },
    dateOfIssue: { required: 'Date of Issue is required', custom: 'Date must be in the past' }
  };
  loading = true;

  constructor(private loaderService: LoaderService, private cdr: ChangeDetectorRef) { }

  get registrationCertificateNoErrors() {
    return this.form.get('registrationCertificateNo')?.errors || null;
  }

  get dateOfIssueErrors() {
    return this.form.get('dateOfIssue')?.errors || null;
  }

  ngOnInit(): void {
    this.loaderService.showLoader();
    setTimeout(() => {
      this.loaderService.hideLoader();
      this.loading = false;
      this.cdr.detectChanges();
    }, 2000);
  }

  onSubmit(): void {
    this.submitted = true;
    this.cdr.detectChanges();
    if (this.form.valid) {
      console.log('Form submitted with value:', this.form.value);
    } else {
      console.log('Form is invalid');
    }
  }
}