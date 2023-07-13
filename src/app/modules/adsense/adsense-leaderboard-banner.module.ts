import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { LeaderboardBannerComponent } from "./leaderboard-banner/leaderboard-banner.component";

@NgModule({
    declarations: [
        LeaderboardBannerComponent,
    ],
    imports: [
        CommonModule
    ],
    exports: [
        LeaderboardBannerComponent,
    ]
})
export class AdsenseLeaderboardBannerModule { }