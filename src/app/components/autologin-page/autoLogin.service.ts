import { CONSTANTS } from "@app/config/constants";
import { Injectable } from "@angular/core";
import { DataService } from "@app/utils/services/data.service";
import { ENDPOINTS } from "@app/config/endpoints";
import { CartService } from "@app/utils/services/cart.service";
import { ProductService } from "@app/utils/services/product.service";
import { Router } from "@angular/router";
import { forkJoin } from "rxjs";
import { CommonService } from "@app/utils/services/common.service";
import { ToastMessageService } from "@app/modules/toastMessage/toast-message.service";

@Injectable()
export class AutoLoginService {
  constructor(
    private router: Router,
    private _dataService: DataService,
    private cartService: CartService,
    private productService: ProductService,
    private _commonService: CommonService,
    private _toastService: ToastMessageService
  ) {}

  getTokenAuthentication(postBody) {
    const url = CONSTANTS.NEW_MOGLIX_API_V2 + ENDPOINTS.TOKEN_AUTHENTICATION;
    return this._dataService.callRestful("POST", url, { body: postBody });
  }

  getDecodeD2cToken(postBody) {
    const url = CONSTANTS.NEW_MOGLIX_API_V2 + ENDPOINTS.PROCESS_D2C_TOKEN;
    return this._dataService.callRestful("POST", url, { body: postBody });
  }

  processMsnsAndAddtoCart(msn) {
    const buyNow = false;
   // const msn = ["msn2r9cfnauwxd", "msng9vn4gd1dkp"];
    let getGroupProductApi = [];
    msn.forEach((ele) => {
      getGroupProductApi.push(this.productService.getGroupProductObj(ele));
    });
    forkJoin(getGroupProductApi).subscribe((results) => {
      const addToCartData = [];
      if (results && results.length > 0) {
        for (let i = 0; i < results.length; i++) {
          const data = results[i];
          const addToCartProductRequest =
            this.cartService.getAddToCartProductItemRequest({
              productGroupData: data["productBO"],
              buyNow: buyNow,
              selectPriceMap: null,
              quantity: 1,
            });
          addToCartData.push(addToCartProductRequest);
          if (i == results.length - 1) {
            this.cartService
              .multipleAddToCart({ buyNow, productDetailsList: addToCartData })
              .subscribe((ress) => {
                if (ress) {
                  this._commonService.setInitaiteLoginPopUp(null);
                }
                console.log("ress =====>", ress);
              });
          }
        }
      } else {
        this._toastService.show({ type: "error", text: "Please make sure token and clientId is appended in url", });
        this.router.navigate([""]);
      }
    });
  }
}
