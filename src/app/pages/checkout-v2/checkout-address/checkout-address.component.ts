import { LocalStorageService } from 'ngx-webstorage';
import { AfterViewInit, Component, ComponentFactoryResolver, EventEmitter, Injector, Input, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CONSTANTS } from '@app/config/constants';
import { ToastMessageService } from '@app/modules/toastMessage/toast-message.service';
import { ClientUtility } from '@app/utils/client.utility';
import { ValidateDto } from '@app/utils/models/cart.initial';
import { CheckoutHeaderModel } from '@app/utils/models/shared-checkout.models';
import { LocalAuthService } from '@app/utils/services/auth.service';
import { GlobalAnalyticsService } from '@app/utils/services/global-analytics.service';
import { GlobalLoaderService } from '@app/utils/services/global-loader.service';
import { AddressService } from '@services/address.service';
import { CartService } from '@services/cart.service';
import { environment } from 'environments/environment';
import { Subject, Subscription } from 'rxjs'; 
import { CheckoutUtil } from '../checkout-util';
import { CartUtils } from './../../../utils/services/cart-utils';
import { CommonService } from '@app/utils/services/common.service';
import { QuickCodService } from '@app/utils/services/quick-cod.service';

@Component({
    selector: 'checkout-address',
    templateUrl: './checkout-address.component.html',
    styleUrls: ['./checkout-address.component.scss'],
})
export class CheckoutAddressComponent implements OnInit, AfterViewInit, OnDestroy
{
    readonly STEPPER: CheckoutHeaderModel[] = [{ label: "ADDRESS & SUMMARY", status: true }, { label: "PAYMENT", status: false }];
    readonly IMG_PATH: string = environment.IMAGE_ASSET_URL;
    readonly INVOICE_TYPES = { RETAIL: "retail", TAX: "tax" };

    @Input("addDeliveryOrBilling") addDeliveryOrBilling: Subject<string> = new Subject();

    // on demand loading of simillarProductsList
    simillarProductsPopupInstance = null;
    @ViewChild("simillarProductsPopup", { read: ViewContainerRef })
    simillarProductsPopupContainerRef: ViewContainerRef;

    invoiceType = this.INVOICE_TYPES.RETAIL;
    payableAmount = 0;
    isUserLoggedIn = false;
    hasCartItems = false;
    verifyUnserviceableFromCartSubscription = false;//to restrict the verification of unserviceable items on every cart subscription.

    deliveryAddress = null;
    billingAddress = null;
    moveSectionTo = null;
    cartSession = null;

    orderSummarySubscription; Subscription = null;
    loginSubscription: Subscription = null;
    logoutSubscription: Subscription = null;
    cartUpdatesSubscription: Subscription = null;
    paymentMode: any;
    addressUpdated = false;
    is_cod_section: number = 0;
    isAllCartAvailableForCod: boolean = false;
    NON_CASH_ON_DELIVERABLE_MSNS: any = [];
    moduleUsedIn: string = 'quick-checkout';

    constructor(public _addressService: AddressService, public _cartService: CartService, private _localAuthService: LocalAuthService, private _activatedRoute: ActivatedRoute,
        private _router: Router, private _toastService: ToastMessageService, private _globalLoader: GlobalLoaderService, private _analytics: GlobalAnalyticsService, private _localStorageService:LocalStorageService, private _commonService: CommonService, private injector: Injector, private  cfr: ComponentFactoryResolver, private quickCodService: QuickCodService)
    {
        
    }

    ngOnInit(): void
    {
        const queryParams = this._activatedRoute.snapshot.queryParams;
        if(this._cartService.quickCheckoutCodMaxErrorMessage !=null){
            this._toastService.show({
                type: "error",
                text: this._cartService.quickCheckoutCodMaxErrorMessage,
              });
            this._cartService.quickCheckoutCodMaxErrorMessage = null;
        }
        
        this._cartService.sendAdobeOnCheckoutOnVisit("address");
        //this._cartService.refreshCartSesion();
        this.updateUserStatus();
        this._cartService.showUnavailableItems = false;
        this._globalLoader.setLoaderState(true);
        this.updateExistingProductsState();
        this.moduleUsedIn = (this._cartService.buyNow != undefined && this._cartService.buyNow == true) ? '' : 'quick-checkout';
    }

