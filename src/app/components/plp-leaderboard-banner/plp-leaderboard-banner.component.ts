import { Component, OnInit, NgModule } from '@angular/core';

@Component({
  selector: 'app-plp-leaderboard-banner',
  templateUrl: './plp-leaderboard-banner.component.html',
  styleUrls: ['./plp-leaderboard-banner.component.scss']
})
export class PlpLeaderboardBannerComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}

@NgModule({
  declarations:[PlpLeaderboardBannerComponent],
  imports:[],
  exports:[PlpLeaderboardBannerComponent],
})
export class PlpLeaderboardBannerModule{}