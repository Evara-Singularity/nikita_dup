import { CommonService } from '@app/utils/services/common.service';
import { GlobalAnalyticsService } from '@app/utils/services/global-analytics.service';
import { AfterViewInit, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CONSTANTS } from '@app/config/constants';
import { ToastMessageService } from '@app/modules/toastMessage/toast-message.service';
import { ClientUtility } from '@app/utils/client.utility';
import { CheckoutHeaderModel, SelectedAddressModel } from '@app/utils/models/shared-checkout.models';
import { LocalAuthService } from '@app/utils/services/auth.service';
import { GlobalLoaderService } from '@app/utils/services/global-loader.service';
import { AddressService } from '@services/address.service';
import { CartService } from '@services/cart.service';
import { environment } from 'environments/environment';
import { Subject, Subscription } from 'rxjs';

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

    invoiceType = this.INVOICE_TYPES.RETAIL;
    payableAmount = 0;
    isUserLoggedIn = false;
    hasCartItems = true;
    verifyUnserviceableFromCartSubscription = false;//to restrict the verification of unserviceable items on every cart subscription.

    deliveryAddress = null;
    billingAddress = null;
    moveSectionTo = null;
    

    orderSummarySubscription; Subscription = null;
    loginSubscription: Subscription = null;
    logoutSubscription: Subscription = null;
    cartUpdatesSubscription: Subscription = null;

    constructor(public _addressService: AddressService, public _cartService: CartService, private _localAuthService: LocalAuthService,
        private _router: Router, private _toastService: ToastMessageService, private _globalLoader: GlobalLoaderService, private _analytics: GlobalAnalyticsService) { }
    

    ngOnInit(): void
    {
        this._cartService.sendAdobeOnCheckoutOnVisit("address");
        this.updateUserStatus();
        this._cartService.showUnavailableItems = false;
    }

    ngAfterViewInit(): void
    {
        this.cartUpdatesSubscription = this._cartService.getCartUpdatesChanges().subscribe(cartSession =>
        {
            if (cartSession && cartSession.itemsList && cartSession.itemsList.length > 0) {
                this._addressService.cartSession = cartSession;
                this.hasCartItems = this._addressService.cartSession && this._addressService.cartSession['itemsList'] && (this._addressService.cartSession['itemsList']).length > 0;
                if (this._addressService.cartSession['cart'] && Object.keys(this._addressService.cartSession['cart']).length) {
                    this.calculatePayableAmount(this._addressService.cartSession['cart']);
                }
                //address is getting updated and cart session is getting updated with some delay.
                //To verify non-serviceable items after cart session is available for one & only once by using 'verifyUnserviceableFromCartSubscription' flag.
                if (!(this.verifyUnserviceableFromCartSubscription) && (this._addressService.cartSession['itemsList'] as any[]).length) {
                    this._addressService.verifyDeliveryAndBillingAddress(this.invoiceType, this.deliveryAddress, this.billingAddress);
                    this.verifyUnserviceableFromCartSubscription = !(this.verifyUnserviceableFromCartSubscription)
                }
            } else {
                // incase user is redirect from payment page or payment gateway this._cartService.getCartUpdatesChanges() 
                // user will receive empty cartSession.
                // in this case we need explicitly trigger cartSession update.
                this._cartService.checkForUserAndCartSessionAndNotify().subscribe(status =>
                {
                    if (status) {
                        this._cartService.setCartUpdatesChanges(this._addressService.cartSession);
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
    handleAddressEvent(addressInformation: SelectedAddressModel)
    {
        this.invoiceType = addressInformation.invoiceType;
        this.deliveryAddress = addressInformation.deliveryAddress;
        this.billingAddress = addressInformation.billingAddress;
        this._addressService.verifyDeliveryAndBillingAddress(this.invoiceType, this.deliveryAddress, this.billingAddress);
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
    calculatePayableAmount(cart) {
        const TOTAL_AMOUNT = cart['totalAmount'] || 0;
        const SHIPPING_CHARGES = cart['shippingCharges'] || 0;
        const TOTAL_OFFER = cart['totalOffer'] || 0;
        this.payableAmount = TOTAL_AMOUNT + SHIPPING_CHARGES + TOTAL_OFFER;
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

    ngOnDestroy()
    {
        if (this.orderSummarySubscription) this.orderSummarySubscription.unsubscribe();
        if (this.loginSubscription) this.loginSubscription.unsubscribe();
        if (this.logoutSubscription) this.logoutSubscription.unsubscribe();
        if (this.cartUpdatesSubscription) this.cartUpdatesSubscription.unsubscribe();
    }
}