    // this will update the products state when any of the products were removed from cart
    updateExistingProductsState() {
        this._cartService.productRemovalNofify().subscribe(value => {
            // console.log(value)
            if (value) {
                const POST_CODE = this.deliveryAddress && this.deliveryAddress['postCode'];
                if (!POST_CODE) return;
                this.verifyServiceablityAndCashOnDelivery(POST_CODE,this.deliveryAddress);
            }
        })
    }

    ngAfterViewInit(): void
    {
        this.addSubscriptions();
        // setTimeout(()=>{
        //     if (!this.deliveryAddress) {
        //         this.addDeliveryOrBilling.next("Delivery");
        //         return;
        //     }
        // },800)
    }

    addSubscriptions(): void
    {
        this.cartUpdatesSubscription = this._cartService.getCartUpdatesChanges().subscribe(cartSession =>
        {
            this._globalLoader.setLoaderState(false);
            if (cartSession && cartSession.itemsList && cartSession.itemsList.length > 0) {
                this.cartSession = cartSession;
                this.hasCartItems = this.cartSession && this.cartSession['itemsList'] && (this.cartSession['itemsList']).length > 0;
                if (this.cartSession['cart'] && Object.keys(this.cartSession['cart']).length) {
                    this.calculatePayableAmount(this.cartSession['cart']);
                }
                //address is getting updated and cart session is getting updated with some delay.
                //To verify non-serviceable items after cart session is available for one & only once by using 'verifyUnserviceableFromCartSubscription' flag.
                if (!(this.verifyUnserviceableFromCartSubscription) && (this.cartSession['itemsList'] as any[]).length) {
                    this.invoiceType = this._cartService.invoiceType === "tax" ? this.INVOICE_TYPES.TAX : this.INVOICE_TYPES.RETAIL;
                    this.verifyDeliveryAndBillingAddress(this.invoiceType, this.deliveryAddress);
                    this.verifyUnserviceableFromCartSubscription = !(this.verifyUnserviceableFromCartSubscription)
                }
            } else {
                // incase user is redirect from payment page or payment gateway this._cartService.getCartUpdatesChanges() 
                // user will receive empty cartSession.
                // in this case we need explicitly trigger cartSession update.
                const tempBuyNow = JSON.parse(JSON.stringify({buyNow:this._cartService.buyNow || false})); 
                this._cartService.checkForUserAndCartSessionAndNotify(tempBuyNow['buyNow']).subscribe(status =>
                {
                    if (status) {
                        this._cartService.setCartUpdatesChanges(this._cartService.getCartSession());
                    } else {
                        console.trace('cart refresh failed');
                    }
                })
            }
        });
        this.logoutSubscription = this._localAuthService.logout$.subscribe(() => { this.isUserLoggedIn = false; });
        if (!this.isUserLoggedIn) {
            this.loginSubscription = this._localAuthService.login$.subscribe(() => { this.updateUserStatus(); });
        }
    }

    /** @description updates user status and is used to display the continue CTA*/
    updateUserStatus()
    {
        const USER_SESSION = this._localAuthService.getUserSession();
        if (USER_SESSION && USER_SESSION.authenticated == "true") {
            this.isUserLoggedIn = true;
        }
    }

    //Address Information
    handleDeliveryAddressEvent(address)
    {
        if(address == null){ this.is_cod_section = 1;}
        this.deliveryAddress = address;
        this._cartService.shippingAddress = address;
        this.verifyDeliveryAndBillingAddress(this.invoiceType, this.deliveryAddress);
        this._cartService.callShippingValueApi(this.cartSession);
        this.updateShipping();
    }

    updateShipping() {
        if(this.addressUpdated) {
          const cartSession = this._cartService.getCartSession();
          const sro = this._cartService.getShippingObj(cartSession);
          this._cartService.getShippingValue(sro).subscribe((data) => {
            this._cartService.updateShippingCharges(data, cartSession);
          });
        }
        this.addressUpdated = true;
      }

    handleBillingAddressEvent(address)
    {
        this.billingAddress = address;
        this._cartService.billingAddress = address;
        this.updateShipping();
    }

    /**
     * @description initiates the non-serviceable & non COD items processing
     * @param invoiceType containes retail | tax
     * @param deliveryAddress contains deliverable address
     * @param billingAddress contains billing address and optional for 'retail' case
     */
    verifyDeliveryAndBillingAddress(invoiceType, deliveryAddress)
    {
        if (deliveryAddress) { this._cartService.shippingAddress = deliveryAddress; }
        if (invoiceType) { this._cartService.invoiceType = invoiceType; }
        const POST_CODE = deliveryAddress && deliveryAddress['postCode'];
        if (!POST_CODE) return;
        this.verifyServiceablityAndCashOnDelivery(POST_CODE,deliveryAddress);
    }

