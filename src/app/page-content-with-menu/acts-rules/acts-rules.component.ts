import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Subscription, finalize } from 'rxjs';

import { GenericService } from '../../_service/generic/generic.service';
import { LoaderService } from '../../_service/loader/loader.service';

interface ActRule {
  rule_name: string;
  file_url: string;
}

@Component({
  selector: 'app-acts-rules',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './acts-rules.component.html',
  styleUrl: './acts-rules.component.scss'
})
export class ActsRulesComponent implements OnInit, OnDestroy {

  subs = new Subscription();

  listOfActsAndRules: ActRule[] = [];
  // PDF Preview
  showPdfPreview = false;
  isPdfClosing = false;
  safePdfUrl: SafeResourceUrl | null = null;

  selectedDocument: ActRule | null = null;

  // PDF Zoom
  pdfZoom = 1;

  constructor(
    private genericService: GenericService,
    private loaderService: LoaderService,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    this.getActsAndRules();
  }

  /**
   * Get Acts & Rules
   */
  getActsAndRules(): void {
    this.loaderService.showLoader();

    const getActsRulesSubs = this.genericService
      .getByQueryParameter('/acts-and-rules', {})
      .pipe(
        finalize(() => this.loaderService.hideLoader())
      )
      .subscribe({
        next: (res: any) => {

          /*
           * Expected API response:
           *
           * {
           *   "data": [
           *     {
           *       "rule_name": "Homestay Notification",
           *       "file_url": "https://....pdf"
           *     }
           *   ]
           * }
           */

          if (Array.isArray(res?.data)) {
            this.listOfActsAndRules = res.data;

          } else if (Array.isArray(res)) {
            this.listOfActsAndRules = res;

          } else if (res?.rule_name && res?.file_url) {
            this.listOfActsAndRules = [res];

          } else {
            this.listOfActsAndRules = [];
          }
        },

        error: (err: any) => {
          // this.listOfActsAndRules = [
          //   {
          //     rule_name: 'SWAAGAT Rule e-Gazette Notification',
          //     file_url:
          //       'https://swaagatbackend.tripura.gov.in/new/storage/uploads/docs_swaagat/SWAAGAT_Rule_e_Gazette_notification.pdf'
          //   },
          //   {
          //     rule_name:
          //       'Tripura Industries Facilitation (Amendment) Act',
          //     file_url:
          //       'https://swaagatbackend.tripura.gov.in/new/storage/uploads/docs_swaagat/Tripura%20Industries%20Faciltation%20%28Amendment%29%20Act.pdf'
          //   },
          //   {
          //     rule_name:
          //       'The Tripura Industries (Facilitation) Act',
          //     file_url:
          //       'https://swaagatbackend.tripura.gov.in/new/storage/uploads/docs_swaagat/The_Tripura_Industries_Facilitation_Act.pdf'
          //   }
          // ];
          this.genericService.openSnackBar(err?.error?.message || err?.message || 'Something Went Wrong! please do again later.', 'error');
        }
      });

    this.subs.add(getActsRulesSubs);
  }

  /**
   * Open PDF Preview
   */
  openPdfPreview(document: ActRule): void {
    if (!document?.file_url) {
      return;
    }
    this.selectedDocument = document;
    this.pdfZoom = 1;
    this.safePdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(document.file_url);
    this.isPdfClosing = false;
    this.showPdfPreview = true;
    globalThis.document.body.style.overflow = 'hidden';
  }

  /**
   * Open PDF in new browser tab
   */
  openPdfInNewTab(document: ActRule): void {
    if (!document?.file_url) {
      return;
    }

    window.open(
      document.file_url,
      '_blank',
      'noopener,noreferrer'
    );
  }
  /**
   * Close PDF Preview
   */
  closePdfPreview(): void {
    this.isPdfClosing = true;

    setTimeout(() => {
      this.showPdfPreview = false;
      this.isPdfClosing = false;
      this.safePdfUrl = null;
      this.selectedDocument = null;
      document.body.style.overflow = '';
    }, 240);
  }

  /**
   * Zoom In
   */
  zoomIn(): void {
    this.pdfZoom = Math.min(
      this.pdfZoom + 0.1,
      1.6
    );
  }

  /**
   * Zoom Out
   */
  zoomOut(): void {
    this.pdfZoom = Math.max(
      this.pdfZoom - 0.1,
      0.8
    );
  }

  /**
   * Reset PDF Zoom
   */
  fitToWidth(): void {
    this.pdfZoom = 1;
  }

  /**
   * Get clean file name from URL
   */
  getFileName(fileUrl: string): string {
    if (!fileUrl) {
      return 'Document';
    }

    try {
      const cleanUrl = fileUrl.split('?')[0];
      const fileName = cleanUrl.substring(
        cleanUrl.lastIndexOf('/') + 1
      );

      return decodeURIComponent(fileName)
        .replace(/\.pdf$/i, '')
        .replace(/[_-]+/g, ' ')
        .trim();

    } catch {
      return 'Document';
    }
  }

  /**
   * Get document type based on name
   */
  getDocumentType(document: ActRule): string {
    const name = `${document?.rule_name || ''}`.toLowerCase();

    if (name.includes('amendment')) {
      return 'Amendment';
    }

    if (name.includes('rule')) {
      return 'Rules';
    }

    if (name.includes('guideline')) {
      return 'Guidelines';
    }

    if (name.includes('notification')) {
      return 'Notification';
    }

    if (name.includes('policy')) {
      return 'Policy';
    }

    if (name.includes('act')) {
      return 'Act';
    }

    return 'Document';
  }

  /**
   * TrackBy for better rendering performance
   */
  trackByDocument(
    index: number,
    document: ActRule
  ): string {
    return document?.file_url || `${index}`;
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();

    // Safety cleanup
    document.body.style.overflow = '';
  }
}
