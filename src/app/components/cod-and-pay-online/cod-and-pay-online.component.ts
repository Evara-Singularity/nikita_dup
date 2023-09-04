import { CommonModule } from '@angular/common';
import { Component, NgModule } from '@angular/core';
import { InitiateQuickCod } from '@app/utils/models/cart.initial';
import { LocalAuthService } from '@app/utils/services/auth.service';
import { CartService } from '@app/utils/services/cart.service';
import { GlobalLoaderService } from '@app/utils/services/global-loader.service';
import { QuickCodService } from '@app/utils/services/quick-cod.service';

@Component({
  selector: 'cod-and-pay-online',
  templateUrl: './cod-and-pay-online.component.html',
  styleUrls: ['./cod-and-pay-online.component.scss']
})
export class CodAndPayOnlineComponent {

  constructor(
    private quickCodService: QuickCodService,
    private globalLoader: GlobalLoaderService,
    private cartService: CartService,
    private localAuthService: LocalAuthService,
  ) { }


  validateCart() {
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
      isBuyNow: (this.cartService.buyNow != undefined && this.cartService.buyNow == true ) ? true : false,
      postCode: _postCode,
      userId: _userId,
    };
    this.quickCodService.initiateQuickCOD(validateDtoRequest);
  }

}

@NgModule({
  declarations: [CodAndPayOnlineComponent],
  imports: [
    CommonModule,
  ],
  exports:[CodAndPayOnlineComponent]
})
export class CodAndPayOnlineModule {
}
