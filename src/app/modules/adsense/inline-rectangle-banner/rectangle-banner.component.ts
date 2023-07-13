import { Component, Input } from '@angular/core';
import { BannerAdUnit } from '@app/utils/models/adsense.model';

@Component({
  selector: 'adsense-rectangle-banner',
  templateUrl: './rectangle-banner.component.html',
  styleUrls: ['./rectangle-banner.component.scss']
})
export class RectangleBannerComponent {

  @Input() data: BannerAdUnit | null = null;

  constructor() { }

}
