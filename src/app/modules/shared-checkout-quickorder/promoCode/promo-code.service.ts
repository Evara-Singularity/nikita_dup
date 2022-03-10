import { CartService } from '@app/utils/services/cart.service';
import { ENDPOINTS } from '@app/config/endpoints';
import { DataService } from '@services/data.service';
import { CONSTANTS } from '@app/config/constants';
import { Injectable } from '@angular/core';
import { ToastMessageService } from '@app/modules/toastMessage/toast-message.service';
import { CommonService } from '@app/utils/services/common.service';
import { GlobalLoaderService } from '@services/global-loader.service';

@Injectable({ 
    providedIn: 'root'
})
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
            this.getPromoCodeDetailByName(this.appliedPromoCode).subscribe(res => {
                console.log(res);
                if (res['status']) {
                    let obj = [{
                        offerId: res['data']['promoAttributes']['promoId'],
                        type: '15'
                    }];
                    const cartSession = this._cartService.getCartSession();
                    cartSession['offersList'] = obj;
                    const reqobj = {
                        'shoppingCartDto': cartSession
                    };
                    this.applyPromoCode(reqobj).subscribe(res => {
                        this._globalLoaderService.setLoaderState(false);
                        console.log(res);
                    });
                } else {
                    this._globalLoaderService.setLoaderState(false);
                    this._tms.show({ type: 'error', text: res['statusDescription'] });
                }
            });
        }
    }
}