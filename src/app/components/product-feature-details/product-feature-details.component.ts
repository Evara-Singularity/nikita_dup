import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, NgModule, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { CONSTANTS } from '@app/config/constants';
import { SliceArrayPipeModule } from '@app/utils/pipes/slice-array.pipe';
import { CommonService } from '@app/utils/services/common.service';
import { YTThumnailPipeModule } from '../../utils/pipes/ytthumbnail.pipe';
import { ObjectToArrayPipeModule } from '../../utils/pipes/object-to-array.pipe';
import { BrandLinkMapping } from '@app/utils/brandLinkMapping';
import { Subscription } from 'rxjs';

@Component({
  selector: 'product-feature-details',
  templateUrl: './product-feature-details.component.html',
  styleUrls: ['./product-feature-details.component.scss']
})
export class ProductFeatureDetailsComponent implements OnInit {
  productStaticData = this.commonService.defaultLocaleValue;
  readonly imagePath = CONSTANTS.IMAGE_BASE_URL;
  readonly baseDomain = CONSTANTS.PROD;
  readonly DOCUMENT_URL = CONSTANTS.DOCUMENT_URL;
  readonly imagePathAsset = CONSTANTS.IMAGE_ASSET_URL;  @Input() productKeyFeatures: any;
  showNavToStorePage=false;
  @Input() isFromOosSimilarCard: boolean = false;
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
  @Input() applyExtraMargin : boolean = true;
  changeStaticSubscription: Subscription = null;
  constructor( private router: Router, public commonService: CommonService) { }

  ngOnInit(): void {
    this.getStaticSubjectData();
    if (this.productBrandDetails && this.productBrandDetails["idBrand"] && BrandLinkMapping.hasOwnProperty(this.productBrandDetails["idBrand"])) {
      this.showNavToStorePage=true;
      this.productBrandDetails['storeLink']=BrandLinkMapping[this.productBrandDetails["idBrand"]];
    }
  }
  
  getStaticSubjectData(){
    this.changeStaticSubscription  = this.commonService.changeStaticJson.subscribe(staticJsonData => {
      this.productStaticData = staticJsonData;
    });
  }

  ngOnDestroy() {
    if(this.changeStaticSubscription) {
      this.changeStaticSubscription.unsubscribe();
    }
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
    let baseUrl = '/brands/';
    if(this.commonService.isHindiPage(brandDetails)) {
      baseUrl = '/hi' + baseUrl;
    }
    let d = brandDetails["friendlyUrl"];
    return [baseUrl + d.toLowerCase()];
  }

  getCategoryLink(categoryDetails = null) {
    console.log(categoryDetails)
    if(categoryDetails == undefined || categoryDetails == null) { return ''};
      if(categoryDetails && categoryDetails['acceptLanguage'] && categoryDetails['acceptLanguage'].length) {
        return 'hi/' + categoryDetails['storeLink'];
      }
      return categoryDetails['storeLink'];
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
