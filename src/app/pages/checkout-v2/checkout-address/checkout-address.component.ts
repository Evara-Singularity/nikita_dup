import { GlobalAnalyticsService } from '@app/utils/services/global-analytics.service';
import { AfterViewInit, Compiler, Component, ComponentRef, EventEmitter, Injector, Input, NgModuleRef, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CONSTANTS } from '@app/config/constants';
import { ToastMessageService } from '@app/modules/toastMessage/toast-message.service';
import { ClientUtility } from '@app/utils/client.utility';
import { CheckoutHeaderModel } from '@app/utils/models/shared-checkout.models';
import { LocalAuthService } from '@app/utils/services/auth.service';
import { GlobalLoaderService } from '@app/utils/services/global-loader.service';
import { AddressService } from '@services/address.service';
import { CartService } from '@services/cart.service';
import { environment } from 'environments/environment';
import { Subject, Subscription } from 'rxjs';
import { CheckoutUtil } from '../checkout-util';
import { SharedTransactionDeclinedComponent } from '@app/modules/shared-transaction-declined/shared-transaction-declined.component';
import { SharedTransactionDeclinedModule } from '@app/modules/shared-transaction-declined/shared-transaction-declined.module';

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
    //ODP-1866
    transactionId = null;
    orderId = null;
    txnDeclinedInstance: ComponentRef<SharedTransactionDeclinedComponent> = null;
    @ViewChild("txnDeclined", { read: ViewContainerRef })
    txnDeclinedContainerRef: ViewContainerRef;

    @Input("addDeliveryOrBilling") addDeliveryOrBilling: Subject<string> = new Subject();

    invoiceType = this.INVOICE_TYPES.RETAIL;
    payableAmount = 0;
    isUserLoggedIn = false;
    hasCartItems = true;
    verifyUnserviceableFromCartSubscription = false;//to restrict the verification of unserviceable items on every cart subscription.

    deliveryAddress = null;
    billingAddress = null;
    moveSectionTo = null;
    cartSession = null;

    orderSummarySubscription; Subscription = null;
    loginSubscription: Subscription = null;
    logoutSubscription: Subscription = null;
    cartUpdatesSubscription: Subscription = null;

    constructor(public _addressService: AddressService, public _cartService: CartService, private _localAuthService: LocalAuthService, private _activatedRoute: ActivatedRoute, private _compiler: Compiler, private _injector: Injector,
        private _router: Router, private _toastService: ToastMessageService, private _globalLoader: GlobalLoaderService, private _analytics: GlobalAnalyticsService)
    {
        //ODP-1866
        this.transactionId = this._activatedRoute.snapshot.queryParams['transactionId'];
        this.orderId = this._activatedRoute.snapshot.queryParams['orderId'];
    }


    ngOnInit(): void
    {
        if(this.transactionId || this.orderId)
        {
            this.fetchTransactionDetails();
            return;
        }
        this._cartService.sendAdobeOnCheckoutOnVisit("address");
        this.updateUserStatus();
        this._cartService.showUnavailableItems = false;
    }

    ngAfterViewInit(): void
    {
        this.cartUpdatesSubscription = this._cartService.getCartUpdatesChanges().subscribe(cartSession =>
        {
            if (cartSession && cartSession.itemsList && cartSession.itemsList.length > 0) {
                this.cartSession = cartSession;
                this.hasCartItems = this.cartSession && this.cartSession['itemsList'] && (this.cartSession['itemsList']).length > 0;
                if (this.cartSession['cart'] && Object.keys(this.cartSession['cart']).length) {
                    this.calculatePayableAmount(this.cartSession['cart']);
                }
                //address is getting updated and cart session is getting updated with some delay.
                //To verify non-serviceable items after cart session is available for one & only once by using 'verifyUnserviceableFromCartSubscription' flag.
                if (!(this.verifyUnserviceableFromCartSubscription) && (this.cartSession['itemsList'] as any[]).length) {
                    this.verifyDeliveryAndBillingAddress(this.invoiceType, this.deliveryAddress);
                    this.verifyUnserviceableFromCartSubscription = !(this.verifyUnserviceableFromCartSubscription)
                }
            } else {
                // incase user is redirect from payment page or payment gateway this._cartService.getCartUpdatesChanges() 
                // user will receive empty cartSession.
                // in this case we need explicitly trigger cartSession update.
                this._cartService.checkForUserAndCartSessionAndNotify().subscribe(status =>
                {
                    if (status) {
                        this._cartService.setCartUpdatesChanges(this.cartSession);
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

    fetchTransactionDetails()
    {
        this._cartService.getPaymentDetails().subscribe((result)=>{
            //handle status code logic
            //handle loader logic
            this.openTxnDeclinedPopup(result);
        })
    }

    async openTxnDeclinedPopup(lastPaymentData)
    {
        const txnDeclinedModule = await import('./../../../modules/shared-transaction-declined/shared-transaction-declined.module').then(m => m.SharedTransactionDeclinedModule);
        const moduleFactory = await this._compiler.compileModuleAsync(txnDeclinedModule);
        const txnDeclinedModuleRef: NgModuleRef<SharedTransactionDeclinedModule> = moduleFactory.create(this._injector);
        const componentFactory = txnDeclinedModuleRef.instance.resolveComponent();
        this.txnDeclinedInstance = this.txnDeclinedContainerRef.createComponent(componentFactory, null, txnDeclinedModuleRef.injector);
        this.txnDeclinedInstance.instance.displayPage = true;
        this.txnDeclinedInstance.instance.lastPaymentData = lastPaymentData;
        this.txnDeclinedInstance.instance.userId = this._localAuthService.getUserSession()['userId'];
        (this.txnDeclinedInstance.instance["emitQuickoutCloseEvent$"] as EventEmitter<boolean>).subscribe((isClosed) =>
        {
            this.txnDeclinedInstance.instance.displayPage = false;
            this.txnDeclinedInstance = null;
            this.txnDeclinedContainerRef.remove();
            this._router.navigate(['quickorder']);
        });
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
        this.deliveryAddress = address;
        this._cartService.shippingAddress = address;
        this.verifyDeliveryAndBillingAddress(this.invoiceType, this.deliveryAddress);
    }

    handleBillingAddressEvent(address)
    {
        this.billingAddress = address;
        this._cartService.billingAddress = address;
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
        this.verifyServiceablityAndCashOnDelivery(POST_CODE);
    }

    /**
   * @description to extract non-serviceable and COD msns
   * @param postCode deliverable post code
   */
    verifyServiceablityAndCashOnDelivery(postCode)
    {
        const cartItems: any[] = this.cartSession['itemsList'] || [];
        if ((!cartItems) || (cartItems.length === 0)) return;
        const MSNS = cartItems.map(item => item.productId);
        this._addressService.getServiceabilityAndCashOnDelivery({ productId: MSNS, toPincode: postCode }).subscribe((response) =>
        {
            if (!response) return;
            const AGGREGATES = CheckoutUtil.formatAggregateValues(response);
            const NON_SERVICEABLE_MSNS: any[] = CheckoutUtil.getNonServiceableMsns(AGGREGATES);
            const NON_CASH_ON_DELIVERABLE_MSNS: any[] = CheckoutUtil.getNonCashOnDeliveryMsns(AGGREGATES);
            this.updateNonServiceableItems(cartItems, NON_SERVICEABLE_MSNS);
            this.updateNonDeliverableItems(cartItems, NON_CASH_ON_DELIVERABLE_MSNS);
        })
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
        this._cartService.codNotAvailableObj['itemsArray'] = cartItems.filter((item) => nonCashonDeliverableMsns.includes(item.productId));
        this._cartService.cashOnDeliveryStatus.isEnable = (nonCashonDeliverableMsns.length === 0);
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
    }

    /**@description calculates the total payable amount as per cart changes*/
    calculatePayableAmount(cart)
    {
        const TOTAL_AMOUNT = cart['totalAmount'] || 0;
        const SHIPPING_CHARGES = cart['shippingCharges'] || 0;
        const TOTAL_OFFER = cart['totalOffer'] || 0;
        this.payableAmount = (TOTAL_AMOUNT + SHIPPING_CHARGES) - TOTAL_OFFER;
    }

    validateCart()
    {
        this._globalLoader.setLoaderState(true);
        const _cartSession = this._cartService.getCartSession();
        const _shippingAddress = this._cartService.shippingAddress;
        const _billingAddress = this._cartService.billingAddress;
        let cart = _cartSession.cart;
        let obj = {
            "shoppingCartDto": {
                "cart":
                {
                    "cartId": cart["cartId"],
                    "sessionId": cart["sessionId"],
                    "userId": cart["userId"],
                    "agentId": cart["agentId"] ? cart["agentId"] : null,
                    "isPersistant": true,
                    "createdAt": null,
                    "updatedAt": null,
                    "closedAt": null,
                    "orderId": null,
                    "totalAmount": cart["totalAmount"] == null ? 0 : cart["totalAmount"],
                    "totalOffer": cart["totalOffer"] == null ? 0 : cart["totalOffer"],
                    "totalAmountWithOffer": cart["totalAmountWithOffer"] == null ? 0 : cart["totalAmountWithOffer"],
                    "taxes": cart["taxes"] == null ? 0 : cart["taxes"],
                    "totalAmountWithTaxes": cart["totalAmountWithTax"],
                    "shippingCharges": cart["shippingCharges"] == null ? 0 : cart["shippingCharges"],
                    "currency": cart["currency"] == null ? "INR" : cart["currency"],
                    "isGift": cart["gift"] == null ? false : cart["gift"],
                    "giftMessage": cart["giftMessage"],
                    "giftPackingCharges": cart["giftPackingCharges"] == null ? 0 : cart["giftPackingCharges"],
                    "totalPayableAmount": cart["totalAmount"] == null ? 0 : cart["totalAmount"]
                },
                "itemsList": this._cartService.getItemsList(_cartSession.itemsList),
                "addressList": [
                    {
                        "addressId": _shippingAddress.idAddress,
                        "type": "shipping",
                        "invoiceType": this._cartService.invoiceType
                    }
                ],
                "payment": null,
                "deliveryMethod": { "deliveryMethodId": 77, "type": "kjhlh" },
                "offersList": (_cartSession.offersList != undefined && _cartSession.offersList.length > 0) ? _cartSession.offersList : null
            }
        };
        if (this._cartService.buyNow) { obj['shoppingCartDto']['cart']['buyNow'] = true; }
        if (_billingAddress) {
            obj.shoppingCartDto.addressList.push({
                "addressId": _billingAddress.idAddress,
                "type": "billing",
                "invoiceType": this._cartService.invoiceType

            })
        }
        this._cartService.validateCartBeforePayment(obj).subscribe(res =>
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
        this._analytics.sendGTMCall({
            'event': 'checkout',
            'ecommerce': {
                'checkout': {
                    'actionField': { 'step': 3, 'option': 'address' },
                    'products': dlp
                }
            },
        });
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

    ngOnDestroy()
    {
        if (this.orderSummarySubscription) this.orderSummarySubscription.unsubscribe();
        if (this.loginSubscription) this.loginSubscription.unsubscribe();
        if (this.logoutSubscription) this.logoutSubscription.unsubscribe();
        if (this.cartUpdatesSubscription) this.cartUpdatesSubscription.unsubscribe();
    }
}
