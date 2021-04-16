import { Component, Inject, PLATFORM_ID, OnInit, OnDestroy, AfterViewInit, Input } from '@angular/core';
import { CheckoutService } from './checkout.service';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { LocalStorageService } from 'ngx-webstorage';
import { PageScrollService } from 'ngx-page-scroll-core';
import { TransferState, makeStateKey } from '@angular/platform-browser';
import { Title } from '@angular/platform-browser';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs/Subject';
import { map } from 'rxjs/operators/map';
import { delay } from 'rxjs/operators/delay';
import { mergeMap } from 'rxjs/operators/mergeMap';
import { isPlatformServer, isPlatformBrowser, DOCUMENT } from '@angular/common';
import { of } from 'rxjs/observable/of';
import CONSTANTS from 'src/app/config/constants';
import { ModalService } from 'src/app/modules/modal/modal.service';
import { DataService } from 'src/app/utils/services/data.service';
import { GlobalState } from 'src/app/utils/global.state';
import { CartService } from 'src/app/utils/services/cart.service';
import { LocalAuthService } from 'src/app/utils/services/auth.service';
import { DeliveryAddressService } from 'src/app/modules/deliveryAddress/deliveryAddress.service';
import { CommonService } from 'src/app/utils/services/common.service';
import { FooterService } from 'src/app/utils/services/footer.service';
import { ToastMessageService } from 'src/app/modules/toastMessage/toast-message.service';
import { UnAvailableItemsComponent } from 'src/app/modules/unAvailableItems/unAvailableItems.component';
const ICWL: any = makeStateKey<boolean>('ICWL'); // ICWL: Is Checkout Window Loaded

declare let dataLayer;
declare var digitalData: {};
declare let _satellite;

@Component({
    selector: 'checkout',
    templateUrl: './checkout.html',
    styleUrls: ['./checkout.scss']
})

export class CheckoutComponent implements OnInit, OnDestroy, AfterViewInit {
    imagePath = CONSTANTS.IMAGE_BASE_URL;
    loginForm: FormGroup;
    user: { authenticated: string };
    tabIndex: number;
    checkoutAddress: {};
    checkoutAddressIndex: number;
    businessDetails: any;
    addressFormButtonText: string = 'SAVE';
    windowWidth: number;
    showSocialLogin: boolean;
    step: number = 1;
    itemsValidationMessage: Array<{}>;
    cartSessionUpdated$: Subject<any> = new Subject<any>();
    tabIndexList: { loginSignUp: number, address: number, invoiceType: number, productSummary: number, payment: number } = {
        loginSignUp: 1, address: 3, invoiceType: 2, productSummary: 4, payment: 5
    };
    invoiceType: string;
    cartData: any;
    headerText: string = CONSTANTS.CMS_TEXT.CART_PAYMENT_METHOD_TEXT;
    isServer: boolean;
    isBrowser: boolean;
    showLoader: boolean = false;
    shippingAddressPincode;
    headerStep = 1;
    // invoiceTypeForm: FormGroup;
    isCheckoutResolved: boolean;
    itemsCount: number;
    buyNow: boolean;
    @Input() checkoutBackPath:Subject<any>;
    isContinue = true;

