import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { animate, style, transition, trigger } from '@angular/animations';
import { GenericService } from '../../_service/generic/generic.service';
import { LoaderService } from '../../_service/loader/loader.service';

@Component({
  selector: 'app-question-preview-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatDividerModule,
    MatTooltipModule,
    MatCardModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatRadioModule,
    MatDatepickerModule,
  ],
  templateUrl: './question-preview-dialog.component.html',
  styleUrls: ['./question-preview-dialog.component.scss'],
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(15px)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
    ]),
  ],
})
export class QuestionPreviewDialogComponent implements OnInit {
  loading = false;
  questionnaires: any[] = [];

  constructor(
    private dialogRef: MatDialogRef<QuestionPreviewDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { serviceId: number },
    private genericService: GenericService,
    private loaderService: LoaderService
  ) { }

  ngOnInit(): void {
    this.loadQuestionnaires();
  }

  loadQuestionnaires() {
    this.loading = true;
    this.loaderService.showLoader();
    this.genericService.getServiceQuestionnaires(this.data.serviceId).subscribe({
      next: (res: any) => {
        this.questionnaires = (res.data || []).sort(
          (a: any, b: any) => (a.display_order ?? 0) - (b.display_order ?? 0)
        );
        this.loading = false;
        this.loaderService.hideLoader();
      },
      error: () => {
        this.loading = false;
        this.loaderService.hideLoader();
      },
    });
  }

  close() {
    this.dialogRef.close();
  }

  getOptions(q: any): string[] {
    return (q.options || '').split(',').map((o: string) => o.trim()).filter(Boolean);
  }
}
