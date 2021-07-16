import { CommonModule } from '@angular/common';
import { Component, Input, NgModule, OnInit, EventEmitter, Output } from '@angular/core';
import { AppPromoModule } from '@app/modules/app-promo/app-promo.module';

@Component({
  selector: 'product-app-promo',
  templateUrl: './product-app-promo.component.html',
  styleUrls: ['./product-app-promo.component.scss']
})
export class ProductAppPromoComponent implements OnInit {

  @Input() isOverlayMode: boolean;
  @Input() showPromoCode: boolean;
  @Output() appPromoStatus$: EventEmitter<any> = new EventEmitter<any>();

  constructor() { }

  ngOnInit() {
  }

  appPromoStatus(event){
    this.appPromoStatus$.emit(event);
  }

}


@NgModule({
  declarations: [ProductAppPromoComponent],
  imports: [
    CommonModule,
    AppPromoModule
  ]
})
export default class ProductAppPromoModule {
}

