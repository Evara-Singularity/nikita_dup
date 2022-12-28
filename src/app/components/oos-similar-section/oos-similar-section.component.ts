import { Component, Input } from '@angular/core';
import { ProductService } from '@app/utils/services/product.service';
import { CommonService } from '../../utils/services/common.service';

@Component({
  selector: 'app-oos-similar-section',
  templateUrl: './oos-similar-section.component.html',
  styleUrls: ['./oos-similar-section.component.scss']
})
export class OosSimilarSectionComponent {
  productStaticData = this._commonService.defaultLocaleValue;
  @Input('productOutOfStock') productOutOfStock;
  @Input('oosSimilarcardFeaturesConfig') oosSimilarcardFeaturesConfig;
  @Input('similarForOOSContainer') similarForOOSContainer;
  @Input('similarForOOSLoaded') similarForOOSLoaded;

  constructor(public productService: ProductService,private _commonService:CommonService) {
    
   }
   ngOnInit(): void {
   
    this.getStaticSubjectData();
  }
  getStaticSubjectData(){
    this._commonService.changeStaticJson.subscribe(staticJsonData => {
      this._commonService.defaultLocaleValue = staticJsonData;
      this.productStaticData = staticJsonData;
    });
  }
}