    /**
   * @description to extract non-serviceable and COD msns
   * @param postCode deliverable post code
   */
    verifyServiceablityAndCashOnDelivery(postCode,deliveryAddress)
    {
        this.NON_CASH_ON_DELIVERABLE_MSNS = [];
        const cartItems: any[] = this.cartSession['itemsList'] || [];
        if ((!cartItems) || (cartItems.length === 0)) return;
        const MSNS = cartItems.map(item => item.productId);
        let invoiceType = this._cartService.invoiceType;
        const isGstInvoice = invoiceType == this.INVOICE_TYPES.TAX ? true : false; 
        const orderPlatform =CONSTANTS.DEVICE.device;
        const addressId = deliveryAddress && deliveryAddress['idAddress'];
        const cartId = this.cartSession['cart']['cartId'];
        const userId = this.cartSession['cart']['userId'];
       let setTime = false;
        this._addressService.getServiceabilityAndCashOnDelivery({ productId: MSNS, toPincode: postCode , isGstInvoice: isGstInvoice, 
            orderPlatform: orderPlatform ,addressId :addressId ,cartId: cartId , userId: userId}).subscribe((response) =>
        {
            setTime = true
            if (!response) { this.is_cod_section = 1; return};
            const AGGREGATES = CheckoutUtil.formatAggregateValues(response);
            const NON_SERVICEABLE_MSNS: any[] = CheckoutUtil.getNonServiceableMsns(AGGREGATES);
            const NON_CASH_ON_DELIVERABLE_MSNS: any[] = CheckoutUtil.getNonCashOnDeliveryMsns(AGGREGATES);
            this.NON_CASH_ON_DELIVERABLE_MSNS =  NON_CASH_ON_DELIVERABLE_MSNS;
            this.getCodAndPayOnline(NON_CASH_ON_DELIVERABLE_MSNS);
            this.updateNonServiceableItems(cartItems, NON_SERVICEABLE_MSNS);
            this.updateNonDeliverableItems(cartItems, NON_CASH_ON_DELIVERABLE_MSNS);
        },err=>{
            this.is_cod_section = 1;
        })
        setTimeout(()=>{
         if(setTime == false){
            this.is_cod_section = 1;
         }
        },1100)
    }

    getCodAndPayOnline(NON_CASH_ON_DELIVERABLE_MSNS){
        if(NON_CASH_ON_DELIVERABLE_MSNS.length == 0){
            this.isAllCartAvailableForCod = true;
            this.calculatePayableAmount(this.cartSession['cart']);
            this.quickCodService
            .checkCODLimit(this.payableAmount)
            .subscribe((res) => {
              if (res && res["iswithInCODLimit"] == true) {
                this.is_cod_section = 2
              } else {
                this.is_cod_section = 1
              }
            });
        }else{
            this.isAllCartAvailableForCod = false;
            this.is_cod_section = 1;
        }
    }

    /**
    * @description to update the non serviceable items which are used in cart notfications
    * @param contains items is cart
    * @param nonServiceableMsns containes non serviceable msns
    */
    updateNonServiceableItems(cartItems: any[], nonServiceableMsns: any[])
    {
        if (nonServiceableMsns.length) {
            const ITEMS = CheckoutUtil.filterCartItemsByMSNs(cartItems, nonServiceableMsns);
            const NON_SERVICEABLE_ITEMS = CheckoutUtil.formatNonServiceableFromCartItems(ITEMS);
            this._cartService.setUnserviceables(NON_SERVICEABLE_ITEMS);
            return;
        }
        this._cartService.setUnserviceables([]);
        this.sendServiceableCriteo();
    }

    /**@description updates global object to set in COD is available or not and used in payment section */
    updateNonDeliverableItems(cartItems: any[], nonCashonDeliverableMsns: any[])
    {
        this._cartService.updateNonDeliverableItems(cartItems, nonCashonDeliverableMsns);
    }

