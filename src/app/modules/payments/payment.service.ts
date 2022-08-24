import { map } from 'rxjs/operators';
import {Injectable} from "@angular/core";
import CONSTANTS from "@app/config/constants";
import { ENDPOINTS } from '@app/config/endpoints';
import { SessionStorageService } from "ngx-webstorage";
import { DataService } from "../../utils/services/data.service";

@Injectable()
export class PaymentService{

    readonly PAYMENT_MSNS = "paymentMSNS";

    constructor(
        private _dataService: DataService,
        private _sessionStorage: SessionStorageService
    ) { }

    getAll(body){
        return this._dataService.callRestful("POST", CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.GET_ALL_PAYMENT, {body: body});
    }

    getBusinessDetail(userId) {    
        let url = CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.BD +userId;
        return this._dataService.callRestful("GET", url);
    }

    getSavedCards(data, type){
        const url = `${CONSTANTS.NEW_MOGLIX_API}${ENDPOINTS.CARD.GET_SAVED_CARD}`;
        return this._dataService.callRestful('GET', url, { params: data }).pipe(map((response)=>{
            return response['status'] ? response : {status:false}
        }))
    }

    getPaymentsMethodData(type) {
        const url = `${CONSTANTS.NEW_MOGLIX_API}/payment/getPaymentMethodsStatus?gateWay=${(type == "retail") ? "payu" : "razorpay"}`;
        return this._dataService.callRestful('GET', url).pipe(map((response) =>
        {
            return response['status'] ? response : { status: false }
        }));
    }

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
    
}