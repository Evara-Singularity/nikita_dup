import { Subscription } from 'rxjs';
import { CartService } from './../../utils/services/cart.service';
import { Component, EventEmitter, Input, OnInit, Output, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonService } from '@app/utils/services/common.service';
import { Router } from '@angular/router';
import { GlobalLoaderService } from '@app/utils/services/global-loader.service';
import { Location } from '@angular/common';

@Component({
	selector: 'cart-header',
	templateUrl: './cart-header.component.html',
	styleUrls: ['./cart-header.component.scss']
})
export class CartHeaderComponent implements OnInit, AfterViewInit, OnDestroy
{
	readonly REPLACE_URL = { replaceUrl: true };
	@Output() loadSideNav$: EventEmitter<boolean> = new EventEmitter<boolean>();
	@Output() navigateToLogin$: EventEmitter<boolean> = new EventEmitter<boolean>();
	@Output() loadSearchNav$: EventEmitter<boolean> = new EventEmitter<boolean>();
	@Output() goBack$: EventEmitter<boolean> = new EventEmitter<boolean>();
	@Input() noOfCart: number = 0;
	@Input() title: string = 'Home';
	@Input() isUserLogin: boolean = false;
	@Input() enableBackBtn: boolean = false;
	@Input() imgAssetPath: boolean = false;
	cartSession = null;
	payableAmount = 0;
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
		if (this.isPayment) { this.checkForPaymentPage(); return }
		this.cartSession = this._cartService.getCartSession();
		this.noOfCart = (this.cartSession['itemsList'] as any[]).length || 0;
		this.calculatePayableAmount(this.cartSession['cart']);
	}

	checkForPaymentPage()
	{
		const replaceURL = { replaceUrl: true };
		if (
			(this._cartService.getGenericCartSession && Object.keys(this._cartService.getGenericCartSession?.cart).length == 0) ||
			!((this._cartService.invoiceType == 'retail' && this._cartService.shippingAddress) ||
				(this._cartService.invoiceType == 'tax' && this._cartService.shippingAddress && this._cartService.billingAddress))
		) {
			this._loader.setLoaderState(true);
			this._router.navigateByUrl('/checkout/address', replaceURL);
		}
	}

	ngAfterViewInit(): void
	{
		this.cartUpdatesSubscription = this._cartService.getCartUpdatesChanges().subscribe(cartSession =>
		{
			this.cartSession = cartSession;
			this.calculatePayableAmount(this.cartSession['cart']);
		});
	}

	calculatePayableAmount(cart)
	{
		if (this.cartSession['cart'] && Object.keys(this.cartSession['cart']).length) {
			const TOTAL_AMOUNT = cart['totalAmount'] || 0;
			const SHIPPING_CHARGES = cart['shippingCharges'] || 0;
			const TOTAL_OFFER = cart['totalOffer'] || 0;
			this.payableAmount = TOTAL_AMOUNT + SHIPPING_CHARGES + TOTAL_OFFER;
		}
	}

	handleNavigation()
	{
		const url = this._router.url;
		const previousURL = this._commonService.previousUrl;
		switch (this.title) {
			case 'My Cart': {
				this.handleMyCartNavigation(url, previousURL);
				break;
			}
			case 'Checkout': {
				this.handleCheckoutNavigation(url, previousURL); break;
			}
			case 'Payment': {
				this.handleCheckoutNavigation(url, previousURL); break;
			}
		}
	}

	handleMyCartNavigation(url: string, previousURL: string)
	{
		if (previousURL.includes("checkout/address") || previousURL.includes("checkout/payment") || previousURL.includes("quickorder")) {
			this._router.navigateByUrl('/', this.REPLACE_URL);
			return;
		}
		this._location.back();
	}

	handleCheckoutNavigation(url: string, previousURL: string)
	{
		this._cartService.clearBuyNowFlow();
		if (previousURL.includes('checkout/login') || previousURL.includes('checkout/sign-up') || previousURL.includes('checkout/otp')) {
			this._router.navigateByUrl("quickorder", { replaceUrl: true });
		} else if (url.includes('checkout/payment') || previousURL.includes('checkout/address')) {
			this._router.navigateByUrl("checkout/address", { replaceUrl: true });
		} else if (previousURL.includes('checkout/address') || previousURL.includes('checkout/payment')) {
			this._router.navigateByUrl("quickorder", { replaceUrl: true });
		} else {
			this._location.back();
		}
	}

	handlePaymentNavigation(url: string, previousURL: string)
	{
		this._router.navigateByUrl('/checkout/address', this.REPLACE_URL);
		this._router.routeReuseStrategy.shouldReuseRoute = () => { return false; };
	}

	get isQuickorder() { return this.title === "My Cart" }

	get isPayment() { return this.title === "Payment" }

	ngOnDestroy(): void
	{
		this.cartUpdatesSubscription.unsubscribe();
	}

}
