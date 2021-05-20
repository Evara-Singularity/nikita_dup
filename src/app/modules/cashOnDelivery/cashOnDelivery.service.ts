import {Injectable} from "@angular/core";
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs/observable/of';
import { HttpErrorResponse } from '@angular/common/http';
import { DataService } from "../../utils/services/data.service";
import CONSTANTS from "../../config/constants";

@Injectable()
export class CashOnDeliveryService{

    constructor(private _dataService: DataService){

    }

    pay(data){
        // (<HTMLElement>document.querySelector('#page-loader')).style.display = "block";
        return this._dataService.callRestful('POST', CONSTANTS.NEW_MOGLIX_API+"/payment/pay", {body:data});
    }

    sendOtp(data){
        return this._dataService.callRestful('POST', CONSTANTS.NEW_MOGLIX_API+"/checkout/sendPaymentOtp", {body:data});
    }

    verifyOtp(data){
        return this._dataService.callRestful('POST', CONSTANTS.NEW_MOGLIX_API+"/checkout/verifypaymentotp", {body:data});
    }

    getPaymentId(data) {
        return this._dataService.callRestful('GET', CONSTANTS.NEW_MOGLIX_API + '/payment/getPaymentId', {params: data}).pipe(
            catchError((e) => of({'status': false, 'data': {'transactionId': null}, 'description': null}))
        );
    }

    getAddreddList(id)
    {
       
        let url = CONSTANTS.NEW_MOGLIX_API + "/address/getAddressList?customerId="+id;
        return this._dataService.callRestful("GET", url);
    }

    postAddress(address) {
        return this._dataService.callRestful("POST", CONSTANTS.NEW_MOGLIX_API + "/address/postAddress", { body: address }).pipe(
            catchError((res: HttpErrorResponse) => {
                return of({status: false, statusCode: res.status});
            })
        );
    }

}