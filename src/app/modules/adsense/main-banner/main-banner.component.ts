import { Component, Input } from '@angular/core';
@Component({
  selector: 'adsense-main-banner',
  templateUrl: './main-banner.component.html',
  styleUrls: ['./main-banner.component.scss']
})
export class MainAdsenseBannerComponent {

  @Input() data: any = null;

  constructor() { }

}

