import { Subscription } from 'rxjs';
import { CartService } from './../../utils/services/cart.service';
import { Component, EventEmitter, Input, OnInit, Output, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonService } from '@app/utils/services/common.service';

@Component({
	selector: 'cart-header',
	templateUrl: './cart-header.component.html',
	styleUrls: ['./cart-header.component.scss']
})
export class CartHeaderComponent implements OnInit, AfterViewInit, OnDestroy
{

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
		private _cartService: CartService
	) { }

	ngOnInit(): void
	{
		this.cartSession = this._cartService.getCartSession();
		this.noOfCart = (this.cartSession['itemsList'] as any[]).length || 0;
		this.calculatePayableAmount(this.cartSession['cart']);
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

	get isCheckout() { return this.title === "Checkout" }
	
	get isQuickorder() { return this.title === "My Cart" }

	ngOnDestroy(): void
	{
		this.cartUpdatesSubscription.unsubscribe();
	}

}
