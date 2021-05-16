import { Injectable } from "@angular/core";
import CONSTANTS from "../../config/constants";
import { DataService } from "../../utils/services/data.service";

@Injectable()
export class ShippingAddressService {

    constructor(private _dataService: DataService) {

    }

    postAddress(address) {
        return this._dataService.callRestful("POST", CONSTANTS.NEW_MOGLIX_API + "/address/postAddress", { body: address });
    }
    
    getCityByPinCode(pinCode) {
        return this._dataService.callRestful("GET", CONSTANTS.NEW_MOGLIX_API + "/address/getcitystatebyPincode?pin=" + pinCode);
    }

    getBusinessDetail(data) {
        let url = CONSTANTS.NEW_MOGLIX_API + "/customer/getCustomerBusinessDetails";
        return this._dataService.callRestful("GET", url, {params: data});
    }

    getAddreddList(id){
        let url = CONSTANTS.NEW_MOGLIX_API + "/address/getAddressList?customerId="+id;
        return this._dataService.callRestful("GET", url);
    }
}