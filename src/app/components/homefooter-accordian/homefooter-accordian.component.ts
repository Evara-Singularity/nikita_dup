import { CommonModule } from '@angular/common';
import { Component, Input, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CONSTANTS } from '@app/config/constants';
import { SiemaCarouselModule } from '@app/modules/siemaCarousel/siemaCarousel.module';
import { KpToggleDirectiveModule } from '@app/utils/directives/kp-toggle.directive';
import { CommonService } from '@app/utils/services/common.service';
import { AccordiansDetails,AccordianDataItem } from '@app/utils/models/accordianInterface';
import { AccordianModule } from "@app/modules/accordian/accordian.module";



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
  accordiansDetails:AccordiansDetails[]=[];


  ngOnInit() {
    this.footerAccordian();
  }

  footerAccordian() {
    this.accordiansDetails = [];
    this.dataArray.forEach(data => {
      Object.entries(this.carouselData).forEach(element => {
        if (element[0] == data) {
          let blockData = element[1]["data"]["brand_block"]
          this.accordiansDetails.push({
            name: "Brands From " + element[1]["layout_name"],
            data: blockData.map(x => ({ name: x.brandName, link: x.brand_url }) as AccordianDataItem),
            icon: ''
          });
        }
      });
    });
  }

}


@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    SiemaCarouselModule,
    KpToggleDirectiveModule,
    AccordianModule
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