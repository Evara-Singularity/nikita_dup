import { Location } from '@angular/common';
import { AfterViewInit, Component, ComponentFactoryResolver, EventEmitter, Injector, Input, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import CONSTANTS from '@app/config/constants';
import { CheckoutService } from '@app/utils/services/checkout.service';
import { CommonService } from '@app/utils/services/common.service';
import { GlobalAnalyticsService } from '@app/utils/services/global-analytics.service';
import { environment } from 'environments/environment';
import { LocalStorageService } from 'ngx-webstorage';
import { of } from 'rxjs';
import { filter, map, mergeMap } from 'rxjs/operators';
import { GlobalState } from '../../utils/global.state';
import { LocalAuthService } from '../../utils/services/auth.service';
import { CartService } from '../../utils/services/cart.service';
import { GlobalLoaderService } from '../../utils/services/global-loader.service';
import { SharedAuthService } from '../shared-auth-v1/shared-auth.service';

@Component({
    selector: 'header-nav',
    templateUrl: './header-nav.component.html',
    styleUrls: ['./header-nav.component.scss'],
})
export class HeaderNavComponent implements OnInit, OnDestroy, AfterViewInit {

    readonly MODULE_NAME = CONSTANTS.MODULE_NAME;
    readonly imgAssetPath: string = environment.IMAGE_ASSET_URL
    isHomePage: boolean;
    routerData: any = null;
    user: any = null;
    isServer: boolean = true; // by default server setting is enabled for SSR
    isBrowser: boolean = false;
    noOfCart: number = 0;
    backRedirectUrl: string = null;
    sideNavInstance = null;
    isUserLogin: any;
    // isScrolledHeader: boolean = false;
    @ViewChild('sideMenu', { read: ViewContainerRef })
    sideMenuContainerRef: ViewContainerRef;
    searchBarInstance = null;
    @ViewChild('searchBar', { read: ViewContainerRef })
    searhNavContainerRef: ViewContainerRef;
    bottomSheetInstance = null;
    @ViewChild('bottomSheet', { read: ViewContainerRef })
    bottomSheetContainerRef: ViewContainerRef;
    searhNav: any;
    checkoutTabMap = {
        1: 'Login',
        2: 'Checkout',
        3: 'Product Summary',
        4: 'Payment',
    };
    staticPages = [
        '/faq',
        '/max',
        '/diwali-deals',
        '/deals',
        '/brand-store',
        '/buyer-guide',
        '/copyright',
        '/privacy',
        '/terms',
        '/testimonials',
        '/compliance',
        '/press',
        '/about',
        '/corporate-gifting',
        '/services',
        '/career',
        '/affiliate',
        '/moglix-originals',
        '/contact',
    ];
    @Input('extraData') extraData;
    activeModuleName = this.MODULE_NAME.HOME;

    constructor(
        public router: Router,
        private localAuthService: LocalAuthService,
        public cartService: CartService,
        private location: Location,
        private sharedAuthService: SharedAuthService,
        private cfr: ComponentFactoryResolver,
        private injector: Injector,
        public _commonService: CommonService,
        private globalLoader: GlobalLoaderService,
        private localStorageService: LocalStorageService,
        private _state: GlobalState,
        private _checkoutService: CheckoutService,
        private _analytics: GlobalAnalyticsService,
        private _activatedRoute: ActivatedRoute
    ) {
        this.isServer = _commonService.isServer;
        this.isBrowser = _commonService.isBrowser;
    }


    ngOnInit() {
        if (this.isBrowser) {
            this.isUserLogin = this.localAuthService.isUserLoggedIn();
        }
        this.createHeaderData(this._activatedRoute);
    }

    ngAfterViewInit() {
        if (this.isBrowser) {
            this.addBrowserSubcribers();
            window.addEventListener('scroll', (event) => {
                let scrollE = document.scrollingElement || document.documentElement;
                if (scrollE['scrollTop'] > 120) {
                    this._commonService.isScrolledHeader = true;
                } else {
                    this._commonService.isScrolledHeader = false;
                }
            });
        }
    }

    ngOnDestroy() {
        this.sideNavInstance = null;
        this.searchBarInstance = null;
    }

    async loadSideNav() {
        if (!this.sideNavInstance) {
            this.globalLoader.setLoaderState(true);
            const { SideNavComponent } = await import(
                './../../components/side-nav/side-nav.component'
            ).finally(() => {
                this.globalLoader.setLoaderState(false);
            });
            const factory = this.cfr.resolveComponentFactory(SideNavComponent);
            this.sideNavInstance = this.sideMenuContainerRef.createComponent(
                factory,
                null,
                this.injector
            );
            this.sideNavInstance.instance['user'] = this.localAuthService.getUserSession();
        } else {
            //toggle side menu
            this.sideNavInstance.instance['sideMenuOpen'] = !this.sideNavInstance[
                'sideMenuOpen'
            ];
            this.sideNavInstance.instance[
                'user'
            ] = this.localAuthService.getUserSession();
        }
        this.genericButtonClick('/', true);
    }

    genericButtonClick(url, hamBurgerClick?: boolean) {
        let PAGE = {
            channel: "menu_hamburger",
            pageName: this.router.url,
            linkName: url,
            subSection: url + ' link click'
        };

        if (hamBurgerClick) {
            PAGE['subSection'] = 'Hamburger icon click';
            delete PAGE['linkName'];
        }
        this._analytics.sendAdobeCall({ page: PAGE }, "genericClick");
    }

    async loadSearchNav(toBeAutoFilledKeyword = '') {
        if (!this.searchBarInstance) {
            this.globalLoader.setLoaderState(true);
            const { SearchBarComponent } = await import(
                './../../components/searchBar/search-bar.component'
            ).finally(() => {
                this.globalLoader.setLoaderState(false);
            });
            const factory = this.cfr.resolveComponentFactory(SearchBarComponent);
            this.searchBarInstance = this.sideMenuContainerRef.createComponent(
                factory,
                null,
                this.injector
            );
            this.searchBarInstance.instance['data'] = {
                type: 'home',
                className: 'secondScroll',
            };
            this.searchBarInstance.instance['showSuggestionBlock'] = false;
            this.searchBarInstance.instance['analytics'] = this._commonService.createGenricAdobeData('best-seller:search:suggestion', this.routerData['pageName'], 'Product Suggestion');
            (
                this.searchBarInstance.instance['out'] as EventEmitter<boolean>
            ).subscribe((status) => {
                this.searchBarInstance = null;
                this.sideMenuContainerRef.detach();
            });
            if (toBeAutoFilledKeyword) { 
                this.searchBarInstance.instance['autoFillSearchKeyword'] = toBeAutoFilledKeyword 
            } else {
                // console.log('already not loaded', this._activatedRoute.snapshot.queryParams['search_query'])
                setTimeout(() => {
                    this.searchBarInstance.instance.handleSendTextToSearchBar(this._activatedRoute.snapshot.queryParams['search_query'] || '');
                    document.getElementById('search-input').focus();
                    // document.getElementById('search-input')['value'] = '';
                }, 500);
            };
        } else {

            if (toBeAutoFilledKeyword) {
                setTimeout(() => {
                    
                    this.searchBarInstance.instance.handleSendTextToSearchBar(toBeAutoFilledKeyword);
                }, 100);
            } else {
                // console.log('already loaded', this._activatedRoute.snapshot.queryParams['search_query'])
                setTimeout(() => {
                    this.searchBarInstance.instance.handleSendTextToSearchBar(this._activatedRoute.snapshot.queryParams['search_query'] || '');
                    document.getElementById('search-input').focus();
                    // document.getElementById('search-input')['value'] = '';
                }, 0);
            }

            this.searchBarInstance.instance['data'] = {
                type: 'home',
                className: 'secondScroll',
            };
            this.searchBarInstance.instance['showSuggestionBlock'] = false;
            this.searchBarInstance.instance['ssp'] = true;
        }
    }

    async loadBottomSheet() {
        if (!this.bottomSheetInstance) {
            const { NavBottomSheetComponent } = await import(
                './../../components/nav-bottom-sheet/nav-bottom-sheet.component'
            );
            const factory = this.cfr.resolveComponentFactory(NavBottomSheetComponent);
            this.bottomSheetInstance = this.sideMenuContainerRef.createComponent(
                factory,
                null,
                this.injector
            );
            this.bottomSheetInstance.instance['sbm'] = true;

        } else {
            //toggle side menu
            this.bottomSheetInstance.instance['sbm'] = !(this.bottomSheetInstance.instance['sbm']);
        }
        this.checkUserLogin();
        this.loadBottomSheetAnalyticEvent();
    }
    checkUserLogin() {
        let user = this.localStorageService.retrieve('user');
        if (user && user.authenticated === 'true') {
            this.bottomSheetInstance.instance['userLogin'] = true;
        }
        else {
            this.bottomSheetInstance.instance['userLogin'] = false;
        }
    }

    loadBottomSheetAnalyticEvent() {
        const user = this.localStorageService.retrieve('user');
        let page = {
            'linkPageName': "moglix:hamburger-menu",
            'linkName': "header",
            'channel': this.routerData['pageName'] || this.router.url
        }
        let custData = {
            'customerID': (user && user["userId"]) ? btoa(user["userId"]) : '',
            'emailID': (user && user["email"]) ? btoa(user["email"]) : '',
            'mobile': (user && user["phone"]) ? btoa(user["phone"]) : '',
            'customerType': (user && user["userType"]) ? user["userType"] : '',
        }
        let order = {}
        this._analytics.sendAdobeCall({ page, custData, order }, "genericClick");
    }

    addBrowserSubcribers() {
        this._commonService.currentUrl = this.router.url;
        this.router.events.subscribe((event) =>
        {
            if (event instanceof NavigationEnd) {
                this.createHeaderData(this._activatedRoute);
                //TODO:set common service previous url and current url
                //TODO:Remove current URL nad backRedirectURL logic.
                localStorage.setItem('backRedirectUrl', this.backRedirectUrl);
                this._commonService.previousUrl = this._commonService.currentUrl;
                this._commonService.currentUrl = event.url;
                this.backRedirectUrl = this._commonService.currentUrl || '';
            }
        });

        this.cartService.cart.subscribe((data) => {
            
            if (data && data.hasOwnProperty('count')) {
                this.noOfCart = data.count;
            } else {
                throw new Error('Cart update count should always be present');
            }
        });

        this.localAuthService.login$.subscribe((data) => {
            this.isUserLogin = this.localAuthService.isUserLoggedIn();
        });

        this.localAuthService.logout$.subscribe((data) => {
            this.isUserLogin = this.localAuthService.isUserLoggedIn();
        });

        this._commonService.getSearchPopupStatus().subscribe((searchKeyword) => {
            this.loadSearchNav(searchKeyword)
        })
    }

    createHeaderData(_aRoute)
    {
        of(_aRoute)
            .pipe(
                map((route) =>
                {
                    while (route.firstChild) {
                        route = route.firstChild;
                    }
                    return route;
                }),
                filter((route) => route.outlet === 'primary'),
                mergeMap((route) => route.data)
            )
            .subscribe((rData) =>
            {
                this.routerData = rData;
                this.activeModuleName = rData['moduleName'];
            });
    }

    goBack() {
        this.backRedirectUrl = localStorage.getItem('backRedirectUrl');
        const isCheckout = this.backRedirectUrl && this.backRedirectUrl.toLowerCase().includes('checkout');

        // const currentURL = this.router.url;
        // const previousURL = (this._commonService.getPreviousUrl);
        // const backURL = this.backRedirectUrl;
        // console.log(`CurrentURL:${currentURL}, PreviousURL:${previousURL}, BackURL:${backURL}`);

        if (this.backRedirectUrl && this.backRedirectUrl !== '/' && isCheckout === false) {
            (window.history.length > 2) ? this.redirectToBackURL() : this.router.navigate(['/']);
        } else {
            if (this.staticPages.indexOf(window.location.pathname) !== -1) {
                this.router.navigate(['/']);
            } else if (isCheckout) {
                this.redirectToBackURLFromCheckout();
            } else {
                this.router.navigate(['/']);
            }
        }
    }

    redirectToBackURLFromCheckout() {

        if (this._commonService.getPreviousUrl.indexOf('checkout/payment') > -1) {
            this.router.navigateByUrl("quickorder", { replaceUrl: true });
            return;
        }

        // incase redirected back from checkout then we need to call cartsession API
        if (((this.router.url).indexOf('checkout/address') > -1) || ((this.router.url).indexOf('quickorder') > -1)) {
            this.cartService.clearBuyNowFlow();
            if (
                this._commonService.getPreviousUrl.indexOf('checkout/login') > -1 ||
                this._commonService.getPreviousUrl.indexOf('checkout/sign-up') > -1 || 
                this._commonService.getPreviousUrl.indexOf('checkout/otp') > -1
            ) {
                this.router.navigateByUrl("quickorder", { replaceUrl: true });
            } else {
                this.location.back();
            }
        } else {
            this.location.back();
        }
    }

    redirectToBackURL() {
        
        if (this._commonService.getPreviousUrl.indexOf('checkout/payment') > -1)
        {
            this.router.navigate(["quickorder"]);
            return;
        }

        if (((this.router.url).indexOf('quickorder') > -1) && (this._commonService.getPreviousUrl.indexOf('checkout/address') > -1)) {
            this.router.navigateByUrl("/", { replaceUrl: true });
            return;
        }

        // incase redirected back from checkout then we need to call cartsession API
        if (((this.router.url).indexOf('checkout/address') > -1) || ((this.router.url).indexOf('quickorder') > -1)) {
            // console.log('bakbtn cart session API called');
            //this.cartService.resetBuyNow();
            //this.cartService.refreshCartSesion();
            this.cartService.clearBuyNowFlow();
            // console.log('bakbtn cart session API called commonService.getPreviousUrl', this._commonService.getPreviousUrl);
            if (
                this._commonService.getPreviousUrl.indexOf('checkout/login') > -1 ||
                this._commonService.getPreviousUrl.indexOf('checkout/signup') > -1 || 
                this._commonService.getPreviousUrl.indexOf('checkout/otp') > -1
            ) {
                this.router.navigate(['/']);
            } else {
                this.location.back();
            }
        } else {
            this.location.back();
        }
    }

    handleCheckoutRedirect()
    {
        
    }

    navigateToLogin($event)
    {
        $event.preventDefault();
        $event.stopPropagation();
        this.localAuthService.clearAuthFlow();
        this.localAuthService.clearBackURLTitle();
        this.router.navigate(['/login']);
    }
}
