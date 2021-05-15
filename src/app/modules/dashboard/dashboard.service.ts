import { Injectable } from '@angular/core';
import CONSTANTS from 'src/app/config/constants';
import { DataService } from 'src/app/utils/services/data.service';

@Injectable()
export class DashboardService {

    constructor(public dataService: DataService) { }

    updatePersonalInfo(obj) {
        let url = CONSTANTS.NEW_MOGLIX_API + "/customer/updatecustomer";
        return this.dataService.callRestful("POST", url, { body: obj });
    }

    getBusinessDetail(data) {
        let url = CONSTANTS.NEW_MOGLIX_API + "/customer/getCustomerBusinessDetails";
        return this.dataService.callRestful("GET", url, {params: data});
    }

    updatePassword(obj) {
        let url = CONSTANTS.NEW_MOGLIX_API + "/login/updatepassword";
        return this.dataService.callRestful("POST", url, { body: obj });
    }

    updateCustomer(obj){
        let url=CONSTANTS.NEW_MOGLIX_API+"/customer/updatecustomer";
        return this.dataService.callRestful("POST", url, {body: obj});
    }

    getRfqList(obj){
        let url = CONSTANTS.NEW_MOGLIX_API + "/rfq/listRFQ";
        return this.dataService.callRestful("POST", url, {body:obj});
    }

    getAddressList(obj){
        let url = CONSTANTS.NEW_MOGLIX_API + "/address/getAddressList?customerId=" + obj["userId"] + "invoiceType=tax";
        return this.dataService.callRestful("GET", url, {body:obj});
    }

    deleteAddress(obj){
        let url = CONSTANTS.NEW_MOGLIX_API + "/address/postAddress";
        return this.dataService.callRestful("POST", url, {body:obj});
    }

    getOrders(obj){
        let url = CONSTANTS.NEW_MOGLIX_API + "/checkout/getorderbyuserid?userId=" + obj["userId"] + "&pageNo=0";
        return this.dataService.callRestful("GET", url, {body:obj});
    }

    getOrderDetail(obj){
        let url = CONSTANTS.NEW_MOGLIX_API + "/order/orderDetails?orderid=" + obj["orderId"] + "&customerId=" + obj["userId"];
        return this.dataService.callRestful("GET", url, {body:obj});
    }

    getPersonalInfo(obj){
        let url = CONSTANTS.NEW_MOGLIX_API + "/customer/getcustomer?customerId=" + obj["userId"];
        return this.dataService.callRestful("GET", url, {body:obj});
    }
}