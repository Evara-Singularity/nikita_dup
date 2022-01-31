import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { SharedAuthService } from '../shared-auth.service';

@Component({
    selector: 'shared-auth-header',
    templateUrl: './shared-auth-header.component.html',
    styleUrls: ['./shared-auth-header.component.scss']
})
export class SharedAuthHeaderComponent implements OnInit, OnDestroy
{
    readonly HOME_URL = "/";
    readonly OTP_URL = "/otp";
    readonly LOGIN_URL = "/login";
    @Input('isCheckout') isCheckout = false;
    checkOutTabSubscriber: Subscription = null;
    tab: string = null;

    constructor(private _router: Router, private _sharedAuthService: SharedAuthService,) { }

    ngOnInit() 
    {
        if (this.isCheckout) {
            this.checkOutTabSubscriber = this._sharedAuthService.getCheckoutTab().subscribe((TAB) =>
            {
                this.tab = TAB;
            })
        }
    }

    handleClick()
    {
        if (this.isCheckout) {
            this.moveTabTo()
            return
        }
        this.navigateBack();
    }

    moveTabTo()
    {
        let nextTab = ""
        if (this.tab === this._sharedAuthService.FORGET_PASSWORD_TAB) {
            nextTab = this._sharedAuthService.OTP_TAB;
        }
        else if (this.tab === this._sharedAuthService.FORGET_PASSWORD_TAB) {
            nextTab = this._sharedAuthService.LOGIN_TAB;
        }
        this._sharedAuthService.emitCheckoutChangeTab(nextTab);
    }

    navigateBack()
    {
        const URL = (this._router.url as string).toLowerCase();
        let NAVIGATE_TO = this.HOME_URL;
        if (URL.includes("forgot-password")) {
            NAVIGATE_TO = this.OTP_URL;
        } else if (URL.includes("sign-up")) {
            NAVIGATE_TO = this.LOGIN_URL;
        } else {
            NAVIGATE_TO = this.HOME_URL;
        }
        this.navigateTo(NAVIGATE_TO);
    }

    navigateTo(link) { this._router.navigate([link]); }

    ngOnDestroy(): void
    {
        if (this.checkOutTabSubscriber)
            this.checkOutTabSubscriber.unsubscribe();
    }
}
