import { Component, ComponentFactoryResolver, Injector, OnInit, ViewChild, ViewContainerRef } from '@angular/core';

@Component({
  selector: 'product-listing-app-promo',
  templateUrl: './product-listing-app-promo.component.html',
  styleUrls: ['./product-listing-app-promo.component.scss']
})
export class ProductListingAppPromoComponent implements OnInit {

  // ondemand loaded components for app Promo
  appPromoInstance = null;
  @ViewChild('appPromo', { read: ViewContainerRef }) appPromoContainerRef: ViewContainerRef;

  constructor(
    private cfr: ComponentFactoryResolver,
    private injector: Injector,
  ) { }

  ngOnInit() {
  }

  async onVisibleAppPromo(event) {
    const { ProductAppPromoComponent } = await import('../../components/product-app-promo/product-app-promo.component')
    const factory = this.cfr.resolveComponentFactory(ProductAppPromoComponent);
    this.appPromoInstance = this.appPromoContainerRef.createComponent(factory, null, this.injector);
    this.appPromoInstance.instance['page'] = 'order-confirmation';
    this.appPromoInstance.instance['isOverlayMode'] = false;
    this.appPromoInstance.instance['showPromoCode'] = false;
    this.appPromoInstance.instance['isLazyLoaded'] = true;
  }

  appPromoStatus(event) {

  }

}
