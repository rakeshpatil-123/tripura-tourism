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
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}