    /**@description scrolls to payment summary section on click of info icon*/
    scrollPaymentSummary()
    {
        if (document.getElementById('payment_summary')) {
            let footerOffset = document.getElementById('payment_summary').offsetTop;
            ClientUtility.scrollToTop(1000, footerOffset - 30);
        }
    }

    /**@description decides whether to procees to payment or not.*/
    continueToPayment()
    {
        //address verification
        if (!this.deliveryAddress) {
            this.addDeliveryOrBilling.next("Delivery");
            return;
        }
        if (this.invoiceType === this.INVOICE_TYPES.TAX) {
            if (!this.billingAddress) {
                this.addDeliveryOrBilling.next("Billing");
                return;
            } else if (!this.billingAddress['gstinVerified']) {
                this._toastService.show({
                    type: 'error', text: "Either the provided GSTIN is invalid or the entered pincode doesn't match your GST certificate addresses"
                });
                this.addDeliveryOrBilling.next("Billing");
                return;
            }
        }
        //cart verification
        const INVALID_CART_TYPES = ['unserviceable', 'oos'];
        const CART_MESSAGES = JSON.parse(JSON.stringify(this._cartService.getCartNotifications()));
        const INVALID_CART_MESSAGES: any[] = CART_MESSAGES.filter(item => INVALID_CART_TYPES.includes(item['type']));
        if (INVALID_CART_MESSAGES.length) {
            this._cartService.viewUnavailableItems(INVALID_CART_TYPES)
            return;
        }
        this.validateCart();
        this._commonService.adobe_tracking_proceed_to_checkout('proceed_to_checkout');
    }

    /**@description calculates the total payable amount as per cart changes*/
    calculatePayableAmount(cart)
    {
        const TOTAL_AMOUNT = cart['totalAmount'] || 0;
        const SHIPPING_CHARGES = cart['shippingCharges'] || 0;
        const TOTAL_OFFER = cart['totalOffer'] || 0;
        if(!this.isAllCartAvailableForCod){
        this.payableAmount = (TOTAL_AMOUNT + SHIPPING_CHARGES) - TOTAL_OFFER;
        }else{
            this._cartService.getShippingPriceChanges().subscribe(res=>{
                const  SHIPPING_CHARGES = res.cart['shippingCharges'] || 0;
                this.payableAmount = (TOTAL_AMOUNT + SHIPPING_CHARGES) - TOTAL_OFFER;
                if(this.payableAmount > CONSTANTS.GLOBAL.codMin && this.payableAmount < CONSTANTS.GLOBAL.codMax && this.NON_CASH_ON_DELIVERABLE_MSNS.length === 0){
                    this.is_cod_section = 2;
                }else{
                    this.is_cod_section = 1;
                }
            })
        }
    }

    validateCart()
    {
        this._globalLoader.setLoaderState(true);
        const _cartSession = this._cartService.getCartSession();
        const validateDto: ValidateDto = {
            cartSession: _cartSession,
            shippingAddress: this._cartService.shippingAddress,
            billingAddress: this._cartService.billingAddress,
            invoiceType: this._cartService.invoiceType,
            isBuyNow: this._cartService.buyNow
        }
        const validateDtoRquest = CartUtils.getValidateDto(validateDto);
        this._cartService.validateCartBeforePayment(validateDtoRquest).subscribe(res =>
        {
            this._globalLoader.setLoaderState(false);
            if (res.status && res.statusCode == 200) {
                let userSession = this._localAuthService.getUserSession();
                let criteoItem = [];
                let eventData = {
                    'prodId': '', 'prodPrice': 0, 'prodQuantity': 0, 'prodImage': '', 'prodName': '', 'prodURL': ''
                };
                for (let p = 0; p < _cartSession["itemsList"].length; p++) {
                    criteoItem.push({ name: _cartSession["itemsList"][p]['productName'], id: _cartSession["itemsList"][p]['productId'], price: _cartSession["itemsList"][p]['productUnitPrice'], quantity: _cartSession["itemsList"][p]['productQuantity'], image: _cartSession["itemsList"][p]['productImg'], url: CONSTANTS.PROD + '/' + _cartSession["itemsList"][p]['productUrl'] });
                    eventData['prodId'] = _cartSession["itemsList"][p]['productId'] + ', ' + eventData['prodId'];
                    eventData['prodPrice'] = _cartSession["itemsList"][p]['productUnitPrice'] + eventData['prodPrice'];
                    eventData['prodQuantity'] = _cartSession["itemsList"][p]['productQuantity'] + eventData['prodQuantity'];
                    eventData['prodImage'] = _cartSession["itemsList"][p]['productImg'] + ', ' + eventData['prodImage'];
                    eventData['prodName'] = _cartSession["itemsList"][p]['productName'] + ', ' + eventData['prodName'];
                    eventData['prodURL'] = _cartSession["itemsList"][p]['productUrl'] + ', ' + eventData['prodURL'];
                }
                /*Start Criteo DataLayer Tags */
                if (criteoItem && criteoItem.length) {
                    this._analytics.sendGTMCall({
                        'event': 'viewBasket',
                        'email': (userSession && userSession.email) ? userSession.email : '',
                        'currency': 'INR',
                        'productBasketProducts': criteoItem,
                        'eventData': eventData
                    });

                    /*End Criteo DataLayer Tags */
                    this._analytics.sendGTMCall({
                        'event': 'checkout',
                        'ecommerce': {
                            'checkout': {
                                'actionField': { 'step': "address", 'option': 'payment' },
                                'products': criteoItem
                            }
                        },
                    });
                }
                this._cartService.lastPaymentMode = null;
                this._cartService.lastParentOrderId = null;
                this._router.navigate(['/checkout/payment']);
            }
            else {
                this._toastService.show({ type: 'error', text: res.statusDescription });
            }
        });
    }

