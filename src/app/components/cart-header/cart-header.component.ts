import { Location } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService } from '@app/utils/services/common.service';
import { GlobalLoaderService } from '@app/utils/services/global-loader.service';
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

	constructor(
		public _commonService: CommonService,
		private _cartService: CartService,
		private _router: Router,
		private _loader: GlobalLoaderService,
		private _location: Location,
	) { }

	ngOnInit(): void
	{
		this._loader.setLoaderState(true);
		this.cartUpdatesSubscription = this._cartService.getCartUpdatesChanges().subscribe(cartSession =>
		{
			this.noOfCartItems = this._cartService.getCartItemsCount();
			this.totalPayableAmount = this._cartService.getTotalPayableAmount(cartSession['cart']);
			this._loader.setLoaderState(false);
		});
	}

	handleNavigation()
	{
		this.goBack$.emit();
		// const url = this._router.url;
		// const previousURL = this._commonService.previousUrl;
		// switch (this.title) {
		// 	case 'My Cart': {
		// 		this.handleMyCartNavigation(url, previousURL);
		// 		break;
		// 	}
		// 	case 'Checkout': {
		// 		this.handleCheckoutNavigation(url, previousURL);
		// 		break;
		// 	}
		// 	case 'Payment': {
		// 		this.handlePaymentNavigation(url, previousURL);
		// 		break;
		// 	}
		// }
	}

	handleMyCartNavigation(url: string, previousURL: string)
	{
		const trace = { Page:'Quickorder', 'Buy Now': this._cartService.buyNow, CurrentURL: url, PreviousURL: previousURL };
		console.table(trace);
		const isBuyNow = this._cartService.buyNow;
		if (isBuyNow) { this._cartService.clearBuyNowFlow(); }
		if (previousURL.includes("checkout") || previousURL.includes("quickorder")) {
			this._router.navigateByUrl('/', this.REPLACE_URL);
			return;
		}
		this._location.back();
	}

	handleCheckoutNavigation(url: string, previousURL: string)
	{
		const isBuyNow = this._cartService.buyNow;
		const trace = { Page: 'Checkout', 'Buy Now': isBuyNow, CurrentURL: url, PreviousURL: previousURL };
		console.table(trace);
		debugger;
		if (isBuyNow) {
			if (previousURL.includes('checkout')) {
				this._router.navigateByUrl('/quickorder', this.REPLACE_URL);
				return;
			}
			if (previousURL.includes('quickorder')) {
				this._router.navigateByUrl("quickorder");
				return;
			}
			this._router.navigateByUrl(previousURL || "/");
		}
		if (previousURL.includes('checkout')) {
			this._router.navigateByUrl("quickorder", this.REPLACE_URL);
			return;
		}
		if (previousURL !== "/") {
			this._router.navigateByUrl(previousURL);
			return
		}
		this._location.back();
	}

	handlePaymentNavigation(url: string, previousURL: string)
	{
		this._router.navigateByUrl('/checkout/address', this.REPLACE_URL);
		this._router.routeReuseStrategy.shouldReuseRoute = () => { return false; };
	}

	get isQuickorder() { return this.title === "My Cart" }

	get isPayment() { return this.title === "Payment" }

	get isCheckout() { return this.title === "Checkout" }

	get displayCartInfo() { return this.isQuickorder && this.noOfCartItems }

	ngOnDestroy(): void
	{
		this.cartUpdatesSubscription.unsubscribe();
	}

}
