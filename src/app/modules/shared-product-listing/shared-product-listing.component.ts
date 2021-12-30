import { EventEmitter, Component, Input, ViewChild, ViewContainerRef, ComponentFactoryResolver, Injector, AfterViewInit, OnInit, OnDestroy } from '@angular/core';
import CONSTANTS from '@app/config/constants';
import { ProductListingDataEntity, ProductsEntity } from '@app/utils/models/product.listing.search';
import { CommonService } from '@app/utils/services/common.service';
import { ProductListService } from '@app/utils/services/productList.service';
import { CartService } from '@app/utils/services/cart.service';
import { LocalAuthService } from '@app/utils/services/auth.service';
import { ProductService } from '@app/utils/services/product.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'shared-product-listing',
  templateUrl: './shared-product-listing.component.html',
  styleUrls: ['./shared-product-listing.component.scss']
})
export class SharedProductListingComponent implements OnInit, OnDestroy {

  readonly sponseredProductPosition = [4, 5, 10, 19, 24];
  private filterInstance = null;
  @ViewChild('filter', { read: ViewContainerRef }) filterContainerRef: ViewContainerRef;

  private sortByInstance = null;
  @ViewChild('sortBy', { read: ViewContainerRef }) sortByContainerRef: ViewContainerRef;

  private paginationInstance = null;
  @ViewChild('pagination', { read: ViewContainerRef }) paginationContainerRef: ViewContainerRef;

  private searchBannerCardInstance = null;
  @ViewChild('searchBannerCard', { read: ViewContainerRef }) searchBannerCardContainerRef: ViewContainerRef;

  @Input() productsListingData: ProductListingDataEntity;
  @Input() pageName: 'CATEGORY' | 'BRAND' | 'SEARCH' | 'POPULAR SEARCH' | 'ATTRIBUTE';
  @Input() brandName: string; // only received in case used in brand module
  @Input() brandUrl: string = ''; // only received in case used in brand module
  @Input() headerName: string;
  @Input() categoryId: string; // only received in case used in category module
  @Input() categoryName: string; // only received in case used in category module
  @Input() categoryTaxonomay: string; // only received in case used in category module
  @Input() searchKeyword: string; // only received in case used in search module
  Object = Object;
  imagePath = CONSTANTS.IMAGE_BASE_URL;
  filterChipsArray: Array<any> = [];
  isServer: boolean;
  isBrowser: boolean
  sponseredProductList: ProductsEntity[] = [];
  sponseredProductLoadStatus: boolean = false;
  isHomeHeader:boolean = true; 
  public appliedFilterCount: number = 0;

  constructor(
    private _componentFactoryResolver: ComponentFactoryResolver,
    private _injector: Injector,
    private _cartService: CartService,
    public _productListService: ProductListService,
    public _productService: ProductService,
    private _localAuthService: LocalAuthService,
    private _activatedRoute: ActivatedRoute,
    public _commonService: CommonService) {
  }

  ngOnInit() {
    this.updateFilterCountAndSort();
    this.getUpdatedSession();
  }


  get isAdsEnable() {
    return this.pageName == 'CATEGORY' || this.pageName == 'SEARCH'
  }

  getSponseredProducts() {
    if (this._commonService.isBrowser && this.isAdsEnable) {
      const paramsUsedInModules = this.getParamsUsedInModules();
      if (this.isCallSponseredApi(paramsUsedInModules)) {
        const query = Object.assign({}, this.getSponseredRequest(), this._commonService.formatParams(paramsUsedInModules))
        this._productService.getSponseredProducts(query).subscribe(response => {
          this.sponseredProductLoadStatus = true;
          if (response['products']) {
            let products = response['products'] || [];
            if (products && (products as []).length > 0) {
              this.sponseredProductList = (products as any[]).map(product => this._productService.searchResponseToProductEntity(product));
              let tempProductList = JSON.parse(JSON.stringify(this.productsListingData.products));
              const reversedSponseredProductList = this.sponseredProductList.reverse();
              this.productsListingData.products.forEach((product, index) => {
                if (this.sponseredProductPosition.includes(index)) {
                  if (reversedSponseredProductList.length > 0) {
                    tempProductList.splice(index, 0, reversedSponseredProductList.pop());
                  }
                }
              });
              // incase any product remains adding it to bottom most
              if (reversedSponseredProductList.length > 0 && tempProductList.length == 24) {
                reversedSponseredProductList.forEach(product => {
                  tempProductList.push(reversedSponseredProductList.pop());
                })
              }
              this.productsListingData.products = JSON.parse(JSON.stringify(tempProductList));
            }
          }
        }, error => {
          this.sponseredProductLoadStatus = true;
          console.error('getSponseredProducts failed', error);
        });
      } else {
        this.sponseredProductLoadStatus = true;
      }
    }
  }

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

  private getParamsUsedInModules() {
    const params = {
      filter: this._commonService.updateSelectedFilterDataFilterFromFragment(this._activatedRoute.snapshot.fragment),
      queryParams: this._activatedRoute.snapshot.queryParams,
      pageName: this.pageName
    };
    return params;
  }

