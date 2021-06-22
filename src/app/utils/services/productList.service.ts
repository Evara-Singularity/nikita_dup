import { Injectable } from '@angular/core';
import { ProductListingDataEntity, SearchResponse } from '@app/utils/models/product.listing.search';

@Injectable({
    providedIn: 'root'
})
export class ProductListService {
    productListingData: ProductListingDataEntity;

    constructor(){}

    createAndProvideDataToSharedListingComponent(rawSearchData: SearchResponse, heading) {
        this.productListingData = {
            totalCount: rawSearchData.productSearchResult.totalCount,
            products: rawSearchData.productSearchResult.products,
            filterData: rawSearchData.buckets,
            listingHeading: heading
          };
    }
}
