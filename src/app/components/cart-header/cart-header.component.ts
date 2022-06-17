import { CartService } from './../../utils/services/cart.service';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonService } from '@app/utils/services/common.service';

@Component({
  selector: 'cart-header',
  templateUrl: './cart-header.component.html',
  styleUrls: ['./cart-header.component.scss']
})
export class CartHeaderComponent implements OnInit {

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

  constructor(
    public _commonService: CommonService,
    private _cartService:CartService
  ) { }

  ngOnInit(): void {
    this.cartSession = this._cartService.getCartSession();
    this.noOfCart = (this.cartSession['itemsList'] as any[]).length || 0
  }

}
