import { CommonModule } from '@angular/common';
import { Component, OnInit, Input, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import CONSTANTS from 'src/app/config/constants';
import { PopUpModule } from 'src/app/modules/popUp/pop-up.module';
import { CharacterremovePipeModule } from 'src/app/utils/pipes/characterRemove.pipe';
import { MathCeilPipeModule } from 'src/app/utils/pipes/math-ceil';

@Component({
  selector: 'app-bestseller',
  templateUrl: './bestseller.component.html',
  styleUrls: ['./bestseller.component.scss']
})
export class BestsellerComponent implements OnInit {
  openPopup: boolean;
  @Input('data') data;
  imagePath = CONSTANTS.IMAGE_BASE_URL;
  defaultImage = CONSTANTS.IMAGE_BASE_URL+'assets/img/home_card.webp';
  
  constructor() { }

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
      MathCeilPipeModule,
      PopUpModule
  ],
})
export class BestSellerModule { }