    constructor(private _modalService: ModalService, public _dataService: DataService, private _router: Router, public _state: GlobalState, private _activatedRoute: ActivatedRoute, @Inject(PLATFORM_ID) platformId, private _tState: TransferState, private formBuilder: FormBuilder, private _cartService: CartService, public router: Router, private title: Title, public footerService: FooterService, private _pageScrollService: PageScrollService, @Inject(DOCUMENT) private _document: any, private _localStorageService: LocalStorageService, private _localAuthService: LocalAuthService, private _commonService: CommonService, private _checkoutService: CheckoutService, private _deliveryAddressService: DeliveryAddressService, private _tms:ToastMessageService) {

        console.log("this.router.getCurrentNavigation().extras.state", this.router.getCurrentNavigation().extras.state)

        const state = this.router.getCurrentNavigation().extras.state;
        if (state && state['buyNow']) {
            this.buyNow = state['buyNow'];
            this._cartService.buyNow = state['buyNow'];
        }
        this.itemsValidationMessage = [];
        this.invoiceType = this._checkoutService.getInvoiceType();
        // alert(this.invoiceType);
        this.isServer = isPlatformServer(platformId);
        this.isBrowser = isPlatformBrowser(platformId);
        this.windowWidth = this.isBrowser ? window.innerWidth : undefined;

        if (this.isServer) {
            this._tState.set(ICWL, true);
            return;
        }

        this.user = this.isBrowser ? this._localAuthService.getUserSession() : null;
        _activatedRoute.queryParams.subscribe(p => {
            if (p.index < this.tabIndex) {
                this.tabIndex = parseInt(p.index);
                // console.log('index', p.index);            
                // this.scrollToNewTab("#productSummary")
            }
        });
        /*if (user.authenticated == 'false') {
            this.router.navigateByUrl('/quickorder');
            return;
        }*/
        /*
        * When user refresh the page, then restrict below `if` code to execute.
        * While navigating to this page, allow below `if` code to execute
        * */
        /*if(!this._tState.get(ICWL, false)){
            let cartSesstion = this._cartService.getCartSession();
            if(cartSesstion['noOfItems'] == 0){
                this.router.navigateByUrl('/quickorder');
            }
        }*/

        this.showSocialLogin = true;
        if (this.isBrowser) {
            this.windowWidth = window.innerWidth;
            this.getBusinessDetails();
        }
        this.title.setTitle('Checkout-Moglix.com');
        /* if(document.querySelector('#page-loader'))
            (<HTMLElement>document.querySelector('#page-loader')).style.display = 'block';//.show();
        setTimeout(() => {
            if(document.querySelector('#page-loader'))
                (<HTMLElement>document.querySelector('#page-loader')).style.display = 'none';
        }, 1000); */
        this.tabIndex = 1;
        // this.changeParams()
        this._cartService.isCartEditButtonClick = false;

        /* this._cartService.orderSummary.subscribe((data)=>
        {

            if(data['noOfItems']==0)
            {
                // alert(5);
                this.router.navigateByUrl('/quickorder');
            }
        }) */


        // this.user = this._localAuthService.getUserSession();

        /*Subscribe below event when user logged in*/
        this._localAuthService.login$.subscribe(
            () => {
                this.user = this._localAuthService.getUserSession();
            }
        );

        /*Subscribe below event when user log out*/
        this._localAuthService.logout$.subscribe(
            () => {
                this.user = this._localAuthService.getUserSession();
            }
        );
        if (this.isBrowser && !this._cartService.isCartEditButtonClick) {
            this.gotoAddress();
        }

        this.loginForm = formBuilder.group({
            'mobile': ['', Validators.required],
            'email': ['', Validators.required],
            'password': '',
        });


        /* this.invoiceTypeForm = this.formBuilder.group({
            'mode': ['retail', [Validators.required]]
        }); */

    }

    changeParams() {
        this.router.navigate(
            [],
            {
                relativeTo: this._activatedRoute,
                replaceUrl: true,
                queryParams: { index: this.tabIndex },
                queryParamsHandling: "merge"
            })
        if (this.tabIndex == 2) {
            let page = {};
            digitalData["page"] = page;
            digitalData["page"]["pageName"] = "moglix: order checkout: product summary & address details",
                digitalData["page"]["channel"] = "checkout",
                digitalData["page"]["subSection"] = "moglix: order checkout: product summary & address details"
            digitalData['page']['linkName'] = '',
                digitalData['page']['linkPageName'] = ''
            // if(typeof _satellite !== "undefined"){
            _satellite.track("genericPageLoad");
            // } 
        }

    }

    gotoAddress() {
        const user = this._localStorageService.retrieve('user');
        if (user && user.authenticated === 'true') {
            this.tabIndex = 2;
            this.changeParams();

            //debugger;
        }
    }

