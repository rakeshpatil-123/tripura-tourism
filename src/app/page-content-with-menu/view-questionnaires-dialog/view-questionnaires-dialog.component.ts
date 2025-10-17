import { Component, Inject, OnInit } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogModule,
  MatDialog,
} from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { GenericService } from '../../_service/generic/generic.service';
import { AddQuestionnaireDialogComponent } from '../add-questionnaire-dialog/add-questionnaire-dialog.component';
import { Service } from '../admin-services/admin-services.component';
import { QuestionPreviewDialogComponent } from '../question-preview-dialog/question-preview-dialog.component';

@Component({
  selector: 'app-view-questionnaires-dialog',
  templateUrl: './view-questionnaires-dialog.component.html',
  styleUrls: ['./view-questionnaires-dialog.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  animations: [
    trigger('fadeInTable', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-10px)' }),
        animate(
          '400ms ease-out',
          style({ opacity: 1, transform: 'translateY(0)' })
        ),
      ]),
    ]),
    trigger('fadeInRow', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-10px)' }),
        animate(
          '300ms ease-out',
          style({ opacity: 1, transform: 'translateX(0)' })
        ),
      ]),
    ]),
  ],
})
export class ViewQuestionnairesDialogComponent implements OnInit {
  questionnaires: any[] = [];
  loading = true;

  displayedColumns: string[] = [
    'question_label',
    'question_type',
    'is_required',
    'options',
    'default_value',
    'group_label',
    'display_order',
    'display_width',
    'section_name',
    'created_by',
    'updated_by',
    'actions',
  ];

  constructor(
    private dialogRef: MatDialogRef<ViewQuestionnairesDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private genericService: GenericService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadQuestionnaires();
  }

  loadQuestionnaires() {
    this.loading = true;
    this.genericService
      .getServiceQuestionnaires(this.data.service.id)
      .subscribe({
        next: (res) => {
          this.questionnaires = (res.data || []).sort(
            (a: any, b: any) => (a.display_order ?? 0) - (b.display_order ?? 0)
          );
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this.snackBar.open('Failed to load questionnaires', 'error', {
            duration: 3000,
          });
        },
      });
  }

  editQuestionnaire(q: any) {
    const dialogRef = this.dialog.open(AddQuestionnaireDialogComponent, {
      width: '75%',
      maxWidth: '90vw',
      height: 'auto',
      maxHeight: '90vh',
      panelClass: 'center-dialog',
      data: { service: this.data.service, mode: 'edit', questionnaire: q },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'updated' || result === 'added') {
        this.loadQuestionnaires();
      }
    });
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  getOptionsAsString(options: any): string {
    if (!options) return '';
    return Array.isArray(options) ? options.join(', ') : options;
  }
  deleteQuestionnaire(service: any): void {
    if (
      confirm(`Delete questionnaire for label "${service.question_label}"?`)
    ) {
      this.genericService
        .deleteServiceQuestionnaires((service as any).id)
        .subscribe({
          next: () => {
            this.genericService.openSnackBar(
              'Questionnaire deleted successfully.',
              'Success'
            );
            this.loadQuestionnaires();
          },
          error: () => {
            this.genericService.openSnackBar(
              'Error deleting questionnaire.',
              'Error'
            );
          },
        });
    }
  }
  downloadPdf(pdfUrl: string): void {
    if (!pdfUrl) return;
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.target = '_blank';
    link.download = pdfUrl.split('/').pop() || 'template_format.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    this.genericService.openSnackBar('Template Format downloaded successfully.', 'Success');
  }
  openQuestionPreview() {
    this.dialog.open(QuestionPreviewDialogComponent, {
      width: '80vw',
      height: '80vh',
      maxWidth: '95vw',
      maxHeight: '90vh',
      panelClass: 'custom-preview-dialog',
      data: { serviceId: this.data.service.id }
    });
  }
}
