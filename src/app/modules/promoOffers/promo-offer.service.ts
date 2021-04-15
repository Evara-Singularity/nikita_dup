import { Injectable } from '@angular/core';
import CONSTANTS from '../../config/constants';
import { DataService } from '../../utils/services/data.service';


@Injectable()
export class PromoOfferService {

    constructor(private _ds: DataService) {
    }

    getAllPromoCodes() {
        const url = CONSTANTS.NEW_MOGLIX_API + '/promoCode/getAllActivePromoCodes';
        return this._ds.callRestful('GET', url);
    }

    getAllPromoCodesByUserId(userID) {
        const url = CONSTANTS.NEW_MOGLIX_API + '/promoCode/getAllActivePromoCodes?userId=' + userID;
        return this._ds.callRestful('GET', url);
    }

    getPromoCodeDetailById(offerId) {
        const url = CONSTANTS.NEW_MOGLIX_API + '/promoCode/getPromoCodeDetails?promoId=' + offerId;
        return this._ds.callRestful('GET', url);
    }

    getPromoCodeDetailByName(promoCode) {
        const url = CONSTANTS.NEW_MOGLIX_API + '/promoCode/getPromoCodeDetails?promoCode=' + promoCode;
        return this._ds.callRestful('GET', url);
    }
}

