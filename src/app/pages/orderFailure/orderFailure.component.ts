import { Component } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { LocalAuthService } from '@app/utils/services/auth.service';
import { CartService } from '@app/utils/services/cart.service';
import { FooterService } from '@app/utils/services/footer.service';

declare var digitalData: {};
declare let _satellite;

@Component({
  selector: "order-failure",
  templateUrl: "orderFailure.html",
  styleUrls: ["orderFailure.scss"],
})
export class OrderFailureComponent {
  data: {};
  API: {};
  queryParams: {};

  constructor(
    private _router: Router,
    public footerService: FooterService,
    private _activatedRoute: ActivatedRoute,
    private _localAuthService: LocalAuthService,
    private _cartService: CartService
  ) {}

  ngOnInit() {
    this.queryParams = this._activatedRoute.snapshot.queryParams;
    this.API = CONSTANTS;
    this.footerService.setFooterObj({ footerData: false });
    this.footerService.footerChangeSubject.next(
      this.footerService.getFooterObj()
    );
    let userSession = this._localAuthService.getUserSession();
    let params = { sessionid: userSession.sessionId };
    let prodIds = "",
      prodNames = "",
      prodPrices = "",
      prodQuantities = "",
      aCat1 = "",
      aCat2 = "",
      aCat3 = "",
      aprodIds = "",
      aprodNames = "",
      aprodPrices = "",
      aprodQuantities = "",
      aShipping = "",
      aOffer = "",
      aTotalDiscount = 0,
      aTotalShipping = 0,
      aTotalQuantity = 0;
    this._cartService.getCartBySession(params).subscribe((cartSession) => {
      if (
        cartSession["statusCode"] != undefined &&
        cartSession["statusCode"] == 200
      ) {
        cartSession["itemsList"].forEach((element) => {
          prodIds = element.productId + ", " + prodIds;
          prodNames = element.productName + ", " + prodNames;
          prodPrices = element.productUnitPrice + ", " + prodPrices;
          prodQuantities = element.productQuantity + ", " + prodQuantities;
          let taxonomy = element.taxonomyCode.split("/");
          taxonomy.forEach((ele, i) => {
            if (i == 0) aCat1 = ele + "|" + aCat1 || "NA";
            if (i == 1) aCat2 = ele + "|" + aCat2 || "NA";
            if (i == 2) aCat3 = ele + "|" + aCat3 || "NA";
          });
          aprodIds = element.productId + "|" + aprodIds;
          aprodNames = element.productName + "|" + aprodNames;
          aprodPrices = element.productUnitPrice + "|" + aprodPrices;
          aprodQuantities = element.productQuantity + "|" + aprodQuantities;
          if (element.shipping) aShipping = element.shipping + "|" + aShipping;
          if (element.offer) aOffer = element.offer + "|" + aOffer;
          if (element.discount)
            aTotalDiscount = element.discount + aTotalDiscount;
          if (element.shipping)
            aTotalShipping = element.shipping + aTotalShipping;
          if (element.productQuantity)
            aTotalQuantity = parseInt(element.productQuantity) + aTotalQuantity;
        });

        /* Start Adobe Analytics Integration */
        let page = {
          pageName: "payment-failure",
          channel: "purchase",
          subsection: "payment failure",
        };
        let custData = {
          customerID:
            userSession && userSession["userId"]
              ? btoa(userSession["userId"])
              : "",
          emailID:
            userSession && userSession["email"]
              ? btoa(userSession["email"])
              : "",
          mobile:
            userSession && userSession["phone"]
              ? btoa(userSession["phone"])
              : "",
        };
        let order = {
          transactionID: this.queryParams["orderId"],
          platformType: "mobile",
          productCategoryL1: aCat1,
          productCategoryL2: aCat2,
          productCategoryL3: aCat3,
          productID: aprodIds,
          productPrice: aprodPrices,
          shipping: aShipping,
          couponDiscount: aOffer,
          quantity: aprodQuantities,
          paymentMode: this.queryParams["mode"],
          totalDiscount: aTotalDiscount,
          totalQuantity: aTotalQuantity,
          totalPrice: this.queryParams["transactionAmount"],
          couponCode: "",
          shippingCharges: aTotalShipping,
        };

        digitalData["page"] = page;
        digitalData["custData"] = custData;
        digitalData["order"] = order;
        _satellite.track("genericPageLoad");
      }
    });
  }
  ngOnDestroy() {
    this.footerService.setFooterObj({ footerData: false });
    this.footerService.footerChangeSubject.next(
      this.footerService.getFooterObj()
    );
  }

  navigateTo(route) {
    this._router.navigate([route]);
  }
}
