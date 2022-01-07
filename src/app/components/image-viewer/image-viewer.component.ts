import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'image-viewer',
  templateUrl: './image-viewer.component.html',
  styleUrls: ['./image-viewer.component.less'],
  encapsulation: ViewEncapsulation.None,
})
export class ImageViewerComponent {

  @Input() images: HTMLImageElement[] = [];

  @Output() closeClick: EventEmitter<void> = new EventEmitter<void>();

  public _currentIndex: number = 0;

  public _next(): void {
    this._currentIndex = this._currentIndex === (this.images.length - 1) ? 0 : (this._currentIndex + 1);
  }

  public _previous(): void {
    this._currentIndex = this._currentIndex === 0 ? (this.images.length - 1) : (this._currentIndex - 1);
  }
}
