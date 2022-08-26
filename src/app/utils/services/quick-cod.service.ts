import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import CONSTANTS from '@app/config/constants';
import { ToastMessageService } from '@app/modules/toastMessage/toast-message.service';
import { CartService } from '@app/utils/services/cart.service';
import { LocalStorageService } from 'ngx-webstorage';
import { forkJoin, Observable, of } from 'rxjs';
import { concatMap, map } from 'rxjs/operators';
import { NonServiceableAndCod } from '../models/address.modal';
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
    this.quickCODPayment(validateDto['shoppingCartDto'], this.initiateQuickCod.userId)
  }

  quickCODPayment(shoppingCartDto, userId)
  {
    this.codMessages = [];
    const validateShoppingCart = this._cartService.validateCartBeforePayment({ shoppingCartDto: shoppingCartDto });
    this._loaderService.setLoaderState(true);
    validateShoppingCart.pipe(
      map((result) =>
      {
        const result_validate_cart = result;
        const isShpopingCartInValid = !(result_validate_cart.status == true && result_validate_cart.statusCode == 200);
        return { canProceed: (isShpopingCartInValid) };
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
      if(!result && !result.status){
        this.displayCODMessage(this.codMessages[0]); 
        this._router.navigate(['checkout/address']);
        return;
      }
      if (this.codMessages.length) {
        this.displayCODMessage(this.codMessages[0]); 
        this._router.navigate(['checkout/address']);
        return;
        }
      let data = result;
      let extras = { queryParams: { mode: 'COD', orderId: data.orderId, transactionAmount: data.orderAmount }, replaceUrl: true };
      this._localStorageService.clear('flashData');
      this._router.navigate(['order-confirmation'], extras);
    })
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
    const billingAddress = this.initiateQuickCod.billingAddress ?? null;
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

  
  //New version of implementation
  checkForCODEligibility(totalPayableAmount, itemsList, postCode): Observable<any>
  {
    const limitVerification = this.checkCODLimit(totalPayableAmount);
    const serviceability_cod = this.verifyServiceabilityAndCOD_v1(itemsList, postCode);
    return forkJoin([limitVerification, serviceability_cod]).pipe(
      map((results) =>
      {
        const result_cod_limit = results[0];
        const result_serviceable_cod = results[1];
        return { ...result_cod_limit, ...result_serviceable_cod };
      }))
  }

  verifyServiceabilityAndCOD_v1(items: any[], postCode)
  {
    const result: NonServiceableAndCod = { nonServiceables: [], nonCods: [] };
    const msns = items.map(item => item.productId);
    return this._urlsService.getServiceability(msns, postCode).pipe(
      map((response) =>
      {
        if (response['status']) {
          const aggregates = Object.values(response['data']).map((item) => item['aggregate']);
          for (let aggregate of aggregates) {
            const productId = aggregate.productId;
            if (!(aggregate.serviceable)) { result.nonServiceables.push(productId); }
            if (!(aggregate.codAvailable)) { result.nonCods.push(productId) }
          }
        }
        return result
      })
    );
  }

  checkCODLimit(totalPayableAmount)
  {
    const result = { iswithInCODLimit: true, message: null }
    const minValue = CONSTANTS.GLOBAL.codMin
    const maxValue = CONSTANTS.GLOBAL.codMax
    if (totalPayableAmount < minValue) {
      result.iswithInCODLimit = false;
      result.message = `COD not applicable on orders below Rs.${minValue}`;
    }
    else if (totalPayableAmount > maxValue) {
      result.iswithInCODLimit = false;
      result.message = `COD not applicable on orders above Rs.${maxValue}`;
    }
    return of(result);
  }

  displayCODMessage(message: string)
  {
    this._loaderService.setLoaderState(false);
    this._toastService.show({ type: "error", text: message })
  }
}
