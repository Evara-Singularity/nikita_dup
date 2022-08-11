import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { concatMap, map, mergeMap } from 'rxjs/operators';
import { ValidateDto } from '../models/cart.initial';
import { CartUtils } from './cart-utils';
import { UrlsService } from './urls.service';

@Injectable({
  providedIn: 'root'
})
export class RetryPaymentService
{
  //always keep this independenct service to avoid circular depenency
  constructor(private _urlsService: UrlsService) { }

  getPaymentDetailsByOrderId(orderId)
  {
    return this._urlsService.getRetryPaymentByOrderId(orderId).pipe(
      map((response) =>
      {
        if (response['status']) {
          return { status: response['status'], data: response['data'] }
        }
        return null;
      })
    );
  }

  reHydrateCartSession(shoppingCartDto)
  {
    const cart = shoppingCartDto['cart'];
    const offerId = shoppingCartDto['offersList'] ? shoppingCartDto['offersList']['offerId'] : null;
    const buyNow = cart['buyNow'] || false;
    return this._urlsService.getCartSession(cart['sessionId'], buyNow).pipe(
      concatMap((cartSession) => 
      {
        //TODO:why items list is not coming from sessionId
        cartSession['itemsList'] = shoppingCartDto['itemsList'];
        const newCartSession = this.updateCartSessionWithPromo(cartSession, offerId);
        return newCartSession;
      }),
      concatMap((newCartSession) => { return this.updateCartSessionWithShipping(newCartSession) })
    )
  }

  updateCartSessionWithPromo(cartSession, offerId)
  {
    if (!offerId) {
      return of(CartUtils.generateGenericCartSession(cartSession))
    }
    cartSession['offersList'] = [{ offerId: offerId, type: '15' }];
    const shoppingCartDto = { 'shoppingCartDto': CartUtils.generateGenericCartSession(cartSession) };
    return this._urlsService.validatePromocode(shoppingCartDto).pipe(
      map((response) =>
      {
        if (response['data']) {
          const data = response['data'];
          cartSession['cart']['totalOffer'] = data['discount'] || null;
          cartSession['extraOffer'] = null;
          const productDiscount = data['productDis'];
          const productIds = Object.keys(data['productDis'] ? data['productDis'] : {});
          cartSession['itemsList'].map((item) =>
          {
            item['offer'] = null;
            if (productIds.includes(item['productId'])) {
              item['offer'] = productDiscount[item['productId']];
            }
            return item['offer'];
          });
          return cartSession
        }
        return cartSession
      })
    );
  }

  updateCartSessionWithShipping(cartSession)
  {
    const shipping = CartUtils.getShippingObj(cartSession);
    return this._urlsService.getShippingCharges(shipping).pipe(
      map((response) =>
      {
        if (response['status']) {
          cartSession['cart']['shippingCharges'] = response['data']['totalShippingAmount'];
          if (response['data']['totalShippingAmount'] !== undefined && response['data']['totalShippingAmount'] !== null) {
            let itemsList = cartSession['itemsList'];
            for (let i = 0; i < itemsList.length; i++) {
              cartSession['itemsList'][i]['shippingCharges'] = response['data']['itemShippingAmount'][cartSession['itemsList'][i]['productId']];
            }
          }
        }
        return cartSession;
      })
    );
  }

  reHydrateAddresses(shoppingCartDto)
  {
    const cart = shoppingCartDto['cart'];
    const businessDetails = shoppingCartDto['businessDetails'];
    const invoiceType = businessDetails ? "tax" : "retails"
    return this._urlsService.getAddressListByUserId(cart['userId'], invoiceType).pipe(
      map((response) =>
      {
        const addressList = response['addressList'] || [];
        return this.findPaymentAddresses(addressList, shoppingCartDto);
      }));
  }

  validateCart(cartSession, shippingAddress, billingAddress, invoiceType, isBuyNow)
  {
    const validateDto: ValidateDto = {
      cartSession: cartSession,
      shippingAddress: shippingAddress,
      billingAddress: billingAddress,
      invoiceType: invoiceType,
      isBuyNow: isBuyNow
    }
    const validatedDto = CartUtils.getValidateDto(validateDto);
    return this.validateCartBeforePayment(validatedDto)
  }

  validateCartBeforePayment(validatedDto)
  {
    const userId = validatedDto["shoppingCartDto"]['cart']['userId'];
    return this._urlsService.getBusinessDetail(userId).pipe(
      map((res: any) => res),
      mergeMap((response) =>
      {
        let bd: any = null;
        if (response.status) {
          const data = response['data'];
          bd = {
            company: data["companyName"], gstin: data["gstin"], is_gstin: data["isGstInvoice"],
          };
        }
        validatedDto["shoppingCartDto"]["businessDetails"] = bd;
        return this._urlsService.validateDto(validatedDto);
      })
    );
  }

  findPaymentAddresses(userAddressList: any[], shoppingCartDto)
  {
    let billingAddress = null, shippingAddress = null, invoiceType = "retail";
    if (userAddressList.length === 0) return { shippingAddress, billingAddress, invoiceType };
    const addressList: any[] = (shoppingCartDto['addressList'] as any[]);
    const shippingAddressId = (addressList[0]['type'] === "shipping") ? addressList[0]['addressId'] : addressList[1]['addressId'];
    shippingAddress = userAddressList.find((address) => address['idAddress'] === shippingAddressId);
    if (addressList.length === 2) {
      const billingAddressId = (addressList[0]['type'] === "billing") ? addressList[0]['addressId'] : addressList[1]['addressId'];
      billingAddress = userAddressList.find((address) => address['idAddress'] === billingAddressId);
      invoiceType = "tax";
    }
    return { shippingAddress, billingAddress, invoiceType };
  }
}
