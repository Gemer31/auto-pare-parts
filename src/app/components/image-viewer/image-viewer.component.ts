import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'image-viewer',
  templateUrl: './image-viewer.component.html',
  styleUrls: ['./image-viewer.component.less'],
  encapsulation: ViewEncapsulation.None,
})
export class ImageViewerComponent {

  @Input() images: HTMLImageElement[] = [];

  public _currentIndex: number = 0;

}
