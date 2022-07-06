import { Component, ComponentFactoryResolver, Injector, Input } from '@angular/core';
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
  selector: 'product-card-vertical-grid-view',
  templateUrl: './product-card-vertical-grid-view.component.html',
  styleUrls: ['./product-card-vertical-grid-view.component.scss']
})
export class ProductCardVerticalGridViewComponent extends ProductCardCoreComponent {

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
    lazyLoadImage: false,
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
      _productService
    );
  }

  ngOnInit(): void {
    super.ngOnInit();
  }

}
