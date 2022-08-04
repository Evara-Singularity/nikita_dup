import { ToastMessageService } from '@app/modules/toastMessage/toast-message.service';
import { LocalAuthService } from '@app/utils/services/auth.service';
import { GlobalLoaderService } from '@app/utils/services/global-loader.service';
import { Router } from '@angular/router';
import { CartService } from '@services/cart.service';
import { GlobalAnalyticsService } from '@app/utils/services/global-analytics.service';
import { DataService } from './../../utils/services/data.service';
import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import CONSTANTS from '@app/config/constants';
import { CommonService } from '@app/utils/services/common.service';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { LocalStorageService } from 'ngx-webstorage';
import { HttpErrorResponse } from '@angular/common/http';
import { Subject, Subscription } from 'rxjs';
import { AddressService } from '@app/utils/services/address.service';
import { CheckoutUtil } from '@app/pages/checkout-v2/checkout-util';


export const PaymentMode =
{
	"COD": "pay-initiated:cash on delivery",
	"CC": "pay-initiated:credit card",
	"DC": "pay-initiated:debit card",
	"EMI": "pay-initiated:emi",
	"NEFT": "pay-initiated:neft-rtgs",
	"NB": "pay-initiated:net banking",
	"PAYTM": "pay-initiated:paytm-upi",
	"card_mode": "pay-initiated:saved card",
	"TEZ": "pay-initiated:upi",
	"UPT": "pay-initiated:upi",
	"WALLET": "pay-initiated:wallet"
}

@Component({
	selector: 'shared-transaction-declined',
	templateUrl: './shared-transaction-declined.component.html',
	styleUrls: ['./shared-transaction-declined.component.scss']
})
export class SharedTransactionDeclinedComponent implements OnInit, AfterViewInit, OnDestroy
{
	readonly imgAssetPath = CONSTANTS.IMAGE_ASSET_URL;
	readonly API = CONSTANTS.NEW_MOGLIX_API;
	readonly MAX_COD_AMOUNT = CONSTANTS.GLOBAL.codMax;
	readonly MIN_COD_AMOUNT = CONSTANTS.GLOBAL.codMin;
	@Input("displayPage") displayPage = false;
	@Input("userId") userId = null;
	@Input("transactionId") transactionId = null;
	@Input("orderId") orderId = null;
	@Input("lastPaymentData") lastPaymentData = {};
	@Output("emitQuickoutCloseEvent$") emitQuickoutCloseEvent$: EventEmitter<boolean> = new EventEmitter<boolean>();
	isCod: boolean = false;

    cartUpdatesSubscription: Subscription = null;
	hasCartItems = true;
    verifyUnserviceableFromCartSubscription = false;//to restrict the verification of unserviceable items on every cart subscription.

   cartSession = null;
   deliveryAddress = null;
    billingAddress = null;
    moveSectionTo = null;
	invoiceType: any;

	constructor(private _dataService: DataService, private _commonService: CommonService, private _globalAnaylytics: GlobalAnalyticsService,
		private _cartService: CartService, private _router: Router, private _localStorageService: LocalStorageService,
		private _globalLoaderService: GlobalLoaderService, private _globalLoader:GlobalLoaderService, private _localAuthService:LocalAuthService,
		private _toastService:ToastMessageService, public _addressService: AddressService,) { }

	ngOnInit(): void
	{
		this.lastPaymentData['validatorRequest'] = this.lastPaymentData['lastPayment']['data'];
		delete this.lastPaymentData['lastPayment']['data'];
		console.log("lastPaymentData --->>>", this.lastPaymentData)

	}


