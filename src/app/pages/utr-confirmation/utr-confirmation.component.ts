import { ToastMessageService } from '@app/modules/toastMessage/toast-message.service';
import { GlobalLoaderService } from '@app/utils/services/global-loader.service';
import { DataService } from './../../utils/services/data.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import CONSTANTS from '@app/config/constants';

@Component({
    selector: 'utr-confirmation',
    templateUrl: './utr-confirmation.component.html',
    styleUrls: ['./utr-confirmation.component.scss']
})
export class UTRConfirmationComponent implements OnInit
{
    readonly SUCCESS_MSG = { type: "success", text: "Information submitted successfully" };
    utrForm: FormGroup = null;

    constructor(private _router: Router, private _route: ActivatedRoute,
        private _dataService: DataService, private _globarLodaer: GlobalLoaderService,
        private _toastMessage: ToastMessageService) { }

    ngOnInit()
    {
        const QPARAMS = this._route.snapshot.queryParams;
        const ORDERID = Number(QPARAMS['orderId']);
        const QUOATATIONID = Number(QPARAMS['quotationId']);
        const QUOATATIONTYPE = QPARAMS['quotationType'];
        const IS_REDIRECT = !(ORDERID && QUOATATIONID && QUOATATIONTYPE);
        console.log(IS_REDIRECT);
        if (IS_REDIRECT) {
            this._router.navigate(['**']);
            return;
        }
        this.utrForm = new FormGroup({
            orderId: new FormControl(ORDERID, [Validators.required]),
            quotationId: new FormControl(QUOATATIONID, [Validators.required]),
            quotationType: new FormControl(QUOATATIONTYPE, [Validators.required]),
            transactionAmount: new FormControl("", [Validators.required, Validators.min(1)]),
            bankTransactionNumber: new FormControl("", [Validators.required, Validators.pattern(/^([a-zA-Z0-9]+)$/)])
        })
    }

    submitUTRForm()
    {
        if (this.utrForm.invalid) { this.utrForm.markAllAsTouched(); return; }
        this._globarLodaer.setLoaderState(true);
        this._dataService.callRestful("POST", `${CONSTANTS.NEW_MOGLIX_API}/rfq/rfqOrderTransaction`, { body: this.utrForm.value }).subscribe(
            (response) => {   
                if (response['status'])
                {
                    this._toastMessage.show(this.SUCCESS_MSG);
                    setTimeout(() => { this._router.navigate(['.'])},500);
                    return;
                }
                this._toastMessage.show({ type: "error", text: response['statusDescription'] })
             },
            (error) => { this._toastMessage.show({ type: "error", text: error.statusDescription }) },
            () => { this._globarLodaer.setLoaderState(false); });
    }

    checkNumberic(event) { return event.charCode >= 48 && event.charCode <= 57; }

    get orderId() { return this.utrForm.get("orderId") }
    get transactionAmount() { return this.utrForm.get("transactionAmount") }
    get bankTransactionNumber() { return this.utrForm.get("bankTransactionNumber") }
}
