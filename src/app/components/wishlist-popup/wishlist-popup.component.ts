import { CommonModule } from '@angular/common';
import { Component, Input, NgModule, OnInit, Output, EventEmitter } from '@angular/core';
import { BottomMenuModule } from "../../modules/bottomMenu/bottom-menu.module";

@Component({
  selector: 'wishlist-popup',
  templateUrl: './wishlist-popup.component.html',
  styleUrls: ['./wishlist-popup.component.scss']
})
export class WishlistPopupComponent implements OnInit {
  @Input('wishListData') wishListData: Array<object>  = [];
  @Output('closePopup$') closePopup$ = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
  }

  closePopup(){
    this.closePopup$.emit(true);
  }

}

@NgModule({
    declarations: [
        WishlistPopupComponent
    ],
    imports: [
        CommonModule,
        BottomMenuModule
    ]
})
export class WishlistPopupModule { }
