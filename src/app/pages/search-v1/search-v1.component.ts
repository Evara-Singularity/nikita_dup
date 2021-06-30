import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonService } from '@app/utils/services/common.service';
import { ProductListService } from '@services/productList.service';
import { Router } from '@angular/router';

@Component({
  selector: 'search-v1',
  templateUrl: './search-v1.component.html',
  styleUrls: ['./search-v1.component.scss']
})
export class SearchV1Component implements OnInit {
  public API_RESULT: any;
  public didYouMean: any;

  constructor(
    private _activatedRoute: ActivatedRoute,
    public _productListService: ProductListService,
    private _commonService: CommonService,
    private _router: Router
  ) { }

  ngOnInit(): void {
    this.setDataFromResolver();
  }

  setDataFromResolver() {
    this._activatedRoute.data.subscribe(result => {
      this.API_RESULT = result;

      this._productListService.createAndProvideDataToSharedListingComponent(this.API_RESULT['searchData'][0], 'Search Results');

      this._commonService.selectedFilterData.totalCount = this.API_RESULT['searchData'][0].productSearchResult.totalCount;

      if (this._activatedRoute.snapshot.queryParams["didYouMean"] != undefined) {
        this.didYouMean = this._activatedRoute.snapshot.queryParams["didYouMean"];
      }
    });
  }

  toggleRcommendFlag = true;
  recommendedCategory: string = '';
  goToRecommendedCategory(categoryId, cat) {
    this.toggleRcommendFlag = false;
    this.recommendedCategory = cat['categoryName'];
    let extras = {
      queryParams: { ...this._activatedRoute.snapshot.queryParams }
    };
    extras['queryParams']['search_query'] = this.API_RESULT['searchData'][0].productSearchResult.correctedSearchString ? this.API_RESULT['searchData'][0].productSearchResult.correctedSearchString : extras['queryParams']['search_query'];
    extras['queryParams']['category'] = categoryId;
    extras['queryParams']['toggleRcommendFlag'] = true;
    delete extras['queryParams']['orderWay'];
    delete extras['queryParams']['orderBy'];
    this._router.navigate(['search'], extras);
  }

  redirectWithNoPreProcessRequiredParam(searchTerm: string) {
    console.log(searchTerm);
  }

}
