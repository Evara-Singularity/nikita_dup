import { CONSTANTS } from '@app/config/constants';
import { Injectable } from "@angular/core";
import { DataService } from "@app/utils/services/data.service";

@Injectable()
export class BrandService {

  constructor(private _dataService: DataService) {
  }
  

  getBrandByName(brandName) {
    return this._dataService.callRestful("GET", CONSTANTS.NEW_MOGLIX_API + '/brand/getBrandByName', { params: { name: brandName } })
  }

  getBrand() {
    return this._dataService.callRestful("GET", CONSTANTS.NEW_MOGLIX_API + '/search/getAllBrands');
  }

  getBrandLogo() {
    return this._dataService.callRestful("GET", CONSTANTS.NEW_MOGLIX_API + '/category/getparentcategoryjsonbody?requestType=brand-store');
  }

  
}
