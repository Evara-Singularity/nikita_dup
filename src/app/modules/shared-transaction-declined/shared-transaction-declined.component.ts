import { ToastMessageService } from '@app/modules/toastMessage/toast-message.service';
import { LocalAuthService } from '@app/utils/services/auth.service';
import { GlobalLoaderService } from '@app/utils/services/global-loader.service';
import { Router } from '@angular/router';
import { CartService } from '@services/cart.service';
import { GlobalAnalyticsService } from '@app/utils/services/global-analytics.service';
import { DataService } from './../../utils/services/data.service';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import CONSTANTS from '@app/config/constants';
import { CommonService } from '@app/utils/services/common.service';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { LocalStorageService } from 'ngx-webstorage';
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
export class SharedTransactionDeclinedComponent implements OnInit
{
	readonly imgAssetPath = CONSTANTS.IMAGE_ASSET_URL;
	readonly API = CONSTANTS.NEW_MOGLIX_API;
	readonly MAX_COD_AMOUNT = CONSTANTS.GLOBAL.codMax;
	readonly MIN_COD_AMOUNT = CONSTANTS.GLOBAL.codMin;
	@Input("displayPage") displayPage = false;
	@Input("userId") userId = null;
	@Input("lastPaymentData") lastPaymentData = {};
	@Output("emitQuickoutCloseEvent$") emitQuickoutCloseEvent$: EventEmitter<boolean> = new EventEmitter<boolean>();

	constructor(private _dataService: DataService, private _commonService: CommonService, private _globalAnaylytics: GlobalAnalyticsService,
		private _cartService: CartService, private _router: Router, private _localStorageService: LocalStorageService,
		private _globalLoaderService: GlobalLoaderService, private _globalLoader:GlobalLoaderService, private _localAuthService:LocalAuthService,
		private _toastService:ToastMessageService) { }

	ngOnInit(): void
	{
	}

	payWithLastDetails()
	{
		//ODP-1866:set last payment mode to in payment page;
		//call validate api before routing to "checkout/payment"
		this.validateCart(this.lastPaymentData);
	}

	validateCart(lastPaymentData)
	{
		this._cartService.validateCartBeforePayment(lastPaymentData).subscribe(res =>
		{
			this._globalLoader.setLoaderState(false);
			if (res.status && res.statusCode == 200) {
				let userSession = this._localAuthService.getUserSession();
				let criteoItem = [];
				let eventData = {
					'prodId': '', 'prodPrice': 0, 'prodQuantity': 0, 'prodImage': '', 'prodName': '', 'prodURL': ''
				};
				//ODP-1866:update itemsList from lastpaymentdata
				const itemsList:any[] = lastPaymentData['itemsList'];
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
				this._cartService.lastPaymentMode = "";
				this._router.navigate(['/checkout/payment']);
			}
			else {
				this._toastService.show({ type: 'error', text: res.statusDescription });
			}
		});
	}

	//ODP-1866:remove if it not required
	payAsCOD()
	{
		this._dataService.callRestful('GET', `${this.API}/payment/getPaymentId`, { params: { userId: this.userId } }).pipe(
			catchError((e) => of({ 'status': false, 'data': { 'transactionId': null }, 'description': null }))
		).subscribe((response) =>
		{
			if (response['transactionId']) {
				const newData = this.getCODRequestFromLastPayment(this.lastPaymentData, response['transactionId']);
				this.pay(newData);
			}
		})
	}

	//ODP-1866:remove if it not required
	//TODO:check for each payment method
	pay(newdata)
	{
		this.shareAnalytics(newdata);
		this._globalLoaderService.setLoaderState(true);
		this._cartService.pay(newdata).subscribe((res): void =>
		{
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
			this._router.navigate(['order-confirmation'], extras);
		});
	}

	shareAnalytics(newData)
	{
		//TODO:check for each payment method
		this._globalAnaylytics.sendGTMCall({
			'event': 'checkoutStarted',
			'shipping_Information': newData['validatorRequest']['shoppingCartDto']['cart']['shippingCharges'],
			//'city': addressList["city"],//TODO need to hit API
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
		request['requestParams'] = null;
		request['transactionId'] = transactionId;
		request['payment'] = { "paymentMethodId": 13, "type": "COD" };
		return request;
	}

	canCOD()
	{
		const totalAmount = Number(this.lastPaymentData['validatorRequest']['shoppingCartDto']['cart']['totalAmount']);
		return (totalAmount >= this.MIN_COD_AMOUNT && totalAmount <= this.MAX_COD_AMOUNT);
	}

	close() { this.emitQuickoutCloseEvent$.emit(true) }
}
