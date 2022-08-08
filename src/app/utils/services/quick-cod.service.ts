import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import CONSTANTS from '@app/config/constants';
import { ENDPOINTS } from '@app/config/endpoints';
import { ToastMessageService } from '@app/modules/toastMessage/toast-message.service';
import { CartService } from '@app/utils/services/cart.service';
import { LocalStorageService } from 'ngx-webstorage';
import { forkJoin, of } from 'rxjs';
import { catchError, concatMap, map } from 'rxjs/operators';
import { InitiateQuickCod, ValidateDto } from './../models/cart.initial';
import { CartUtils } from './cart-utils';
import { DataService } from './data.service';
import { GlobalLoaderService } from './global-loader.service';

@Injectable({ providedIn: 'root' })
export class QuickCodService
{
  codMessages: string[] = [];

  constructor(private _dataService: DataService, private _localStorageService: LocalStorageService, private _loaderService: GlobalLoaderService,
    private _toastService: ToastMessageService, private _router: Router, private _cartService: CartService) { }

  initiateQuickCOD(initiateQuickCod: InitiateQuickCod)
  {
    const validateDtoRequest: ValidateDto = {
      cartSession: initiateQuickCod.cartSession,
      shippingAddress: initiateQuickCod.shippingAddress,
      billingAddress: initiateQuickCod.billingAddress,
      invoiceType: initiateQuickCod.invoiceType,
      isBuyNow: initiateQuickCod.isBuyNow
    }
    const validateDto = CartUtils.getValidateDto(validateDtoRequest);
    this.quickCODPayment(validateDto, initiateQuickCod.postCode, initiateQuickCod.userId)
  }

  quickCODPayment(shoppingCartDto, postCode, userId)
  {
    this.codMessages = [];
    const limitVerification = this.verifyCODLimit(shoppingCartDto['cart']['totalPayableAmount']);
    const serviceability_cod = this.verifyServiceabilityAndCOD(shoppingCartDto['itemsList'], postCode);
    const validateShoppingCart = this._cartService.validateCartBeforePayment({ shoppingCartDto: shoppingCartDto });
    this._loaderService.setLoaderState(true);
    forkJoin([limitVerification, serviceability_cod, validateShoppingCart]).pipe(
      map((results) =>
      {
        const result_cod_limit = results[0];
        const messages = result_cod_limit['messages'];
        const result_serviceable_cod = results[1];
        const result_validate_cart = results[2];
        const isNonServiceable = result_serviceable_cod['isNonServiceable'];
        const isNonCod = result_serviceable_cod['isNonCod'];
        const isShpopingCartInValid = !(result_validate_cart.status && result_validate_cart.statusCode == 200);
        if (isNonServiceable || isNonCod) {
          this.codMessages.push("Items in cart are either not serviceable or not eligible for COD");
          this.codMessages = messages;
        }
        const canProceed = !(isNonServiceable || isNonCod || isShpopingCartInValid);
        return { canProceed: canProceed };
      }),
      concatMap((result) =>
      {
        const id = (result['canProceed'] && userId) ? userId : null;
        return this.getPaymentId(id)
      }),
      concatMap((transactionID) =>
      {
        return this.shoppingCartToPayment(shoppingCartDto, transactionID)
      })
    ).subscribe((result) =>
    {
      this._loaderService.setLoaderState(false);
      if (this.codMessages.length) { this.displayCODMessage(this.codMessages[0]); return; }
      let data = result.data;
      let extras = { queryParams: { mode: 'COD', orderId: data.orderId, transactionAmount: data.orderAmount }, replaceUrl: true };
      this._localStorageService.clear('flashData');
      this._router.navigate(['order-confirmation'], extras);
    })
  }

  verifyCODLimit(totalPayableAmount)
  {
    const result = { status: true }
    const minValue = CONSTANTS.GLOBAL.codMin
    const maxValue = CONSTANTS.GLOBAL.codMax
    if (totalPayableAmount < minValue) {
      result.status = false;
      this.codMessages.push(`COD not applicable on orders below Rs.${minValue}`)
    }
    else if (totalPayableAmount > maxValue) {
      result.status = false;
      this.codMessages.push(`COD not applicable on orders above Rs.${maxValue}`)
    }
    return of(result);
  }

  verifyServiceabilityAndCOD(items: any[], postCode)
  {
    const result = { isNonServiceable: false, isNonCod: false };
    const MSNS = items.map(item => item.productId);
    const URL = `${CONSTANTS.NEW_MOGLIX_API}${ENDPOINTS.VALIDATE_PRODUCT_SER}`;
    return this._dataService.callRestful("POST", URL, { body: { productId: MSNS, toPincode: postCode } }).pipe(
      map((response) =>
      {
        if (response['status']) {
          const aggregates = Object.values(response['data']).map((item) => item['aggregate']);
          for (let aggregate of aggregates) {
            if (!(aggregate.serviceable)) { result.isNonServiceable; }
            if (!(aggregate.codAvailable)) { result.isNonCod; }
          }
        }
        return result
      }),
      catchError((error: HttpErrorResponse) => { return of(result); })
    );
  }

  getPaymentId(userId)
  {
    if (!userId) { return of(null) }
    const url = `${CONSTANTS.NEW_MOGLIX_API}/payment/getPaymentId`;
    return this._dataService.callRestful('GET', url, { params: { userId: userId } }).pipe(
      map((response) =>
      {
        const data = response['data'] || null;
        if (data && data['transactionId']) return data['transactionId'];
        return null;
      }),
      catchError((e) => of(null))
    );
  }

  shoppingCartToPayment(shoppingCartDto, transactionID)
  {
    if (!transactionID) { return of({ status: false }) }
    shoppingCartDto['deliveryMethod'] = { deliveryMethodId: 77, type: "kjhlh", };
    delete shoppingCartDto['noOfItems'];
    delete shoppingCartDto['userInfo'];
    delete shoppingCartDto['description'];
    const cart_keys = ["customeruuid", "totalAmountWithTaxes", "noCostEmiDiscount", "countryCode"];
    const payment_keys = ["id", "cartId", "createdAt", "updatedAt", "emiFlag", "bankName", "bankEmi", "gateway"];
    cart_keys.forEach((key) => delete shoppingCartDto['cart'][key]);
    payment_keys.forEach((key) => delete shoppingCartDto['payment'][key]);
    (shoppingCartDto['addressList'] as any[]).forEach((address) =>
    {
      delete address['id'];
      delete address['cartId'];
      delete address['createdAt'];
      delete address['updatedAt'];
    })
    let request = {
      "mode": "COD",
      "paymentId": 13,
      "platformCode": "online",
      "requestParams": null,
      "transactionId": transactionID,
      "validatorRequest": { shoppingCartDto: shoppingCartDto }
    }
    return this._cartService.pay(request)
  }

  displayCODMessage(message: string)
  {
    this._loaderService.setLoaderState(false);
    this._toastService.show({ type: "error", text: message })
  }
}
