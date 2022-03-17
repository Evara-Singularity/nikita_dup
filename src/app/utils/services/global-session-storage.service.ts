import { Injectable } from '@angular/core';
import { SessionStorageService } from 'ngx-webstorage';

@Injectable({
    providedIn: 'root'
})
export class GlobalSessionStorageService
{
    readonly PAYMENT_MSNS = "paymentMSNS";

    constructor(private _sessionStorage: SessionStorageService) { }

    //payment module
    updatePaymentMsns(data)
    {
        this._sessionStorage.store(this.PAYMENT_MSNS, data)
    }

    clearPaymentMsns()
    {
        this._sessionStorage.clear(this.PAYMENT_MSNS);
    }

    fetchPaymentMsns()
    {
        return this._sessionStorage.retrieve(this.PAYMENT_MSNS);
    }

    //authentication module
    //TODO:Move authentication related session storage over here.
}
