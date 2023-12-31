import { Component, Inject, OnInit, Renderer2, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonService } from '@app/utils/services/common.service';
import { ProductListService } from '@services/productList.service';
import { DataService } from '@app/utils/services/data.service';
import { GlobalAnalyticsService } from '@app/utils/services/global-analytics.service';
import { LocalStorageService } from 'ngx-webstorage';
import CONSTANTS from '@app/config/constants';
import { DOCUMENT } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';
import { GLOBAL_CONSTANT } from '@app/config/global.constant';
import { SharedProductListingComponent } from '@app/modules/shared-product-listing/shared-product-listing.component';
import { AccordiansDetails,AccordianDataItem } from '@utils/models/accordianInterface';

let digitalData = {
  page: {},
  custData: {},
  order: {}
};

@Component({
  selector: 'search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss', '../category/category.scss',  './../../components/homefooter-accordian/homefooter-accordian.component.scss']
})
export class SearchComponent implements OnInit {
  public API_RESULT: any;
  public didYouMean: any;
  public headerNameBasedOnCondition;
  @ViewChild('sharedProductList') sharedProductList: SharedProductListingComponent;
  accordiansDetails: AccordiansDetails[] = [];
  moduleUsedIn: string = "PRODUCT_RECENT_PRODUCT_SEARCH";