	ngAfterViewInit(): void
    {
        this.cartUpdatesSubscription = this._cartService.getCartUpdatesChanges().subscribe(cartSession =>
        {
            console.log("cartSession -->>>", cartSession)
            if (cartSession && cartSession.itemsList && cartSession.itemsList.length > 0) {
                this.cartSession = cartSession;
                this.hasCartItems = this.cartSession && this.cartSession['itemsList'] && (this.cartSession['itemsList']).length > 0;
                //address is getting updated and cart session is getting updated with some delay.
                //To verify non-serviceable items after cart session is available for one & only once by using 'verifyUnserviceableFromCartSubscription' flag.
                if (!(this.verifyUnserviceableFromCartSubscription) && (this.cartSession['itemsList'] as any[]).length) {
                    console.log("this.deliveryAddress --->>>", this.deliveryAddress)
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
    }

	verifyDeliveryAndBillingAddress(invoiceType, deliveryAddress)
    {
        if (deliveryAddress) { this._cartService.shippingAddress = deliveryAddress; }
        if (invoiceType) { this._cartService.invoiceType = invoiceType; }
        const POST_CODE = deliveryAddress && deliveryAddress['postCode'];
        if (!POST_CODE) return;
        this.verifyServiceablityAndCashOnDelivery(POST_CODE);
    }

	verifyServiceablityAndCashOnDelivery(postCode)
    {
        console.log('cod this.cartSession -->>', this.cartSession)
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
		 this._globalAnaylytics.sendGTMCall({
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
			 this._globalAnaylytics.sendGTMCall({
				 'event': 'setEmail',
				 'email': (userSession && userSession.email) ? userSession.email : ''
			 });
			 /*End Criteo DataLayer Tags */
		 }
	 }


	payWithLastDetails()
	{
		console.log("retry", this.lastPaymentData)
		//ODP-1866:set last payment mode to in payment page;
		this._cartService.lastPaymentMode = this.lastPaymentData['validatorRequest']['shoppingCartDto']['payment']['type'];
		this._cartService.lastPaymentId = this.lastPaymentData['validatorRequest']['shoppingCartDto']['payment']['paymentMethodId'];
		
		console.log("this._cartService.lastPaymentMode --->>", this._cartService.lastPaymentMode)
		//call validate api before routing to "checkout/payment"
		this.validateCart(this.lastPaymentData);
	}

	validateCart(lastPaymentData)
	{
		this._cartService.validateCartBeforePayment(lastPaymentData['validatorRequest']).subscribe(res =>
		{
			console.log("validateCartBeforePayment res -->>", res)
			this._globalLoader.setLoaderState(false);
			if (res.statusCode == 200) {
				let userSession = this._localAuthService.getUserSession();
				let criteoItem = [];
				let eventData = {
					'prodId': '', 'prodPrice': 0, 'prodQuantity': 0, 'prodImage': '', 'prodName': '', 'prodURL': ''
				};
				//ODP-1866:update itemsList from lastpaymentdata
				console.log("1111aaaa", userSession)
				const itemsList:any[] = lastPaymentData['validatorRequest']['shoppingCartDto']['itemsList'];
				for (let p = 0; p < itemsList.length; p++) {
					criteoItem.push({ name: itemsList[p]['productName'], id: itemsList[p]['productId'], price: itemsList[p]['productUnitPrice'], quantity: itemsList[p]['productQuantity'], image: itemsList[p]['productImg'], url: CONSTANTS.PROD + '/' + itemsList[p]['productUrl'] });
					eventData['prodId'] = itemsList[p]['productId'] + ', ' + eventData['prodId'];
					eventData['prodPrice'] = itemsList[p]['productUnitPrice'] + eventData['prodPrice'];
					eventData['prodQuantity'] = itemsList[p]['productQuantity'] + eventData['prodQuantity'];
					eventData['prodImage'] = itemsList[p]['productImg'] + ', ' + eventData['prodImage'];
					eventData['prodName'] = itemsList[p]['productName'] + ', ' + eventData['prodName'];
					eventData['prodURL'] = itemsList[p]['productUrl'] + ', ' + eventData['prodURL'];
				}
				/*Start Criteo DataLayer Tags */
				this._globalAnaylytics.sendGTMCall({
					'event': 'viewBasket',
					'email': (userSession && userSession.email) ? userSession.email : '',
					'currency': 'INR',
					'productBasketProducts': criteoItem,
					'eventData': eventData
				});
				/*End Criteo DataLayer Tags */

				this._globalAnaylytics.sendGTMCall({
					'event': 'checkout',
					'ecommerce': {
						'checkout': {
							'actionField': { 'step': "address", 'option': 'payment' },
							'products': criteoItem
						}
					},
				});
				if(this.isCod) {
					    this.pay(lastPaymentData)
						this._cartService.lastPaymentMode = '';
					}else{
						this._router.navigate(['/checkout/payment']);
					}
			}
			else {
				this._toastService.show({ type: 'error', text: res.statusDescription });
			}
		});
	}

	//ODP-1866:remove if it not required
	payAsCOD()
	{
		let currUser = this._localAuthService.getUserSession();
		 this.getPaymentId({userId: currUser['userId']}).subscribe(res => {
            if(res && res['status']) {
                this.transactionId = res['data']['transactionId'];
				const newData = this.getCODRequestFromLastPayment(this.lastPaymentData, this.transactionId);
				this.isCod = true;
				this.validateCart(newData)
				//this.pay(newData);
            }
        });

		// this.isCod = true;
		// const newData = this.getCODRequestFromLastPayment(this.lastPaymentData, this.transactionId);
		// this.validateCart(newData)
		//this.pay(newData);
	}

	//ODP-1866:remove if it not required
	//TODO:check for each payment method
	pay(newdata)
	{
		console.log("pay newdata --->>>", newdata)
		this.shareAnalytics(newdata);
		this._globalLoaderService.setLoaderState(true);
		this._cartService.pay(newdata).subscribe((res): void =>
		{
			console.log("cod res --->>>", res)
			this._globalLoaderService.setLoaderState(false);
			if (res.status != true) {
				//TODO:check for success code for each payment
				//TODO:need to write logic for redirecting to payment again
				return;
			}
			let data = res.data;
			let extras = {
				queryParams: {
					mode: 'COD',
					orderId: data.orderId,
					transactionAmount: data.orderAmount
				},
				replaceUrl: true
			};
			this._commonService.isBrowser && this.updateBuyNowToLocalStorage();
			//this._router.navigate(['order-confirmation'], extras);
		});
	}

	shareAnalytics(newData)
	{
		let addressList = this._cartService.shippingAddress as any;
		console.log("shiiping address --->>>", addressList["isGstInvoice"] != null)
		//TODO:check for each payment method
		let shippingInformation = {
            'shippingCost': newData['validatorRequest']['shoppingCartDto']['cart']['shippingCharges'],
            'couponUsed': newData['validatorRequest']['shoppingCartDto']['cart']['totalOffer'],
            'GST': addressList["isGstInvoice"] != null ? 'Yes' : 'No',
        };
		this._globalAnaylytics.sendGTMCall({
			'event': 'checkoutStarted',
			'shipping_Information':shippingInformation,
			'city': addressList["city"],//TODO need to hit API
			'paymentMode': 'COD'
		});
		this._globalAnaylytics.sendAdobeOrderRequestTracking(newData, PaymentMode[newData]);
	}

	updateBuyNowToLocalStorage()
	{
		const buyNow = this._cartService.buyNow;
		if (buyNow) {
			this._localStorageService.store('flashData', { buyNow: true });
		} else {
			this._localStorageService.clear('flashData');
		}
	}

	getCODRequestFromLastPayment(request, transactionId)
	{
		request['mode'] = "COD";
		request['paymentId'] = 13;
		request["platformCode"]= "online",
		request['requestParams'] = null,
		request['transactionId'] = transactionId;
		request['validatorRequest']['shoppingCartDto']['payment'] = { "paymentMethodId": 13, "type": "COD" };
		request['validatorRequest']['shoppingCartDto']['cart']['parentOrderId'] = this.orderId;
		request['validatorRequest']['shoppingCartDto']["deliveryMethod"]= { "deliveryMethodId": 77, "type": "kjhlh" },
		delete request['lastPayment'];
		delete request['validatorRequest']['shoppingCartDto']['noOfItems'];
		delete request['validatorRequest']['shoppingCartDto']['userInfo'];
		console.log("resuqest data -->>>", request);
		return request;
	}

	canCOD()
	{
		const totalAmount = Number(this.lastPaymentData['validatorRequest']['shoppingCartDto']['cart']['totalAmount']);
		return (totalAmount >= this.MIN_COD_AMOUNT && totalAmount <= this.MAX_COD_AMOUNT);
	}

	close() { this.emitQuickoutCloseEvent$.emit(true) }

	getPaymentId(data) {
        return this._dataService.callRestful('GET', CONSTANTS.NEW_MOGLIX_API + '/payment/getPaymentId', {params: data}).pipe(
            catchError((e) => of({'status': false, 'data': {'transactionId': null}, 'description': null}))
        );
    }

	ngOnDestroy()
    {
        if (this.cartUpdatesSubscription) this.cartUpdatesSubscription.unsubscribe();
    }
}
