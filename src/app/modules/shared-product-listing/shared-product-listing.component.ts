import { EventEmitter, Component, Input, ViewChild, ViewContainerRef, ComponentFactoryResolver, Injector } from '@angular/core';
import CONSTANTS from '@app/config/constants';
import { ProductListingDataEntity, ProductsEntity } from '@app/utils/models/product.listing.search';
import { CommonService } from '@app/utils/services/common.service';
import { ProductListService } from '@app/utils/services/productList.service';
import { CartService } from '@app/utils/services/cart.service';
import { LocalAuthService } from '@app/utils/services/auth.service';
import { ProductService } from '@app/utils/services/product.service';

@Component({
  selector: 'shared-product-listing',
  templateUrl: './shared-product-listing.component.html',
  styleUrls: ['./shared-product-listing.component.scss']
})
export class SharedProductListingComponent {

  readonly sponseredProductPosition = [0, 5, 10, 15];
  readonly sponseredProductPositionMapping = { 0: 0, 5: 1, 10: 2, 15: 3 }
  private filterInstance = null;
  @ViewChild('filter', { read: ViewContainerRef }) filterContainerRef: ViewContainerRef;

  private sortByInstance = null;
  @ViewChild('sortBy', { read: ViewContainerRef }) sortByContainerRef: ViewContainerRef;

  private paginationInstance = null;
  @ViewChild('pagination', { read: ViewContainerRef }) paginationContainerRef: ViewContainerRef;

  @Input() productsListingData: ProductListingDataEntity;
  @Input() pageName: string;
  @Input() brandName: string;
  @Input() brandUrl: string = '';
  @Input() headerName: string;
  @Input() sponseredKeyword: string;
  Object = Object;
  imagePath = CONSTANTS.IMAGE_BASE_URL;
  filterChipsArray: Array<any> = [];
  isServer: boolean;
  isBrowser: boolean
  sponseredProductList: ProductsEntity[] = [];

  public appliedFilterCount: number = 0;

  constructor(
    private _componentFactoryResolver: ComponentFactoryResolver,
    private _injector: Injector,
    private _cartService: CartService,
    public _productListService: ProductListService,
    public _productService: ProductService,
    private _localAuthService: LocalAuthService,
    public _commonService: CommonService) {
  }

  ngOnInit() {
    this.updateFilterCountAndSort();
    this.getUpdatedSession();
    this.getSponseredProducts();
  }

  private getSponseredProducts() {
    if (this._commonService.isBrowser && this.sponseredKeyword) {
      const query = {
        a_type: 'PRODUCT',
        client_id: 302211,
        keywords: encodeURIComponent(this.sponseredKeyword.toLowerCase()),
        pcnt: 4,
        page_type: 'SEARCH',
        device_id: this._commonService.getUniqueGAId()
      }
      this._productService.getSponseredProducts(query).subscribe(response => {
        let products = response['productSearchResult']['products'] || [];
        if (products && (products as []).length > 0) {
          this.sponseredProductList = (products as any[]).map(product => this._productService.searchResponseToProductEntity(product));
        }
      });
    }
  }

  getUpdatedSession() {
     // incase redirection from checkout with buynow updated count of product should be displayed in header cart icon
    if (this.isBrowser) {
      const userSession = this._localAuthService.getUserSession();
      let params = { "sessionid": userSession.sessionId };
      this._cartService.getCartBySession(params).subscribe((cartSession) => {
        this._cartService.cart.next({ count: cartSession['noOfItems'] || null });
      })
    }
  }
  
  ngOnChanges(){
    this.updateFilterCountAndSort();
  }
  
  removeFilterChip(key, termName) {
    const item = this.productsListingData.filterData.find(f => f.name === key);
    if (item) {
      const term = item.terms.find(t => t.term.toLowerCase() === termName.toLowerCase()); 
      if (term) {
        this._commonService.genricApplyFilter(key, term);
      }
    }
  }
  
  updateFilterCountAndSort(){
    this._productListService.pageName = this.pageName.toLowerCase();

    this.appliedFilterCount = Object.keys(this._commonService.selectedFilterData.filter).length;
    
    if (this.paginationInstance) {
      this.paginationInstance.instance['paginationData'] = { itemCount: this._commonService.selectedFilterData.totalCount };
      this.paginationInstance.instance.initializePageData();
    }

    this.filterChipsArray = [];
    for(let key in this._commonService.selectedFilterData.filter) {
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

  async filterUp() {
    if (!this.filterInstance) {
      const { FilterComponent } = await import('@app/components/filter/filter.component').finally(() => {
        setTimeout(() => {
          this._commonService.toggleFilter();
        }, 0);
      });
      const factory = this._componentFactoryResolver.resolveComponentFactory(FilterComponent);
      this.filterInstance = this.filterContainerRef.createComponent(factory, null, this._injector);
      this.filterInstance.instance['filterData'] = this.productsListingData.filterData;
      this.filterInstance.instance['isBrandPage'] = this.pageName === 'BRAND';
      this.filterInstance.instance['brandName'] = this.brandName;
      this.filterInstance.instance['brandUrl'] = this.brandUrl;
      (this.filterInstance.instance['toggleFilter'] as EventEmitter<any>).subscribe(data => {
        this.filterUp();
      });
    } else {
      this._commonService.toggleFilter();
      this.filterInstance.instance['filterData'] = this.productsListingData.filterData;
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
