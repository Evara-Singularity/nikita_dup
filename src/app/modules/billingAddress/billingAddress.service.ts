import { Injectable } from "@angular/core";
import { ENDPOINTS } from '@app/config/endpoints';
import CONSTANTS from "../../config/constants";
import { DataService } from "../../utils/services/data.service";

@Injectable()
export class BillingAddressService {

    constructor(private _dataService: DataService) {

    }

    postAddress(address) {
        return this._dataService.callRestful("POST", CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.POST_ADD, { body: address });
    }
    getCityByPinCode(pinCode) {
        return this._dataService.callRestful("GET", CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.CITY_BY_PIN + pinCode);
    }

    getBusinessDetail(data) {
        let url = CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.CBD;
        return this._dataService.callRestful("GET", url, { params: data });
    }

    getAddreddList(id) {

        let url = CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.GET_ADD_LIST +'?customerId=' + id;
        return this._dataService.callRestful("GET", url);
    }

    setBusinessDetail(obj) {
        let url = CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.UPD_CUS;
        return this._dataService.callRestful("POST", url, { body: obj });
    }

    getGSTINDetails(gstin) {
        return this._dataService.callRestful("GET", CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.TAXPAYER_BY_TIN + gstin);
    }

}