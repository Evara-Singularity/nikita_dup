import { CommonModule } from '@angular/common';
import { Component, Input, NgModule} from '@angular/core';
import { RouterModule } from '@angular/router';
import { AccordianModule } from "@app/modules/accordian/accordian.module";
import { CommonService } from '@app/utils/services/common.service';
import { AccordiansDetails,AccordianDataItem } from '@app/utils/models/accordianInterface';
import { GlobalAnalyticsService } from '@app/utils/services/global-analytics.service';
import { makeStateKey } from '@angular/platform-browser';
@Component({
  selector: 'product-accordian',
  templateUrl: './product-accordians.component.html',
  styleUrls: ['./product-accordians.component.scss']
})
export class ProductAccordiansComponent {
  @Input('categoryBrandDetails') categoryBrandDetails: any;
  @Input('analyticsInfo') analyticsInfo: any;
  @Input('relatedLinkRes') relatedLinkRes: any;
  @Input('categoryBucketRes') categoryBucketRes: any;
  @Input('similarCategoryRes') similarCategoryRes: any;
  ACCORDIAN_DATA: Array<any> = [[],[],[]];
  accordiansDetails:AccordiansDetails[]=[];
  isServer: boolean;
  isBrowser: boolean;
  categoryId: any;

  constructor(
    public _commonService: CommonService,
    private globalAnalyticService: GlobalAnalyticsService,
  ) { 
    this.isServer = this._commonService.isServer;
    this.isBrowser = this._commonService.isBrowser;
  }

  ngOnInit() {
    // console.log('setAccordianData', this.relatedLinkRes, this.categoryBucketRes, this.similarCategoryRes);
    this.setAccordianData(this.relatedLinkRes, this.categoryBucketRes, this.similarCategoryRes);
  }

  setAccordianData(relatedLinkRes, categoryBucketRes, similarCategoryRes) {
    
    if (relatedLinkRes && relatedLinkRes['status']) {
      this.ACCORDIAN_DATA[0] = relatedLinkRes['data'];
      // accordian data
      if (this.ACCORDIAN_DATA[0]?.length > 0) {
        this.accordiansDetails.push({
          name: 'Related Searches',
          data: (this.ACCORDIAN_DATA[0]).map(e => ({ name: e.title, link: e.friendlyUrl }) as AccordianDataItem),
          icon: 'icon-attribute'
        });
      }
    }
    if (categoryBucketRes && categoryBucketRes.hasOwnProperty('categoryLinkList') && categoryBucketRes['categoryLinkList']) {
      this.ACCORDIAN_DATA[1] = categoryBucketRes['categoryLinkList'];

      // accordian data
      this.accordiansDetails.push({
        name: 'Popular Brand Categories',
        extra: this.categoryBrandDetails.brand.brandName,
        data: Object.entries(this.ACCORDIAN_DATA[1]).map(x => ({ name: x[0], link: x[1] }) as AccordianDataItem),
        icon: 'icon-brand_store'
      });
    }
    if (similarCategoryRes && similarCategoryRes.hasOwnProperty('mostSoledSiblingCategories')) {
      this.ACCORDIAN_DATA[2] = similarCategoryRes['mostSoledSiblingCategories'];
      // accordian data
      if (this.ACCORDIAN_DATA[2]?.length > 0) {
        this.accordiansDetails.push({
          name: 'Shop by Related Categories',
          data: (this.ACCORDIAN_DATA[2]).map(e => ({ name: e.categoryName, link: e.categoryLink }) as AccordianDataItem),
          icon: 'icon-categories'
        });
      }
    }
  }

  sendAnalyticsInfo() {    
    this.globalAnalyticService.sendAdobeCall(this.analyticsInfo, 'genericClick');
  }

}


@NgModule({
  declarations: [ProductAccordiansComponent],
  imports: [
    CommonModule,
    RouterModule,
    AccordianModule
  ],
  exports:[ProductAccordiansComponent]
})
export default class ProductAccordiansModule {
}

