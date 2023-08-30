import { EventEmitter, Component, Output, Input, ViewChild, ViewContainerRef, ComponentFactoryResolver, Injector, AfterViewInit, OnInit, OnDestroy } from '@angular/core';
import CONSTANTS from '@app/config/constants';
import { ProductListingDataEntity, ProductsEntity } from '@app/utils/models/product.listing.search';
import { CommonService } from '@app/utils/services/common.service';
import { ProductListService } from '@app/utils/services/productList.service';
import { CartService } from '@app/utils/services/cart.service';
import { LocalAuthService } from '@app/utils/services/auth.service';
import { ProductService } from '@app/utils/services/product.service';
import { ActivatedRoute, Router } from '@angular/router';
import * as localization_en from '../../config/static-en';
import * as localization_hi from '../../config/static-hi';

@Component({
  selector: 'shared-product-listing',
  templateUrl: './shared-product-listing.component.html',
  styleUrls: ['./shared-product-listing.component.scss']
})
export class SharedProductListingComponent implements OnInit, OnDestroy, AfterViewInit {

  readonly sponseredProductPosition = [4, 5, 10, 19, 24];
  private filterInstance = null;
  @ViewChild('filter', { read: ViewContainerRef }) filterContainerRef: ViewContainerRef;

  private sortByInstance = null;
  @ViewChild('sortBy', { read: ViewContainerRef }) sortByContainerRef: ViewContainerRef;

  private selectLangInstace = null;
  @ViewChild('selectLang', { read: ViewContainerRef }) selectLangContainerRef: ViewContainerRef;

  private paginationInstance = null;
  @ViewChild('pagination', { read: ViewContainerRef }) paginationContainerRef: ViewContainerRef;

  private searchBannerCardInstance = null;
  @ViewChild('searchBannerCard', { read: ViewContainerRef }) searchBannerCardContainerRef: ViewContainerRef;

  @Input() productsListingData: ProductListingDataEntity;
  @Input() pageName: 'CATEGORY' | 'BRAND' | 'SEARCH' | 'POPULAR SEARCH' | 'ATTRIBUTE';
  @Input() brandName: string; // only received in case used in brand module
  @Input() brandUrl: string = ''; // only received in case used in brand module
  @Input() headerName: string;
  @Input() titleDescription;
  @Input() categoryId: string; // only received in case used in category module
  @Input() categoryName: string; // only received in case used in category module
  @Input() categoryTaxonomay: string; // only received in case used in category module
  @Input() searchKeyword: string; // only received in case used in search module
  @Input() categoryMidPlpFilterData: any; // only received in case used in search module
  @Input() categoryNameEn: string = '';
  @Input() graphData:any = null;
  @Input() isL2CategoryCheck;
  @Input() informativeVideosData:any;
  @Input() adsenseData:any = null;
  @Output('categoryClicked') categoryClicked: EventEmitter<string> = new EventEmitter<string>();
  Object = Object;
  imagePath = CONSTANTS.IMAGE_BASE_URL;
  filterChipsArray: Array<any> = [];
  isServer: boolean;
  isBrowser: boolean
  sponseredProductList: ProductsEntity[] = [];
  sponseredProductLoadStatus: boolean = false;
  isHomeHeader: boolean = true;
  public appliedFilterCount: number = 0;
  showSortBy: boolean = true;
  productStaticData: any = this._commonService.defaultLocaleValue;
  taxonomyCodesArray: Array<any> = [];
  @Input() isAcceptLanguage = false;
  showNudge = true;
  
  constructor(
    private _componentFactoryResolver: ComponentFactoryResolver,
    private _injector: Injector,
    private _cartService: CartService,
    public _productListService: ProductListService,
    public _productService: ProductService,
    private _localAuthService: LocalAuthService,
    private _activatedRoute: ActivatedRoute,
    private router: Router,
    public _commonService: CommonService) {
  }

