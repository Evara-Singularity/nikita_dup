import { Component, OnInit, Input } from '@angular/core';
import CONSTANTS from 'src/app/config/constants';


@Component({
  selector: 'app-new-arrival',
  templateUrl: './new-arrival.component.html',
  styleUrls: ['./new-arrival.component.scss']
})
export class NewArrivalComponent implements OnInit {
  openPopup: boolean;
  @Input() data;
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
