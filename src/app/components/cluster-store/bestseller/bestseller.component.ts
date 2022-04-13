import { CommonModule } from '@angular/common';
import { Component, OnInit, Input, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import CONSTANTS from '@app/config/constants';
import { PopUpModule } from '@app/modules/popUp/pop-up.module';
import { CharacterremovePipeModule } from '@app/utils/pipes/characterRemove.pipe';
import { MathCeilPipeModule } from '@app/utils/pipes/math-ceil';
import { MathFloorPipeModule } from '@app/utils/pipes/math-floor';

@Component({
  selector: 'app-bestseller',
  templateUrl: './bestseller.component.html',
  styleUrls: ['./bestseller.component.scss']
})
export class BestsellerComponent implements OnInit {
  openPopup: boolean;
  @Input('data') data;
  imagePath = CONSTANTS.IMAGE_BASE_URL;
  defaultImage = CONSTANTS.IMAGE_BASE_URL + CONSTANTS.ASSET_IMG;

  ngOnInit() {
  }
  outData(data) {
    // console.log(data);
      if (Object.keys(data).indexOf('hide') !== -1) {
          this.openPopup = !data.hide;
      }
  }
}

@NgModule({
  declarations: [
    BestsellerComponent
  ],
  imports: [
      CommonModule,
      RouterModule,
      CharacterremovePipeModule,
      MathFloorPipeModule,
      PopUpModule
  ],
})
export class BestSellerModule { }
