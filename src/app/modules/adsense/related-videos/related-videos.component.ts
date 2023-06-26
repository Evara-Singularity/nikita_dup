import { Component, Input } from '@angular/core';
import { VideoAdUnit } from '@app/utils/models/adsense.model';

@Component({
  selector: 'adsense-related-videos',
  templateUrl: './related-videos.component.html',
  styleUrls: ['./related-videos.component.scss']
})
export class RelatedVideosComponent {

  @Input() data: VideoAdUnit[] | null = null;

  constructor() { }


}