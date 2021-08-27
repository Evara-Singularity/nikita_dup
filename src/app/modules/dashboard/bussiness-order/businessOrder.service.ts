import { Injectable } from "@angular/core";
import CONSTANTS from "@app/config/constants";
import { ENDPOINTS } from '@app/config/endpoints';
import { DataService } from "@app/utils/services/data.service";
import { LocalStorageService } from "ngx-webstorage";

@Injectable()
export class BusinessOrderService {
  constructor(public dataService: DataService, private _localStorageService: LocalStorageService) {}

  getOrderbyUserid(pageNo) {
    const user = this._localStorageService.retrieve("user");
    return this.dataService.callRestful(
      "GET",
      CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.GET_ORDER,
      { params: { userId: user.userId, pageNo: pageNo } }
    );
  }

  getOrderDetail(orderId, userId) {
    const user = this._localStorageService.retrieve("user");
    return this.dataService.callRestful(
      "GET",
      CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.ORD_DET,
      { params: { orderid: orderId, customerid: user.userId } }
    );
  }

  getCancelReasons() {
    let url = CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.CR;
    return this.dataService.callRestful("GET", url);
  }
}