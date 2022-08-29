import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from '@app/utils/services/common.service';
import { NavigationService } from '@app/utils/services/navigation.service';
import { Subscription } from 'rxjs';
import { CartService } from './../../utils/services/cart.service';
@Component({
	selector: 'cart-header',
	templateUrl: './cart-header.component.html',
	styleUrls: ['./cart-header.component.scss']
})
export class CartHeaderComponent implements OnInit, OnDestroy
{
	readonly REPLACE_URL = { replaceUrl: true };
	@Output() loadSideNav$: EventEmitter<boolean> = new EventEmitter<boolean>();
	@Output() navigateToLogin$: EventEmitter<boolean> = new EventEmitter<boolean>();
	@Output() loadSearchNav$: EventEmitter<boolean> = new EventEmitter<boolean>();
	@Output() goBack$: EventEmitter<boolean> = new EventEmitter<boolean>();
	@Input() noOfCartItems: number = 0;
	@Input() title: string = 'Home';
	@Input() isUserLogin: boolean = false;
	@Input() enableBackBtn: boolean = false;
	@Input() imgAssetPath: boolean = false;
	totalPayableAmount = 0;
	cartUpdatesSubscription: Subscription = null;
	orderId = null;

	constructor(
		public _commonService: CommonService,
		private _cartService: CartService,
		private _naviagtionService: NavigationService,
		private _activatedRoute: ActivatedRoute,
		private _router: Router,
	) { }


	ngOnInit(): void
	{
		//retry payment && Zero Items(checkout+Payment) + Normal Flow
		const queryParams = this._activatedRoute.snapshot.queryParams;
		const orderId = queryParams['orderId'] || queryParams['txnId'];
		if (this.isCheckout && orderId) {
			const retryUrl = this._router.url;
			this._naviagtionService.saveHistory([retryUrl]);
			return;
		}
		this.cartUpdatesSubscription = this._cartService.getCartUpdatesChanges().subscribe(cartSession =>
		{
			//front end created dummy cart session;
			if (!cartSession) return;
			this.totalPayableAmount = this._cartService.getTotalPayableAmount(cartSession['cart']);
			if ((this.isCheckout || this.isPayment) && (cartSession['itemsList'] as any[]).length === 0) {
				this._naviagtionService.handleCartWithZeroItems();
			}
		});
		this.noOfCartItems = this._cartService.getCartItemsCount();
	}

	handleNavigation()
	{
		if (this.isCheckout && this._cartService.buyNow) {
			this._cartService.clearBuyNowFlow();
		}
		this.resetCartChanges();
		this.goBack$.emit();
	}

	resetCartChanges()
	{
		this._cartService.lastPaymentMode = null;
		this._cartService.lastParentOrderId = null;
		this._cartService.invoiceType = null;
		this._cartService.shippingAddress = null;
		this._cartService.billingAddress = null;
	}

	get isQuickorder() { return this.title === "My Cart" }

	get isPayment() { return this.title === "Payment" }

	get isCheckout() { return this.title === "Checkout" }

	get displayCartInfo() { return this.isQuickorder && this.noOfCartItems }

	ngOnDestroy(): void
	{
		if (this.cartUpdatesSubscription) { this.cartUpdatesSubscription.unsubscribe(); }
	}

}
