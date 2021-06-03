import { CommonService } from '@services/common.service';
import { Component, OnInit, Input } from '@angular/core';
import CONSTANTS from '@app/config/constants';

@Component({
  selector: 'home-accordians',
  templateUrl: './homefooter-accordian.component.html',
  styleUrls: ['./homefooter-accordian.component.scss']
})
export class HomefooterAccordianComponent implements OnInit {
  @Input() flyoutData;
  @Input() carouselData;
  produrl = CONSTANTS.PROD;
  dataArray = CONSTANTS.SEO_HOME_ACCORDIANS;
  constructor(public _commonService: CommonService) { }

  ngOnInit(): void {
    // console.log(this.carouselData);
    // this.dataArray = this.dataArray.filter(item => {
    //   this.carouselData[item]['data']['brand_block'].length > 0
    // });
    // console.log(this.dataArray);
  }

}

