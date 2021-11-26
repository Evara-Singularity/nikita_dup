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
    orderId = null;
    utrForm: FormGroup = null;

    constructor(private _router: Router, private _route: ActivatedRoute,
        private _dataService: DataService, private _globarLodaer: GlobalLoaderService,
        private _toastMessage: ToastMessageService) { }

    ngOnInit()
    {
        this.orderId = this._route.snapshot.params['orderId'];
        if (!this.orderId) {
            this._router.navigate['**'];
            return;
        }
        this.utrForm = new FormGroup({
            amount: new FormControl("", [Validators.required, Validators.min(1)]),
            utrNo: new FormControl("", [Validators.required, Validators.pattern(/^([a-zA-Z0-9]+)$/)])
        })
    }

    submitUTRForm()
    {
        console.log(this.utrForm.value);
        if (this.utrForm.invalid) { this.utrForm.markAllAsTouched(); return; }
        this._globarLodaer.setLoaderState(true);
        this._dataService.callRestful("POST", `${CONSTANTS.NEW_MOGLIX_API}`, { body: this.utrForm.value }).subscribe(
            (res) => { this._toastMessage.show({ type: "success", message: "Information submitted successfully" }) },
            (error) => { this._toastMessage.show({ type: "error", message: error.message }) },
            () => { this._globarLodaer.setLoaderState(false); });
    }

    checkNumberic(event) { return event.charCode >= 48 && event.charCode <= 57; }

    get amount() { return this.utrForm.get("amount") }
    get utrNo() { return this.utrForm.get("utrNo") }
}
