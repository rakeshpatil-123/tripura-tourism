// dynamic-card-container.component.ts
import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, SecurityContext } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

export interface CardData {
  id?: string;
  title: string;
  description: string;
  features: string[];
  buttonText?: string;
  icon?: SafeHtml; // Now SafeHtml instead of string class
  gradient?: string;
}

@Component({
  selector: 'dynamic-card-container',
  imports: [CommonModule],
  templateUrl: './dynamic-card-container.component.html',
  styleUrls: ['./dynamic-card-container.component.scss'],
  standalone: true,
})
export class DynamicCardContainerComponent implements OnInit {
  @Input() cardData: CardData[] = [];

  // ✅ 12 Beautiful, Curated Gradients
  private readonly gradients = [
    'linear-gradient(135deg, rgb(47, 99, 177), rgb(93, 81, 194))',
    'linear-gradient(135deg, rgb(25, 138, 117), rgb(44, 130, 170))',
    'linear-gradient(135deg, rgb(119, 16, 132), rgb(168, 31, 115))',
    'linear-gradient(135deg, rgb(17, 156, 135), rgb(34, 136, 191))',
    'linear-gradient(135deg, rgb(122, 21, 82), rgb(156, 38, 50))',
    'linear-gradient(135deg, rgb(63, 94, 251), rgb(252, 70, 108))',
    'linear-gradient(135deg, rgb(34, 197, 94), rgb(13, 148, 135))',
    'linear-gradient(135deg, rgb(168, 85, 247), rgb(100, 124, 255))',
    'linear-gradient(135deg, rgb(239, 68, 68), rgb(234, 179, 8))',
    'linear-gradient(135deg, rgb(59, 130, 246), rgb(99, 102, 241))',
    'linear-gradient(135deg, rgb(16, 185, 129), rgb(34, 197, 94))',
    'linear-gradient(135deg, rgb(139, 92, 246), rgb(217, 70, 239))',
  ];

  private lastGradientIndex = -1;

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit() {
    this.assignGradientsAndSanitizeIcons();
  }

  private assignGradientsAndSanitizeIcons(): void {
    this.cardData.forEach((card) => {
      // Assign gradient
      card.gradient = this.getRandomGradient();

      // Sanitize icon if it's a raw SVG string (optional if already SafeHtml)
      // If you pass raw SVG string, sanitize it:
      // card.icon = this.sanitizeSvg(rawSvgString);
    });
  }

  // Use this method if you need to sanitize raw SVG strings before passing
  sanitizeSvg(svgContent: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(svgContent);
  }

  private getRandomGradient(): string {
    let index: number;
    const total = this.gradients.length;

    do {
      index = Math.floor(Math.random() * total);
    } while (total > 1 && index === this.lastGradientIndex);

    this.lastGradientIndex = index;
    return this.gradients[index];
  }

  trackById(index: number, item: CardData): string {
    return item.id || item.title;
  }

  trackByFeature(index: number, feature: string): string {
    return feature;
  }

  onButtonClick(card: CardData): void {
    console.log('Button clicked:', card.title);
  }
}