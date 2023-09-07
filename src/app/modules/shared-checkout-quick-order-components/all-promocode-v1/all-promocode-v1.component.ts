import { Component, Input, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { CartService } from "@app/utils/services/cart.service";
import { CommonService } from "@app/utils/services/common.service";
import { GlobalAnalyticsService } from "@app/utils/services/global-analytics.service";
import { Subscription } from "rxjs";
import { setTimeout } from "timers";

@Component({
  selector: "all-promocode-v1",
  templateUrl: "./all-promocode-v1.component.html",
  styleUrls: ["./all-promocode-v1.component.scss"],
})
export class AllPromocodeV1Component implements OnInit {
  showPromoOfferPopup: boolean = false;
  appliedPromocodeSubscription: Subscription;
  appliedPromocode: string = "";
  @Input() moduleUsedIn = '';
  viewCouponHeaderText: string = 'VIEW MORE COUPONS'

  constructor(
    private _commonService: CommonService,
    public _cartService: CartService,
    private _analytics: GlobalAnalyticsService,
    private _activatedRoute: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.appliedPromocodeSubscription =
      this._cartService.promoCodeSubject.subscribe(
        ({ promocode, isNewPromocode }) => {
          this.appliedPromocode = promocode || "";
        }
      );
      const url = this._activatedRoute.snapshot['_routerState'].url;
      if(url == '/checkout/address' && (this._cartService.buyNow != true)){ this.viewCouponHeaderText = 'APPLY COUPON'}
  }

  openPromoCodeList() {
    this.showPromoOfferPopup = true;
    if (this._commonService.isBrowser && document.querySelector("app-pop-up")) {
      document.querySelector("app-pop-up").classList.add("open");
    }
  }

  closePromoListPopUp(flag) {
    (<HTMLElement>document.getElementById("body")).classList.remove(
      "stop-scroll"
    );
    document
      .getElementById("body")
      .removeEventListener("touchmove", this.preventDefault);
    this.showPromoOfferPopup = flag;    
  }

  preventDefault(e) {
    e.preventDefault();
  }

  submitPromocode(e, promocode) {
    // if (this.selectedPromocode === promocode) { return }
    this._cartService.genericApplyPromoCode(promocode);
    this.adobeTracking('apply_coupon_cart_top');
}

adobeTracking(trackingname){
  const page = {
      'linkPageName': "moglix:cart summary",
      'linkName': trackingname,
  }
  let data = {}
  data["page"] = page;
  data["custData"] = this._commonService.custDataTracking;
  this._analytics.sendAdobeCall(data, trackingname); 
}
}
