import { Component, OnInit } from "@angular/core";
import { CartService } from "@app/utils/services/cart.service";
import { CommonService } from "@app/utils/services/common.service";
import { Subscription } from "rxjs";

@Component({
  selector: "all-promocode-v1",
  templateUrl: "./all-promocode-v1.component.html",
  styleUrls: ["./all-promocode-v1.component.scss"],
})
export class AllPromocodeV1Component implements OnInit {
  showPromoOfferPopup: boolean = false;
  appliedPromocodeSubscription: Subscription;
  appliedPromocode: string = "";

  constructor(
    private _commonService: CommonService,
    private _cartService: CartService
  ) {}

  ngOnInit(): void {
    this.appliedPromocodeSubscription =
      this._cartService.promoCodeSubject.subscribe(
        ({ promocode, isNewPromocode }) => {
          this.appliedPromocode = promocode || '';
          console.log(this.appliedPromocode);
        }
      );
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
}
