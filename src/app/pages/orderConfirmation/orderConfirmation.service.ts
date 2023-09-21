import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DataService } from '@app/utils/services/data.service';
import CONSTANTS from '@app/config/constants';
import { CommonService } from '@app/utils/services/common.service';
import { ENDPOINTS } from '@app/config/endpoints';
import { filter, map, pluck } from 'rxjs/operators';


@Injectable()
export class OrderConfirmationService
{

    isServer: boolean;
    isBrowser: boolean;

    constructor(private _dataService: DataService, public _commonService: CommonService)
    {
        this.isServer = _commonService.isServer;
        this.isBrowser = _commonService.isBrowser;
    }

    addAffiliateOrder(data)
    {
        let url = CONSTANTS.NEW_MOGLIX_API + "/checkout/createAffiliateOrder";
        return this._dataService.callRestful("POST", url, { body: data });
    }

    sendTrackerOrderConfirmationCall(data): Observable<any>
    {
        let url = CONSTANTS.NEW_MOGLIX_API + "/clickStream/setOrderStreamData";
        return this._dataService.callRestful("POST", url, { body: data });
    }

    cs(s, ce)
    {// s: src, ce: createElement, at: appendTo
        if (this.isServer) {
            return;
        }
        const cec = document.createElement(ce);
        cec.setAttribute('type', 'text/javascript');
        cec.setAttribute('src', s);
        document.body.appendChild(cec);
    }
    cns(e)
    {
        if (this.isServer) {
            return;
        }
        const ce = document.createElement('noscript');
        const i = document.createElement(e.ce);
        i.setAttribute('src', e.src);
        ce.appendChild(i);
        document.body.appendChild(ce);
    }

    getOrderbyUserid(userId, pageNo, orderId)
    {
        const params = { params: { userId: userId, pageNo: pageNo } }
        const URL = `${CONSTANTS.NEW_MOGLIX_API}${ENDPOINTS.GET_ORDER}`;
        return this._dataService.callRestful("GET", URL, params).pipe(map((response)=>{
            const orders = response['data'] ? (response['data'] as any[]) : [];
            if(orders.length){
                const order = orders.filter((order) => { return order.orderId == orderId})[0];
                return order || null;
            }
            return null;
        }));
    }

    checkCookie(name) {
        // Split all cookies into an array
        const cookies = document.cookie.split(';');
        // Iterate through the array of cookies
        for (let i = 0; i < cookies.length; i++) {
          const cookie = cookies[i].trim();
          // Check if this cookie starts with the desired name
          if (cookie.indexOf(name + '=') === 0) {
            // Cookie with the specified name found
            return true;
          }
        }
        // Cookie with the specified name not found
        return false;
      }      
}