  ngOnInit() {
    this.updateFilterCountAndSort();
    this.getUpdatedSession();
    this.initializeLocalization();
    const languagePrefrence = localStorage.getItem("languagePrefrence");
    this.updateUserLanguagePrefrence(languagePrefrence);
  }

  ngAfterViewInit() {
    if(this.showNudge) {
      setTimeout(() => this.showNudge = false, 3000);
    }
  }

  private updateUserLanguagePrefrence(languagePrefrence) {
    const userSession = this._localAuthService.getUserSession();
    if (
      userSession &&
      userSession["authenticated"] == "true" &&
      languagePrefrence != null  &&
      languagePrefrence != userSession["preferredLanguage"]
    ) {
      const params = "customerId=" + userSession["userId"] + "&languageCode=" + languagePrefrence;
      this._commonService.postUserLanguagePrefrence(params).subscribe(result=>{
        if(result && result['status'] == true){
          const selectedLanguage = result['data'] && result['data']['languageCode'];
          const newUserSession = Object.assign({}, this._localAuthService.getUserSession());
          newUserSession.preferredLanguage = selectedLanguage;
          this._localAuthService.setUserSession(newUserSession);
        }
      });
    }
  }

  updateUserLang() {
    let userPreference = null;
    userPreference = localStorage.getItem('languagePrefrence');
    const userSession = this._localAuthService.getUserSession();
    if (
      userSession &&
      userSession["authenticated"] == "true" &&
      userPreference != null  &&
      userPreference != userSession["preferredLanguage"]
    ) {
      userPreference = userSession['preferredLanguage'];
    }
    // this.initializeLocalization(userPreference && userPreference == 'hi' ? true : false);
    if(!this.isHindiUrl && userPreference == 'hi') {
      const URL = '/hi' + this.getSanitizedUrl(this.router.url);
      this.router.navigateByUrl(URL);
    } 
  }

  initializeLocalization(isHindi = this.isHindiUrl) {
    if (isHindi) {
        this._commonService.defaultLocaleValue = localization_hi.product;
        this.productStaticData = localization_hi.product;
        this._commonService.changeStaticJson.next(this.productStaticData);
    } else {
        this._commonService.defaultLocaleValue = localization_en.product;
        this.productStaticData = localization_en.product;
        this._commonService.changeStaticJson.next(this.productStaticData);
    }
    this._commonService.changeStaticJson.asObservable().subscribe(localization_content => {
        this.productStaticData = localization_content;
    });
  }

  get isAdsEnable() {
    return this.pageName == 'CATEGORY' || this.pageName == 'SEARCH'
  }

    //getSponseredProducts() {
    // if (this._commonService.isBrowser && this.isAdsEnable) {
    //   const paramsUsedInModules = this.getParamsUsedInModules();
    //   if (this.isCallSponseredApi(paramsUsedInModules)) {
    //     const query = Object.assign({}, this.getSponseredRequest(), this._commonService.formatParams(paramsUsedInModules))
    //     this._productService.getSponseredProducts(query).subscribe(response => {
    //       if (response['products']) {
    //         let products = response['products'] || [];
    //         if (products && (products as []).length > 0) {
    //           this.sponseredProductList = (products as any[]).map(product => this._productService.searchResponseToProductEntity(product));
    //           // console.log('sponseredProductList', Object.assign([],this.sponseredProductList));
    //           let tempProductList = JSON.parse(JSON.stringify(this.productsListingData.products));
    //           const reversedSponseredProductList = this.sponseredProductList.reverse();
    //           this.productsListingData.products.forEach((product, index) => {
    //             if (this.sponseredProductPosition.includes(index)) {
    //               if (reversedSponseredProductList.length > 0) {
    //                 tempProductList.splice(index, 0, reversedSponseredProductList.pop());
    //               }
    //             }
    //           });
    //           // incase any product remains adding it to bottom most
    //           if (reversedSponseredProductList.length > 0 && tempProductList.length == 24) {
    //             reversedSponseredProductList.forEach(product => {
    //               tempProductList.push(reversedSponseredProductList.pop());
    //             })
    //           }
    //           this.productsListingData.products = JSON.parse(JSON.stringify(tempProductList));
    //         }
    //         this.sponseredProductLoadStatus = true;
    //       }
    //     }, error => {
    //       this.sponseredProductLoadStatus = true;
    //       console.error('getSponseredProducts failed', error);
    //     });
    //   } else {
    //     this.sponseredProductLoadStatus = true;
    //   }
    // }
    //}

