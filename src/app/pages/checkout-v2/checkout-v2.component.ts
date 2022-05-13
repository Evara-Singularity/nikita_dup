import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { CommonService } from '@app/utils/services/common.service';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { LocalAuthService } from './../../utils/services/auth.service';

@Component({
    selector: 'app-checkout-v2',
    templateUrl: './checkout-v2.component.html',
    styleUrls: ['./checkout-v2.component.scss']
})
export class CheckoutV2Component implements OnInit, AfterViewInit, OnDestroy
{
    isUserLoggedIn = false;
    isCheckoutFlow = false;
    userSession = null;
    routerSubscription:Subscription = null;
    routingData: any = null;

    constructor(
        private _router: Router, 
        public _route: ActivatedRoute,
        private _localAuthService: LocalAuthService,
        public _commonService: CommonService
    ) { }
    
    ngOnInit() {
        if (this._commonService.isServer) {
            return
        }
        this.isUserLoggedIn = this._localAuthService.isUserLoggedIn();
        this.updateCheckoutFlag(this._router.url.toLowerCase());
        this.subcribers();
    }

    private subcribers() {
        if (this._commonService.isBrowser) {
            this.createHeaderData();
            this._router.events.subscribe((res) => {
                this.createHeaderData();
            });
        }
    }

    ngAfterViewInit(): void
    {
        this.routerSubscription = this._router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe((event: NavigationEnd) =>
        {
            const URL = event.url.toLowerCase();
            this.updateCheckoutFlag(URL);
        });
    }

    updateCheckoutFlag(url) { this.isCheckoutFlow = url.includes("payment") || url.includes("address");  }

    ngOnDestroy(): void
    {
        if (this.routerSubscription) this.routerSubscription.unsubscribe();
    }

    createHeaderData() {
        this._commonService.getRoutingData(this._route).subscribe((rData) => {
            this.routingData = rData;
        });
    }

}
