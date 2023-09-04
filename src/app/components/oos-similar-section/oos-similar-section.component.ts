import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ProductService } from '@app/utils/services/product.service';
import { Subscription } from 'rxjs';
import { CommonService } from '../../utils/services/common.service';

@Component({
  selector: 'app-oos-similar-section',
  templateUrl: './oos-similar-section.component.html',
  styleUrls: ['./oos-similar-section.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OosSimilarSectionComponent {
  productStaticData = this._commonService.defaultLocaleValue;
  @Input('productOutOfStock') productOutOfStock;
  @Input('oosSimilarcardFeaturesConfig') oosSimilarcardFeaturesConfig;
  @Input('similarForOOSContainer') similarForOOSContainer;
  @Input('similarForOOSLoaded') similarForOOSLoaded;
  changeStaticSubscription: Subscription = null;
  constructor(public productService: ProductService,private _commonService:CommonService) {
    
   }
   ngOnInit(): void {
   
    this.getStaticSubjectData();
  }
  getStaticSubjectData(){
    this.changeStaticSubscription = this._commonService.changeStaticJson.subscribe(staticJsonData => {
      this._commonService.defaultLocaleValue = staticJsonData;
      this.productStaticData = staticJsonData;
    });
  }
  ngOnDestroy() {
    if(this.changeStaticSubscription) {
      this.changeStaticSubscription.unsubscribe();
    }
  }
}