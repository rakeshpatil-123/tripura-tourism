import { Directive, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appBlockCopyPaste]',
  standalone: true
})
export class BlockCopyPasteDirective {
  @Input() blockCopyPaste: boolean = false;

  @HostListener('paste', ['$event']) blockPaste(event: ClipboardEvent) {
    if (this.blockCopyPaste) {
      event.preventDefault();
    }
  }

  @HostListener('copy', ['$event']) blockCopy(event: ClipboardEvent) {
    if (this.blockCopyPaste) {
      event.preventDefault();
    }
  }

  @HostListener('cut', ['$event']) blockCut(event: ClipboardEvent) {
    if (this.blockCopyPaste) {
      event.preventDefault();
    }
  }
}