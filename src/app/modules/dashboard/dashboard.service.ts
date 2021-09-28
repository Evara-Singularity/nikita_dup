import { Injectable } from '@angular/core';
import CONSTANTS from '@app/config/constants';
import { ENDPOINTS } from '@app/config/endpoints';
import { DataService } from '@app/utils/services/data.service';
import { LocalStorageService } from 'ngx-webstorage';

@Injectable()
export class DashboardService {

    constructor(public dataService: DataService,  private _localStorageService: LocalStorageService) { }

    updatePersonalInfo(obj) {
        let url = CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.UC;
        return this.dataService.callRestful("POST", url, { body: obj });
    }

    getBusinessDetail(data) {
        let url = CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.CBD;
        return this.dataService.callRestful("GET", url, {params: data});
    }

    updatePassword(obj) {
        let url = CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.UPD_PASS;
        return this.dataService.callRestful("POST", url, { body: obj });
    }

    updateCustomer(obj){
        let url=CONSTANTS.NEW_MOGLIX_API+ ENDPOINTS.UC;
        return this.dataService.callRestful("POST", url, {body: obj});
    }

    getRfqList(obj){
        
        let url = CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.RFQ_LIST;
        return this.dataService.callRestful("POST", url, {body:obj});
    }

    getAddressList(obj){
        let url = CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.GET_ADD_LIST + '?customerId=' + obj["userId"] + "invoiceType=tax";
        return this.dataService.callRestful("GET", url, {body:obj});
    }

    deleteAddress(obj){
        //obj['onlineab'] = "y";
        let url = CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.POST_ADD + '?onlineab=y';
        return this.dataService.callRestful("POST", url, {body:obj});
    }

    getOrders(obj){
        const user = this._localStorageService.retrieve("user");
        let url = CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.GET_ODR + user["userId"] + "&pageNo=0";
        return this.dataService.callRestful("GET", url, {body:obj});
    }

    getOrderDetail(obj){
        const user = this._localStorageService.retrieve("user");
        let url = CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.ORD_DET + "?orderid=" + obj["orderId"] + "&customerId=" + user["userId"];
        return this.dataService.callRestful("GET", url, {body:obj});
    }

    getPersonalInfo(obj){
        let url = CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.GET_CUS + obj["userId"];
        return this.dataService.callRestful("GET", url, {body:obj});
    }
}