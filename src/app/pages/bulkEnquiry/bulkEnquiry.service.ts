import { Injectable } from '@angular/core';
import CONSTANTS from '@app/config/constants';
import { DataService } from '@app/utils/services/data.service';

@Injectable()
export class BulkEnquiryService {

    constructor(public dataService: DataService) { }

    postBulkEnquiry(obj) {
        let url = CONSTANTS.NEW_MOGLIX_API + "/rfq/createRfq";
        return this.dataService.callRestful("POST", url, { body: obj })
    }

    getCustomerBusinessDetail(data) {
        let url = CONSTANTS.NEW_MOGLIX_API + "/customer/getCustomerBusinessDetails";
        return this.dataService.callRestful("GET", url, { params: data });
    }
}