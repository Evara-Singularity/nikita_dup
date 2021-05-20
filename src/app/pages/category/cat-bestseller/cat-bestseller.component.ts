import { CONSTANTS } from '@config/constants';
import { Component, Input, NgModule, ViewChild } from '@angular/core';
import { PopUpComponent } from '@modules/popUp/pop-up.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { PopUpModule } from "@modules/popUp/pop-up.module";

@Component({
  selector: 'cat-bestseller',
  templateUrl: './cat-bestseller.component.html',
})
export class CatBestsellerComponent {
  @Input('bestSeller_Data') bestSeller_Data;
  baseURL = CONSTANTS.PROD;
  imagePath = CONSTANTS.IMAGE_BASE_URL;
  defaultImage = CONSTANTS.IMAGE_BASE_URL + CONSTANTS.ASSET_IMG;
  name;
  descArr;
  openPopup: boolean;
  @ViewChild(PopUpComponent) _popupComponent: PopUpComponent;


  constructor() {
    this.openPopup = false;
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

@NgModule({
  declarations: [
    CatBestsellerComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    LazyLoadImageModule,
    PopUpModule
  ]
})
export class CategoryBestSellerModule { }
export class CategoryModule extends CategoryBestSellerModule { }

