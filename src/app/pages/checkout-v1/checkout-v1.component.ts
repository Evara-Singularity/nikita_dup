import { DOCUMENT } from '@angular/common';
import { Component, Inject, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { makeStateKey, Title, TransferState } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { LocalStorageService } from 'ngx-webstorage';
import { of, Subject } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import CONSTANTS from '../../config/constants';
import { UnAvailableItemsComponent } from '../../modules/unAvailableItems/unAvailableItems.component';
import { GlobalLoaderService } from '../../utils/services/global-loader.service';
import { DeliveryAddressService } from '../../modules/deliveryAddress/deliveryAddress.service';
import { ModalService } from '../../modules/modal/modal.service';
import { ToastMessageService } from '../../modules/toastMessage/toast-message.service';
import { GlobalState } from '../../utils/global.state';
import { LocalAuthService } from '../../utils/services/auth.service';
import { CartService } from '../../utils/services/cart.service';
import { CheckoutService } from '../../utils/services/checkout.service';
import { CommonService } from '../../utils/services/common.service';
import { DataService } from '../../utils/services/data.service';
import { FooterService } from '../../utils/services/footer.service';

const ICWL: any = makeStateKey<boolean>('ICWL'); // ICWL: Is Checkout Window Loaded
declare let dataLayer;
declare var digitalData: {};
declare let _satellite;

@Component({
  selector: 'app-checkout-v1',
  templateUrl: './checkout-v1.component.html',
  styleUrls: ['./checkout-v1.component.scss']
})
export class CheckoutV1Component implements OnInit {

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
  shippingAddressPincode;
  headerStep = 1;
  // invoiceTypeForm: FormGroup;
  isCheckoutResolved: boolean;
  itemsCount: number;
  buyNow: boolean;
  @Input() checkoutBackPath: Subject<any>;
  isContinue = true;
  set showLoader(value) {
    this.loaderService.setLoaderState(value);
  }

  constructor(
    private _modalService: ModalService,
    public _dataService: DataService,
    private _router: Router,
    public _state: GlobalState,
    private _activatedRoute: ActivatedRoute,
    private _tState: TransferState,
    private formBuilder: FormBuilder,
    private _cartService: CartService,
    public router: Router,
    private title: Title,
    public footerService: FooterService,
    @Inject(DOCUMENT) private _document: any,
    private _localStorageService: LocalStorageService,
    private _localAuthService: LocalAuthService,
    private _commonService: CommonService,
    private loaderService: GlobalLoaderService,
    private _checkoutService: CheckoutService,
    private _deliveryAddressService: DeliveryAddressService,
    private _tms: ToastMessageService) {

    const state = this.router.getCurrentNavigation().extras.state;
    if (state && state['buyNow']) {
      this.buyNow = state['buyNow'];
      this._cartService.buyNow = state['buyNow'];
    }

    this.itemsValidationMessage = [];
    this.invoiceType = this._checkoutService.getInvoiceType();

    this.isServer = _commonService.isServer;
    this.isBrowser = _commonService.isBrowser;
    this.windowWidth = this.isBrowser ? window.innerWidth : undefined;

    if (this.isServer) {
      this._tState.set(ICWL, true);
      return;
    }

    this.user = this.isBrowser ? this._localAuthService.getUserSession() : null;
    //ODP-1244
    // _activatedRoute.queryParams.subscribe(p => {
    //   if (p.index < this.tabIndex) {
    //     this.tabIndex = parseInt(p.index);
    //     this._checkoutService.setCheckoutTabIndex(this.tabIndex);
    //   }
    // });

    this.showSocialLogin = true;
    if (this.isBrowser) {
      this.windowWidth = window.innerWidth;
      this.getBusinessDetails();
    }
    this.title.setTitle('Checkout-Moglix.com');

    //ODP-1244
    // this.tabIndex = 1;
    // this._checkoutService.setCheckoutTabIndex(this.tabIndex);
    this._cartService.isCartEditButtonClick = false;

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
    this.tabIndex = this._checkoutService.getCheckoutTabIndex();
  }

  ngOnInit(): void {

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
    }

    this._state.subscribe("routeChanged", (tab) => {
      //  ;
      if (tab > 1) {
        this.tabIndex = tab;
        this._checkoutService.setCheckoutTabIndex(this.tabIndex);
        // this.changeParams();
        if (this.tabIndex == 2) {
          this.headerStep = 1;
        }
      } else {
        this._state.notifyDataChanged('checkoutRoutChanged', null);
      }
    });

    /**
     * Only update session when buynow is false
     */
    if (!this._cartService.buyNow) {
      this.getSession();
    } else if (this._cartService.buyNow && userSession && userSession['authenticated'] == "true") {
      this.getSession();
    } else {
      this.isCheckoutResolved = true;
    }

    this.footerService.setFooterObj({ footerData: false });
    this.footerService.footerChangeSubject.next(this.footerService.getFooterObj());

    if (this.isBrowser) {
      dataLayer.push({
        'event': 'setEmail',
        'email': (userSession && userSession.email) ? userSession.email : '',
      });
      this._commonService.setWindowLoaded();
    }
    
    this.intialCheckoutVisit();
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

  gotoAddress() {
    const user = this._localStorageService.retrieve('user');
    if (user && user.authenticated === 'true') {
      this.tabIndex = 2;
      this._checkoutService.setCheckoutTabIndex(this.tabIndex);
      // this.changeParams();
    }
  }



  getSession() {
    this._commonService.getSession()
      .pipe(
        map((res) => res),
        mergeMap((gs) => {
          this._localAuthService.setUserSession(gs);
          let params = { "sessionid": gs["sessionId"] };
          if (this._cartService.buyNow) {
            params['buyNow'] = this._cartService.buyNow;
          }
          return this._cartService.getCartBySession(params);
        }),
        mergeMap((cartSession) => {
          //  ;
          this.isCheckoutResolved = true;
          if (this.isServer)
            return of(null);
          /**
           * return cartsession, if session id missmatch
           */
          if (cartSession['statusCode'] != undefined && cartSession['statusCode'] == 202)
            return of(cartSession);
          //                                  
          return this.getShippingValue(cartSession);
        }),
      )
      .subscribe((cartSession) => {
        //  ;
        if (cartSession && cartSession['statusCode'] != undefined && cartSession['statusCode'] == 200) {
          const cs = this._cartService.updateCart(cartSession);
          this._cartService.setCartSession(cs);
          setTimeout(() => {
            this.cartSessionUpdated$.next(cartSession);
          }, 100);
          this._cartService.orderSummary.next(cartSession);
          this._cartService.cart.next(cartSession["cart"] != undefined ? cartSession['noOfItems'] : 0);

          const buyNow = this._cartService.buyNow;
          if (cartSession["noOfItems"] == 0 && !buyNow) {
            this._router.navigateByUrl('/quickorder');
          }
        } else if (cartSession['statusCode'] != undefined && cartSession['statusCode'] == 202) {
          const cs = this._cartService.updateCart(cartSession['cart']);
          this._cartService.setCartSession(cs);
          setTimeout(() => {
            this.cartSessionUpdated$.next(cs);
          }, 100);
          this._cartService.orderSummary.next(cs);
          this._cartService.cart.next(cs["cart"] != undefined ? cs['noOfItems'] : 0);

          this._localAuthService.setUserSession(cartSession['userData']);
          this._localAuthService.logout$.emit();
          if (cs["noOfItems"] == 0) {
            this._router.navigateByUrl('/quickorder');
          }
        }

        this.itemsCount = this._cartService.getCartSession()['itemsList'].length;
      })
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

  tabIndexUpdated(index): void {

    const invoiceType = this._checkoutService.getInvoiceType();
    const checkoutAddress = this._checkoutService.getCheckoutAddress();
    const billingAddress = this._checkoutService.getBillingAddress();

    if (!checkoutAddress) {
      this._deliveryAddressService.openNewAddressForm(1);
      return;
    }

    if (invoiceType == 'tax' && !billingAddress) {
      this._deliveryAddressService.openNewAddressForm(2);
      return;
    }

    if (billingAddress) {
      if (!billingAddress['gstinVerified']) {
        this._deliveryAddressService.openEditBillingAddressForm({ billingAddress: billingAddress });
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
      if (this.cartData["itemsList"][p]['bulkPrice'] != '' && this.cartData["itemsList"][p]['bulkPrice'] != null) {
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
    } else if (index == 3) {
      this.tabIndex = 4;
    } else if (index != 1) {
      this.tabIndex += 2;
    }
    this._checkoutService.setCheckoutTabIndex(this.tabIndex);

    if (this.tabIndex === 2) {
      // this.scrollToNewTab('#deliveryAddress');

    }
    if (this.tabIndex === 3) {

      digitalData["page"]["pageName"] = "moglix:order checkout:product summary",
        digitalData["page"]["channel"] = "checkout",
        digitalData["page"]["subSection"] = "moglix:order checkout:product summary ",
        //digitalData["page"]["pincode"] = this.shippingAddressPincode;
        digitalData["order"]["invoiceType"] = this.invoiceType;

      if (_satellite) {
        _satellite.track("genericPageLoad");
      }

      // this.scrollToNewTab('#businessDetail');
    }
    if (this.tabIndex === 4 && index != 5) {
      this.headerStep = 2;
      this.tabIndex = 2;
      this._checkoutService.setCheckoutTabIndex(this.tabIndex);
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
      if (_satellite) {
        _satellite.track("genericPageLoad");
      }
      this.tabIndex = 4;
      this._checkoutService.setCheckoutTabIndex(this.tabIndex);
    }
    // incase navigates back from payment tab to address page
    this.intialCheckoutVisit();
    // this.changeParams();
  }

  changeParams() {
    console.log('continue tabIndexUpdated this.index==>', this.tabIndex);
    this.router.navigate(
      [],
      {
        relativeTo: this._activatedRoute,
        replaceUrl: true,
        queryParams: { index: this.tabIndex },
        queryParamsHandling: "merge"
      })

  }

  intialCheckoutVisit() {
    console.log('continue tabIndexUpdated this.index==>', this.tabIndex);
    if (this.tabIndex == 2) {
      let page = {};
      digitalData["page"] = page;
      digitalData["page"]["pageName"] = "moglix: order checkout: product summary & address details",
        digitalData["page"]["channel"] = "checkout",
        digitalData["page"]["subSection"] = "moglix: order checkout: product summary & address details"
      digitalData['page']['linkName'] = '',
        digitalData['page']['linkPageName'] = ''
      // if(typeof _satellite !== "undefined"){
        if(_satellite){
          _satellite.track("genericPageLoad");
        }
      // } 
    }
  }

  viewUnavailableItems() {
    // console.log('continue viewUnavailableItems ==>', 'called');

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

  updatedStep(data) {
    console.log('continue login using cred step update ==>', data);
    this.tabIndex = data;
    this._checkoutService.setCheckoutTabIndex(this.tabIndex);
    this.changeParams();
  }

  slWorking(data) {
    if (!data) {
      //console.log('continue login using social step update ==>', data);
      this.updatedStep(2);
    }
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

  unServicableItemsUpdated(unServicableItems) {
    console.log(unServicableItems);
    const itemsValidationMessage = this._commonService.itemsValidationMessage;
    this.itemsValidationMessage = itemsValidationMessage;
    // this.itemsValidationMessage = [...this.itemsValidationMessage, ...unServicableItems];
  }

  itemsValidationMessageUpdated(itemsValidationMessage) {
    console.log(itemsValidationMessage);
    itemsValidationMessage = this._commonService.itemsValidationMessage;
    this.itemsValidationMessage = itemsValidationMessage;
  }


}
