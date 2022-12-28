import { Injectable } from "@angular/core";
import CONSTANTS from "@app/config/constants";
import { ENDPOINTS } from "@app/config/endpoints";
import { DataService } from "@app/utils/services/data.service";

@Injectable()
export class RfqSupplierService {

    constructor(
        private _dataService: DataService
    ) { }

    getRfqList(body) {
        const url = CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.SUPPLIER_RFQ_LIST
        {
            return this._dataService.callRestful("POST", url, { body: body }
            );
        }
    }

    getCategories() {
        const url = CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.SUPPLIER_RFQ_CATEGORY;
        {
            return this._dataService.callRestful("GET", url);
        }

    }

    numericdashboard() {
        const url = CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.SUPPLIER_RFQ_REPORT;
        {
            return this._dataService.callRestful("GET", url);
        }
    }

    captureInterestApi(body) {
        const url = CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.SUPPLIER_RFQ_SAVE;
        {
            return this._dataService.callRestful("POST", url, { body });
        }
    }

}

