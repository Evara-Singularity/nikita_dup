import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, NgModule, OnInit, Output } from '@angular/core';
import { PopUpModule } from '../../modules/popUp/pop-up.module';
import { ModalModule } from '../../modules/modal/modal.module';
import CONSTANTS from '../../config/constants';
import { CommonService } from '../../utils/services/common.service';

@Component({
  selector: 'app-product-offer-popup',
  templateUrl: './product-offer-popup.component.html',
  styleUrls: ['./product-offer-popup.component.scss']
})
export class ProductOfferPopupComponent implements OnInit {
  productStaticData = this._commonService.defaultLocaleValue;
  @Input() openMobikwikPopup: boolean = false;
  @Input() offerIndex: number = null;
  @Input() data: any = null;
  @Input() gstPercentage;
  @Output() out: EventEmitter<any> = new EventEmitter<any>();
  @Output() isLoading: EventEmitter<any> = new EventEmitter<any>();
  IMG_PATH = CONSTANTS.IMAGE_BASE_URL;

  constructor(private _commonService:CommonService){

  }
  ngOnInit(): void {
    this.getStaticSubjectData();
  }
  getStaticSubjectData(){
    this._commonService.changeStaticJson.subscribe(staticJsonData => {
      this._commonService.defaultLocaleValue = staticJsonData;
      this.productStaticData = staticJsonData;
    });
  }

  outData(data) {
    // console.log('outData', data);
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
