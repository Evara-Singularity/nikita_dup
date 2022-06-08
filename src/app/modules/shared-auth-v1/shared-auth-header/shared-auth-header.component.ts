import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { LocalAuthService } from './../../../utils/services/auth.service';

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
    @Input('isWhiteHeader') isWhiteHeader = false;
    @Input('overrideBackBtn') overrideBackBtn: boolean = false;
    @Input('enableSkipBtn') enableSkipBtn: boolean = false;
    @Output() onBackBtnClick$: EventEmitter<any> = new EventEmitter<any>();
    @Output() onSkipBtnClick$: EventEmitter<any> = new EventEmitter<any>();
    @Output() onHomepageBtnClick$: EventEmitter<any> = new EventEmitter<any>();
    checkOutTabSubscriber: Subscription = null;
    tab: string = null;

    constructor(
        private _router: Router,
        private _localAuthService: LocalAuthService) { }

    ngOnInit() { }

    navigateBack()
    {
        const URL = (this._router.url as string).toLowerCase();
        let NAVIGATE_TO = this.HOME_URL;
        if (URL.includes("forgot-password")) {
            NAVIGATE_TO = this.OTP_URL;
        } else if (URL.includes("sign-up")) {
            NAVIGATE_TO = this.LOGIN_URL;
        } else if (URL.includes("otp")) {
            NAVIGATE_TO = this.LOGIN_URL;
        } else {
            this._localAuthService.handleBackURL(true);
            return;
        }
        this.navigateTo(this.isCheckout ? `checkout/${NAVIGATE_TO}` : NAVIGATE_TO);
    }

    navigateToHome(link)
    {
        this.navigateTo(link);
    }

    navigateTo(link) { this._router.navigate([link]); }

    onBackBtnClick(){
        this.onBackBtnClick$.emit(true);
    }

    onHomepageBtnClick(){
        this.onHomepageBtnClick$.emit(true);
    }

    ngOnDestroy(): void
    {
        if (this.checkOutTabSubscriber) {
            this.checkOutTabSubscriber.unsubscribe();
        }
    }
}