  getSponseredRequest() {
    const request = {
      a_type: 'PRODUCT',
      client_id: 302211,
      pcnt: 5,
      page_type: 'SEARCH',
      device_id: this._commonService.getUniqueGAId()
    }
    if (this.pageName == 'SEARCH') {
      request['page_type'] = 'SEARCH';
      request['keywords'] = this.searchKeyword;
    }
    if (this.pageName == 'CATEGORY') {
      request['page_type'] = 'CATEGORY';
      request['category'] = this.categoryId;
      request['categoryName'] = this.categoryName;
      request['categories'] = this.categoryId;
      request['taxonomy'] = this.categoryTaxonomay;
    }
    return request;
  }

  pageTranslation(){
    const isPopUp = localStorage.getItem("isPopUp");
    if(isPopUp == null && !this.isHindiUrl){
      this.loadSelectLangPopup();
    }else{
      const language = this.isHindiUrl ? "en" : "hi";
      localStorage.setItem("languagePrefrence", language); 
      this._productService.updateUserLanguagePrefrence();
      this.translate();
    }
  }

  translate() {
    let hash = '';
    let queryParams = {};
    if(this._commonService.isBrowser) {
      hash = window.location.hash.replace('#', '');
    }
    queryParams = this._activatedRoute.snapshot.queryParams;
    if ((this.router.url).toLowerCase().indexOf('/hi/') !== -1) {
      const URL = this.getSanitizedUrl(this.router.url).split("/hi/").join('/');
      this.navigateToUrl(hash, queryParams, URL);
    }
    else {
      const URL = '/hi' + this.getSanitizedUrl(this.router.url);
      this.navigateToUrl(hash, queryParams, URL);
    }
  }

  navigateToUrl(hash, queryParams, URL) {
    const navigationExtras = (hash && hash.length) ? { fragment: decodeURIComponent(hash) } : {};
    if(Object.keys(queryParams) && Object.keys(queryParams).length) {
      navigationExtras['queryParams'] = queryParams;
    }
    this.router.navigate([URL], navigationExtras);
  }

  getSanitizedUrl(url) {
    return (url).toLowerCase().split('#')[0].split('?')[0];
  }

  getUpdatedSession() {
    // incase redirection from checkout with buynow updated count of product should be displayed in header cart icon
    if (this._commonService.isBrowser) {
      const userSession = this._localAuthService.getUserSession();
      let params = { "sessionid": userSession.sessionId };
      this._cartService.getCartUpdatesChanges().subscribe((cartSession) => {
        let count = 0;
        if (cartSession['noOfItems']) {
          count = cartSession['noOfItems'];
        } else if (cartSession['itemsList']) {
          count = cartSession['itemsList'].length;
        }
        this._cartService.cart.next({ "count" : count });
      })
    }
  }

  get sponseredProductCount() {
    if (this.isAdsEnable && this.sponseredProductList.length > 0) {
      const productCount = this.productsListingData?.products.length;
      if(productCount > 0 && productCount < 5) {
        return 1;
      } else if (productCount >= 5 && productCount < 10) {
        return 2;
      } else if (productCount >= 10 && productCount < 15) {
        return 3;
      } else if (productCount >= 15 && productCount < 20) {
        return 4;
      } else return 5;
    }
    else return 0;
  }

  ngOnChanges() {
    this.updateFilterCountAndSort();
  }

  removeFilterChip(key, termName) {
    this._commonService.genricApplyFilter(key, { term: termName });
  }

