import { CommonModule } from '@angular/common';
import { Component, OnInit, Input, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import CONSTANTS from '@app/config/constants';
import { PopUpModule } from '@app/modules/popUp/pop-up.module';
import { CharacterremovePipeModule } from '@app/utils/pipes/characterRemove.pipe';
import { MathCeilPipeModule } from '@app/utils/pipes/math-ceil';
import { ProductCardVerticalContainerModule } from "../../../modules/ui/product-card-vertical-container/product-card-vertical-container.module";
import { ProductCardVerticalGridViewModule } from "../../../modules/product-card/product-card-vertical-grid-view/product-card-vertical-grid-view.module";
import { ProductService } from '@app/utils/services/product.service';


@Component({
  selector: 'app-new-arrival',
  templateUrl: './new-arrival.component.html',
  styleUrls: ['./new-arrival.component.scss']
})
export class NewArrivalComponent implements OnInit {
  openPopup: boolean;
  @Input('data') data;
  newArrivalProducts:any
  imagePath = CONSTANTS.IMAGE_BASE_URL;
  defaultImage = CONSTANTS.IMAGE_BASE_URL + CONSTANTS.ASSET_IMG;
  constructor(
    private _productService: ProductService,
  ) {
    this.openPopup = false;
    
   }

  ngOnInit() {
    this.newArrivalProducts = (this.data['data']).map((item) => this._productService.storePageResponseToProductEntity(item));
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
        PopUpModule,
        ProductCardVerticalContainerModule,
        ProductCardVerticalGridViewModule
    ]
})
export class NewArrivalModule { }
