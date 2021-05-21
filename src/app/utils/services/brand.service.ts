import { CONSTANTS } from '@app/config/constants';
import { Injectable } from "@angular/core";
import { DataService } from "@app/utils/services/data.service";
import { ENDPOINTS } from '@app/config/endpoints';

@Injectable()
export class BrandService {

  constructor(private _dataService: DataService) {
  }
  

  getBrandByName(brandName) {
    return this._dataService.callRestful("GET", CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.GET_BRAND_NAME, { params: { name: brandName } })
  }

  getBrand() {
    return this._dataService.callRestful("GET", CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.GET_ALL_BRANDS);
  }

  getBrandLogo() {
    return this._dataService.callRestful("GET", CONSTANTS.NEW_MOGLIX_API + CONSTANTS.GET_PARENT_CAT+'brand-store');
  }

  
}