  updateFilterCountAndSort() {
    this._productListService.pageName = this.pageName.toLowerCase();

    this.appliedFilterCount = Object.keys(this._commonService.selectedFilterData.filter).length;

    if (this.paginationInstance) {
      this.paginationInstance.instance['paginationData'] = { itemCount: this._commonService.selectedFilterData.totalCount };
      this.paginationInstance.instance.initializePageData();
    }

    this.filterChipsArray = [];
    for (let key in this._commonService.selectedFilterData.filter) {
      this.filterChipsArray = [...this.filterChipsArray, ...this._commonService.selectedFilterData.filter[key]];
    }
  }

  async onVisiblePagination() {
    if (!this.paginationInstance) {
      const { PaginationComponent } = await import('@app/components/pagination/pagination.component');
      const factory = this._componentFactoryResolver.resolveComponentFactory(PaginationComponent);
      this.paginationInstance = this.paginationContainerRef.createComponent(factory, null, this._injector);
      this.paginationInstance.instance['paginationData'] = { itemCount: this._commonService.selectedFilterData.totalCount };
    }
  }

  async onVisiblesearchBannerCard() {
    if ((this.pageName == 'BRAND' || this.pageName == 'CATEGORY' || this.pageName == 'ATTRIBUTE') && !this.searchBannerCardInstance) {
      const { SearchBannerCardComponent } = await import('@app/components/search-banner-card/search-banner-card.component');
      const factory = this._componentFactoryResolver.resolveComponentFactory(SearchBannerCardComponent);
      this.searchBannerCardInstance = this.searchBannerCardContainerRef.createComponent(factory, null, this._injector);
      this.searchBannerCardInstance.instance['categoryTaxonomay'] = this.categoryTaxonomay;
      (this.searchBannerCardInstance.instance['fireSearchEvent$'] as EventEmitter<boolean>).subscribe(data => {
        if (data) {
          let keyword = '';
          if (this.pageName == 'CATEGORY') {
            keyword = this.headerName;
            if(this._commonService.isHindiUrl) {
              keyword = this.categoryNameEn;
            }
          } else if (this.pageName == 'ATTRIBUTE') {
            keyword = this.categoryName;
          } else if (this.pageName == 'BRAND') {
            keyword = this.brandName;
            if (this._commonService.isHindiUrl && this.productsListingData && this.productsListingData['totalCount'] > 0) {
              keyword = this.productsListingData['products'][0]['brandName']
          }
          }
          this._commonService.updateSearchPopup(keyword);
        }
      });
    }
  }

