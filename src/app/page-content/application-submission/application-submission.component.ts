import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-application-submission',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './application-submission.component.html',
  styleUrls: ['./application-submission.component.scss'],
})
export class ApplicationSubmissionComponent implements OnInit {
  applicationData: any = null;
  loading = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const queryParams = params as {
        user_id?: string;
        swaagat_user_name?: string;
        service_id?: string;
        applicationId?: string;
        payment_status?: string;
        status?: string;
        max_processing_date?: string;
        noc_number?: string;
        noc_valid_till?: string;
        source?: string;
      };

      if (!queryParams.applicationId) {
        this.error = 'Missing application ID';
        this.loading = false;
        return;
      }

      this.applicationData = {
        user_id: queryParams.user_id ? parseInt(queryParams.user_id, 10) : null,
        swaagat_user_name: queryParams.swaagat_user_name || '',
        service_id: queryParams.service_id
          ? parseInt(queryParams.service_id, 10)
          : null,
        applicationId: queryParams.applicationId || '',
        payment_status: queryParams.payment_status || '',
        status: queryParams.status || '',
        max_processing_date: queryParams.max_processing_date || '',
        noc_number: queryParams.noc_number || '',
        noc_valid_till: queryParams.noc_valid_till || '',
        source: queryParams.source || 'third_party',
      };
      console.log(this.applicationData, 'Data');

      this.sendToBackend(this.applicationData)
        .subscribe({
          next: (response) => {
            console.log('Data sent to backend successfully:', response);
          },
          error: (err) => {
            console.error('Failed to send data to backend:', err);
          },
        })
        .add(() => {
          this.loading = false;
        });
    });
  }

  sendToBackend(data: any) {
    return this.http.post(
      'http://swaagatstaging.tripura.cloud/api/user/third-party/return',
      data
    );
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}
