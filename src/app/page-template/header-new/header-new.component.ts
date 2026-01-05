import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  Renderer2,
  ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { GenericService } from '../../_service/generic/generic.service';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { A11yModule } from '@angular/cdk/a11y';

@Component({
  selector: 'app-header-new',
  standalone: true,
  imports: [CommonModule, RouterLink, A11yModule],
  templateUrl: './header-new.component.html',
  styleUrls: ['./header-new.component.scss']
})
export class HeaderNewComponent implements OnInit, AfterViewInit, OnDestroy {
  logoPath = '/assets/images/tripuratourismlogo.png';
  isLoggedIn: boolean = false;
  private loginSubscription!: Subscription;
   reading = false;
  useBrowserTTS = false; // toggle: false = LiveAnnouncer (screen reader), true = browser TTS
  private readTimeouts: number[] = [];
  private speechUtterance?: SpeechSynthesisUtterance;

  // Accessibility state
  @ViewChild('srDialog') srDialogRef!: ElementRef<HTMLDivElement>;
  dialogOpen = false;
  previouslyFocused?: Element | null;
  screenReaderMode = false;
  liveMessage = '';

  // font size state: 'small' | 'normal' | 'large'
  fontSize: 'small' | 'normal' | 'large' = 'normal';

  constructor(
    private genericService: GenericService,
    private cdRef: ChangeDetectorRef,
    private renderer: Renderer2,
    private hostEl: ElementRef,
    private router: Router,
    private liveAnnouncer: LiveAnnouncer
  ) {}

  ngOnInit(): void {
    this.checkToken();
    // login status subscription (if available)
    try {
      this.loginSubscription = this.genericService.getLoginStatus().subscribe((status: boolean) => {
        this.isLoggedIn = !!status;
        this.cdRef.detectChanges();
      });
    } catch (e) {
      // ignore if service isn't present or method missing
    }

    // restore persisted font size
    const saved = localStorage.getItem('site-font-size');
    if (saved === 'small' || saved === 'large' || saved === 'normal') {
      this.fontSize = saved;
    } else {
      this.fontSize = 'normal';
    }
    this.applyFontSize(this.fontSize, false);
  }

  ngAfterViewInit(): void {
    // any extra after view init work (kept from your original)
    // no google translate changes here
  }
   readPageContent(): void {
    if (this.reading) return; // already reading
    const text = this.getPageTextToRead();
    if (!text) {
      // nothing to read
      this.liveAnnouncer.announce('No readable content found on this page.', 'polite');
      return;
    }

    this.reading = true;

    // If too long, split into smaller chunks (AT and browser TTS are happier with modest sizes)
    const chunks = this.chunkText(text, 900); // ~900 chars per chunk

    if (this.useBrowserTTS && 'speechSynthesis' in window) {
      this.speakWithBrowserTTS(chunks);
    } else {
      this.announceWithLiveAnnouncer(chunks);
    }
  }

  stopReading(): void {
    // stop pending timeouts
    this.readTimeouts.forEach((id) => window.clearTimeout(id));
    this.readTimeouts = [];

    // stop browser utterance if playing
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    } catch (e) {}

