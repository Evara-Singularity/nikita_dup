import { Injectable } from '@angular/core';
import CONSTANTS from '@app/config/constants';
import { ENDPOINTS } from '@app/config/endpoints';
import { DataService } from '@app/utils/services/data.service';

@Injectable()
export class BusinessDetailService {

    constructor(public dataService: DataService) { }

    getBusinessDetail(data) {
        let url = CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.CBD;
        return this.dataService.callRestful("GET", url, { params: data });
    }

    setBusinessDetail(obj) {
        let url = CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.UPD_CUS;
        return this.dataService.callRestful("POST", url, { body: obj });
    }

    getCityByPinCode(pinCode) {
        return this.dataService.callRestful("GET", CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.CITY_BY_PIN + pinCode);
    }

    getGSTINDetails(gstin) {
        return this.dataService.callRestful("GET", CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.TAXPAYER_BY_TIN + gstin);
    }
}