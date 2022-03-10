import { ENDPOINTS } from '@app/config/endpoints';
import { DataService } from '@services/data.service';
import { CONSTANTS } from '@app/config/constants';
import { Injectable } from '@angular/core';

@Injectable({ 
    providedIn: 'root'
})
export class PromoCodeService {
    appliedPromoCode  = '';
    constructor(private _dataService: DataService) {}

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
}