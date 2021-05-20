import { Injectable } from "@angular/core";
import CONSTANTS from "@app/config/constants";
import { ENDPOINTS } from '@app/config/endpoints';
import { DataService } from "@app/utils/services/data.service";

@Injectable()
export class OrderDetailService {
  constructor(public dataService: DataService) {}

  uploadImage(obj){
    return new Promise((resolve, reject) => {
        let xhr: XMLHttpRequest;
        const url = CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.UPL_IMG;
        // let headerData = {'contentType': "false", 'processData': 'false'};
        xhr =  this.dataService.callRestfulWithFormData('POST', url, obj);
        xhr.onreadystatechange = (function (request: XMLHttpRequest, event: Event) {
            if (request.status === 200 && request.readyState === 4) {
                //console.log(request);
                // window.location.href = request.responseURL;
                resolve(request);
            }
        }).bind(this, xhr);
    });
}

returnItem(obj)
{
    let url = CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.RET_REFUND
    return this.dataService.callRestful("POST", url, {body:obj});
}

getTransactionId(obj) {
    let url = CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.RET_TRANSAC + obj.userId;
    return this.dataService.callRestful("GET", url);
}

getOrderbyUserid(user,pageNo){
    return this.dataService.callRestful("GET", CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.GET_ORDER, { params: {userId:user.userId,pageNo:pageNo}});
}

getOrderDetail(orderId, userId){
    return this.dataService.callRestful("GET", CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.ORD_DET, { params: {orderid : orderId, customerid: userId}});
}

changePassword(obj) {
    let url = CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.UPD_PASS;
    return this.dataService.callRestful("POST", url, { body: obj });
}

getBusinessDetail(id) {
    let url = CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.BD+id;
    return this.dataService.callRestful("GET", url);
}

getCancelReasons(){
    let url = CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.CR;
    return this.dataService.callRestful("GET", url)
}


cancelOrder(data){
    let url = CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.CANCEL_ODR;
    return this.dataService.callRestful("POST", url, { body: data })
}

getOrderTracking(orderId)
{
    let url = CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.ODR_TRACK + orderId;
    return this.dataService.callRestful("GET", url)
}

groupBy = function (xs, key)
{ 
    console.log(xs,key);
    return xs.reduce(function (rv, x)
    {
        
            (rv[x[key]] = rv[x[key]] || []).push(x);
            return rv;
        
    }, {});
};

}