  private isCallSponseredApi(formatParamsObj: any): boolean {
    const filter = formatParamsObj.filter || {};
    const queryParams = formatParamsObj.queryParams || {};
    const filterKeys = Object.keys(filter)
    const queryParamsKeys = Object.keys(queryParams);
    const queryParamConditionOne = (!queryParamsKeys.includes('orderby') && !queryParamsKeys.includes('orderway') && !queryParamsKeys.includes('orderBy') && !queryParamsKeys.includes('orderWay')) || (queryParamsKeys.includes('orderby') && queryParamsKeys.includes('orderway') && !queryParamsKeys.includes('orderBy') && !queryParamsKeys.includes('orderWay'))
    return filterKeys.length == 0 && (queryParamsKeys.length == 0 || (queryParamsKeys.length > 0 && queryParamConditionOne))
  }

  getUpdatedSession() {
    // incase redirection from checkout with buynow updated count of product should be displayed in header cart icon
    if (this._commonService.isBrowser) {
      const userSession = this._localAuthService.getUserSession();
      let params = { "sessionid": userSession.sessionId };
      this._cartService.getCartBySession(params).subscribe((cartSession) => {

        let count = 0;
        if (cartSession['noOfItems']) {
          count = cartSession['noOfItems'];
        } else if (cartSession['itemsList']) {
          count = cartSession['itemsList'].length;
        }
        this._cartService.cart.next({ count });
      })
    }
  }

  get sponseredProductCount() {
    if (this.isAdsEnable && this.sponseredProductList.length > 0) {
      const productCount = this.productsListingData?.products.length;
      if (productCount > 0 && productCount < 5) {
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
    if (this.pageName != 'SEARCH' && !this.searchBannerCardInstance) {
      const { SearchBannerCardComponent } = await import('@app/components/search-banner-card/search-banner-card.component');
      const factory = this._componentFactoryResolver.resolveComponentFactory(SearchBannerCardComponent);
      this.searchBannerCardInstance = this.searchBannerCardContainerRef.createComponent(factory, null, this._injector);
      let keyword = '';
      if (this.pageName == 'CATEGORY' || this.pageName == 'ATTRIBUTE') {
        keyword = this.categoryName;
      } else if (this.pageName == 'BRAND') {
        keyword = this.brandName;
      }
      this.searchBannerCardInstance.instance['searchKeyword'] = keyword;
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
      if (discountIndex) {
        this.productsListingData.filterData[discountIndex].terms.sort((a, b) => (a.term < b.term) ? 1 : ((b.term < a.term) ? -1 : 0)); //ODP-1570, Ratings  asecending to descending
      }
      const ratingIndex = this.productsListingData.filterData.findIndex(f => f.name === 'ratings');
      if (ratingIndex) {
        this.productsListingData.filterData[ratingIndex].terms.sort((a, b) => (parseInt(a.term) < parseInt(b.term)) ? 1 : ((parseInt(b.term) < parseInt(a.term)) ? -1 : 0)); //ODP-1570, Ratings  asecending to descending
      }
      // this.productsListingData.filterData[4].terms = this.productsListingData.filterData[4].terms.reverse();   //ODP-1570, Ratings  asecending to descending 
      this.filterInstance.instance['filterData'] = this.productsListingData.filterData;
      this.filterInstance.instance['isBrandPage'] = this.pageName === 'BRAND';
      this.filterInstance.instance['brandName'] = this.brandName;
      this.filterInstance.instance['brandUrl'] = this.brandUrl;
      (this.filterInstance.instance['toggleFilter'] as EventEmitter<any>).subscribe(data => {
        this.filterUp();
      });
    } else {
      this._commonService.toggleFilter();
      const discountIndex = this.productsListingData.filterData.findIndex(f => f.name === 'discount');
      if (discountIndex) {
        this.productsListingData.filterData[discountIndex].terms.sort((a, b) => (a.term < b.term) ? 1 : ((b.term < a.term) ? -1 : 0)); //ODP-1570, Ratings  asecending to descending
      }
      const ratingIndex = this.productsListingData.filterData.findIndex(f => f.name === 'ratings');
      if (ratingIndex) {
        this.productsListingData.filterData[ratingIndex].terms.sort((a, b) => (parseInt(a.term) < parseInt(b.term)) ? 1 : ((parseInt(b.term) < parseInt(a.term)) ? -1 : 0)); //ODP-1570, Ratings  asecending to descending
      }
      // this.productsListingData.filterData[4].terms = this.productsListingData.filterData[4].terms.reverse();   //ODP-1570, Ratings  asecending to descending 
      this.filterInstance.instance['filterData'] = this.productsListingData.filterData;
      console.log(this.productsListingData.filterData);
    }
  }

  async toggleSortBy() {
    if (!this.sortByInstance) {
      const { SortByComponent } = await import('@app/components/sortBy/sortBy.component');
      const factory = this._componentFactoryResolver.resolveComponentFactory(SortByComponent);
      this.sortByInstance = this.sortByContainerRef.createComponent(factory, null, this._injector);

      (this.sortByInstance.instance['toggleFilter'] as EventEmitter<any>).subscribe(data => {
        this.toggleSortBy();
      });
    } else {
      const sortByFilter = document.querySelector('sort-by');
      if (sortByFilter) {
        sortByFilter.classList.toggle('open');
      }
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

  ngOnDestroy() {
    this.resetLazyComponents();
  }

}
