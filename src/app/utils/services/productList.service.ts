import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ENDPOINTS } from '@app/config/endpoints';
import { CommonService } from '@services/common.service';
import { DataService } from '@services/data.service';
import { ProductListingDataEntity, SearchResponse } from '@utils/models/product.listing.search';
import { environment } from 'environments/environment';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class ProductListService {
  productListingData: ProductListingDataEntity;
  inlineFilterData: any;

  constructor(
      private _activatedRoute: ActivatedRoute,
      private _commonService: CommonService,
      private _router: Router,
      private _dataService: DataService
  ){}

  createAndProvideDataToSharedListingComponent(rawSearchData: SearchResponse, heading) {
      this.productListingData = {
          totalCount: rawSearchData.productSearchResult ? rawSearchData.productSearchResult.totalCount : 0,
          products: rawSearchData.productSearchResult.products,
          filterData: rawSearchData.buckets,
          listingHeading: heading
        };
  }

  initializeSortBy() {
    const queryParams = this._activatedRoute.snapshot.queryParams;

    if (queryParams.hasOwnProperty('orderBy') && queryParams.hasOwnProperty('orderWay') && queryParams['orderBy'] === 'price') {
      if (queryParams['orderWay'] === 'asc') {
        this._commonService.selectedFilterData['sortBy'] = 'lowPrice';
      } else {
        this._commonService.selectedFilterData['sortBy'] = 'highPrice';
      }
    } else {
      this._commonService.selectedFilterData['sortBy'] = 'popularity';
    }
  }

  calculateFilterCount(data){
    console.log(data);
    let count = 0;
    data.forEach((el) => {
        for (let i = 0; i < el.terms.length; i++) {
            if (el.terms[i].selected) {
                console.log(el);
                count++;
                break;
            }
        }
    });
    return count;
  }

}
