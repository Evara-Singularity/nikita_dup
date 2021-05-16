import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { CONSTANTS } from '@app/config/constants';
import { PopUpComponent } from '@app/modules/popUp/pop-up.component';


@Component({
  selector: 'cat-bestseller',
  templateUrl: './cat-bestseller.component.html',
  styleUrls: []
})
export class CatBestsellerComponent implements OnInit {


  @Input('bestSeller_Data') bestSeller_Data;
  @Input('bestSlroptions') bestSlroptions;
  baseURL = CONSTANTS.PROD;
  imagePath = CONSTANTS.IMAGE_BASE_URL;
  defaultImage = CONSTANTS.IMAGE_BASE_URL + 'assets/img/home_card.webp';
  name;
  descArr;
  openPopup: boolean;
  @ViewChild(PopUpComponent) _popupComponent: PopUpComponent;


  constructor() {
    this.openPopup = false;
  }


  ngOnInit() {

  }

  getBrandBy(brandName) {
    this.descArr = brandName.split(":");
    return this.descArr[1];

  }

  outData(data) {
    if (Object.keys(data).indexOf('hide') !== -1) {
      this.openPopup = !data.hide;
    }
  }

  customClose() {
    this._popupComponent.closePopup();
  }




}
