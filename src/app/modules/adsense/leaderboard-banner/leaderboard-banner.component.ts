import { Component, Input } from '@angular/core';
import { BannerAdUnit } from '@app/utils/models/adsense.model';

@Component({
  selector: 'adsense-leaderboard-banner',
  templateUrl: './leaderboard-banner.component.html',
  styleUrls: ['./leaderboard-banner.component.scss']
})
export class LeaderboardBannerComponent {

  @Input() data: BannerAdUnit | null = null;
  constructor() { }

}