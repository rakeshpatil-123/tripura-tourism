import { CommonModule } from '@angular/common';
import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

export interface ZoomImageItem {
  src: string;
  title?: string;
}

@Component({
  selector: 'app-image-zoom-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './image-zoom-card.component.html',
  styleUrls: ['./image-zoom-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImageZoomCardComponent {
  @Input() images: ZoomImageItem[] = [];

  trackBySrc(_: number, item: ZoomImageItem): string {
    return item.src;
  }

  getTitle(img: ZoomImageItem): string {
    if (img.title) return img.title;
    const file = img.src.split('/').pop() ?? '';
    return file
      .replace(/\.[^/.]+$/, '')
      .replace(/[_\-]+/g, ' ')
      .replace(/\d+/g, '')
      .trim();
  }
}
