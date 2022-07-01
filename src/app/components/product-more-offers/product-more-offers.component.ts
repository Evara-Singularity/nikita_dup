import { Component, EventEmitter, Input, NgModule, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PopUpModule } from '../../modules/popUp/pop-up.module';
import { ModalModule } from '../../modules/modal/modal.module';
import { BottomMenuModule } from '@app/modules/bottomMenu/bottom-menu.module';

@Component({
  selector: 'app-product-more-offers',
  templateUrl: './product-more-offers.component.html',
  styleUrls: ['./product-more-offers.component.scss']
})
export class ProductMoreOffersComponent implements OnInit {

  @Input() data: any ;
  @Output() out: EventEmitter<any> = new EventEmitter<any>();
  @Output() isLoading : EventEmitter<any> = new EventEmitter<any>();
  promoCodeOffers: any;

  constructor() { }

  ngOnInit(): void {
    const promos = [...this.data];
    this.promoCodeOffers= promos.splice(1, 1)
    this.isLoading.emit(false);
  }

  outData(data) {
    this.out.emit(data);
  }
  togglePopUp(){}
  
}


@NgModule({
  declarations: [ProductMoreOffersComponent],
  imports: [
    CommonModule,
    PopUpModule,
    ModalModule,
    BottomMenuModule
  ]
})
export default class ProductMoreOffersModule {

}