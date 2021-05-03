import { Injectable } from "@angular/core";
import CONSTANTS from "src/app/config/constants";
import { DataService } from "src/app/utils/services/data.service";


@Injectable()
export class BrandService {

  constructor(private _dataService: DataService) { }
  getBrand() {
    return this._dataService.callRestful("GET", CONSTANTS.NEW_MOGLIX_API + '/search/getAllBrands');
  }
  getBrandLogo() {
    return this._dataService.callRestful("GET", CONSTANTS.NEW_MOGLIX_API + '/category/getparentcategoryjsonbody?requestType=brand-store');
  }
}
