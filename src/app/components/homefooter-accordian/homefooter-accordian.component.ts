import { CommonModule } from '@angular/common';
import { Component, Input, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CONSTANTS } from '@app/config/constants';
import { SiemaCarouselModule } from '@app/modules/siemaCarousel/siemaCarousel.module';
import { KpToggleDirectiveModule } from '@app/utils/directives/kp-toggle.directive';
import { CommonService } from '@app/utils/services/common.service';

@Component({
  selector: 'home-accordians',
  templateUrl: './homefooter-accordian.component.html',
  styleUrls: ['./homefooter-accordian.component.scss']
})
export class HomefooterAccordianComponent {
  constructor(public _commonService: CommonService){}
  @Input() carouselData;
  produrl = CONSTANTS.PROD;
  dataArray = CONSTANTS.SEO_HOME_ACCORDIANS;
}


@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    SiemaCarouselModule,
    KpToggleDirectiveModule
  ],
  declarations: [
    HomefooterAccordianComponent
  ],
  exports: [
    HomefooterAccordianComponent
  ],
  providers: []
})

export class HomefooterAccordianModule { }