    /**@description triggers the unavailbel item pop-up from notfications */
    viewUnavailableItemsFromNotifacions(types: string[]) { if (types && types.length) this._cartService.viewUnavailableItems(types); }

    handleInvoiceTypeEvent(invoiceType: string) { this.invoiceType = invoiceType; }

    sendServiceableCriteo()
    {
        let cartSession = this._cartService.getGenericCartSession;
        let dlp = [];
        for (let p = 0; p < cartSession["itemsList"].length; p++) {
            let product = {
                id: cartSession["itemsList"][p]['productId'],
                name: cartSession["itemsList"][p]['productName'],
                price: cartSession["itemsList"][p]['totalPayableAmount'],
                variant: '',
                quantity: cartSession["itemsList"][p]['productQuantity']
            };
            dlp.push(product);
        }
        if(dlp && dlp.length) {
            this._analytics.sendGTMCall({
                'event': 'checkout',
                'ecommerce': {
                    'checkout': {
                        'actionField': { 'step': 3, 'option': 'address' },
                        'products': dlp
                    }
                },
            });
        }
        let userSession = this._localAuthService.getUserSession();
        if (userSession && userSession.authenticated && userSession.authenticated == "true") {
            /*Start Criteo DataLayer Tags */
            this._analytics.sendGTMCall({
                'event': 'setEmail',
                'email': (userSession && userSession.email) ? userSession.email : ''
            });
            /*End Criteo DataLayer Tags */
        }
    }

    async openSimillarProductsPopUp(event) {
        const msnid = event["productId"];
        const data = event["item"];
        const { SimillarProductsPopupComponent } = await import(
          "../../../components/simillar-products-popup/simillar-products-popup.component"
        ).finally();
        const factory = this.cfr.resolveComponentFactory(
          SimillarProductsPopupComponent
        );
        this.simillarProductsPopupInstance =
          this.simillarProductsPopupContainerRef.createComponent(
            factory,
            null,
            this.injector
          );
        this.simillarProductsPopupInstance.instance["msnid"] = msnid;
        this.simillarProductsPopupInstance.instance["productName"] =
          data.productName;
        (
          this.simillarProductsPopupInstance.instance[
            "closePopup$"
          ] as EventEmitter<any>
        ).subscribe((res) => {
          this.simillarProductsPopupContainerRef.remove();
          this.simillarProductsPopupInstance = null;
        });
    }

    continueToPayment$(){
        this.continueToPayment();
    }
    
    ngOnDestroy()
    {
        if (this.orderSummarySubscription) this.orderSummarySubscription.unsubscribe();
        if (this.loginSubscription) this.loginSubscription.unsubscribe();
        if (this.logoutSubscription) this.logoutSubscription.unsubscribe();
        if (this.cartUpdatesSubscription) this.cartUpdatesSubscription.unsubscribe();
        if (this.simillarProductsPopupInstance) {
            this.simillarProductsPopupInstance = null;
            this.simillarProductsPopupContainerRef.remove();
        }
        this._cartService.showNotification = false;
    }
}