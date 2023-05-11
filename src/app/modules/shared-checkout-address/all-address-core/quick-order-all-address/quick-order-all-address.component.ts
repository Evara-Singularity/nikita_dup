import { Component, ComponentFactoryResolver, Injector } from "@angular/core";
import { AddressService } from "@app/utils/services/address.service";
import { LocalAuthService } from "@app/utils/services/auth.service";
import { CartService } from "@app/utils/services/cart.service";
import { GlobalAnalyticsService } from "@app/utils/services/global-analytics.service";
import { AllAddressCoreComponent } from "../all-address-core.component";

@Component({
  selector: "quick-order-all-address",
  templateUrl: "./quick-order-all-address.component.html",
  styleUrls: ["./quick-order-all-address.component.scss"],
})
export class QuickOrderAllAddressComponent extends AllAddressCoreComponent {
  constructor(
    public _addressService: AddressService,
    public _localAuthService: LocalAuthService,
    public cfr: ComponentFactoryResolver,
    public injector: Injector,
    public _cartService: CartService,
    public _globalAnalyticsService: GlobalAnalyticsService
  ) {
    super(
      _addressService,
      _localAuthService,
      cfr,
      injector,
      _cartService,
      _globalAnalyticsService
    );
  }

  ngOnInit(): void {
    super.ngOnInit();
  }
}
