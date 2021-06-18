import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductListingDataEntity, SearchResponse } from '@app/utils/models/product.listing.search';

@Component({
  selector: 'search-v1',
  templateUrl: './search-v1.component.html',
  styleUrls: ['./search-v1.component.scss']
})
export class SearchV1Component implements OnInit {

  productListingData: ProductListingDataEntity;

  constructor(
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.route.data.subscribe(result => {
      console.log(result);
      this.createSearchData(result['searchData'][0]);
    })
  }

  createSearchData(rawSearchData: SearchResponse) {
    // data to be used for product listing section
    this.productListingData = {
      totalCount: rawSearchData.productSearchResult.totalCount,
      products: rawSearchData.productSearchResult.products,
      filterData: rawSearchData.buckets,
      listingHeading: 'Search Results'
    };
    
  }


}
