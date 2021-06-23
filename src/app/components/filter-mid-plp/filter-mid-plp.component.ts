import { CommonModule } from '@angular/common';
import { Component, Input, NgModule, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { GLOBAL_CONSTANT } from '@app/config/global.constant';
import { BucketsEntity } from '@app/utils/models/product.listing.search';
import { ProductListService } from '@app/utils/services/productList.service';

@Component({
  selector: 'filter-mid-plp',
  templateUrl: './filter-mid-plp.component.html',
  styleUrls: ['./filter-mid-plp.component.scss']
})
export class FilterMidPlpComponent implements OnInit {
  @Input('filterData') filterData: Array<BucketsEntity>;
  @Input('position') position: number;
  
  public inlineFilterData: BucketsEntity;
  
  constructor(private _productListService: ProductListService) { }

  ngOnInit(): void {
    this.genrateInlineFilterData();
    this.inlineFilterData = this._productListService?.inlineFilterData[this.position / 5 - 1];
  }

  genrateInlineFilterData() {
    this._productListService.inlineFilterData = [];
    
    const category = this.filterData.find(x => x.name === GLOBAL_CONSTANT.inlineFilter[0]);
    const price = this.filterData.find(x => x.name === 'price');
    const discount = this.filterData.find(x => x.name === 'discount');
    
    if (category) {
      this._productListService.inlineFilterData.push(category);
    }
    if (price) {
      this._productListService.inlineFilterData.push(price);
    }
    if (discount) {
      this._productListService.inlineFilterData.push(discount);
    }
    console.log(this._productListService.inlineFilterData);
  }

}

@NgModule({
  imports: [
      CommonModule,
      RouterModule,
  ],
  exports: [
    FilterMidPlpComponent
  ],
  declarations: [
    FilterMidPlpComponent
  ],
})

export class FilterMidPlpModule { }