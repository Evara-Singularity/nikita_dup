import { Injectable } from '@angular/core';
import CONSTANTS from "src/app/config/constants";
import { DataService } from "src/app/utils/services/data.service";
@Injectable()
export class BusinessService {
  constructor(public dataService: DataService) {}

  getBusinessDetail(data) {
    let url = CONSTANTS.NEW_MOGLIX_API + "/customer/getCustomerBusinessDetails";
    return this.dataService.callRestful("GET", url, { params: data });
  }
}