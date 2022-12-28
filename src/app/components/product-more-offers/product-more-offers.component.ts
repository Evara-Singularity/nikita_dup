import { Component, EventEmitter, Input, NgModule, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PopUpModule } from '../../modules/popUp/pop-up.module';
import { ModalModule } from '../../modules/modal/modal.module';
import { BottomMenuModule } from '@app/modules/bottomMenu/bottom-menu.module';
import { CommonService } from '../../utils/services/common.service';

@Component({
  selector: 'app-product-more-offers',
  templateUrl: './product-more-offers.component.html',
  styleUrls: ['./product-more-offers.component.scss']
})
export class ProductMoreOffersComponent implements OnInit {
  productStaticData = this._commonService.defaultLocaleValue;
  @Input() data: any ;
  @Output() out: EventEmitter<any> = new EventEmitter<any>();
  @Output() isLoading : EventEmitter<any> = new EventEmitter<any>();
  promoCodeOffers: any;

  constructor(private _commonService:CommonService) { }

  ngOnInit(): void {
    const promos = [...this.data];
    this.promoCodeOffers= promos.splice(1);
    this.isLoading.emit(false);
  }
  getStaticSubjectData(){
    this._commonService.changeStaticJson.subscribe(staticJsonData => {
      console.log("hello got it",staticJsonData)
      this._commonService.defaultLocaleValue = staticJsonData;
      this.productStaticData = staticJsonData;
    });
  }

  outData(data) {
    this.out.emit(data);
  }
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