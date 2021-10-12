import { Component, Inject, OnInit, Renderer2 } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonService } from '@app/utils/services/common.service';
import { ProductListService } from '@services/productList.service';
import { Router } from '@angular/router';
import { DataService } from '@app/utils/services/data.service';
import { GlobalAnalyticsService } from '@app/utils/services/global-analytics.service';
import { LocalStorageService } from 'ngx-webstorage';
import CONSTANTS from '@app/config/constants';
import { DOCUMENT } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';
import { GLOBAL_CONSTANT } from '@app/config/global.constant';

let digitalData = {
  page: {},
  custData: {},
  order: {}
};

@Component({
  selector: 'search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss', '../category/category.scss']
})
export class SearchComponent implements OnInit {
  public API_RESULT: any;
  public didYouMean: any;
  public headerNameBasedOnCondition;

  constructor(
    private _activatedRoute: ActivatedRoute,
    public _localStorageService: LocalStorageService,
    public _productListService: ProductListService,
    public _commonService: CommonService,
    private _dataService: DataService,
    private _title: Title,
    private meta: Meta,
    @Inject(DOCUMENT) private _document,
    private _renderer2: Renderer2, 
    private _analytics: GlobalAnalyticsService,
    private _router: Router
  ) { }

  ngOnInit(): void {
    if (this._commonService.isBrowser) {
      // Set Meta data
      this.meta.addTag({ "name": "robots", "content": CONSTANTS.META.ROBOT2 });

      // Set Adobe tracking and other tasks
      this.initializeAdobeTracking();
    }
    this.setDataFromResolver();
  }

  ngAfterViewInit(): void {
    // this._productListService.getFilterBucket(this._activatedRoute.snapshot.params.id, 'SEARCH').subscribe(res => {
    //   if (res.hasOwnProperty('buckets')) {
    //     this.API_RESULT.searchData[0].buckets = JSON.parse(JSON.stringify(res['buckets']));
    //     this._productListService.createAndProvideDataToSharedListingComponent(this.API_RESULT['searchData'][0], 'Search Results');
    //   }
    // });
}

  setHeaderNameBasedOnCondition(){
    if ((this.API_RESULT['searchData'][0].productSearchResult.correctedSearchString === undefined || this.API_RESULT['searchData'][0].productSearchResult.correctedSearchString === null) && this.API_RESULT['searchData'][0].productSearchResult.searchDisplayOperation == 'or') {
      this.headerNameBasedOnCondition = 'Results for ' + this.API_RESULT['searchData'][0].productSearchResult.displayString;
    } else if (this.toggleRcommendFlag && ((this.API_RESULT['searchData'][0].productSearchResult.correctedSearchString === undefined || this.API_RESULT['searchData'][0].productSearchResult.correctedSearchString === null) && this.API_RESULT['searchData'][0].productSearchResult.searchDisplayOperation != 'or')) {
      this.headerNameBasedOnCondition = 'Results for ' + (this.API_RESULT['searchData'][0].productSearchResult.displayString ? this.API_RESULT['searchData'][0].productSearchResult.displayString : this.API_RESULT['searchData'][0].productSearchResult.inputSearchString);
    }
  }

  setDataFromResolver() {
    this._activatedRoute.data.subscribe(result => {
      // Empty the setSearchResultsTrackingData initially.
      this._commonService.setSearchResultsTrackingData({});

      // Set the API_RESULT variable
      this.API_RESULT = result;

      this._title.setTitle(GLOBAL_CONSTANT.genricTitleBarText);

      this.setHeaderNameBasedOnCondition();

      // Update shared product list Data
      this._productListService.getFilterBucket(this._activatedRoute.snapshot.params.id, 'SEARCH').subscribe(res => {
        if (res.hasOwnProperty('buckets')) {
          this.API_RESULT.searchData[0].buckets = JSON.parse(JSON.stringify(res['buckets']));
          this._productListService.createAndProvideDataToSharedListingComponent(this.API_RESULT['searchData'][0], 'Search Results');
        }
      });

      // Initialize the current activated filter count
      this._commonService.selectedFilterData.totalCount = this.API_RESULT['searchData'][0].productSearchResult.totalCount;

      // update recommend search flag
      this.updateToggleRcommendFlag();

      // Remove spacing from input search input value
      this.removeSpacingForSearchInput();

      const filterIsNotAppliedAndProductCountIsOne = this.API_RESULT['searchData'][0].productSearchResult['totalCount'] === 1 || this._activatedRoute.snapshot.fragment === null;
      
      if (filterIsNotAppliedAndProductCountIsOne) {
        this._commonService.setSearchResultsTrackingData({ 'search-query': this._activatedRoute.snapshot["queryParams"]["search_query"], 'search-results': '1' });
      }

      // Send Adobe Tracking Data
      this.setAdobeTrackingData();

      // Send GTM call
      this.sendGTMCall();

      // Send Analytics Call
      this.sendAnalyticsCall();

      // Set canonical Urls
      this.setCanonicalUrls();

    });
  }

  setCanonicalUrls(){
    //Start Canonical URL 
    let currentQueryParams = this._activatedRoute.snapshot.queryParams;
    let currentRoute = this._commonService.getCurrentRoute(this._router.url);
    let pageCountQ = this.API_RESULT['searchData'][0].productSearchResult.totalCount / 10;
    let currentPageP = parseInt(currentQueryParams["page"]);

    if (pageCountQ > 1 && (currentPageP == 1 || isNaN(currentPageP))) {

        let links = this._renderer2.createElement('link');
        links.rel = "next";
        links.href = CONSTANTS.PROD + currentRoute + '?page=2';
        this._renderer2.appendChild(this._document.head, links);

    } else if (currentPageP > 1 && pageCountQ >= currentPageP) {
        let links = this._renderer2.createElement('link');
        links.rel = "prev";
        links.href = CONSTANTS.PROD + currentRoute + '?page=' + (currentPageP - 1);
        this._renderer2.appendChild(this._document.head, links);

        links = this._renderer2.createElement('link');
        links.rel = "next";
        links.href = CONSTANTS.PROD + currentRoute + '?page=' + (currentPageP + 1);
        this._renderer2.appendChild(this._document.head, links);
    } else if (currentPageP > 1 && pageCountQ + 1 >= currentPageP) {
        let links = this._renderer2.createElement('link');
        links.rel = "prev";
        links.href = CONSTANTS.PROD + currentRoute + '?page=' + (currentPageP - 1);
        this._renderer2.appendChild(this._document.head, links);
    }
  }

  sendGTMCall() {
    this._analytics.sendGTMCall({
      'event': 'search-results',
      'search-query': this._activatedRoute.snapshot['queryParams']['search_query'],
      'search-results': this.API_RESULT['searchData'][0].productSearchResult["totalCount"]
    });
  }

  sendAnalyticsCall(){
    if (this._commonService.isBrowser && this.API_RESULT['searchData'][0].productSearchResult.products[0]) {
      digitalData["page"]["trendingSearch"] = 'no';
      digitalData['page']['searchTerm'] = this.API_RESULT['searchData'][0].productSearchResult["totalCount"] === 1 ? this.API_RESULT['searchData'][0].productSearchResult.products[0].moglixPartNumber : this._activatedRoute.snapshot.queryParams['search_query'];
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

  initializeAdobeTracking() {
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
      (<HTMLInputElement>document.querySelector('#search-input')).value = this._activatedRoute.snapshot.queryParams['search_query'].trim();
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