  async filterUp() {
    if (!this.filterInstance) {
      const { FilterComponent } = await import('@app/components/filter/filter.component').finally(() => {
        setTimeout(() => {
          this._commonService.toggleFilter();
        }, 0);
      });
      const factory = this._componentFactoryResolver.resolveComponentFactory(FilterComponent);
      this.filterInstance = this.filterContainerRef.createComponent(factory, null, this._injector);
      const discountIndex = this.productsListingData.filterData.findIndex(f => f.name === 'discount');
      if (discountIndex && this.productsListingData.filterData && this.productsListingData.filterData[discountIndex]) {
        this.productsListingData.filterData[discountIndex].terms.sort((a, b) => (a.term < b.term) ? 1 : ((b.term < a.term) ? -1 : 0)); //ODP-1570, Ratings  asecending to descending
      }
      const ratingIndex = this.productsListingData.filterData.findIndex(f => f.name === 'ratings');
      if (ratingIndex && this.productsListingData.filterData  && this.productsListingData.filterData[ratingIndex]) {
        this.productsListingData.filterData[ratingIndex].terms.sort((a, b) => (parseInt(a.term) < parseInt(b.term)) ? 1 : ((parseInt(b.term) < parseInt(a.term)) ? -1 : 0)); //ODP-1570, Ratings  asecending to descending
      }
      // this.productsListingData.filterData[4].terms = this.productsListingData.filterData[4].terms.reverse();   //ODP-1570, Ratings  asecending to descending 
      this.filterInstance.instance['filterData'] = this.productsListingData.filterData;
      this.filterInstance.instance['isBrandPage'] = this.pageName === 'BRAND';
      this.filterInstance.instance['brandName'] = this.brandName;
      this.filterInstance.instance['brandUrl'] = this.brandUrl;
      this.filterInstance.instance['productStaticData'] = this.productStaticData;
      (this.filterInstance.instance['toggleFilter'] as EventEmitter<any>).subscribe(data => {
        this.filterInstance = null;
        this.filterContainerRef.remove()
      });
    } else {
      // this._commonService.toggleFilter();
      const discountIndex = this.productsListingData.filterData.findIndex(f => f.name === 'discount');
      if (discountIndex>-1) {
        this.productsListingData.filterData[discountIndex].terms.sort((a, b) => (a.term < b.term) ? 1 : ((b.term < a.term) ? -1 : 0)); //ODP-1570, Ratings  asecending to descending
      }
      const ratingIndex = this.productsListingData.filterData.findIndex(f => f.name === 'ratings');
      if (ratingIndex>-1) {
        this.productsListingData.filterData[ratingIndex].terms.sort((a, b) => (parseInt(a.term) < parseInt(b.term)) ? 1 : ((parseInt(b.term) < parseInt(a.term)) ? -1 : 0)); //ODP-1570, Ratings  asecending to descending
      }
      // this.productsListingData.filterData[4].terms = this.productsListingData.filterData[4].terms.reverse();   //ODP-1570, Ratings  asecending to descending 
      this.filterInstance.instance['filterData'] = this.productsListingData.filterData;
      // console.log(this.productsListingData.filterData);
    }
    // console.log(this.productsListingData.filterData);
  }

  async toggleSortBy() {
    if (!this.sortByInstance) {
      const { SortByComponent } = await import('@app/components/sortBy/sortBy.component');
      const factory = this._componentFactoryResolver.resolveComponentFactory(SortByComponent);
      this.sortByInstance = this.sortByContainerRef.createComponent(factory, null, this._injector);
      this.sortByInstance.instance['productStaticData'] = this.productStaticData;
      (this.sortByInstance.instance['toggleFilter'] as EventEmitter<any>).subscribe(data => {
        if (!data) {
          this.sortByInstance = null;
          this.sortByContainerRef.remove();
        }
      });
    }
  }

  resetLazyComponents() {
    if (this.filterInstance) {
      this.filterInstance = null;
      this.filterContainerRef.remove();
    }

    if (this.sortByInstance) {
      this.sortByInstance = null;
      this.sortByContainerRef.remove();
    }

    if (this.paginationInstance) {
      this.paginationInstance = null;
      this.paginationContainerRef.remove();
    }
  }
  get getTaxonomyArray(){
    this.taxonomyCodesArray = (this.categoryTaxonomay as string).split("/");
    return this.categoryTaxonomay && this.categoryTaxonomay.length > 0 
    ? this.taxonomyCodesArray 
    :''
  }

  async loadSelectLangPopup() {
    if (!this.selectLangInstace) {
      const { SelectLanguageComponent } = await import('@app/components/select-language/select-language.component');
      const factory = this._componentFactoryResolver.resolveComponentFactory(SelectLanguageComponent);
      this.selectLangInstace = this.selectLangContainerRef.createComponent(factory, null, this._injector);
      this.selectLangInstace.instance['imagePathAsset'] = CONSTANTS.IMAGE_ASSET_URL;
      this.selectLangInstace.instance['isHindiUrl'] = this.isHindiUrl;
      (this.selectLangInstace.instance['translate$'] as EventEmitter<any>).subscribe(data => {
          this.translate();
          this.selectLangInstace = null;
          this.selectLangContainerRef.remove();
      });
    }
  }
  
  get isHindiUrl() {
    return (this.router.url).toLowerCase().indexOf('/hi/') !== -1
  }

  ngOnDestroy() {
    this.resetLazyComponents();
    this._commonService.defaultLocaleValue = localization_en.product;
  }
}
