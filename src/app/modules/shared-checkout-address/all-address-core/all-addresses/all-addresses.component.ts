import { Component, ComponentFactoryResolver, Injector } from "@angular/core";
import { AddressService } from "@app/utils/services/address.service";
import { LocalAuthService } from "@app/utils/services/auth.service";
import { CartService } from "@app/utils/services/cart.service";
import { GlobalAnalyticsService } from "@app/utils/services/global-analytics.service";
import { AllAddressCoreComponent } from "../all-address-core.component";

@Component({
  selector: "all-addresses",
  templateUrl: "./all-addresses.component.html",
  styleUrls: ["../../common-checkout.scss"],
})
export class AllAddressesComponent extends AllAddressCoreComponent {
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
