import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import CONSTANTS from '@app/config/constants';
import { ToastMessageService } from '@app/modules/toastMessage/toast-message.service';
import { CodDetails } from '@app/utils/models/address.modal';
import { InitiateQuickCod } from '@app/utils/models/cart.initial';
import { GlobalAnalyticsService } from '@app/utils/services/global-analytics.service';
import { GlobalLoaderService } from '@app/utils/services/global-loader.service';
import { QuickCodService } from '@app/utils/services/quick-cod.service';
import { RetryPaymentService } from '@app/utils/services/retry-payment.service';
import { CartService } from '@services/cart.service';
import { LocalStorageService } from 'ngx-webstorage';
import { forkJoin } from 'rxjs';
import { concatMap, map } from 'rxjs/operators';
import { BottomMenuComponent } from '../bottomMenu/bottom-menu.component';
import { CommonService } from '@utils/services/common.service';


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
	@Input("userId") userId = null;
	@Input("transactionId") transactionId = null;
	@Input("orderId") orderId = null;
	@Input("shoppingCartDto") shoppingCartDto = {};
	@Output("emitCloseEvent$") emitCloseEvent$: EventEmitter<any> = new EventEmitter<any>();
	@ViewChild(BottomMenuComponent) bottomMenuComponent: BottomMenuComponent;

	hasCartItems = true;
	canCOD = true;
	isBuyNow = false;
	isRehydrationDone = false;

	cartSession = null;
	shippingAddress = null;
	billingAddress = null;
	moveSectionTo = null;
	invoiceType: any;
	shippingPincode = null;
	isValidCartMsg = null;
	prepaidDiscounts = null;
	nonCods = [];
	failureMessage: string = null;

	constructor(
		private _cartService: CartService, 
		private _loaderService: GlobalLoaderService, 
		private _toastService: ToastMessageService, 
		private _localStorageService: LocalStorageService,
		public _router: Router, 
		private _quickCodService: QuickCodService, 
		public localStorageService: LocalStorageService,
    	private globalAnalyticService: GlobalAnalyticsService,
		public _commonService: CommonService,
		private _retryPaymentService: RetryPaymentService,
		private _activatedRoutes: ActivatedRoute) { }

	ngOnInit()
	{
		if(this._activatedRoutes.snapshot.queryParams.failureMessage != "null"){ 
			this.failureMessage = this._activatedRoutes.snapshot.queryParams.failureMessage;
		}else{
			this.failureMessage = 'Transaction was declined due to some technical reason/fault';
		}
		this.initiateRehydration(this.shoppingCartDto);
	}

	ngAfterViewInit()
	{
		this.isBuyNow = this.shoppingCartDto['cart']['buyNow'] || false;
		this._localStorageService.store('flashData', { buyNow: this.isBuyNow });
		this.adobeAnayticInitCall("moglix:payment:transaction:failed", "transaction:failed", "transaction:failed:popup");
	}

	initiateRehydration(shoppingCartDto)
	{
		this._loaderService.setLoaderState(true);

		this.reHydrateAddressesAndCOD(shoppingCartDto).subscribe(results_0 => {
			const codInfo: CodDetails = results_0;
			this.nonCods = codInfo.nonCods || [];
			this.canCOD = (codInfo.iswithInCODLimit && codInfo.nonCods.length === 0 && codInfo.nonServiceables.length === 0);
			this._retryPaymentService.reHydrateCartSession(shoppingCartDto, this.shippingAddress).subscribe(results_1 => {
				this.cartSession = results_1;
				// console.log('cartSession initiateRehydration', results[1]);
				//upfront we are validating for time saving and as this mandatory action
				this.validateCart();
				this.isRehydrationDone = true;
				this._loaderService.setLoaderState(false);
			}, (error) => { this.isRehydrationDone = true; })
		}, (error) => { this.isRehydrationDone = true; })

		// forkJoin([this.reHydrateAddressesAndCOD(shoppingCartDto), this._retryPaymentService.reHydrateCartSession(shoppingCartDto, this.shippingAddress)]).subscribe((results) =>
		// {
		// 	const codInfo: CodDetails = results[0];
		// 	this.nonCods = codInfo.nonCods || [];
		// 	this.canCOD = (codInfo.iswithInCODLimit && codInfo.nonCods.length === 0 && codInfo.nonServiceables.length === 0);
		// 	this.cartSession = results[1];
		// 	// console.log('cartSession initiateRehydration', results[1]);
		// 	//upfront we are validating for time saving and as this mandatory action
		// 	this.validateCart();
		// 	this.isRehydrationDone = true;
		// 	this._loaderService.setLoaderState(false);
		// 	// this.prepaidDiscounts = 
		// },
		// 	(error) => { this.isRehydrationDone = true; })
	}

	reHydrateAddressesAndCOD(shoppingCartDto)
	{
		return this._retryPaymentService.reHydrateAddresses(shoppingCartDto).pipe(
			map(({ shippingAddress, billingAddress, invoiceType }) =>
			{
				this.shippingAddress = shippingAddress;
				this.billingAddress = billingAddress || null;
				this.invoiceType = invoiceType;
				this.prepaidDiscounts = shoppingCartDto['prepaidDiscounts'] || null;
				this.shippingPincode = (shippingAddress && shippingAddress['postCode']) ? shippingAddress['postCode'] : null;
				// console.log('reHydrateAddressesAndCOD', shippingAddress, this.shippingPincode);
				return { shoppingCartDto: shoppingCartDto, shippingPincode: this.shippingPincode, prepaidDiscounts: this.prepaidDiscounts };
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
			this.adobeAnayticInitCall("moglix:payment:transaction:failed:cod", "transaction:failed:cod", "transaction:failed:popup:cod");
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
		this.adobeAnayticInitCall("moglix:payment:transaction:failed:repay", "transaction:failed:repay", "transaction:failed:popup:repay");
		this._cartService.updateNonDeliverableItems(this.cartSession['itemsList'], this.nonCods);
		this.cartSession = this._cartService.generateGenericCartSession(this.cartSession);
		if(this.cartSession['prepaidDiscountList']){
			this._cartService.generatePrepaidSession(this.cartSession['prepaidDiscountList']);
		}
		// console.log('this.cartSession', this.cartSession);
		this._cartService.setGenericCartSession(this.cartSession);
		this.emitCloseEvent(this.lastCartDetails);
	}

	emitCloseEvent(cartInfo) { this.emitCloseEvent$.emit(cartInfo); }

	get lastCartDetails()
	{
		const lastCartInfo = {
			invoiceType: this.invoiceType, 
			shippingAddress: this.shippingAddress, 
			billingAddress: this.billingAddress,
			lastPaymentMode: this.shoppingCartDto['payment']['type'], 
			lastParentOrderId: this.shoppingCartDto['cart']['parentOrderId'],
			buyNow: this.isBuyNow
		}
		return lastCartInfo;
	}

	private adobeAnayticInitCall(pageName, channel, subSection) {
		const user = this.localStorageService.retrieve('user');
		let page = {
			'pageName': pageName,
			'channel': channel,
			'subSection': subSection,
			'loginStatus': (user && user["authenticated"] == 'true') ? "registered user" : "guest"
		};
		let order = {};
		let adobeObj = {};
		adobeObj["page"] = page;
		adobeObj["custData"] = this._commonService.custDataTracking;
		adobeObj["order"] = order;
		this.globalAnalyticService.sendAdobeCall(adobeObj);
	}

	ngOnDestroy() { }
}
