import { CommonModule } from "@angular/common";
import {
  Component,
  EventEmitter,
  Input,
  NgModule,
  Output,
} from "@angular/core";
import { InitiateQuickCod } from "@app/utils/models/cart.initial";
import { LocalAuthService } from "@app/utils/services/auth.service";
import { CartService } from "@app/utils/services/cart.service";
import { CommonService } from "@app/utils/services/common.service";
import { GlobalAnalyticsService } from "@app/utils/services/global-analytics.service";
import { GlobalLoaderService } from "@app/utils/services/global-loader.service";
import { QuickCodService } from "@app/utils/services/quick-cod.service";
import { MathRoundPipeModule } from "../../utils/pipes/math-round";

@Component({
  selector: "cod-and-pay-online",
  templateUrl: "./cod-and-pay-online.component.html",
  styleUrls: ["./cod-and-pay-online.component.scss"],
})
export class CodAndPayOnlineComponent {
  readonly INVOICE_TYPES = { RETAIL: "retail", TAX: "tax" };
  @Input("payableAmount") payableAmount: number = 0;
  @Input("invoiceType") invoiceType = this.INVOICE_TYPES.RETAIL;
  @Output() continueToPayment$: EventEmitter<any> = new EventEmitter<any>();

  @Input("deliveryAddress") deliveryAddress: any = null;
  @Input("billingAddress") billingAddress: any = null;

  constructor(
    private quickCodService: QuickCodService,
    private globalLoader: GlobalLoaderService,
    public cartService: CartService,
    private localAuthService: LocalAuthService,
    private _analytics: GlobalAnalyticsService,
    private _commonService: CommonService
  ) {}

  validateCart() {
    //address verification
    if (!this.deliveryAddress) {
      this.continueToPayment$.emit(true);
        return;
    }
    if (this.invoiceType === this.INVOICE_TYPES.TAX) {
        if (!this.billingAddress) {
          this.continueToPayment$.emit(true);
            return;
        } else if (!this.billingAddress['gstinVerified']) {
          this.continueToPayment$.emit(true);
          return;
        }
    }
    this.globalLoader.setLoaderState(true);
    const _cartSession = this.cartService.getCartSession();
    const _shippingAddress = this.cartService.shippingAddress ?? null;
    const _billingAddress = this.cartService.billingAddress ?? null;
    const _invoiceType = this.cartService.invoiceType;
    const _postCode = this.cartService.shippingAddress["zipCode"];
    const _userSession = this.localAuthService.getUserSession();
    const _userId = _userSession["userId"];

    const validateDtoRequest: InitiateQuickCod = {
      cartSession: _cartSession,
      shippingAddress: _shippingAddress,
      billingAddress: _billingAddress,
      invoiceType: _invoiceType,
      isBuyNow: this.getBuyNow(),
      postCode: _postCode,
      userId: _userId,
    };
    this.adobeTracking("checkout:COD");
    this.quickCodService.initiateQuickCOD(validateDtoRequest);
  }

  getBuyNow() {
    const buyNow =
      this.cartService.buyNow != undefined && this.cartService.buyNow == true
        ? true
        : false;
    return buyNow;
  }

  continueToPayment() {
    this.adobeTracking("checkout:payonline");
    this.continueToPayment$.emit(true);
  }

  adobeTracking(trackingname) {
    const page = {
      linkPageName: "moglix:checkout",
      linkName: trackingname,
      channel: "checkout"
    };
    let data = {};
    data["page"] = page;
    data["custData"] = this._commonService.custDataTracking;
    this._analytics.sendAdobeCall(data, 'genericClick');
  }
}

@NgModule({
  declarations: [CodAndPayOnlineComponent],
  exports: [CodAndPayOnlineComponent],
  imports: [CommonModule, MathRoundPipeModule],
})
export class CodAndPayOnlineModule {}