    unServicableItemsUpdated(unServicableItems) {
        console.log(unServicableItems);
        const itemsValidationMessage = this._commonService.itemsValidationMessage;
        this.itemsValidationMessage = itemsValidationMessage;
        // this.itemsValidationMessage = [...this.itemsValidationMessage, ...unServicableItems];
    }
    ngOnDestroy() {
        this.footerService.setFooterObj({ footerData: false });
        this.footerService.footerChangeSubject.next(this.footerService.getFooterObj());
    }

    check(event) {

        this.businessDetails = event;
        this.businessDetails = event[0];
    }

    itemsValidationMessageUpdated(itemsValidationMessage) {
        console.log(itemsValidationMessage);
        itemsValidationMessage = this._commonService.itemsValidationMessage;
        this.itemsValidationMessage = itemsValidationMessage;
    }

    ngOnInit() {
       
        debugger;

        /*If window is not loaded then call api to fetch data else get data from cart service*/
        // this._commonService.getSession().subscribe((response) => {

        const userSession = this.isBrowser ? this._localAuthService.getUserSession() : null;
        this.cartData = this._cartService.getCartSession();

        if (this.cartData['itemsList'] !== null && this.cartData['itemsList']) {
            var totQuantity = 0;
            var trackData = {
                event_type: "page_load",
                page_type: this.router.url == "/quickorder" ? "Cart" : "Checkout",
                label: "checkout_started",
                channel: this.router.url == "/quickorder" ? "Cart" : "Checkout",
                price: this.cartData["cart"]["totalPayableAmount"] ? this.cartData["cart"]["totalPayableAmount"].toString() : '0',
                quantity: this.cartData["itemsList"].map(item => {
                    return totQuantity = totQuantity + item.productQuantity;
                })[this.cartData["itemsList"].length - 1],
                shipping: parseFloat(this.cartData["shippingCharges"]),
                itemList: this.cartData.itemsList.map(item => {
                    return {
                        category_l1: item["taxonomyCode"] ? item["taxonomyCode"].split("/")[0] : null,
                        category_l2: item["taxonomyCode"] ? item["taxonomyCode"].split("/")[1] : null,
                        category_l3: item["taxonomyCode"] ? item["taxonomyCode"].split("/")[2] : null,
                        price: item["totalPayableAmount"].toString(),
                        quantity: item["productQuantity"]
                    }
                })
            }

            this._dataService.sendMessage(trackData);
            // this.sessionCart = this.session;
        }

        this._state.subscribe("routeChanged", (tab) => {
            debugger;
            if (tab > 1) {
                this.tabIndex = tab;
                this.changeParams();
                if(this.tabIndex == 2){
                   this.headerStep = 1;
                }
            } else {
                this._state.notifyDataChanged('checkoutRoutChanged', null);
            }
        });

        // this._activatedRoute.data
        //     .pipe(
        //         map(data => data.chres),
        //         mergeMap((cartSession: any) => {
        //             // console.log(cartSession, 'cartSessioncartSessioncartSession');
        //             if (this.isServer) {
        //                 return of(null);
        //             }

        //             /**
        //              * return cartsession, if session id missmatch
        //              */
        //             if (cartSession['statusCode'] !== undefined && cartSession['statusCode'] === 202) {
        //                 return of(cartSession);
        //             }
        //             return this.getShippingValue(cartSession);

        //         })
        //     )
        //     .subscribe((cartSession) => {
        //         if (cartSession && cartSession['statusCode'] !== undefined && cartSession['statusCode'] === 200) {
        //             const cs = this._cartService.updateCart(cartSession);
        //             this._cartService.setCartSession(cs);
        //             this.cartSessionUpdated$.next(cartSession);
        //             this._cartService.orderSummary.next(cartSession);
        //             this._cartService.cart.next(cartSession['cart'] !== undefined ? cartSession['noOfItems'] : 0);

        //             if (cartSession['noOfItems'] === 0) {
        //                 this._router.navigateByUrl('/quickorder');
        //             }
        //         } else if (cartSession['statusCode'] !== undefined && cartSession['statusCode'] === 202) {
        //             const cs = this._cartService.updateCart(cartSession['cart']);
        //             this._cartService.setCartSession(cs);
        //             this.cartSessionUpdated$.next(cs);
        //             this._cartService.orderSummary.next(cs);
        //             this._cartService.cart.next(cs['cart'] !== undefined ? cs['noOfItems'] : 0);

        //             this._localAuthService.setUserSession(cartSession['userData']);
        //             this._localAuthService.logout$.emit();
        //             if (cs['noOfItems'] === 0) {
        //                 this._router.navigateByUrl('/quickorder');
        //             }
        //         }
        //         /* if(this.isBrowser && document.querySelector('#page-loader')){
        //             (<HTMLElement>document.querySelector('#page-loader')).style.display = 'none';
        //         } */
        //     });

        debugger
        // const state = window.history.state;
        // if (state) {
        //     if (state['buyNow']) {
        //         this._cartService.buyNow = state['buyNow'];
        //     }
        // }
        // console.log('[Checkout Page]', this._cartService.buyNow, window.history.state);
        /**
         * Only update session when buynow is false
         */
        if(!this._cartService.buyNow){
            this.getSession();
        }else if(this._cartService.buyNow && userSession && userSession['authenticated'] == "true"){
            this.getSession();
        }else{
            this.isCheckoutResolved = true;
        }
        this.footerService.setFooterObj({ footerData: false });
        this.footerService.footerChangeSubject.next(this.footerService.getFooterObj());


        if (this.isBrowser) {

            /*Start Criteo DataLayer Tags */
            dataLayer.push({
                'event': 'setEmail',
                'email': (userSession && userSession.email) ? userSession.email : '',
            });
            /*End Criteo DataLayer Tags */

            // <!------  NET CORE SCRIPT ---------------->

            // <!------  End NET CORE SCRIPT --->

            this._commonService.setWindowLoaded();
        }


        this.tabIndexUpdated(this.tabIndex)
    }

