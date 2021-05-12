import { Injectable } from "@angular/core";
import { map } from "rxjs/operators/map";
import CONSTANTS from "src/app/config/constants";
import { DataService } from "src/app/utils/services/data.service";

@Injectable()
export class BusinessPurchaseListService {
  constructor(public dataService: DataService) {}

  getPurchaseList(data) {
    let url = CONSTANTS.NEW_MOGLIX_API + "/purchase/getPurchaseList";
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
    let url = CONSTANTS.NEW_MOGLIX_API + "/purchase/removePurchaseList";
    return this.dataService.callRestful("POST", url, { body: data });
  }

  getReviewsRating(obj) {
    let url = CONSTANTS.NEW_MOGLIX_API + "/reviews/getReviews";
    return this.dataService.callRestful("POST", url, { body: obj });
  }

  addMatCode(obj) {
    let url = CONSTANTS.NEW_MOGLIX_API + "/purchase/addMatCode";
    return this.dataService
      .callRestful("POST", url, { body: obj })
      .pipe(map((res) => res));
  }

  deleteMatCode(obj) {
    let url = CONSTANTS.NEW_MOGLIX_API + "/purchase/deleteMatCode";
    return this.dataService
      .callRestful("POST", url, { body: obj })
      .pipe(map((res) => res));
  }
}