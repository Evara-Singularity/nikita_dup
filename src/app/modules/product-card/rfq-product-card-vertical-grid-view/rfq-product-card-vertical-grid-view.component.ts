import { ChangeDetectorRef, Component, ComponentFactoryResolver, Injector, Input } from '@angular/core';
import { Router } from '@angular/router';
import { ModalService } from '@app/modules/modal/modal.service';
import { ToastMessageService } from '@app/modules/toastMessage/toast-message.service';
import { ProductCardFeature } from '@app/utils/models/product.listing.search';
import { LocalAuthService } from '@app/utils/services/auth.service';
import { CartService } from '@app/utils/services/cart.service';
import { CommonService } from '@app/utils/services/common.service';
import { GlobalAnalyticsService } from '@app/utils/services/global-analytics.service';
import { GlobalLoaderService } from '@app/utils/services/global-loader.service';
import { ProductService } from '@app/utils/services/product.service';
import { ProductListService } from '@app/utils/services/productList.service';
import { ProductCardCoreComponent } from '../product-card.core.component';


@Component({
  selector: 'rfq-product-card-vertical-grid-view',
  templateUrl: './rfq-product-card-vertical-grid-view.component.html',
  styleUrls: ['./rfq-product-card-vertical-grid-view.component.scss']
})
export class RfqProductCardVerticalGridViewComponent extends ProductCardCoreComponent{

  rfqStatuscolour:string
  @Input() cardFeaturesConfig: ProductCardFeature = {
    // feature config
    enableAddToCart: true,
    enableBuyNow: true,
    enableFeatures: true,
    enableRating: true,
    enableVideo: true,
    // design config
    enableCard: false,
    verticalOrientation: false,
    horizontalOrientation: true,
    verticalOrientationV2: false,
    lazyLoadImage: true,
  }

  constructor(
    public _cartService: CartService,
    public _productListService: ProductListService,
    public _loader: GlobalLoaderService,
    public _router: Router,
    public _cfr: ComponentFactoryResolver,
    public _injector: Injector,
    public modalService: ModalService,
    public _localAuthService: LocalAuthService,
    public _commonService: CommonService,
    public _analytics: GlobalAnalyticsService,
    public _toastMessageService: ToastMessageService,
    public _productService: ProductService,
    public _cdr: ChangeDetectorRef
  ) {
    super(
      _cartService,
      _productListService,
      _loader,
      _router,
      _cfr,
      _injector,
      modalService,
      _localAuthService,
      _commonService,
      _analytics,
      _toastMessageService,
      _productService,
      _cdr
    );
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.rfqstatusColourConfig(this.product['HomePageRFQstatus']['status']);
  }

  rfqstatusColourConfig(status){
    switch (status) {
      case 'Pending':
        this.rfqStatuscolour = 'orange'
        break;
      case 'Created':
        this.rfqStatuscolour = 'orange'
        break;
      case 'Closed':
        this.rfqStatuscolour = ''
        break;
      case 'Quoted':
        this.rfqStatuscolour = 'green'
        break;
      case 'Order_Created':
        this.rfqStatuscolour = 'green'
        break;
    }
  }

  splitBrandName(str){
    let brand = str.split(" ");
     return brand[1];
  }

  getProductImage(product) { 
    // console.log('getProductImage', product);
    return product['mainImageThumnailLink'] || product['imageLink_medium'] || product['mainImageMediumLink'] || product['mainImageLink'] ;
  }
}
