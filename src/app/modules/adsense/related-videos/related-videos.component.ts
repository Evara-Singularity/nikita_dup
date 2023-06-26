import { Component, Input } from '@angular/core';

@Component({
  selector: 'adsense-related-videos',
  templateUrl: './related-videos.component.html',
  styleUrls: ['./related-videos.component.scss']
})
export class RelatedVideosComponent {

  @Input() data: any = null;

  constructor() { }


}