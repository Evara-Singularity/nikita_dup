import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import CONSTANTS from '@app/config/constants';
import { ToastMessageService } from '@app/modules/toastMessage/toast-message.service';
import { GlobalLoaderService } from '@app/utils/services/global-loader.service';
import { QuickCodService } from '@app/utils/services/quick-cod.service';
import { RetryPaymentService } from '@app/utils/services/retry-payment.service';
import { CartService } from '@services/cart.service';
import { Router } from '@angular/router';
import { InitiateQuickCod } from '@app/utils/models/cart.initial';

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
	@Input("shoppingCartDto") shoppingCartDto = {};
	@Output("emitQuickoutCloseEvent$") emitQuickoutCloseEvent$: EventEmitter<boolean> = new EventEmitter<boolean>();
	isLastPaymentIsCod: boolean = false;

	hasCartItems = true;
	verifyUnserviceableFromCartSubscription = false;//to restrict the verification of unserviceable items on every cart subscription.

	cartSession = null;
	shippingAddress = null;
	billingAddress = null;
	moveSectionTo = null;
	invoiceType: any;
	shippingPincode = null;
	isBuyNow = false;

	constructor(private _cartService: CartService, private _loaderService: GlobalLoaderService, private _toastService: ToastMessageService,
		public _router: Router, private _quickCodService: QuickCodService, private _retryPaymentService: RetryPaymentService) { }

	ngOnInit()
	{
		//to set parentOrderId
		this.reHydrateAddresses(this.shoppingCartDto);
		this.reHydrateCartSession(this.shoppingCartDto);
	}

	ngAfterViewInit()
	{
		this.isLastPaymentIsCod = (this.shoppingCartDto['payment']['type'] === "COD");
		this.isBuyNow = this.shoppingCartDto['cart']['buyNow'] || false;
	}

	//move to shared-transaction
	reHydrateAddresses(shoppingCartDto)
	{
		this._retryPaymentService.reHydrateAddresses(shoppingCartDto).subscribe(({ shippingAddress, billingAddress, invoiceType }) =>
		{
			this.shippingAddress = shippingAddress;
			this.billingAddress = billingAddress;
			this.invoiceType = invoiceType;
			this.shippingPincode = (shippingAddress && shippingAddress['postCode']) ? shippingAddress['postCode'] : null;
		});
	}

	//parentid=orderid
	reHydrateCartSession(shoppingCartDto)
	{
		this._retryPaymentService.reHydrateCartSession(shoppingCartDto).subscribe((cartSession) =>
		{
			this.cartSession = cartSession;
		})
	}

	payAsCOD()
	{
		//if pincode is not available then abort the flow
		if (!this.shippingPincode) {
			this._toastService.show({ type: "error", text: "Pincode is not available" })
			return;
		}
		if(this.canCOD)
		{
			const initiateQuickCod: InitiateQuickCod = {
				cartSession: this.cartSession,
				shippingAddress: this.shippingAddress,
				billingAddress: this.billingAddress,
				invoiceType: this.invoiceType,
				isBuyNow: this.isBuyNow,
				postCode: this.shippingPincode,
				userId: this.userId
			}
			this._quickCodService.initiateQuickCOD(initiateQuickCod);
		}
	}

	payWithLastDetails()
	{
		//canCode & isLastPaymentIsCode.
		//ODP-1866:set last payment mode to in payment page;
		this._loaderService.setLoaderState(true);
		this._cartService.lastPaymentMode = this.shoppingCartDto['payment']['type'];
		this._cartService.lastPaymentId = this.shoppingCartDto['payment']['paymentMethodId'];
		this._retryPaymentService.validateCart(this.cartSession, this.shippingAddress, this.billingAddress, this.invoiceType, this.isBuyNow).subscribe((response) =>
		{
			this._loaderService.setLoaderState(false);
			if (response['status']) {
				this._router.navigate(['/checkout/payment']);
				return;
			}
			this._toastService.show({ type: 'error', text: response.statusDescription });
		})
	}

	canCOD()
	{
		const totalAmount = Number(this.shoppingCartDto['cart']['totalPayableAmount']);
		return (totalAmount >= this.MIN_COD_AMOUNT && totalAmount <= this.MAX_COD_AMOUNT);
	}

	close() { this.emitQuickoutCloseEvent$.emit(true) }

	ngOnDestroy() { }
}
