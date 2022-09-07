import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import CONSTANTS from '@app/config/constants';
import { ToastMessageService } from '@app/modules/toastMessage/toast-message.service';
import { CodDetails } from '@app/utils/models/address.modal';
import { InitiateQuickCod } from '@app/utils/models/cart.initial';
import { GlobalLoaderService } from '@app/utils/services/global-loader.service';
import { QuickCodService } from '@app/utils/services/quick-cod.service';
import { RetryPaymentService } from '@app/utils/services/retry-payment.service';
import { CartService } from '@services/cart.service';
import { forkJoin } from 'rxjs';
import { concatMap, map } from 'rxjs/operators';

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
	readonly withLastDetails = true;
	@Input("displayPage") displayPage = false;
	@Input("userId") userId = null;
	@Input("transactionId") transactionId = null;
	@Input("orderId") orderId = null;
	@Input("shoppingCartDto") shoppingCartDto = {};
	@Output("emitCloseEvent$") emitCloseEvent$: EventEmitter<any> = new EventEmitter<any>();

	hasCartItems = true;
	canCOD = true;
	isBuyNow = false;

	cartSession = null;
	shippingAddress = null;
	billingAddress = null;
	moveSectionTo = null;
	invoiceType: any;
	shippingPincode = null;
	isValidCartMsg = null;

	constructor(private _cartService: CartService, private _loaderService: GlobalLoaderService, private _toastService: ToastMessageService,
		public _router: Router, private _quickCodService: QuickCodService, private _retryPaymentService: RetryPaymentService) { }

	ngOnInit()
	{
		this.initiateRehydration(this.shoppingCartDto);
	}

	ngAfterViewInit()
	{
		this.isBuyNow = this.shoppingCartDto['cart']['buyNow'] || false;
	}

	initiateRehydration(shoppingCartDto)
	{
		this._loaderService.setLoaderState(true);
		forkJoin([this.reHydrateAddressesAndCOD(shoppingCartDto), this._retryPaymentService.reHydrateCartSession(shoppingCartDto)]).subscribe((results) =>
		{
			const codInfo: CodDetails = results[0];
			this.canCOD = (codInfo.iswithInCODLimit && codInfo.nonCods.length === 0 && codInfo.nonServiceables.length === 0);
			this.cartSession = results[1];
			//upfront we are validating for time saving and as this mandatory action
			this.validateCart();
			this._loaderService.setLoaderState(false);
		})
	}

	reHydrateAddressesAndCOD(shoppingCartDto)
	{
		return this._retryPaymentService.reHydrateAddresses(shoppingCartDto).pipe(
			map(({ shippingAddress, billingAddress, invoiceType }) =>
			{
				this.shippingAddress = shippingAddress;
				this.billingAddress = billingAddress || null;
				this.invoiceType = invoiceType;
				this.shippingPincode = (shippingAddress && shippingAddress['postCode']) ? shippingAddress['postCode'] : null;
				return { shoppingCartDto: shoppingCartDto, shippingPincode: this.shippingPincode };
			}),
			concatMap(({ shoppingCartDto, shippingPincode }) =>
			{
				return this._quickCodService.checkForCODEligibility(shoppingCartDto['cart']['totalPayableAmount'], shoppingCartDto['itemsList'], shippingPincode);
			}))
	}

	payAsCOD()
	{
		//if pincode is not available then abort the flow
		if (!this.shippingPincode) {
			this._toastService.show({ type: "error", text: "Pincode is not available" })
			return;
		}
		if (this.canCOD) {
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

	validateCart()
	{
		this._retryPaymentService.validateCart(this.cartSession, this.shippingAddress, this.billingAddress, this.invoiceType, this.isBuyNow).subscribe((response) =>
		{
			if (response['status']) {
				this.isValidCartMsg = null;
				return;
			}
			this.isValidCartMsg = response.message;
		})
	}

	pay()
	{
		if (this.isValidCartMsg) {
			this._toastService.show({ type: 'error', text: this.isValidCartMsg });
			return;
		}
		this._cartService.setGenericCartSession(this.cartSession);
		this.emitCloseEvent(this.lastCartDetails);
	}

	emitCloseEvent(cartInfo) { this.emitCloseEvent$.emit(cartInfo); }

	get lastCartDetails()
	{
		const lastCartInfo = {
			invoiceType: this.invoiceType, shippingAddress: this.shippingAddress, billingAddress: this.billingAddress,
			lastPaymentMode: this.shoppingCartDto['payment']['type'], lastParentOrderId: this.shoppingCartDto['cart']['parentOrderId']
		}
		return lastCartInfo;
	}

	ngOnDestroy() { }
}
