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
  @Input() categoryTaxonomay;
  @Output() fireSearchEvent$: EventEmitter<boolean> = new EventEmitter<boolean>();
  imgAssetPath = CONSTANTS.IMAGE_ASSET_URL;
  constructor(
    public _commonService: CommonService,
    private globalAnalyticService: GlobalAnalyticsService
  ) { }

  fireSearchEvent() {
    let taxo1 = '';
    let taxo2 = '';
    let taxo3 = '';
    if (this.categoryTaxonomay && this.categoryTaxonomay.taxonomy) {
      taxo1 = this.categoryTaxonomay.taxonomy.split("/")[0] || '';
      taxo2 = this.categoryTaxonomay.taxonomy.split("/")[1] || '';
      taxo3 = this.categoryTaxonomay.taxonomy.split("/")[2] || '';
    }
    const analyticObj: any = {
      page: {},
      custData: this._commonService.custDataTracking
    }
    analyticObj['page']['pageName'] = "moglix:" + taxo1 + ":" + taxo2 + ":" + taxo3 + ":listing";
    analyticObj['page']['linkName'] = 'search card';
    analyticObj['page']['linkPageName'] = 'search:nudge:bottom-card';
    analyticObj['page']['channel'] = 'listing';
    console.log(analyticObj);
    this.globalAnalyticService.sendAdobeCall(analyticObj, 'genericClick')
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