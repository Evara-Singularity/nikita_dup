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
import { LocalAuthService } from './auth.service';
import { CartUtils } from './cart-utils';
import { CommonService } from './common.service';
import { DataService } from './data.service';
import { GlobalLoaderService } from './global-loader.service';
import { UrlsService } from './urls.service';

@Injectable({ providedIn: 'any' })
export class QuickCodService
{
  codMessages: string[] = [];
  initiateQuickCod: InitiateQuickCod = null;
  isBrowser:boolean

  constructor(private _localStorageService: LocalStorageService, private _loaderService: GlobalLoaderService,
    private _toastService: ToastMessageService, private _router: Router, private _cartService: CartService, private _urlsService: UrlsService, public _dataService: DataService, private _commonService:CommonService, private _localAuthService:LocalAuthService) { 
      this.isBrowser = _commonService.isBrowser;
    }

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
    this.quickCODPayment(validateDto['shoppingCartDto'], initiateQuickCod.userId);
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
        const isShpopingCartInValid = (result_validate_cart.status == true && result_validate_cart.statusCode == 200);
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
      if ((!result && !result.status) || this.codMessages.length) {
        let extras = { queryParams: { orderId: result.data.orderId }, replaceUrl: true };
        this.displayCODMessage(this.codMessages[0]);
        this._router.navigate(['checkout/address'], extras); 
        return;
      }
      let data = result.data;
      let extras = { queryParams: { mode: 'COD', orderId: data.orderId, transactionAmount: data.orderAmount }, replaceUrl: true };
      this._localStorageService.store('flashData', { buyNow: true });
      this.analyticPlaceOrder();
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
    const billingAddress = this.initiateQuickCod.billingAddress || null;
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
    const serviceability_cod = this.verifyServiceabilityAndCOD(itemsList, postCode);
    return forkJoin([limitVerification, serviceability_cod]).pipe(
      map((results) =>
      {
        const result_cod_limit = results[0];
        const result_serviceable_cod = results[1];
        return { ...result_cod_limit, ...result_serviceable_cod };
      }))
  }

  verifyServiceabilityAndCOD(items: any[], postCode)
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

  analyticPlaceOrder(){
    const userSession = this.isBrowser ? this._localAuthService.getUserSession() : null;
    const cartData = this._cartService.getGenericCartSession;

    if (cartData['itemsList'] !== null && cartData['itemsList']) {
      var totQuantity = 0;
      var trackData = {
        event_type: "page_load",
        page_type: this._router.url == "/quickCod" ? "Pdp" : "Checkout",
        label: "checkout_started",
        channel: this._router.url == "/quickCod" ? "pdp" : "Checkout",
        price: cartData["cart"]["totalPayableAmount"] ? cartData["cart"]["totalPayableAmount"].toString() : '0',
        quantity: cartData["itemsList"].map(item => {
          return totQuantity = totQuantity + item.productQuantity;
        })[cartData["itemsList"].length - 1],
        shipping: parseFloat(cartData["shippingCharges"]),
        itemList: cartData.itemsList.map(item => {
          return {
            category_l1: item["taxonomyCode"] ? item["taxonomyCode"].split("/")[0] : null,
            category_l2: item["taxonomyCode"] ? item["taxonomyCode"].split("/")[1] : null,
            category_l3: item["taxonomyCode"] ? item["taxonomyCode"].split("/")[2] : null,
            price: item["totalPayableAmount"].toString(),
            quantity: item["productQuantity"]
          }
        })
      }

      this._dataService.sendMessage(trackData);
  }
 }
}
