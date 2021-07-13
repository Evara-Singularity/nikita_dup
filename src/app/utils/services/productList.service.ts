import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from '@services/common.service';
import { ProductListingDataEntity, SearchResponse } from '@utils/models/product.listing.search';

@Injectable({
  providedIn: 'root'
})
export class ProductListService {
  productListingData: ProductListingDataEntity;
  inlineFilterData: any;

  constructor(
    private _commonService: CommonService,
  ) {
  }

  createAndProvideDataToSharedListingComponent(rawSearchData: SearchResponse, heading) {

    this.productListingData = {
      totalCount: rawSearchData.productSearchResult ? rawSearchData.productSearchResult.totalCount : 0,
      products: rawSearchData.productSearchResult.products,
      filterData: JSON.parse(JSON.stringify(rawSearchData.buckets)),
      listingHeading: heading
    };
    
    if (this._commonService.isBrowser) {
      const fragment = (Object.keys(this.extractFragmentFromUrl(window.location.hash))[0]).split('#').join(''); 
      this._commonService.selectedFilterData.filter = this._commonService.updateSelectedFilterDataFilterFromFragment(fragment);
      this.initializeSortBy();
    }

  }

  extractFragmentFromUrl(str) {
    var pieces = str.split("&"), data = {}, i, parts;
    // process each query pair
    for (i = 0; i < pieces.length; i++) {
        parts = pieces[i].split("=");
        if (parts.length < 2) {
            parts.push("");
        }
        data[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1]);
    }
    return data;
}

  initializeSortBy() {
    const url = location.search.substring(1);
    const queryParams = url ? JSON.parse('{"' + decodeURI(url).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g, '":"') + '"}') : {};

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

  calculateFilterCount(data) {
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
