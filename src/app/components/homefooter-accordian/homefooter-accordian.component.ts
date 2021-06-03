import { Component, Input } from '@angular/core';
import CONSTANTS from '@app/config/constants';

@Component({
  selector: 'home-accordians',
  templateUrl: './homefooter-accordian.component.html',
  styleUrls: ['./homefooter-accordian.component.scss']
})
export class HomefooterAccordianComponent {
  @Input() flyoutData;
  @Input() carouselData;
  produrl = CONSTANTS.PROD;
  dataArray = CONSTANTS.SEO_HOME_ACCORDIANS;
}