    getSession(){
        this._commonService.getSession()
            .pipe(
                map((res) => res),
                mergeMap((gs) => {
                    debugger;
                    this._localAuthService.setUserSession(gs);
                    let params = { "sessionid": gs["sessionId"] };
                    if (this.buyNow) {
                        params['buyNow'] = this.buyNow;
                    }
                    return this._cartService.getCartBySession(params);
                }),
                mergeMap((cartSession) => {
                    debugger;
                    this.isCheckoutResolved = true;
                    if (this.isServer)
                        return of(null);

                    /**
                     * return cartsession, if session id missmatch
                     */
                    if (cartSession['statusCode'] != undefined && cartSession['statusCode'] == 202)
                        return of(cartSession);
                    // debugger                                
                    return this.getShippingValue(cartSession);
                }),
            )
            .subscribe((cartSession) => {
                debugger;
                if (cartSession && cartSession['statusCode'] != undefined && cartSession['statusCode'] == 200) {
                    console.log('checkout cs', cartSession); 
                    const cs = this._cartService.updateCart(cartSession);
                    this._cartService.setCartSession(cs);
                    this.cartSessionUpdated$.next(cartSession);
                    this._cartService.orderSummary.next(cartSession);
                    this._cartService.cart.next(cartSession["cart"] != undefined ? cartSession['noOfItems'] : 0);

                    const buyNow = this._cartService.buyNow;
                    if (cartSession["noOfItems"] == 0 && !buyNow) {
                        this._router.navigateByUrl('/quickorder');
                    }
                } else if (cartSession['statusCode'] != undefined && cartSession['statusCode'] == 202) {
                    const cs = this._cartService.updateCart(cartSession['cart']);
                    this._cartService.setCartSession(cs);
                    this.cartSessionUpdated$.next(cs);
                    this._cartService.orderSummary.next(cs);
                    this._cartService.cart.next(cs["cart"] != undefined ? cs['noOfItems'] : 0);

                    this._localAuthService.setUserSession(cartSession['userData']);
                    this._localAuthService.logout$.emit();
                    if (cs["noOfItems"] == 0) {
                        this._router.navigateByUrl('/quickorder');
                    }
                }

                this.itemsCount = this._cartService.getCartSession()['itemsList'].length;
                /* if(this.isBrowser && document.querySelector('#page-loader')){
                    (<HTMLElement>document.querySelector("#page-loader")).style.display = "none";
                } */
            })
    }
    navidateToHome() {
        const buyNow = this._cartService.buyNow;
        this.router.navigateByUrl('/', { state: buyNow ? { buyNow: buyNow } : {} });   //this redirect to quick order page
    }

