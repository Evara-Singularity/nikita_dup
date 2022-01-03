import { Component, EventEmitter, Input, NgModule, Output } from '@angular/core';
import { CommonModule } from "@angular/common";
import CONSTANTS from '@app/config/constants';
import { CommonService } from '@app/utils/services/common.service';
import { GlobalAnalyticsService } from '@app/utils/services/global-analytics.service';

@Component({
  selector: 'search-banner-card',
  templateUrl: './search-banner-card.component.html',
  styleUrls: ['./search-banner-card.component.scss']
})
export class SearchBannerCardComponent {
  @Output() fireSearchEvent$: EventEmitter<boolean> = new EventEmitter<boolean>();
  imgAssetPath = CONSTANTS.IMAGE_ASSET_URL;
  constructor(
    public _commonService: CommonService,
    private globalAnalyticService: GlobalAnalyticsService
  ) { }

  fireSearchEvent() {
    const analyticObj: any = {
      page: {}
    }
    analyticObj['page']['linkPageName'] = "moglix:search:nudge:bottom-card",
    analyticObj['page']['linkName'] = 'Search:nudge',
    analyticObj['page']['pageName'] = '',
    analyticObj['page']['channel'] = '',
    analyticObj['page']['subSection'] = '',
    analyticObj['page']['loginStatus'] = ''
    this.globalAnalyticService.sendAdobeCall(analyticObj,'genericClick')
    this.fireSearchEvent$.emit(true);
  }
}

@NgModule({
  declarations: [
    SearchBannerCardComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    SearchBannerCardComponent
  ]
})
export class SearchBannerCardModule { }
export class BrandModule extends SearchBannerCardModule { }
export class SearchModule extends SearchBannerCardModule { }
export class CategoryModule extends SearchBannerCardModule { }