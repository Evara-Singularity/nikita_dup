import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DataService } from '@app/utils/services/data.service';
import CONSTANTS from '@app/config/constants';
import { CommonService } from '@app/utils/services/common.service';


@Injectable()
export class OrderConfirmationService {

    isServer: boolean;
    isBrowser: boolean;

    constructor(private _dataService: DataService, public _commonService: CommonService) {
        this.isServer = _commonService.isServer;
        this.isBrowser = _commonService.isBrowser;
    }

    addAffiliateOrder(data) {
        let url = CONSTANTS.NEW_MOGLIX_API + "/checkout/createAffiliateOrder";
        return this._dataService.callRestful("POST", url, { body: data });
    }

    sendTrackerOrderConfirmationCall(data): Observable<any> {
        let url = CONSTANTS.NEW_MOGLIX_API + "/clickStream/setOrderStreamData";
        return this._dataService.callRestful("POST", url, { body: data });
    }

    cs(s, ce) {// s: src, ce: createElement, at: appendTo
        if (this.isServer) {
            return;
        }
        const cec = document.createElement(ce);
        cec.setAttribute('type', 'text/javascript');
        cec.setAttribute('src', s);
        document.body.appendChild(cec);
    }
    cns(e) {
        if (this.isServer) {
            return;
        }
        const ce = document.createElement('noscript');
        const i = document.createElement(e.ce);
        i.setAttribute('src', e.src);
        ce.appendChild(i);
        document.body.appendChild(ce);
    }

}