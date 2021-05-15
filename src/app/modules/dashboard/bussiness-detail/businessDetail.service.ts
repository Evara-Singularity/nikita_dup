import { Injectable } from '@angular/core';
import CONSTANTS from '@app/config/constants';
import { DataService } from '@app/utils/services/data.service';

@Injectable()
export class BusinessDetailService {

    constructor(public dataService: DataService) { }

    getBusinessDetail(data) {
        let url = CONSTANTS.NEW_MOGLIX_API + "/customer/getCustomerBusinessDetails";
        return this.dataService.callRestful("GET", url, { params: data });
    }

    setBusinessDetail(obj) {
        let url = CONSTANTS.NEW_MOGLIX_API + "/customer/addUpdateCustomer";
        return this.dataService.callRestful("POST", url, { body: obj });
    }

    getCityByPinCode(pinCode) {
        return this.dataService.callRestful("GET", CONSTANTS.NEW_MOGLIX_API + "/address/getcitystatebyPincode?pin=" + pinCode);
    }

    getGSTINDetails(gstin) {
        return this.dataService.callRestful("GET", CONSTANTS.NEW_MOGLIX_API + "/address/getTaxpayerByGstin?gstin=" + gstin);
    }
}