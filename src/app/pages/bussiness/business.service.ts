import { Injectable } from '@angular/core';
import CONSTANTS from "@app/config/constants";
import { ENDPOINTS } from '@app/config/endpoints';
import { DataService } from "@app/utils/services/data.service";
@Injectable()
export class BusinessService {
  constructor(public dataService: DataService) {}

  getBusinessDetail(data) {
    let url = CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.CBD;
    return this.dataService.callRestful("GET", url, { params: data });
  }
}