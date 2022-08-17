import { NavigationService } from '@app/utils/services/navigation.service';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { LocalAuthService } from './../../../utils/services/auth.service';

@Component({
    selector: 'shared-auth-header',
    templateUrl: './shared-auth-header.component.html',
    styleUrls: ['./shared-auth-header.component.scss']
})
export class SharedAuthHeaderComponent implements OnInit, OnDestroy {
    readonly HOME_URL = "/";
    readonly OTP_URL = "/otp";
    readonly LOGIN_URL = "/login";
    @Input('isCheckout') isCheckout: boolean = false;
    @Input('isWhiteHeader') isWhiteHeader = false;
    @Input('overrideBackBtn') overrideBackBtn: boolean = false;
    @Input('enableSkipBtn') enableSkipBtn: boolean = false;
    @Output() onBackBtnClick$: EventEmitter<any> = new EventEmitter<any>();
    @Output() onSkipBtnClick$: EventEmitter<any> = new EventEmitter<any>();
    @Output() onHomepageBtnClick$: EventEmitter<any> = new EventEmitter<any>();
    @Output() backButtonClicked$: EventEmitter<any> = new EventEmitter<any>();
    @Input('isLoginPopup') isLoginPopup;

    checkOutTabSubscriber: Subscription = null;
    tab: string = null;
    previousUrl: boolean = false;

    constructor(
        private _navigationService: NavigationService,
        private _router: Router, private activatedRoute: ActivatedRoute,
        private _localAuthService: LocalAuthService) {
        this.activatedRoute.queryParams.subscribe(params => {
            this.previousUrl = (params.backurl.split('/').includes('dashboard')) ? true : false;
            console.log(this.previousUrl);
        });
    }

    ngOnInit() { }

    navigateBack()
    {
        if(this.isLoginPopup){
         this.backButtonClicked$.emit()
        }
        else if (this.previousUrl){
            console.log('in')
            this.navigateTo('/')
            this.onSkipBtnClick$.emit(true)
        } else {
            console.log('else')
            const URL = (this._router.url as string).toLowerCase();
            let NAVIGATE_TO = null;
            if (URL.includes("forgot-password")) {
                NAVIGATE_TO = this.OTP_URL;
            } else if (URL.includes("sign-up")) {
                NAVIGATE_TO = this.LOGIN_URL;
            } else if (URL.includes("otp")) {
                NAVIGATE_TO = this.LOGIN_URL;
            }
            this._localAuthService.handleBackURL(true);
            if (this.isCheckout && NAVIGATE_TO) {
                this.navigateTo(`checkout/${NAVIGATE_TO}`)
            }
            else {
                this._navigationService.goBack(true);
            }
        }
    }


    navigateToHome(link) {
        this.navigateTo(link);
    }

    navigateTo(link) { this._router.navigate([link]) }

    onBackBtnClick() {
        this._navigationService.goBack(true);
    }

    onHomepageBtnClick() {
        this.onHomepageBtnClick$.emit(true);
    }

    ngOnDestroy() {
        if (this.checkOutTabSubscriber) {
            this.checkOutTabSubscriber.unsubscribe();
        }
    }
}