    this.reading = false;
    // announce stopping using LiveAnnouncer so screen readers get notified
    try {
      this.liveAnnouncer.announce('Stopped reading.', 'polite');
    } catch (e) {}
  }

  /** Gather visible page text to read: first look for #mainContent or <main>, fallback to body */
  private getPageTextToRead(): string {
    const main = document.getElementById('mainContent') || document.querySelector('main');
    const source = main || document.body;
    if (!source) return '';
    // Only read visible text — use innerText (not textContent) to avoid script/styles and hidden text.
    let text = (source as HTMLElement).innerText || '';
    // normalize whitespace
    text = text.replace(/\s{2,}/g, ' ').trim();
    // optional safety limit — avoid extremely long streams (can be chunked)
    if (text.length === 0) return '';
    return text;
  }

  /** Split long text into readable chunks (splits at sentence-ish boundaries if possible) */
  private chunkText(text: string, maxLen = 900): string[] {
    if (text.length <= maxLen) return [text];

    const chunks: string[] = [];
    let remaining = text.trim();

    while (remaining.length > 0) {
      if (remaining.length <= maxLen) {
        chunks.push(remaining.trim());
        break;
      }

      // try to find a sentence end before maxLen
      const slice = remaining.slice(0, maxLen);
      const lastPeriod = Math.max(
        slice.lastIndexOf('. '),
        slice.lastIndexOf('? '),
        slice.lastIndexOf('! ')
      );

      if (lastPeriod > Math.floor(maxLen * 0.4)) {
        // split at sentence boundary
        const chunk = remaining.slice(0, lastPeriod + 1).trim();
        chunks.push(chunk);
        remaining = remaining.slice(lastPeriod + 1).trim();
      } else {
        // fallback: split at maxLen
        const chunk = remaining.slice(0, maxLen).trim();
        chunks.push(chunk);
        remaining = remaining.slice(maxLen).trim();
      }
    }
    return chunks;
  }

  /** Use LiveAnnouncer to sequentially announce chunks (polite) */
  private announceWithLiveAnnouncer(chunks: string[]): void {
    // announce a start message
    try {
      this.liveAnnouncer.announce('Start reading page content.', 'polite');
    } catch (e) {}

    // schedule announcements spaced out so screen readers read fully
    let delay = 400; // initial short delay
    const spacing = 900; // spacing between chunks (ms) — adjust as needed

    chunks.forEach((chunk, i) => {
      const id = window.setTimeout(() => {
        try {
          // announce each chunk
          this.liveAnnouncer.announce(chunk, 'polite');
        } catch (e) {}
        // if last chunk, clear state after a small delay
        if (i === chunks.length - 1) {
          const endId = window.setTimeout(() => {
            this.reading = false;
            try {
              this.liveAnnouncer.announce('Finished reading page content.', 'polite');
            } catch (e) {}
            window.clearTimeout(endId);
          }, 500);
          this.readTimeouts.push(endId);
        }
      }, delay);
      this.readTimeouts.push(id);
      delay += spacing;
    });
  }

  /** Use browser TTS (SpeechSynthesis) to speak chunks. Works even without screen reader. */
  private speakWithBrowserTTS(chunks: string[]): void {
    if (!('speechSynthesis' in window)) {
      // fallback to LiveAnnouncer
      this.announceWithLiveAnnouncer(chunks);
      return;
    }

    // Cancel any previous speech
    window.speechSynthesis.cancel();

    // chain utterances
    const speakNext = (index: number) => {
      if (!this.reading || index >= chunks.length) {
        this.reading = false;
        try {
          this.liveAnnouncer.announce('Finished reading page content.', 'polite');
        } catch (e) {}
        return;
      }
      const u = new SpeechSynthesisUtterance(chunks[index]);
      // optionally choose voice/lang if you want:
      // u.lang = 'en-US';
      u.rate = 1; // normal speed
      u.onend = () => {
        speakNext(index + 1);
      };
      u.onerror = () => {
        // if error, fallback to LiveAnnouncer for remaining chunks
        this.announceWithLiveAnnouncer(chunks.slice(index));
      };
      this.speechUtterance = u;
      window.speechSynthesis.speak(u);
    };

    try {
      this.liveAnnouncer.announce('Start reading page content using browser text to speech.', 'polite');
    } catch (e) {}
    speakNext(0);
  }

  ngOnDestroy(): void {
    // existing cleanup...
    this.stopReading();
    if (this.loginSubscription) {
      this.loginSubscription.unsubscribe();
    }
    const dialogEl = this.srDialogRef?.nativeElement;
    if (dialogEl) dialogEl.removeEventListener('keydown', this.onDialogKeydownBound);
  }

  // ---------- Authentication helpers ----------
  checkToken(): void {
    const token = localStorage.getItem('token');
    this.isLoggedIn = !!token;
  }

  logout(): void {
    try {
      this.genericService.logoutUser();
    } catch (e) {}
    localStorage.removeItem('token');
    this.isLoggedIn = false;
    const redirect = this.getRedirectUrl('/');
    window.location.href = redirect;
  }

  navigateToLogin(): void {
    // try router navigation if available, else fallback
    try {
      (this.router as any).navigateByUrl('/page/login');
    } catch {
      window.location.href = this.getRedirectUrl('/page/login');
    }
  }

  navigateToRegister(): void {
    try {
      (this.router as any).navigateByUrl('/page/registration');
    } catch {
      window.location.href = this.getRedirectUrl('/page/registration');
    }
  }

  private getRedirectUrl(path: string): string {
    if (!path) return '';
    const { origin } = window.location;
    const normalized = path.startsWith('/') ? path : `/${path}`;
    const baseEl = document.querySelector('base');
    const basePath = baseEl?.getAttribute('href')?.replace(/\/$/, '') || '';
    return `${origin}${basePath}${normalized}`;
  }

  // ---------- Screen Reader dialog controls ----------
  openSrDialog(): void {
    this.previouslyFocused = document.activeElement;
    this.dialogOpen = true;
    this.cdRef.detectChanges();

    // small timeout to allow dialog element to exist
    setTimeout(() => {
      const dialogEl = this.srDialogRef?.nativeElement;
      if (!dialogEl) return;
      // focus the first focusable element in dialog
      const focusable = dialogEl.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      focusable?.focus();
      // trap keys
      dialogEl.addEventListener('keydown', this.onDialogKeydownBound);
    }, 0);
  }

  closeSrDialog(): void {
    this.dialogOpen = false;
    const dialogEl = this.srDialogRef?.nativeElement;
    if (dialogEl) {
      dialogEl.removeEventListener('keydown', this.onDialogKeydownBound);
    }
    // restore focus
    (this.previouslyFocused as HTMLElement | null)?.focus?.();
    this.previouslyFocused = undefined;
    this.cdRef.detectChanges();
  }

  // bound function reference so we can add/remove listener
  private onDialogKeydownBound = (ev: KeyboardEvent) => this.onDialogKeydown(ev);

  private onDialogKeydown(ev: KeyboardEvent) {
    if (!this.dialogOpen) return;
    if (ev.key === 'Escape') {
      ev.preventDefault();
      this.closeSrDialog();
      return;
    }
    if (ev.key === 'Tab') {
      // basic focus trap inside dialog
      const dialogEl = this.srDialogRef?.nativeElement;
      if (!dialogEl) return;
      const focusable = Array.from(
        dialogEl.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => !el.hasAttribute('disabled'));
      if (focusable.length === 0) {
        ev.preventDefault();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (!ev.shiftKey && active === last) {
        ev.preventDefault();
        first.focus();
      } else if (ev.shiftKey && active === first) {
        ev.preventDefault();
        last.focus();
      }
    }
  }

  // Skip to main content (find element with id="mainContent" or first <main>)
  skipToMainContent(): void {
    const main = document.getElementById('mainContent') || document.querySelector('main');
    if (main) {
      // ensure focusable
      (main as HTMLElement).setAttribute('tabindex', '-1');
      (main as HTMLElement).focus();
      this.announce('Skipped to main content');
    } else {
      this.announce('Main content not found');
    }
    this.closeSrDialog();
  }

/** Improved announce + small guarantee of DOM update so AT picks it up */
announce(msg: string): void {
  // Clear first (helps ensure repeated messages are read)
  this.liveMessage = '';
  this.cdRef.detectChanges();

  // Small delay to ensure DOM updated with empty string, then set actual message
  setTimeout(() => {
    this.liveMessage = msg;
    this.cdRef.detectChanges();

    // Clear after a few seconds to avoid stale content in the live region
    setTimeout(() => {
      this.liveMessage = '';
      this.cdRef.detectChanges();
    }, 3500);
  }, 60);
}
enableScreenReaderMode(): void {
  this.screenReaderMode = true;

  // Optional: add visual helper class
  document.body.classList.add('sr-mode');

  // 🔊 Screen reader will speak this (if enabled)
  this.liveAnnouncer.announce(
    'Screen reader mode enabled. Use Skip to main content to jump to the page.',
    'polite' // or 'assertive' if critical
  );

  // Close dialog AFTER announce (safe timing handled by CDK)
  this.closeSrDialog();
}




  // ---------- Font controls ----------
  increaseFont(): void {
    this.applyFontSize('large', true);
  }
  resetFont(): void {
    this.applyFontSize('normal', true);
  }
  decreaseFont(): void {
    this.applyFontSize('small', true);
  }

  /**
   * Apply font size to document root (html) using Renderer2.
   * Also persist to localStorage if persist=true.
   */
  applyFontSize(size: 'small' | 'normal' | 'large', persist = true) {
    this.fontSize = size;
    const docEl = document.documentElement;
    // remove any inline font-size style first
    this.renderer.setStyle(docEl, 'font-size', null);

    let px = '16px';
    if (size === 'small') px = '14px';
    if (size === 'normal') px = '16px';
    if (size === 'large') px = '18px';

    // set font size on root element so rem-based UI scales
    this.renderer.setStyle(docEl, 'font-size', px);

    if (persist) {
      localStorage.setItem('site-font-size', size);
      this.announce(
        size === 'small' ? 'Font size decreased' : size === 'large' ? 'Font size increased' : 'Font size reset to normal'
      );
    }
    this.cdRef.detectChanges();
  }

  // ngOnDestroy(): void {
  //   if (this.loginSubscription) {
  //     this.loginSubscription.unsubscribe();
  //   }
  //   // clean up dialog listeners if any
  //   const dialogEl = this.srDialogRef?.nativeElement;
  //   if (dialogEl) {
  //     dialogEl.removeEventListener('keydown', this.onDialogKeydownBound);
  //   }
  // }
}
