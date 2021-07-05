import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonService } from '@app/utils/services/common.service';
import { ProductListService } from '@services/productList.service';
import { Router } from '@angular/router';
import { DataService } from '@app/utils/services/data.service';
import { GlobalAnalyticsService } from '@app/utils/services/global-analytics.service';
import { LocalStorageService } from 'ngx-webstorage';

let digitalData = {
  page: {},
  custData: {},
  order: {}
};

@Component({
  selector: 'search-v1',
  templateUrl: './search-v1.component.html',
  styleUrls: ['./search-v1.component.scss', '../category-v1/category-v1.scss']
})
export class SearchV1Component implements OnInit {
  public API_RESULT: any;
  public didYouMean: any;

  constructor(
    private _activatedRoute: ActivatedRoute,
    public _localStorageService: LocalStorageService,
    public _productListService: ProductListService,
    private _commonService: CommonService,
    private _dataService: DataService,
    private _analytics: GlobalAnalyticsService,
    private _router: Router
  ) { }

  ngOnInit(): void {
    this.setDataFromResolver();
  }

  setDataFromResolver() {
    this._activatedRoute.data.subscribe(result => {
      // Empty the setSearchResultsTrackingData initially.
      this._commonService.setSearchResultsTrackingData({});

      this.API_RESULT = result;

      this._productListService.createAndProvideDataToSharedListingComponent(this.API_RESULT['searchData'][0], 'Search Results');

      this._commonService.selectedFilterData.totalCount = this.API_RESULT['searchData'][0].productSearchResult.totalCount;

      this.updateToggleRcommendFlag();

      // Remove spacing from input search input value
      this.removeSpacingForSearchInput();

      
      const filterIsNotAppliedAndProductCountIsOne = this.API_RESULT['searchData'][0].productSearchResult['totalCount'] === 1 || this._activatedRoute.snapshot.fragment === null;
      if (filterIsNotAppliedAndProductCountIsOne) {
        this._commonService.setSearchResultsTrackingData({ 'search-query': this._activatedRoute.snapshot["queryParams"]["search_query"], 'search-results': '1' });
      }
      
      this.setAdobeTrackingData();

      this.sendGTMCall();

      this.sendAnalyticsCall();

    });
  }

  sendGTMCall() {
    this._analytics.sendGTMCall({
      'event': 'search-results',
      'search-query': this._activatedRoute.snapshot['queryParams']['search_query'],
      'search-results': this.API_RESULT['searchData'][0].productSearchResult["totalCount"]
    });
  }

  sendAnalyticsCall(){
    if (this._commonService.isBrowser) {
      digitalData["page"]["trendingSearch"] = 'no';
      digitalData['page']['searchTerm'] = this._activatedRoute.snapshot.queryParams['search_query'];
      digitalData['page']['suggestionClicked'] = this._activatedRoute.snapshot.queryParams['lsource'] && this._activatedRoute.snapshot.queryParams['lsource'] == 'sclick' ? 'yes' : 'no'
      this._analytics.sendAdobeCall(digitalData);
    }
  }

  setAdobeTrackingData() {
    const trackingData = {
      event_type: "page_load",
      label: "view",
      channel: "Search Listing",
      page_type: "search page",
      search_query: this._activatedRoute.snapshot.queryParams['search_query'] ? this._activatedRoute.snapshot.queryParams['search_query'].trim() : this._activatedRoute.snapshot.queryParams['search_query'],
      filter_added: !!window.location.hash.substr(1) ? 'true' : 'false',
      product_count: this.API_RESULT['searchData'][0].productSearchResult.totalCount
    }

    this._dataService.sendMessage(trackingData);

    let relatedSearchResults = '';

    if (this.API_RESULT['searchData'][0].relatedSearchResult) {
      this.API_RESULT['searchData'][0].relatedSearchResult.filter(((r, index) => {
            if (index < 3) {
                if (index === 0) {
                    relatedSearchResults += r['categoryName'];
                } else {
                    relatedSearchResults += ' | ' + r['categoryName'];
                }
                return true;
            }
            return false;
        }));
    }

    digitalData['page']['categoryRecommended'] = relatedSearchResults;
    digitalData['page']['categoryRecSelected'] = this.recommendedCategory;
    digitalData['page']['subSection'] += (this.API_RESULT['searchData'][0].productSearchResult['products'].length === 0 ? " : ZSR" : '');
  }

  setAdobeTracking() {
    const user = this._localStorageService.retrieve('user');
    let page = {
        'pageName': "Search Listing Page",
        'channel': "search",
        'categoryRecommended': '',
        'categoryRecSelected': '',
        'subSection': "moglix:search " + this._commonService.getSectionClick().toLowerCase(),
        'loginStatus': (user && user["authenticated"] == 'true') ? "registered user" : "guest"
    }
    let custData = {
        'customerID': (user && user["userId"]) ? btoa(user["userId"]) : '',
        'emailID': (user && user["email"]) ? btoa(user["email"]) : '',
        'mobile': (user && user["phone"]) ? btoa(user["phone"]) : '',
        'customerType': (user && user["userType"]) ? user["userType"] : '',
    }
    let order = {}
    
    digitalData["page"] = page;
    digitalData["custData"] = custData;
    digitalData["order"] = order;
}

  removeSpacingForSearchInput(){
    if (this._commonService.isBrowser && (<HTMLInputElement>document.querySelector('#search-input'))) {
      const queryParams = this._activatedRoute.snapshot.queryParams;
      (<HTMLInputElement>document.querySelector('#search-input')).value = queryParams['search_query'].trim();
    }
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

  updateToggleRcommendFlag() {
    if (this._activatedRoute.snapshot.queryParams["didYouMean"] != undefined) {
      this.didYouMean = this._activatedRoute.snapshot.queryParams["didYouMean"];
    }

    if (!this._activatedRoute.snapshot.queryParams.toggleRcommendFlag) {
      this.toggleRcommendFlag = true;
      if (digitalData['page']) {
        digitalData['page']['categoryRecSelected'] = '';
      }
    } else {
      this.toggleRcommendFlag = false;
      this.recommendedCategory = '';
    }
  }

  redirectWithNoPreProcessRequiredParam(searchTerm: string) {
    const actualParams = { ...this._activatedRoute.snapshot.queryParams };
    actualParams['str'] = searchTerm;
    actualParams['preProcessRequired'] = 'n';

    this._router.navigate(['search'], { queryParams: actualParams });
  }

}