    ngAfterViewInit() {
        if (this.isBrowser) {
            this.windowWidth = window.innerWidth;
            this._tState.remove(ICWL);
        }
    }

    private setGtmTag(cs?) {
        if (cs && cs["noOfItems"] > 0) {
            let pName = [];

            for (let i = 0; i < cs["itemsList"].length; i++) {
                pName.push({
                    CPURL: cs["itemsList"][i]["productUrl"],
                    SPDNAME: cs["itemsList"][i]["productName"],
                    IPRQT: cs["itemsList"][i]["productQuantity"]
                });
            }
            dataLayer.push({
                'event': 'pr-checkout',
                'pName': pName,
            });
        }
    }


    private getShippingValue(cartSession) {
        let sro = this._cartService.getShippingObj(cartSession);
        return this._cartService.getShippingValue(sro)
            .pipe(
                map((sv: any) => {
                    if (sv && sv['status'] && sv['statusCode'] === 200) {
                        cartSession['cart']['shippingCharges'] = sv['data']['totalShippingAmount'];
                        // Below condition is added to resolve : someitmes error is occurring itemsList.length is undefined.
                        if (sv['data']['totalShippingAmount'] !== undefined && sv['data']['totalShippingAmount'] != null) {
                            const itemsList = cartSession['itemsList'];
                            for (let i = 0; i < itemsList.length; i++) {
                                cartSession['itemsList'][i]['shippingCharges'] = sv['data']['itemShippingAmount'][cartSession['itemsList'][i]['productId']];
                            }
                        }
                        // note1: belowline
                        // Object.assign(this.cartSession, cartSession);
                        // console.log(this.cartSession, cartSession);
                    }
                    return cartSession;
                })
            );
    }

    getBusinessDetails() {
        if (this._localStorageService.retrieve('user')) {
            const user = this._localStorageService.retrieve('user');

            if (user.authenticated === 'true') {
                this._checkoutService.getBusinessDetail(user.userId).subscribe(data => {
                });
            }
        }
    }

    logout() {
        this._commonService.logout().subscribe((response) => {
            // console.log('Logout REsponse', response);
            this._localStorageService.clear('user');
            this._localAuthService.setUserSession(response);
            this.user = this._localAuthService.getUserSession();

            this._commonService.getSession()
                .pipe(
                    map((res: any) => {
                        this._localAuthService.setUserSession(res);
                        return res;
                    }),
                    delay(100),
                    mergeMap((data) => {
                        const params = { 'sessionid': data.sessionId };
                        return this._cartService.getCartBySession(params)
                            .pipe(
                                map((res: any) => {
                                    return res;
                                })
                            );
                    })
                )
                .subscribe((cartSession: any) => {
                    if (cartSession['statusCode'] !== undefined && cartSession['statusCode'] === 200) {
                        const cs = this._cartService.updateCart(cartSession);
                        this._cartService.setCartSession(cs);
                        this._cartService.cart.next(cartSession['cart'] !== undefined ? cartSession['noOfItems'] : 0);
                        this._cartService.orderSummary.next(cartSession);
                    }
                });

            this._localAuthService.logout$.emit();
        });
        // this.setUser();
    }

    private setUser() {
        if (this._localStorageService.retrieve('user') != null) {
            this.user = this._localStorageService.retrieve('user');
        } else {
            this.user = { authenticated: 'false' };
        }
    }

    updateItemsCount(count) {
        this.itemsCount = count;
    }

