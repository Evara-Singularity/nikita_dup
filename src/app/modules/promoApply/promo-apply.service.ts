import { Injectable } from '@angular/core';
import CONSTANTS from '../../config/constants';
import { ENDPOINTS } from '../../config/endpoints';
import { DataService } from '../../utils/services/data.service';

@Injectable()
export class PromoApplyService {

    constructor(private _ds: DataService) {
    }

    applyPromoCode(obj) {
        const url = CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.CART.validatePromoCode;
        return this._ds.callRestful('POST', url, { body: obj });
    }

    getPromoCodeDetailByName(promoCode) {
        const url = CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.CART.getPromoCodeDetails + '?promoCode=' + promoCode;
        return this._ds.callRestful('GET', url);
    }
}
