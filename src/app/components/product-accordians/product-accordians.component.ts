import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Input, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AccordianModule } from "@app/modules/accordian/accordian.module";
import { CommonService } from '@app/utils/services/common.service';
import { AccordiansDetails, AccordianDataItem } from '@app/utils/models/accordianInterface';
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
  @Input('msn') msn: any;
  @Input('isHindiMode') isHindiMode: boolean = false;

  ACCORDIAN_DATA: Array<any> = [[], [], []];
  accordiansDetails: AccordiansDetails[] = [];
  isServer: boolean;
  isBrowser: boolean;
  categoryId: any;
  productStaticData: any;

  constructor(
    public _commonService: CommonService,
    private globalAnalyticService: GlobalAnalyticsService,
    private cdr: ChangeDetectorRef
  ) {
    this.isServer = this._commonService.isServer;
    this.isBrowser = this._commonService.isBrowser;
  }

  ngOnInit() {
    this.productStaticData = this._commonService.getLocalizationData(!this.isHindiMode);
    console.log(this.productStaticData)
    this.getStaticSubjectData();
    this.setAccordianData(this.relatedLinkRes, this.categoryBucketRes, this.similarCategoryRes);
  }


  getStaticSubjectData() {
    this._commonService.changeStaticJson.subscribe(staticJsonData => {
      this.productStaticData = staticJsonData;
      this.cdr.detectChanges();
    });
  }

  setAccordianData(relatedLinkRes, categoryBucketRes, similarCategoryRes) {
    if (relatedLinkRes && relatedLinkRes.length) {
      this.ACCORDIAN_DATA[0] = relatedLinkRes;
      // accordian data
      if (this.ACCORDIAN_DATA[0]?.length > 0) {
        this.accordiansDetails.push({
          name: this.productStaticData.accordian_list1_label,
          data: (this.ACCORDIAN_DATA[0]).map(e => ({ name: e.title, link: e.friendlyUrl }) as AccordianDataItem),
          icon: 'icon-attribute'
        });
      }
    }
    if (categoryBucketRes && categoryBucketRes.length) {
      this.ACCORDIAN_DATA[1] = categoryBucketRes;

      // accordian data
      // console.log(this.accordiansDetails['name']);
      this.accordiansDetails.push({
        name: this.productStaticData.accordian_list2_label,
        extra: this.categoryBrandDetails.brand.brandName,
        data: this.categoryBucketRes,
        icon: 'icon-brand_store'
      });
    }
    if (similarCategoryRes && similarCategoryRes.hasOwnProperty('mostSoledSiblingCategories')) {
      this.ACCORDIAN_DATA[2] = similarCategoryRes['mostSoledSiblingCategories'];
      // accordian data
      if (this.ACCORDIAN_DATA[2]?.length > 0) {
        this.accordiansDetails.push({
          name: this.productStaticData.accordian_list3_label,
          data: (this.ACCORDIAN_DATA[2]).map(e => ({ name: e.categoryName, link: e.categoryLink }) as AccordianDataItem),
          icon: 'icon-categories'
        });
      }
    }
    this.cdr.detectChanges();
  }

  sendAnalyticsInfo() {
    if (this._commonService.isBrowser) {
      this.globalAnalyticService.sendAdobeCall(this.analyticsInfo, 'genericClick');
    }
  }

}


@NgModule({
  declarations: [ProductAccordiansComponent],
  imports: [
    CommonModule,
    RouterModule,
    AccordianModule
  ],
  exports: [ProductAccordiansComponent]
})
export default class ProductAccordiansModule {
}