    tabIndexUpdated(index): void {

        const invoiceType = this._checkoutService.getInvoiceType();
        const checkoutAddress = this._checkoutService.getCheckoutAddress();
        const billingAddress = this._checkoutService.getBillingAddress();

        if(!checkoutAddress){
            this._deliveryAddressService.openNewAddressForm(1);
            return;
        }

        if( invoiceType == 'tax' && !billingAddress){
            this._deliveryAddressService.openNewAddressForm(2);
            return;
        }

        if (billingAddress) {
            if (!billingAddress['gstinVerified']) {
                this._deliveryAddressService.openEditBillingAddressForm({billingAddress: billingAddress});
                this._tms.show({
                    type: 'error', text: "Either the provided GSTIN is invalid or the entered pincode doesn't match your GST certificate addresses"
                });
                return
            }
        }

        if (index == 3) {
            const unavailableItems = JSON.parse(JSON.stringify(this._commonService.itemsValidationMessage))
                .filter(item => item['type'] == 'unservicable' || item['type'] == 'oos');
            if (unavailableItems && unavailableItems.length) {
                this.viewUnavailableItems();
                return;
            }
            index = 4;
        }

        this.user = this._localAuthService.getUserSession();


        let taxo1 = '', taxo2 = '', taxo3 = '', productList = '', brandList = '', productPriceList = '', shippingList = '', couponDiscountList = '', quantityList = '', totalDiscount = 0, totalQuantity = 0, totalPrice = 0, totalShipping = 0;
        for (let p = 0; p < this.cartData["itemsList"].length; p++) {

            let price = this.cartData["itemsList"][p]['productUnitPrice']; 
            if( this.cartData["itemsList"][p]['bulkPrice'] != '' && this.cartData["itemsList"][p]['bulkPrice'] != null ){
                price = this.cartData["itemsList"][p]['bulkPrice'];
            }

            console.log(this.cartData["itemsList"][p]['bulkPrice'], this.cartData["itemsList"][p]['productUnitPrice']);

            taxo1 = this.cartData["itemsList"][p]['taxonomyCode'].split("/")[0] + '|' + taxo1;
            taxo2 = this.cartData["itemsList"][p]['taxonomyCode'].split("/")[1] + '|' + taxo2;
            taxo3 = this.cartData["itemsList"][p]['taxonomyCode'].split("/")[2] + '|' + taxo3;
            productList = this.cartData["itemsList"][p]['productId'] + '|' + productList;
            brandList = this.cartData["itemsList"][p]['brandName'] ? this.cartData["itemsList"][p]['brandName'] + '|' + brandList : '';
            productPriceList = price + '|' + productPriceList;
            shippingList = this.cartData["itemsList"][p]['shippingCharges'] + '|' + shippingList;
            couponDiscountList = this.cartData["itemsList"][p]['offer'] ? this.cartData["itemsList"][p]['offer'] + '|' + couponDiscountList : '';
            quantityList = this.cartData["itemsList"][p]['productQuantity'] + '|' + quantityList;
            totalDiscount = this.cartData["itemsList"][p]['offer'] + totalDiscount;
            totalQuantity = this.cartData["itemsList"][p]['productQuantity'] + totalQuantity;
            totalPrice = (price * this.cartData["itemsList"][p]['productQuantity']) + totalPrice;
            totalShipping = this.cartData["itemsList"][p]['shippingCharges'] + totalShipping;
        }
        let page = {
            'channel': "checkout",
            'loginStatus': (this.user && this.user["authenticated"] == 'true') ? "registered user" : "guest",
            'pageName': "moglix:order checkout:product summary",
            'subSection': "moglix:order checkout:product summary" 
        }
        let custData = {
            'customerID': (this.user['userId'] && this.user['userId']) ? btoa(this.user['userId']) : '',
            'emailID': (this.user && this.user['email']) ? btoa(this.user['email']) : '',
            'mobile': (this.user && this.user['phone']) ? btoa(this.user['phone']) : '',
            'type': (this.user && this.user['userType']) ? this.user['userType'] : '',
        }
        let order = {
            'productCategoryL1': taxo1,
            'productCategoryL2': taxo2,
            'productCategoryL3': taxo3,
            'productID': productList,
            'brand': brandList,
            'productPrice': productPriceList,
            'shipping': shippingList,
            'couponDiscount': couponDiscountList,
            'quantity': quantityList,
            'totalDiscount': totalDiscount,
            'totalQuantity': totalQuantity,
            'totalPrice': totalPrice,
            'shippingCharges': totalShipping
        }
        digitalData["page"] = page;
        digitalData["custData"] = custData;
        digitalData["order"] = order;

        this.invoiceType = this._checkoutService.getInvoiceType();

        // console.log('Checkout Component', index);
        this._cartService.isCartEditButtonClick = true;
        
        if (index == 2) {
            this.tabIndex = 2;
        }else if (index == 3) {
            this.tabIndex = 4;
        } else if (index != 1) {
            this.tabIndex += 2;
        }

        if (this.tabIndex === 2) {
            // this.scrollToNewTab('#deliveryAddress');

        }
        if (this.tabIndex === 3) {

            digitalData["page"]["pageName"] = "moglix:order checkout:product summary",
                digitalData["page"]["channel"] = "checkout",
                digitalData["page"]["subSection"] = "moglix:order checkout:product summary ",
                //digitalData["page"]["pincode"] = this.shippingAddressPincode;
                digitalData["order"]["invoiceType"] = this.invoiceType;

            _satellite.track("genericPageLoad");

            // this.scrollToNewTab('#businessDetail');
        }
        if (this.tabIndex === 4 && index != 5) {
            this.headerStep = 2;
            this.tabIndex = 2;
            this._state.notifyData('validationCheck', 'validate');
            // this.scrollToNewTab('#productSummary');
        }
        if (this.tabIndex === 5) {

            // this.scrollToNewTab('#paymentMethod');
        }
        if (index == 5) {
            digitalData["page"]["pageName"] = "moglix:order checkout:payment methods",
                digitalData["page"]["channel"] = "checkout",
                digitalData["page"]["subSection"] = "moglix:order checkout:payment methods",
                digitalData["order"]["invoiceType"] = this.invoiceType;
            _satellite.track("genericPageLoad");



            this.tabIndex = 4;
        }
    
        this.changeParams();
    }

