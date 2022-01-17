import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, NgModule, OnInit, Output } from '@angular/core';
import { PopUpModule } from '../../modules/popUp/pop-up.module';
import { ModalModule } from '../../modules/modal/modal.module';
import CONSTANTS from '../../config/constants';

@Component({
  selector: 'app-product-offer-popup',
  templateUrl: './product-offer-popup.component.html',
  styleUrls: ['./product-offer-popup.component.scss']
})
export class ProductOfferPopupComponent implements OnInit {

  @Input() openMobikwikPopup: boolean = false;
  @Input() data: any =  null;
  @Input() gstPercentage;
  @Output() out: EventEmitter<any> =  new EventEmitter<any>();
  IMG_PATH = CONSTANTS.IMAGE_BASE_URL;

  ngOnInit(): void {
  }

  outData(data){
    console.log('outData', data);
    this.out.emit(data);
  }

}

@NgModule({
  declarations: [ProductOfferPopupComponent],
  imports: [
    CommonModule,
    PopUpModule,
    ModalModule
  ]
})
export default class ProductOfferPopupModule {

}
