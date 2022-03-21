import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CheckoutHeaderModel } from '@app/utils/models/shared-checkout.models';
import { filter } from 'rxjs/operators';

@Component({
    selector: 'app-checkout-v2',
    templateUrl: './checkout-v2.component.html',
    styleUrls: ['./checkout-v2.component.scss']
})
export class CheckoutV2Component implements OnInit, AfterViewInit
{
    readonly ADDRESS_HEADERS: CheckoutHeaderModel[] = [{ label: "ADDRESS & SUMMARY", status: false }];
    readonly PAYMENT_HEADERS: CheckoutHeaderModel[] = [{ label: "ADDRESS & SUMMARY", status: true }, { label: "PAYMENT", status: false }];
    headers = this.ADDRESS_HEADERS;

    constructor(private _router: Router, private _activatedRoute: ActivatedRoute) { }
    ngOnInit() { }

    ngAfterViewInit(): void
    {
        this._router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe((event: NavigationEnd) =>
        {
            this.headers = event.url.toLowerCase().includes("payment") ? this.PAYMENT_HEADERS : this.ADDRESS_HEADERS;
        });
    }


}
