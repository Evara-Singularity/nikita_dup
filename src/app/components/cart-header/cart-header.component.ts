import { NavigationService } from '@app/utils/services/navigation.service';
import { Location } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from '@app/utils/services/common.service';
import { GlobalLoaderService } from '@app/utils/services/global-loader.service';
import { Subscription } from 'rxjs';
import { CartService } from './../../utils/services/cart.service';
import { retry } from 'rxjs-compat/operator/retry';
import { retryWhen } from 'rxjs-compat/operator/retryWhen';

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
		private _loader: GlobalLoaderService,
		private _naviagtionService: NavigationService,
		private _activatedRoute: ActivatedRoute,
	) { }


	ngOnInit(): void
	{
		this._loader.setLoaderState(true);
		this.orderId = this._activatedRoute.snapshot.queryParams['orderId'];
	}

	ngAfterViewInit(): void
	{
		this.cartUpdatesSubscription = this._cartService.getCartUpdatesChanges().subscribe(cartSession =>
		{
			if (cartSession['proxy']) return;//front end created dummy cart session;
			this.noOfCartItems = this._cartService.getCartItemsCount();
			this.totalPayableAmount = this._cartService.getTotalPayableAmount(cartSession['cart']);
			if (this.orderId === null && this.noOfCartItems === 0 && this.isCheckout) {
				this._naviagtionService.handleCartWithZeroItems();
			}
			this._loader.setLoaderState(false);
		});
	}

	handleNavigation()
	{
		if (this.isCheckout && this._cartService.buyNow) {
			this._cartService.clearBuyNowFlow();
		}
		this.goBack$.emit();
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