  constructor(
    private _activatedRoute: ActivatedRoute,
    public _localStorageService: LocalStorageService,
    public _productListService: ProductListService,
    public _commonService: CommonService,
    private _title: Title,
    private meta: Meta,
    @Inject(DOCUMENT) private _document,
    private _renderer2: Renderer2,
    private _analytics: GlobalAnalyticsService,
    private _router: Router,
    private globalAnalyticsService: GlobalAnalyticsService,
  ) {
    this._commonService.isHomeHeader = false;
    this._commonService.isPLPHeader = true;
  }

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
    this.moduleUsedIn = (this._productListService?.productListingData?.products != undefined && this._productListService?.productListingData?.products?.length==0) ? "PRODUCT_RECENT_PRODUCT_PLP_PAGE_NOT_FOUND" : "PRODUCT_RECENT_PRODUCT_SEARCH"
    // this.sharedProductList.getSponseredProducts();
  }

  setHeaderNameBasedOnCondition() {
    if(this.API_RESULT['searchData'][0].productSearchResult.displayString){
      if (!this.API_RESULT['searchData'][0].productSearchResult.correctedSearchString && this.API_RESULT['searchData'][0].productSearchResult.searchDisplayOperation == 'or') {
        this.headerNameBasedOnCondition = 'Results for ' + this.API_RESULT['searchData'][0].productSearchResult.displayString;
      } else if (this.toggleRcommendFlag && (!this.API_RESULT['searchData'][0].productSearchResult.correctedSearchString && this.API_RESULT['searchData'][0].productSearchResult.searchDisplayOperation != 'or')) {
        this.headerNameBasedOnCondition = 'Results for ' + (this.API_RESULT['searchData'][0].productSearchResult.displayString ? this.API_RESULT['searchData'][0].productSearchResult.displayString : this.API_RESULT['searchData'][0].productSearchResult.inputSearchString);
      } else {
        this.headerNameBasedOnCondition = this.checkForCorrectString(this.API_RESULT['searchData'][0].productSearchResult.displayString,this.API_RESULT['searchData'][0].productSearchResult.correctedSearchString);
      }
    }else{
      this.headerNameBasedOnCondition = '';
    }
  }

  checkForCorrectString(displayString, CorrectedString){
    return (CorrectedString)?CorrectedString:displayString;
  }

  setDataFromResolver() {
    this._activatedRoute.data.subscribe(result => {

      // Empty the setSearchResultsTrackingData initially.
      this._commonService.setSearchResultsTrackingData({});

      this._productListService.excludeAttributes = [];

      // Set the API_RESULT variable
      this.API_RESULT = result;

      //incase only product avaliable in search result
      if (this.API_RESULT['searchData'][0] && this.API_RESULT['searchData'][0]['productSearchResult'] && this.API_RESULT['searchData'][0]['productSearchResult']['products'].length == 1) {
        const backUrl = localStorage.getItem('searchURL') || '/';
        this._localStorageService.store("history", [])
        window.history.replaceState('', '', backUrl);
        window.history.pushState('', '', backUrl);
        this._router.navigateByUrl(this.API_RESULT['searchData'][0]['productSearchResult']['products'][0]['productUrl']);
        return;
      }

      this.setCategoriesPrimaryForCategoryMidPlpFilter();

      this._title.setTitle(GLOBAL_CONSTANT.genricTitleBarText);

      this.setHeaderNameBasedOnCondition();

      // Update shared product list Data
      this._productListService.createAndProvideDataToSharedListingComponent(this.API_RESULT['searchData'][0], 'Search Results');
      this._productListService.getFilterBucket(this._activatedRoute.snapshot.params.id, 'SEARCH').subscribe(res => {
        if (res.hasOwnProperty('buckets')) {
          this.API_RESULT.searchData[0].buckets = JSON.parse(JSON.stringify(res['buckets']));
          this._productListService.createAndProvideDataToSharedListingComponent(this.API_RESULT['searchData'][0], 'Search Results', true);
        }
      });

      if (this.sharedProductList) {
        // this.sharedProductList.getSponseredProducts();
      }

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
      if (this._commonService.isBrowser) {
        this.setAdobeTrackingData();
      }

      // set Accordian data
      this.setAccordianData();

      // Send GTM call
      this.sendGTMCall();

      // Send Analytics Call
      this.sendAnalyticsCall();

      // Set canonical Urls
      this.setCanonicalUrls();

    });
  }

  private setAccordianData() {
    this.accordiansDetails = [];
    this.accordiansDetails.push({
        name: 'Related Searches',
        outerNavRouteEvent: true,
        isNotVisible: !(this._commonService.selectedFilterData.page < 2),
        data: this.API_RESULT['searchData'][0].categoriesRecommended ? this.API_RESULT['searchData'][0].categoriesRecommended.map(e => ({ name: e.categoryName, link: '', category: e }) as AccordianDataItem) : [],
        icon:'icon-attribute'
    });
  }

  setCanonicalUrls() {
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

  sendAnalyticsCall() {
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
      channel: "Search Result Page",
      page_type: "search page",
      search_query: this._activatedRoute.snapshot.queryParams['search_query'] ? this._activatedRoute.snapshot.queryParams['search_query'].trim() : this._activatedRoute.snapshot.queryParams['search_query'],
      filter_added: !!window.location.hash.substr(1) ? 'true' : 'false',
      product_count: this.API_RESULT['searchData'][0].productSearchResult.totalCount
    }

    this.globalAnalyticsService.sendMessage(trackingData);

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

   
    digitalData['page']['totalProductCount'] = this._productListService?.productListingData?.totalCount;
    digitalData['page']['categoryRecommended'] = relatedSearchResults;
    digitalData['page']['categoryRecSelected'] = this.recommendedCategory;
    digitalData['page']['subSection'] += (this.API_RESULT['searchData'][0].productSearchResult['products'].length === 0 ? " : ZSR" : '');
  }

  initializeAdobeTracking() {
    const user = this._localStorageService.retrieve('user');
    let page = {
      'pageName': "Search Listing Page",
      'channel': "Search Result Page",
      'categoryRecommended': '',
      'categoryRecSelected': '',
      'subSection': "moglix:search " + this._commonService.getSectionClick().toLowerCase(),
      'loginStatus': (user && user["authenticated"] == 'true') ? "registered user" : "guest"
    }
    let order = {}

    digitalData["page"] = page;
    digitalData["custData"] = this._commonService.custDataTracking;
    digitalData["order"] = order;
  }

  removeSpacingForSearchInput() {
    if (this._commonService.isBrowser && (<HTMLInputElement>document.querySelector('#search-input'))) {
      (<HTMLInputElement>document.querySelector('#search-input')).value = this._activatedRoute.snapshot.queryParams['search_query'].trim();
    }
  }

  toggleRcommendFlag = true;
  recommendedCategory: string = '';
  goToRecommendedCategory(data) {
    this.toggleRcommendFlag = false;
    let extras = {
      queryParams: { ...this._activatedRoute.snapshot.queryParams }
    };
    extras['queryParams']['search_query'] = this.API_RESULT['searchData'][0].productSearchResult.correctedSearchString ? this.API_RESULT['searchData'][0].productSearchResult.correctedSearchString : extras['queryParams']['search_query'];
    extras['queryParams']['category'] = data.categoryId;
    extras['queryParams']['toggleRcommendFlag'] = true;
    extras['queryParams']['page'] = 1;
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

  /**
   * 
   * @param event - Get the category on which the user has currently clicked on specific for SEARCH page
   */
  handleCategoryClicked(event) {
    this.goToRecommendedCategory(event);
  }

  setCategoriesPrimaryForCategoryMidPlpFilter() {
    this.API_RESULT['searchData'][0].categoriesPrimary = {
      name: GLOBAL_CONSTANT.inlineFilter[3],
      terms: (this.API_RESULT['searchData'][0].categoriesPrimary && this.API_RESULT['searchData'][0].categoriesPrimary.length > 0) ? this.API_RESULT['searchData'][0].categoriesPrimary.map(data => {
        data['term'] = data['categoryName'];
        data['count'] = 3;
        data['enabled'] = true;
        data['selected'] = data['categoryId'] === this._activatedRoute.snapshot.queryParams['category'] ? true : false;
        return data;
      }) : []
    }
  }

}
