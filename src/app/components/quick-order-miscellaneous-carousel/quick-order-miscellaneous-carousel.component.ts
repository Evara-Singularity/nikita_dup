import { CommonModule } from '@angular/common';
import { Component, Input, NgModule, OnInit } from '@angular/core';
import { ProductCardVerticalGridViewModule } from '@app/modules/product-card/product-card-vertical-grid-view/product-card-vertical-grid-view.module';
import { ProductCardVerticalContainerModule } from '@app/modules/ui/product-card-vertical-container/product-card-vertical-container.module';
import { ProductCardFeature } from '@app/utils/models/product.listing.search';
import { ProductService } from '@app/utils/services/product.service';

@Component({
  selector: 'quick-order-miscellaneous-carousel',
  templateUrl: './quick-order-miscellaneous-carousel.component.html',
  styleUrls: ['./quick-order-miscellaneous-carousel.component.scss']
})
export class QuickOrderMiscellaneousCarouselComponent implements OnInit {
  @Input("data") data: any = null;

  readonly cardFeaturesConfig: ProductCardFeature = {
    // feature config
    enableAddToCart: false,
    enableBuyNow: false,
    enableFullAddToCart: true,
    enableFeatures: false,
    enableRating: true,
    enableVideo: false,
    // design config
    enableCard: true,
    verticalOrientation: true,
    horizontalOrientation: false,
    lazyLoadImage: true,
  };

  tabsArray: { id: number, name: string, data: any[], isSelected: boolean }[] = [];

  constructor(
    private _productService: ProductService
  ) { }

  ngOnInit(): void {
    let count = 0;
    for(const i in this.data){
      count+=1;
       this.tabsArray.push({ 
          id: count,
          name: this.data[i].detailsOptim.categoryName,
          data: (this.data[i].productList as any[]).map((item) => (this._productService.recentProductResponseToProductEntityV1(item))).filter(res=> (this._productService.isInStock(res) == true)) || [],
          isSelected: false,
        })
    }
    if (this.tabsArray.length > 0) {
      this.tabsArray[0].isSelected = true;
    }
  }

  setProductTab(tabName) {
    this.tabsArray.forEach((element, index) => {
      this.tabsArray[index].isSelected = false;
    });
    this.tabsArray.forEach((element, index) => {
      if(this.tabsArray[index].id ==  tabName){
        this.tabsArray[index].isSelected = true;
      }
    });
  }

}

@NgModule({
  declarations: [QuickOrderMiscellaneousCarouselComponent],
  imports: [
    CommonModule,
    ProductCardVerticalContainerModule,
    ProductCardVerticalGridViewModule,
  ],
 // exports: []
})
export class QuickOrderMiscellaneousCarouselModule { }
