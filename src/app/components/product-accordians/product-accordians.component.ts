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

  constructor(
    public _commonService: CommonService,
    private _dataService: DataService,
    private _productListService: ProductListService,
  ) { }

  ngOnInit() {
    this.loadShopByAttributeData();
  }

  loadShopByAttributeData() {
    let categoryId = this.categoryBrandDetails.category.categoryCode;
    const apiList = [
      this._dataService.callRestful('GET', environment.BASE_URL + ENDPOINTS.GET_RELATED_LINKS + "?categoryCode=" + categoryId),
      this._productListService.getFilterBucket(categoryId, 'BRAND', this.categoryBrandDetails.brand.brandName),
      this._dataService.callRestful('GET', environment.BASE_URL + ENDPOINTS.SIMILAR_CATEGORY + "?catId=" + categoryId)
    ];

    forkJoin(apiList).subscribe(res => {
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
      if (res[1].hasOwnProperty('categoryLinkList') && res[1]['categoryLinkList']) {
        this.ACCORDIAN_DATA[1] = res[1]['categoryLinkList'];

        // accordian data
        this.accordiansDetails.push({
          name: 'Popular Brand Categories',
          extra: this.categoryBrandDetails.brand.brandName,
          data: Object.entries(this.ACCORDIAN_DATA[1]).map(x => ({ name: x[0], link: x[1] }) as AccordianDataItem),
          icon: 'icon-brand_store'
        });
      }
      if (res[2].hasOwnProperty('mostSoledSiblingCategories')) {
        this.ACCORDIAN_DATA[2] = res[2]['mostSoledSiblingCategories'];
        // accordian data
        if (this.ACCORDIAN_DATA[2]?.length > 0) {
          this.accordiansDetails.push({
            name: ' Shop by Related Categories',
            data: (this.ACCORDIAN_DATA[2]).map(e => ({ name: e.categoryName, link: e.categoryLink }) as AccordianDataItem),
            icon:'icon-categories'
          });
        }
      }
    });
  }
}


@NgModule({
  declarations: [ProductAccordiansComponent],
  imports: [
    CommonModule,
    RouterModule,
    AccordianModule
  ]
})
export default class ProductAccordiansModule {
}

