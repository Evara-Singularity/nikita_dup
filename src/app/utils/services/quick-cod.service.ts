import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import CONSTANTS from '@app/config/constants';
import { ToastMessageService } from '@app/modules/toastMessage/toast-message.service';
import { CartService } from '@app/utils/services/cart.service';
import { LocalStorageService } from 'ngx-webstorage';
import { forkJoin, of } from 'rxjs';
import { concatMap, map } from 'rxjs/operators';
import { InitiateQuickCod, ValidateDto } from './../models/cart.initial';
import { CartUtils } from './cart-utils';
import { GlobalLoaderService } from './global-loader.service';
import { UrlsService } from './urls.service';

@Injectable({ providedIn: 'any' })
export class QuickCodService
{
  codMessages: string[] = [];
  initiateQuickCod: InitiateQuickCod = null;

  constructor(private _localStorageService: LocalStorageService, private _loaderService: GlobalLoaderService,
    private _toastService: ToastMessageService, private _router: Router, private _cartService: CartService, private _urlsService: UrlsService) { }

  initiateQuickCOD(initiateQuickCod: InitiateQuickCod)
  {
    this.initiateQuickCod = initiateQuickCod;
    const validateDtoRequest: ValidateDto = {
      cartSession: initiateQuickCod.cartSession,
      shippingAddress: initiateQuickCod.shippingAddress,
      billingAddress: initiateQuickCod.billingAddress,
      invoiceType: initiateQuickCod.invoiceType,
      isBuyNow: initiateQuickCod.isBuyNow
    }
    const validateDto = CartUtils.getValidateDto(validateDtoRequest);
    this.quickCODPayment(validateDto['shoppingCartDto'], initiateQuickCod.postCode, initiateQuickCod.userId)
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
        return this.payAsCod(transactionID);
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
    const msns = items.map(item => item.productId);
    return this._urlsService.getServiceability(msns, postCode).pipe(
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
      })
    );
  }

  getPaymentId(userId)
  {
    return this._urlsService.getTransactionId(userId).pipe(
      map((response) =>
      {
        const data = response['data'] || null;
        if (data && data['transactionId']) return data['transactionId'];
        return null;
      })
    );
  }

  payAsCod(transactionId)
  {
    const invoiceType = this.initiateQuickCod.invoiceType;
    const cartSession = this.initiateQuickCod.cartSession;
    const shippingAddress = this.initiateQuickCod.shippingAddress;
    const billingAddress = this.initiateQuickCod.billingAddress;
    const userId = this.initiateQuickCod.userId;
    let extra = { 'mode': 'COD', 'paymentId': 13, addressList: shippingAddress };
    let request = {
      'transactionId': transactionId,
      'platformCode': 'online',
      'mode': extra.mode,
      'paymentId': extra.paymentId,
      'requestParams': null,
      'validatorRequest': CartUtils.getPayableRequest(cartSession, billingAddress, userId, invoiceType, extra)
    };
    if (invoiceType === 'tax') {
      request['paymentGateway'] = 'razorpay'
    }
    return this._cartService.pay(request)
  }

  displayCODMessage(message: string)
  {
    this._loaderService.setLoaderState(false);
    this._toastService.show({ type: "error", text: message })
  }
}
