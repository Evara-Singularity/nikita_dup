
import { LocalStorageService } from 'ngx-webstorage';
import { Component, ViewEncapsulation, Input } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { QuickOrderService } from './quickOrder.service';
import { Title } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { CONSTANTS } from '@config/constants';
import { GlobalState } from '../../utils/global.state';
import { LocalAuthService } from '../../utils/services/auth.service';
import { FooterService } from '../../utils/services/footer.service';
import { CartService } from '../../utils/services/cart.service';
import { CommonService } from '../../utils/services/common.service';
import { GlobalAnalyticsService } from '@app/utils/services/global-analytics.service';

@Component({
    selector: 'quick-order',
    templateUrl: './quickOrder.html',
    styleUrls: ['./quickOrder.scss'],
    encapsulation: ViewEncapsulation.None
})

export class QuickOrderComponent {
    @Input() showHeading: boolean = false;
    cartSessionUpdated$: Subject<any> = new Subject<any>();
    sessionCart: {};
    itemsList: Array<{}>;
    cart: {};
    isServer: boolean;
    isBrowser: boolean;
    public isShowLoader: boolean = false;
    imagePath = CONSTANTS.IMAGE_BASE_URL;
    signInText;
    private cDistryoyed = new Subject();
    itemsValidationMessage: Array<{}>;

    // New Variables
    API_RESPONSE: any;

    constructor(
        private _gState: GlobalState,
        private meta: Meta,
        private _activatedRoute: ActivatedRoute,
        private _localAuthService: LocalAuthService,
        private title: Title,
        private localStorageService: LocalStorageService,
        public footerService: FooterService,
        public cartService: CartService,
        private _quickOrderService: QuickOrderService,
        public _commonService: CommonService,
        private _analytics: GlobalAnalyticsService,
        public router: Router) {
        this.itemsList = [];
    }

    ngOnInit() {
        this.setDataFromResolver();
    }

    setDataFromResolver() {
        this._activatedRoute.data.subscribe(result => {
            this.API_RESPONSE = result.data;

            this.updateUserSession();
        });
    }
    
    updateUserSession() {
        this._commonService.userSession = this.localStorageService.retrieve('user');
    }

    navigateToCheckout() {
        this._localAuthService.setBackURLTitle(null, 'Continue to checkout');
        this.router.navigate(['/checkout'], { queryParams: { title: 'Continue to checkout' } });
    }
}