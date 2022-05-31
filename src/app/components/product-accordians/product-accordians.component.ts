import { CommonModule } from '@angular/common';
import { Component, Input, NgModule} from '@angular/core';
import { RouterModule } from '@angular/router';
import { AccordianModule } from "@app/modules/accordian/accordian.module";
import { ENDPOINTS } from '@app/config/endpoints';
import { CommonService } from '@app/utils/services/common.service';
import { DataService } from '@app/utils/services/data.service';
import { ProductListService } from '@app/utils/services/productList.service';
import { environment } from 'environments/environment';
import { forkJoin } from 'rxjs';
import { AccordiansDetails,AccordianDataItem } from '@app/utils/models/accordianInterface';
import { GlobalAnalyticsService } from '@app/utils/services/global-analytics.service';
import { makeStateKey, TransferState } from '@angular/platform-browser';

const ACC: any = makeStateKey<{}>("ACC");


@Component({
  selector: 'product-accordian',
  templateUrl: './product-accordians.component.html',
  styleUrls: ['./product-accordians.component.scss']
})
export class ProductAccordiansComponent {
  @Input('categoryBrandDetails') categoryBrandDetails: any;
  @Input('analyticsInfo') analyticsInfo: any;
  ACCORDIAN_DATA: Array<any> = [[],[],[]];
  accordiansDetails:AccordiansDetails[]=[];
  isServer: boolean;
  isBrowser: boolean;
  categoryId: any;

  constructor(
    public _commonService: CommonService,
    private _dataService: DataService,
    private _productListService: ProductListService,
    private globalAnalyticService: GlobalAnalyticsService,
    private _tState: TransferState
  ) { 
    this.isServer = _commonService.isServer;
    this.isBrowser = _commonService.isBrowser;
  }

  ngOnInit() {
    this.loadShopByAttributeData();
  }

  loadShopByAttributeData() {
    if (this._tState.hasKey(ACC)) {
      let response = this._tState.get(ACC, {});
      if (this.categoryBrandDetails && this.categoryBrandDetails.category && this.categoryBrandDetails.category.categoryCode) {
        this.categoryId = this.categoryBrandDetails.category.categoryCode;
        this.setDataForPopularBrandCategories(response);
      }
      return;
    }

    if (this.categoryBrandDetails && this.categoryBrandDetails.category && this.categoryBrandDetails.category.categoryCode) {
      this.categoryId = this.categoryBrandDetails.category.categoryCode;
      const apiList = [
        this._dataService.callRestful('GET', environment.BASE_URL + ENDPOINTS.GET_RELATED_LINKS + "?categoryCode=" + this.categoryId),
        this._dataService.callRestful('GET', environment.BASE_URL + ENDPOINTS.SIMILAR_CATEGORY + "?catId=" + this.categoryId)
      ];
      forkJoin(apiList).subscribe((response) => {
        if (this.isServer) {
          this._tState.set(ACC, response);
        }
      });
    }
  }

  setDataForPopularBrandCategories(response) {
    this._productListService.getFilterBucket(this.categoryId, 'CATEGORY').subscribe(
      (res) => {
        response.push(res);
        this.setAccordianData(response);
      },
      (error) => {
        console.log("API error", error)
      }
    );
  }

  setAccordianData(res){
    if (res[0]['status']) {
      this.ACCORDIAN_DATA[0] = res[0]['data'];
      // accordian data
      if (this.ACCORDIAN_DATA[0]?.length > 0) {
        this.accordiansDetails.push({
          name: 'Related Searches',
          data: (this.ACCORDIAN_DATA[0]).map(e => ({ name: e.title, link: e.friendlyUrl }) as AccordianDataItem),
          icon:'icon-attribute'
        });
      }
    }
    if (res[2].hasOwnProperty('categoryLinkList') && res[2]['categoryLinkList']) {
      this.ACCORDIAN_DATA[2] = res[2]['categoryLinkList'];

      // accordian data
      this.accordiansDetails.push({
        name: 'Popular Brand Categories',
        extra: this.categoryBrandDetails.brand.brandName,
        data: Object.entries(this.ACCORDIAN_DATA[2]).map(x => ({ name: x[0], link: x[1] }) as AccordianDataItem),
        icon: 'icon-brand_store'
      });
    }
    if (res[1].hasOwnProperty('mostSoledSiblingCategories')) {
      this.ACCORDIAN_DATA[1] = res[1]['mostSoledSiblingCategories'];
      // accordian data
      if (this.ACCORDIAN_DATA[1]?.length > 0) {
        this.accordiansDetails.push({
          name: ' Shop by Related Categories',
          data: (this.ACCORDIAN_DATA[1]).map(e => ({ name: e.categoryName, link: e.categoryLink }) as AccordianDataItem),
          icon:'icon-categories'
        });
      }
    }
  }

  sendAnalyticsInfo() {    
    this.globalAnalyticService.sendAdobeCall(this.analyticsInfo, 'genericClick');
  }

  ngAfterViewInit() {
    if (this.isBrowser) {
      this._tState.remove(ACC);
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
  exports:[ProductAccordiansComponent]
})
export default class ProductAccordiansModule {
}

