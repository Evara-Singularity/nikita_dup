import { Injectable } from "@angular/core";
import { map } from "rxjs/operators/map";
import CONSTANTS from "@app/config/constants";
import { DataService } from "@app/utils/services/data.service";
import { ENDPOINTS } from '@app/config/endpoints';

@Injectable()
export class BusinessPurchaseListService {
  constructor(public dataService: DataService) {}

  getPurchaseList(data) {
    let url = CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.PRC_LIST;
    return this.dataService.callRestful("GET", url, { params: data }).pipe(
      map((res) => {
        if (res["status"] && res["statusCode"] == 200) {
          return res["data"];
        } else {
          return [];
        }
      })
    );
  }

  removePurchaseList(data) {
    let url = CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.RM_PCR_LIST;
    return this.dataService.callRestful("POST", url, { body: data });
  }
}