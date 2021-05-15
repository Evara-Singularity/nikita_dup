import { CommonModule } from '@angular/common';
import { Component, OnInit, Input, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import CONSTANTS from '@app/config/constants';
import { PopUpModule } from '@app/modules/popUp/pop-up.module';
import { CharacterremovePipeModule } from '@app/utils/pipes/characterRemove.pipe';
import { MathCeilPipeModule } from '@app/utils/pipes/math-ceil';


@Component({
  selector: 'app-new-arrival',
  templateUrl: './new-arrival.component.html',
  styleUrls: ['./new-arrival.component.scss']
})
export class NewArrivalComponent implements OnInit {
  openPopup: boolean;
  @Input('data') data;
  imagePath = CONSTANTS.IMAGE_BASE_URL;
  defaultImage = CONSTANTS.IMAGE_BASE_URL+'assets/img/home_card.webp';
  constructor() {
    this.openPopup = false;
   }

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
    NewArrivalComponent
  ],
  imports: [
      CommonModule,
      RouterModule,
      CharacterremovePipeModule,
      MathCeilPipeModule,
      PopUpModule
  ],
})
export class NewArrivalModule { }
