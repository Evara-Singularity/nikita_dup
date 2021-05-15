import { Injectable } from "@angular/core";
import CONSTANTS from "@app/config/constants";
import { DataService } from "@app/utils/services/data.service";

@Injectable()
export class OrderDetailService {
  constructor(public dataService: DataService) {}

  // uploadImage(obj) {
  //   return new Promise((resolve) => {
  //     let xhr: XMLHttpRequest;
  //     const url = CONSTANTS.NEW_MOGLIX_API + "/payment/uploadImageS";
  //     xhr = this.dataService.callRestfulWithFormData("POST", url, obj);
  //     xhr.onreadystatechange = function (request: XMLHttpRequest) {
  //       if (request.status === 200 && request.readyState === 4) {
  //         resolve(request);
  //       }
  //     }.bind(this, xhr);
  //   });
  // }

  // returnItem(obj) {
  //   let url = CONSTANTS.NEW_MOGLIX_API + "/payment/returnRefund";
  //   return this.dataService.callRestful("POST", url, { body: obj });
  // }

  // getTransactionId(obj) {
  //   let url =
  //     CONSTANTS.NEW_MOGLIX_API +
  //     "/payment/getReturnTransactionId?userId=" +
  //     obj.userId;
  //   return this.dataService.callRestful("GET", url);
  // }

  // getOrderDetail(orderId, userId) {
  //   return this.dataService.callRestful(
  //     "GET",
  //     CONSTANTS.NEW_MOGLIX_API + "/order/orderDetails",
  //     { params: { orderid: orderId, customerid: userId } }
  //   );
  // }

  // getCancelReasons() {
  //   let url = CONSTANTS.NEW_MOGLIX_API + "/order/cancelReasons";
  //   return this.dataService.callRestful("GET", url);
  // }

  // cancelOrder(data) {
  //   let url = CONSTANTS.NEW_MOGLIX_API + "/order/cancelOrder";
  //   return this.dataService.callRestful("POST", url, { body: data });
  // }

  // getOrderTracking(orderId) {
  //   let url =
  //     CONSTANTS.NEW_MOGLIX_API + "/order/orderTracking?shipmentId=" + orderId;
  //   return this.dataService.callRestful("GET", url);
  // }

  // groupBy = function (xs, key) {
  //   console.log(xs, key);
  //   return xs.reduce(function (rv, x) {
  //     (rv[x[key]] = rv[x[key]] || []).push(x);
  //     return rv;
  //}, {});


  //};


  uploadImage(obj){
    return new Promise((resolve, reject) => {
        let xhr: XMLHttpRequest;
        const url = CONSTANTS.NEW_MOGLIX_API+'/payment/uploadImageS';
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
    let url = CONSTANTS.NEW_MOGLIX_API+"/payment/returnRefund";
    return this.dataService.callRestful("POST", url, {body:obj});
}

getTransactionId(obj) {
    let url = CONSTANTS.NEW_MOGLIX_API + "/payment/getReturnTransactionId?userId=" + obj.userId;
    return this.dataService.callRestful("GET", url);
}

getOrderbyUserid(user,pageNo){
    return this.dataService.callRestful("GET", CONSTANTS.NEW_MOGLIX_API+"/checkout/getorderbyuserid", { params: {userId:user.userId,pageNo:pageNo}});
}

getOrderDetail(orderId, userId){
    return this.dataService.callRestful("GET", CONSTANTS.NEW_MOGLIX_API+"/order/orderDetails", { params: {orderid : orderId, customerid: userId}});
}

changePassword(obj) {
    let url = CONSTANTS.NEW_MOGLIX_API + "/login/updatepassword";
    return this.dataService.callRestful("POST", url, { body: obj });
}

getBusinessDetail(id) {
    let url = CONSTANTS.NEW_MOGLIX_API + "/businessdetails/getbyid?id="+id;
    return this.dataService.callRestful("GET", url);
}

getCancelReasons(){
    let url = CONSTANTS.NEW_MOGLIX_API + "/order/cancelReasons";
    return this.dataService.callRestful("GET", url)
}


cancelOrder(data){
    let url = CONSTANTS.NEW_MOGLIX_API + "/order/cancelOrder";
    return this.dataService.callRestful("POST", url, { body: data })
}

getOrderTracking(orderId)
{
    let url = CONSTANTS.NEW_MOGLIX_API + '/order/orderTracking?shipmentId=' + orderId;
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