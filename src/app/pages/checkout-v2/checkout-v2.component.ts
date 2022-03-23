import { LocalAuthService } from './../../utils/services/auth.service';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CheckoutHeaderModel } from '@app/utils/models/shared-checkout.models';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-checkout-v2',
    templateUrl: './checkout-v2.component.html',
    styleUrls: ['./checkout-v2.component.scss']
})
export class CheckoutV2Component implements OnInit, AfterViewInit, OnDestroy
{
    readonly ADDRESS_HEADERS: CheckoutHeaderModel[] = [{ label: "ADDRESS & SUMMARY", status: true }, { label: "PAYMENT", status: false }];
    readonly PAYMENT_HEADERS: CheckoutHeaderModel[] = [{ label: "ADDRESS & SUMMARY", status: true }, { label: "PAYMENT", status: true }];
    headers = this.ADDRESS_HEADERS;
    isUserLoggedIn = false;
    isCheckoutFlow = false;
    userSession = null;
    routerSubscription:Subscription = null;

    constructor(private _router: Router, private _localAuthService: LocalAuthService) { }
    
    ngOnInit() 
    {
        this.isUserLoggedIn = this._localAuthService.isUserLoggedIn();
        this.updateCheckoutFlag(this._router.url.toLowerCase());
    }

    ngAfterViewInit(): void
    {
        this.routerSubscription = this._router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe((event: NavigationEnd) =>
        {
            const URL = event.url.toLowerCase();
            this.updateCheckoutFlag(URL);
            this.headers = URL.includes("payment") ? this.PAYMENT_HEADERS : this.ADDRESS_HEADERS;
        });
    }

    updateCheckoutFlag(url) { this.isCheckoutFlow = url.includes("payment") || url.includes("address");  }

    get displayStepper() { return this.isUserLoggedIn && this.isCheckoutFlow}

    ngOnDestroy(): void
    {
        if (this.routerSubscription) this.routerSubscription.unsubscribe();
    }
}
