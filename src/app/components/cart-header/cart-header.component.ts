import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { ClientUtility } from '@app/utils/client.utility';
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

	backButtonClickQuickOrderSubscription: Subscription;
    isBackClickedQuickOrder: boolean=false; 
	backButtonClickPaymentSubscription: Subscription;
    isBackClickedPayment: boolean=false; 
	cancelIconClickedSubscription: Subscription;
    isCancelIconClicked: boolean=true;
	cancelIconClickedPaymentSubscription: Subscription;
    isCancelIconPaymentClicked: boolean=true;
	missOutSavingAmount: number=0; //calculate [mrp-(selling Price + shipping Charges)]

	constructor(
		public _commonService: CommonService,
		public _cartService: CartService,
		private _naviagtionService: NavigationService,
		private _router:Router
	) { }


	ngOnInit(): void
	{
		this._naviagtionService.setBackClickedQuickOrder(false);
		this._naviagtionService.setBackClickedPayment(false);
		this._naviagtionService.setCancelIconQuickOrderClicked(true);
		this._naviagtionService.setCancelIconPaymentClicked(true);

		this.cartUpdatesSubscription = this._cartService.getCartUpdatesChanges().subscribe(cartSession =>
		{
			//front end created dummy cart session;
			if (cartSession['proxy']) return;
			this.totalPayableAmount = this._cartService.totalDisplayPayableAmountWithOutPrepaid;
			if ((this.isCheckout || this.isPayment) && (cartSession['itemsList'] as any[]).length === 0) {
				this._naviagtionService.handleCartWithZeroItems();
			}
		});
		this.noOfCartItems = this._cartService.getCartItemsCount();
		this.backButtonClickQuickOrderSubscription = this._naviagtionService.isBackClickedQuickOrder$.subscribe(
			value => {
			  this.isBackClickedQuickOrder = value;
			}
		  );
		
		this.backButtonClickPaymentSubscription = this._naviagtionService.isBackClickedPayment$.subscribe(
		value => {
			this.missOutSavingAmount=this.calculate_mrp_totalPayable_Difference();
			this.isBackClickedPayment = value;
		}
		);
		this.cancelIconClickedSubscription = this._naviagtionService.isCancelIconQuickOrderClicked$.subscribe(
			value => {
			  this.isCancelIconClicked = value;
			}
		  );  
		  this.cancelIconClickedPaymentSubscription = this._naviagtionService.isCancelIconPaymentClicked$.subscribe(
			value => {
			  this.isCancelIconPaymentClicked = value;
			}
		  );    
	}
	calculate_mrp_totalPayable_Difference() { 
		const sums = this._cartService.getGenericCartSession["itemsList"].reduce((acc, item) => {
		  acc.sum_mrpAmounts += (item.amount * item.productQuantity);
		  acc.sum_totalPayableAmounts += (item.totalPayableAmount + item.shippingCharges);
		  return acc;
		}, { sum_mrpAmounts: 0, sum_totalPayableAmounts: 0 });
		return sums.sum_mrpAmounts - sums.sum_totalPayableAmounts;
	  }	

	handleNavigation()
	{
		if (this.isCheckout && this._cartService.buyNow) {
			this._cartService.clearBuyNowFlow();
		}
		if (this.isQuickorder && !this.isBackClickedQuickOrder && this.isCancelIconClicked ) {
			this._naviagtionService.setBackClickedQuickOrder(true);
			// this.resetCartChanges();
			// this.goBack$.emit();
			return
		}
		if (this.isQuickorder && this.isBackClickedQuickOrder && !this.isCancelIconClicked ) {
			this._naviagtionService.setBackClickedQuickOrder(false);
			this.resetCartChanges();
			this.goBack$.emit();
			return
		}
		if(this.isPayment && !this.isBackClickedPayment && this.isCancelIconPaymentClicked && this.missOutSavingAmount){
			this._naviagtionService.setBackClickedPayment(true);
			return
		}
		if(this.isPayment && this.isBackClickedPayment && this.isCancelIconPaymentClicked && this.missOutSavingAmount){
			this._naviagtionService.setBackClickedPayment(true);
			this.goBack$.emit();
			return
		}
		if(this.isPayment && !this.missOutSavingAmount){
			this._naviagtionService.setBackClickedPayment(true);
			this.goBack$.emit();
			return
		}
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

	get isCheckout() { return this._router.url.includes("checkout/address"); }

	get displayCartInfo() { return this.isQuickorder && this.noOfCartItems }

	/**@description scrolls to payment summary section on click of info icon*/
	scrollPaymentSummary()
	{
		if (document.getElementById('summary_common_id_')) {
			let footerOffset = document.getElementById('summary_common_id_').offsetTop;
			ClientUtility.scrollToTop(1000, footerOffset-30);
		}
	}

	ngOnDestroy(): void
	{
		if (this.cartUpdatesSubscription) { this.cartUpdatesSubscription.unsubscribe(); }
		if (this.backButtonClickQuickOrderSubscription) this.backButtonClickQuickOrderSubscription.unsubscribe();
		if (this.backButtonClickPaymentSubscription) this.backButtonClickPaymentSubscription.unsubscribe();
		if (this.cancelIconClickedSubscription) this.cancelIconClickedSubscription.unsubscribe();
		if (this.cancelIconClickedPaymentSubscription) this.cancelIconClickedPaymentSubscription.unsubscribe();
	}

}
