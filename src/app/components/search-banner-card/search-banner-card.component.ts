import { Component, Input, NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import CONSTANTS from '@app/config/constants';
import { CommonService } from '@app/utils/services/common.service';

@Component({
  selector: 'search-banner-card',
  templateUrl: './search-banner-card.component.html',
  styleUrls: ['./search-banner-card.component.scss']
})
export class SearchBannerCardComponent {
  @Input('searchKeyword') searchKeyword;
  imgAssetPath = CONSTANTS.IMAGE_ASSET_URL;
  constructor(public _commonService: CommonService) { }

  fireSearchEvent() {
    this._commonService.updateSearchPopup(this.searchKeyword)
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