    viewUnavailableItems() {
        debugger;
        const cartSession = JSON.parse(JSON.stringify(this._cartService.getCartSession()));
        let itemsList = cartSession['itemsList'];
        const unservicableMsns = JSON.parse(JSON.stringify(this._commonService.itemsValidationMessage))
            .filter(item => item['type'] == 'unservicable')
            .reduce((acc, cv) => {
                return [...acc, ...[cv['msnid']]]
            }, []);
        // const unservicableMsns = this.unServicableItems.map((item) => item['msnid']);
        // const unservicableMsns = this.unServicableItems.map((item) => item['msnid']);
        itemsList = itemsList.filter(item => item['oos'] || unservicableMsns.indexOf(item['productId']) != -1);
        this._modalService.show({
            component: UnAvailableItemsComponent,
            inputs: { data: { page: 'all', items: itemsList, removeUnavailableItems: this.removeUnavailableItems.bind(this) } },
            outputs: {},
            mConfig: { className: 'ex' }
        });
    }

    removeUnavailableItems(items) {
        this._state.notifyDataChanged('cart.rui', items);
    }

    checkoutAddressUpdated(data) {
        /**
         * As feature release: Continue button ions checkout page will be enabled by default 
         * if delivery address and billing address is not avaliable still continue btn will be enabled 
         * is user clicks on continue button then incase address is not avaliable then add new address popup will open 
         * Existing feature : this functionality changes existing function in which continue button will not enabled until address is provided by user
         */
        this.isContinue = true;
    }

    updateShowSocialLogin(data) {
        this.showSocialLogin = data;
    }

    slWorking(data){
        if(!data){
            this.updatedStep(2);
        }
    }

    updatedStep(data) {
        // alert(data);
        this.tabIndex = data;

        this.changeParams();
    }
    
}
