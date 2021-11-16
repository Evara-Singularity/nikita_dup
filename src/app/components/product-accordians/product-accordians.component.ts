import { CommonModule } from '@angular/common';
import { Component, Input, NgModule, OnInit, EventEmitter, Output } from '@angular/core';
import { ENDPOINTS } from '@app/config/endpoints';
import { KpToggleDirectiveModule } from '@app/utils/directives/kp-toggle.directive';
import { CommonService } from '@app/utils/services/common.service';
import { DataService } from '@app/utils/services/data.service';
import { ProductListService } from '@app/utils/services/productList.service';
import { environment } from 'environments/environment';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'product-accordian',
  templateUrl: './product-accordians.component.html',
  styleUrls: ['./product-accordians.component.scss']
})
export class ProductAccordiansComponent {
  @Input('categoryBrandDetails') categoryBrandDetails: any;
  ACCORDIAN_DATA: Array<any> = [[],[],[]];
  popularLinks: Array<any>= [];

  constructor(
    public _commonService: CommonService, 
    private _dataService: DataService,
    private _productListService: ProductListService,
  ){}

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
      }
      if (res[1].hasOwnProperty('categoryLinkList') && res[1]['categoryLinkList']) {
        this.ACCORDIAN_DATA[1] = res[1]['categoryLinkList'];
        this.popularLinks = Object.keys(res[1]['categoryLinkList']);
      }
      if (res[2].hasOwnProperty('mostSoledCategories')) {
        this.ACCORDIAN_DATA[2] = res[2]['mostSoledCategories'];
      }
    });

  }
}


@NgModule({
  declarations: [ProductAccordiansComponent],
  imports: [
    CommonModule,
    KpToggleDirectiveModule,
  ]
})
export default class ProductAccordiansModule {
}

