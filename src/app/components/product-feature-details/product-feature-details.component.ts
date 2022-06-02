import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, NgModule, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { CONSTANTS } from '@app/config/constants';
import { SliceArrayPipeModule } from '@app/utils/pipes/slice-array.pipe';
import { CommonService } from '@app/utils/services/common.service';
import { YTThumnailPipeModule } from '../../utils/pipes/ytthumbnail.pipe';
import { ObjectToArrayPipeModule } from '../../utils/pipes/object-to-array.pipe';

@Component({
  selector: 'app-product-feature-details',
  templateUrl: './product-feature-details.component.html',
  styleUrls: ['./product-feature-details.component.scss']
})
export class ProductFeatureDetailsComponent implements OnInit {

  readonly imagePath = CONSTANTS.IMAGE_BASE_URL;
  readonly baseDomain = CONSTANTS.PROD;
  readonly DOCUMENT_URL = CONSTANTS.DOCUMENT_URL;
  readonly imagePathAsset = CONSTANTS.IMAGE_ASSET_URL;  @Input() productKeyFeatures: any;
  @Input() productAttributes : any;
  @Input() productDescripton : any;
  @Input() productCategoryDetails : any;
  @Input() productBrandDetails : any;
  @Input() productName : any;
  @Input() productVideos : any;
  @Input() productDocumentInfo : any;
  @Input() productBrandCategoryUrl: any;
  @Output() handleProductInfoPopup$: EventEmitter<any> = new EventEmitter<any>();
  @Output() showYTVideo$: EventEmitter<any> = new EventEmitter<any>();

  constructor( private router: Router, public commonService: CommonService) { }

  ngOnInit(): void {
  }

  handleProductInfoPopup(infoType, cta) {
    this.handleProductInfoPopup$.emit({infoType, cta});
  }

  showYTVideo(link){
    this.showYTVideo$.emit(link);
  }

  navigateLink(link) {
    this.router.navigate([link]);
  }


  getBrandLink(brandDetails: {}) {
    if (brandDetails == undefined) {
      return [];
    }
    let d = brandDetails["friendlyUrl"];
    return ["/brands/" + d.toLowerCase()];
  }


}

@NgModule({
  declarations: [
    ProductFeatureDetailsComponent
  ],
  imports: [
    CommonModule,
    SliceArrayPipeModule,
    YTThumnailPipeModule,
    ObjectToArrayPipeModule
  ],
  exports: [
    ProductFeatureDetailsComponent
  ]
})
export class ProductFeatureDetailsModule { }
