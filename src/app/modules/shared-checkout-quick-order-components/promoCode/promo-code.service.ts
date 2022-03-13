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
                    const cartSession = this._cartService.getGenericCartSession;
                    cartSession['offersList'] = obj;
                    const cartObject = {
                        'shoppingCartDto': cartSession
                    };
                    this.applyPromoCode(cartObject).subscribe(({status, data, statusDescription: message}:any) => {
                        this._globalLoaderService.setLoaderState(false);
                        if(status) {
                            console.log(data);
                            if (data['discount'] <= cartSession['cart']['totalAmount']) {
                                cartSession['cart']['totalOffer'] = data['discount'];
                                cartSession['extraOffer'] = null;
                                const productDiscount = data['productDis'];
                                const productIds = Object.keys(data['productDis'] ? data['productDis'] : {});

                                cartSession.itemsList.map((item) => {
                                    if (productIds.indexOf(item['productId']) !== -1) {
                                        return item['offer'] = productDiscount[item['productId']];
                                    } else {
                                        return item['offer'] = null;
                                    }
                                });

                                this._cartService.getShippingAndUpdateCartSession(cartSession).subscribe(
                                    data => {
                                        this._cartService.setGenericCartSession(data);
                                        this._globalLoaderService.setLoaderState(false);
                                        this._tms.show({ type: 'success', text: 'Promo Code Applied' });
                                    }
                                );
                                
                            } else {
                                cartSession['cart']['totalOffer'] = 0;
                                cartSession['offersList'] = [];
                                cartSession.itemLists.map((item) => item['offer'] = null);
                                this._cartService.getShippingAndUpdateCartSession(cartSession).subscribe(
                                    data => {
                                        this._cartService.setGenericCartSession(data);
                                        this._globalLoaderService.setLoaderState(false);
                                        this._tms.show({ type: 'error', text: 'Your cart amount is less than ' + data['discount'] });
                                    }
                                );
                            }
                        } else {
                            this.appliedPromoCode = '';
                            this._tms.show({ type: 'error', text: message });
                        }
                    });
                } else {
                    this.appliedPromoCode = '';
                    this._globalLoaderService.setLoaderState(false);
                    this._tms.show({ type: 'error', text: message });
                }
            });
        }
    }

    genericRemovePromoCode() {
        this._globalLoaderService.setLoaderState(true);
        let cartSession = this._cartService.getGenericCartSession;
        cartSession['offersList'] = [];
        cartSession['extraOffer'] = null;
        cartSession['cart']['totalOffer'] = 0;

        cartSession.itemsList.map((element) => {
            element['offer'] = null;
        });

        this._cartService.getShippingAndUpdateCartSession(cartSession).subscribe(
            data => {
                this.appliedPromoCode = '';
                this._cartService.setGenericCartSession(data);
                this._globalLoaderService.setLoaderState(false);
                this._tms.show({ type: 'success', text: "Promo Code Removed" });
            }
        );
    }
}