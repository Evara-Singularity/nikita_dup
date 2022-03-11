import { CartService } from '@app/utils/services/cart.service';
import { ENDPOINTS } from '@app/config/endpoints';
import { DataService } from '@services/data.service';
import { CONSTANTS } from '@app/config/constants';
import { Injectable } from '@angular/core';
import { ToastMessageService } from '@app/modules/toastMessage/toast-message.service';
import { CommonService } from '@app/utils/services/common.service';
import { GlobalLoaderService } from '@services/global-loader.service';

@Injectable()
export class PromoCodeService {
    appliedPromoCode  = '';

    constructor(
        private _dataService: DataService, 
        private _tms: ToastMessageService, 
        private _commonService: CommonService,
        private _cartService: CartService,
        private _globalLoaderService: GlobalLoaderService
    ) {}

    getAllPromoCodes() {
        const url = CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.CART.getAllActivePromoCodes;
        return this._dataService.callRestful('GET', url);
    }

    getAllPromoCodesByUserId(userID) {
        const url = CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.CART.getAllActivePromoCodes +'?userId=' + userID;
        return this._dataService.callRestful('GET', url);
    }

    getPromoCodeDetailById(offerId) {
        const url = CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.CART.getPromoCodeDetails +'?promoId=' + offerId;
        return this._dataService.callRestful('GET', url);
    }

    applyPromoCode(obj) {
        const url = CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.CART.validatePromoCode;
        return this._dataService.callRestful('POST', url, { body: obj });
    }

    getPromoCodeDetailByName(promoCode) {
        const url = CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.CART.getPromoCodeDetails + '?promoCode=' + promoCode;
        return this._dataService.callRestful('GET', url);
    }

    genericApplyPromoCode() {
        this._globalLoaderService.setLoaderState(true);
        if (this._commonService.userSession.authenticated !== 'true') {
            this._tms.show({ type: 'error', text: "To Avail Offer Please Login" });
        } else {
            this.getPromoCodeDetailByName(this.appliedPromoCode).subscribe(({status, data, statusDescription: message}: any) => {
                if (status) {
                    let obj = [{
                        offerId: data['promoAttributes']['promoId'],
                        type: '15'
                    }];
                    const cartSession = this._cartService.getCartSession();
                    cartSession['offersList'] = obj;
                    const cartObject = {
                        'shoppingCartDto': cartSession
                    };
                    this.applyPromoCode(cartObject).subscribe(({status, data, statusDescription: message}:any) => {
                        this._globalLoaderService.setLoaderState(false);
                        if(status) {
                            if (data['discount'] <= cartSession['cart']['totalAmount']) {
                                //  ;
                                // this.iData.isApplied = true;
                                // this.iData.text =
                                // pcd : promo code detail
                                // this.outData$.emit({
                                //     pcd: {
                                //         text: this.promoCodeGroup.controls['promoCode'].value,
                                //         // type: this.iData.type,
                                //         isApplied: true
                                //     }
                                // });
                                // cartSession['cart']['totalOffer'] = resp['data']['discount'];
                                // cartSession['extraOffer'] = null;
                                // const productDiscount = resp['data']['productDis'];
                                // const productIds = Object.keys(resp['data']['productDis'] ? resp['data']['productDis'] : {});
                                // const itemsList: Array<{}> = cartSession['itemsList'];

                                // itemsList.map((item) => {
                                //     if (productIds.indexOf(item['productId']) !== -1) {
                                //         return item['offer'] = productDiscount[item['productId']];
                                //     } else {
                                //         return item['offer'] = null;
                                //     }
                                // });

                                // this.itemsList = itemsList;
                                // cartSession['itemsList'] = itemsList;

                                // this._cs.updateCartSession(cartSession).pipe(
                                //     mergeMap(cartSession => {
                                //         return this._cs.getShippingAndUpdateCartSession(cartSession)
                                //     })
                                // ).subscribe(
                                //     data => {
                                //         this.updateCartSession$.next({ cartSession: data });
                                //         // this.cartSession = data;
                                //         this._cs.setCartSession(data);
                                //         this.appliedPromoCode.promoCode = this.promoCodeResponse.data.promoAttributes.promoCode;
                                //         this.appliedPromoCode.promoDescription = this.promoCodeResponse.data.promoAttributes.promoDescription;
                                //         this._cs.validateCartSession.next(data);
                                //         this._cs.prepaidDiscountSubject.next();
                                //         this.isShowLoader = false;
                                //         setTimeout(() => {
                                //             this._tms.show({ type: 'success', text: 'Promo Code Applied' });
                                //         }, 500);
                                //     }
                                // );
                                
                            } 
                            // else {

                            //     cartSession['cart']['totalOffer'] = 0;
                            //     cartSession['offersList'] = [];

                            //     const itemLists: Array<{}> = cartSession['itemsList'];
                            //     itemLists.map((item) => item['offer'] = null);
                            //     this.itemsList = itemLists;
                            //     cartSession['itemsList'] = itemLists;


                            //     this.appliedPromoCode.promoCode = null;
                            //     this.appliedPromoCode.promoDescription = null;
                            //     this._cs.updateCartSession(cartSession).pipe(
                            //         mergeMap(cartSession => {
                            //             return this._cs.getShippingAndUpdateCartSession(cartSession)
                            //         })
                            //     ).subscribe(
                            //         data => {
                            //             this.updateCartSession$.next({ cartSession: data });
                            //             this.cartSession = data;
                            //             this._cs.setCartSession(data);
                            //             this._cs.validateCartSession.next(this.cartSession);
                            //             this._cs.prepaidDiscountSubject.next();
                            //             this.isShowLoader = false;
                            //             setTimeout(() => {
                            //                 this._tms.show({ type: 'error', text: 'Your cart amount is less than ' + resp['data']['discount'] });
                            //             }, 500);
                            //         }
                            //     );

                            // }
                        } else {
                            this._tms.show({ type: 'error', text: message });
                        }
                    });
                } else {
                    this._globalLoaderService.setLoaderState(false);
                    this._tms.show({ type: 'error', text: message });
                }
            });
        }
    }
}