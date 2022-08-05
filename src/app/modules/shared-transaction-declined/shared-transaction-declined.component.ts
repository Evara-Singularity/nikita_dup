import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import CONSTANTS from '@app/config/constants';
import { ToastMessageService } from '@app/modules/toastMessage/toast-message.service';
import { AddressService } from '@app/utils/services/address.service';
import { GlobalLoaderService } from '@app/utils/services/global-loader.service';
import { QuickCodService } from '@app/utils/services/quick-cod.service';
import { CartService } from '@services/cart.service';
import { Subscription } from 'rxjs';

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

	cartUpdatesSubscription: Subscription = null;
	hasCartItems = true;
	verifyUnserviceableFromCartSubscription = false;//to restrict the verification of unserviceable items on every cart subscription.

	cartSession = null;
	deliveryAddress = null;
	billingAddress = null;
	moveSectionTo = null;
	invoiceType: any;
	shippingPincode = null;

	constructor(private _cartService: CartService, private _loaderService: GlobalLoaderService, private _toastService: ToastMessageService,
		public _addressService: AddressService, private _quickCodService: QuickCodService) { }

	ngOnInit()
	{
		const params = { customerId: this.userId, invoiceType: "tax" };
		this._loaderService.setLoaderState(true);
		this._addressService.getAddressList(params).subscribe((addresses) =>
		{
			const shippingAddress = (this.shoppingCartDto['addressList'] as any[]).find((address) => { return address['type'] === "shipping" });
			if (shippingAddress['invoiceType'] === "tax") { this.shoppingCartDto['paymentGateway'] = "razorpay" }
			const address = (addresses['deliveryAddressList'] as any[]).find((address) => { return address['idAddress'] === shippingAddress['addressId'] });
			this.shippingPincode = (address && address['postCode']) ? address['postCode'] : null;
			this._loaderService.setLoaderState(false);
		});
	}

	ngAfterViewInit()
	{
		this.isLastPaymentIsCod = (this.shoppingCartDto['payment']['type'] === "COD");
	}

	//ODP-1866:remove if it not required
	payAsCOD()
	{
		//if pincode is not available then abort the flow
		if (!this.shippingPincode) {
			this._toastService.show({ type: "error", text: "Pincode is not available" })
			return;
		}
		//if last method is COD and able to perform COD now
		if (this.isLastPaymentIsCod && this.canCOD) {
			this._quickCodService.quickCODPayment(this.shoppingCartDto, this.shippingPincode, this.userId);
			return;
		}
		//if last payment is NON-COD and able to perform COD now.
		if (!(this.isLastPaymentIsCod) && this.canCOD) {
			this.convertToCODAndPay(this.shoppingCartDto);
		}
	}

	//converts NON-COD to COD shopping cart and pays
	convertToCODAndPay(shoppingCartDto)
	{
		shoppingCartDto['payment'] = { "paymentMethodId": 13, "type": "COD" };
		shoppingCartDto["deliveryMethod"] = { "deliveryMethodId": 77, "type": "kjhlh" };
		this._quickCodService.quickCODPayment(this.shoppingCartDto, this.shippingPincode, this.userId);
	}

	payWithLastDetails()
	{
		//canCode & isLastPaymentIsCode.
		//ODP-1866:set last payment mode to in payment page;
		this._cartService.lastPaymentMode = this.shoppingCartDto['payment']['type'];
		this._cartService.lastPaymentId = this.shoppingCartDto['payment']['paymentMethodId'];
	}

	canCOD()
	{
		const totalAmount = Number(this.shoppingCartDto['cart']['totalPayableAmount']);
		return (totalAmount >= this.MIN_COD_AMOUNT && totalAmount <= this.MAX_COD_AMOUNT);
	}

	close() { this.emitQuickoutCloseEvent$.emit(true) }

	ngOnDestroy()
	{
		if (this.cartUpdatesSubscription) this.cartUpdatesSubscription.unsubscribe();
	}
}
