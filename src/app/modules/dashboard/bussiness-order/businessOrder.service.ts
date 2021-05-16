import { Injectable } from "@angular/core";
import CONSTANTS from "@app/config/constants";
import { DataService } from "@app/utils/services/data.service";

@Injectable()
export class BusinessOrderService {
  constructor(public dataService: DataService) {}

  getOrderbyUserid(user, pageNo) {
    return this.dataService.callRestful(
      "GET",
      CONSTANTS.NEW_MOGLIX_API + "/checkout/getorderbyuserid",
      { params: { userId: user.userId, pageNo: pageNo } }
    );
  }

  getOrderDetail(orderId, userId) {
    return this.dataService.callRestful(
      "GET",
      CONSTANTS.NEW_MOGLIX_API + "/order/orderDetails",
      { params: { orderid: orderId, customerid: userId } }
    );
  }

  getCancelReasons() {
    let url = CONSTANTS.NEW_MOGLIX_API + "/order/cancelReasons";
    return this.dataService.callRestful("GET", url);
  }
}