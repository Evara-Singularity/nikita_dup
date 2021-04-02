import { Injectable } from "@angular/core";
import { catchError } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { of } from 'rxjs';

import CONSTANTS from "../../config/constants";
import { DataService } from "./data.service";

@Injectable({
    providedIn: "root"
})
export class CheckoutService {
    billingAddress: {};
    checkoutAddress: {};
    invoiceType: string;

    constructor(public dataService: DataService) {
        this.checkoutAddress = null;
        this.billingAddress = null;
        this.invoiceType = 'retail';
    }

    setCheckoutAddress(checkoutAddress) {
        this.checkoutAddress = checkoutAddress;
    }

    setInvoiceType(type) {
        this.invoiceType = type;
    }

    getInvoiceType() {
        return this.invoiceType;
    }

    getCheckoutAddress() {
        return this.checkoutAddress;
    }

    setBillingAddress(billingAddress) {
        this.billingAddress = billingAddress;
    }

    getBillingAddress() {
        return this.billingAddress;
    }

    getBusinessDetail(id) {
        let url = CONSTANTS.NEW_MOGLIX_API + "/businessdetails/getbyid?id=" + id;
        return this.dataService.callRestful("GET", url).pipe(
            catchError((res: HttpErrorResponse) => {
                return of({ status: false, statusCode: res.status });
            })
        );
    }

    getPrepaidDiscountUpdate(body) {
        return this.dataService.callRestful("POST", CONSTANTS.NEW_MOGLIX_API + "/payment/getPrepaidDiscount", { body: body }).pipe(
            catchError((res: HttpErrorResponse) => {
                return of({ status: false, statusCode: res.status });
            })
        );
    }
}
