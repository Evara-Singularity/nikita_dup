import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ENDPOINTS } from '@app/config/endpoints';
import { CommonService } from '@services/common.service';
import { DataService } from '@services/data.service';
import { ProductListingDataEntity, SearchResponse } from '@utils/models/product.listing.search';

@Injectable({
    providedIn: 'root'
})
export class ProductListService {
  productListingData: ProductListingDataEntity;
  inlineFilterData: any;

  constructor(
      private _activatedRoute: ActivatedRoute,
      private _commonService: CommonService,
  ){}

  createAndProvideDataToSharedListingComponent(rawSearchData: SearchResponse, heading) {
    
      this.productListingData = {
          totalCount: rawSearchData.productSearchResult ? rawSearchData.productSearchResult.totalCount : 0,
          products: rawSearchData.productSearchResult.products,
          filterData: JSON.parse(JSON.stringify(rawSearchData.buckets)),
          listingHeading: heading
      };

      for (let filter in this._commonService.selectedFilterData.filter) {
        const data = rawSearchData.buckets.find(f => f.name === filter);
        let fil = [];
        if (data) {
          fil = (data.terms.filter(f => f.selected)).map(f=> f.term);
        }
        this._commonService.selectedFilterData.filter[filter] = JSON.parse(JSON.stringify(fil));
      }
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
