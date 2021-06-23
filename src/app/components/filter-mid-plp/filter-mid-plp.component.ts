import { CommonModule } from '@angular/common';
import { Component, Input, NgModule, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { GLOBAL_CONSTANT } from '@app/config/global.constant';
import { BucketsEntity } from '@app/utils/models/product.listing.search';
import { CommonService } from '@app/utils/services/common.service';
import { ProductListService } from '@app/utils/services/productList.service';

@Component({
  selector: 'filter-mid-plp',
  templateUrl: './filter-mid-plp.component.html',
  styleUrls: ['./filter-mid-plp.component.scss']
})
export class FilterMidPlpComponent implements OnInit {
  @Input('filterData') filterData: Array<BucketsEntity>;
  @Input('position') position: number;
  
  public GLOBAL_CONSTANT = GLOBAL_CONSTANT;
  public inlineFilterData: BucketsEntity;
  
  constructor(private _router: Router, private _productListService: ProductListService, private _commonService: CommonService) { }

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
  }

  checkAndApplyFilter(key, item) {
    if (key === GLOBAL_CONSTANT.inlineFilter[0]) {
      this._router.navigate([item.categoryLink]);
      return;
    } else {
      if (this._commonService.selectedFilterData.filter.hasOwnProperty(key)) {
        const indexInSelectedFilterDataFilterArray = this._commonService.selectedFilterData.filter[key].findIndex(x => x === item.term);
        if (!(indexInSelectedFilterDataFilterArray > -1)) {
          this._commonService.selectedFilterData.filter[key].push(item.term);
        } else {
          this._commonService.selectedFilterData.filter[key].splice(indexInSelectedFilterDataFilterArray,1);
        }
      } else {
        this._commonService.selectedFilterData.filter[key] = [];
        this._commonService.selectedFilterData.filter[key].push(item.term);
      }
  
      this._commonService.applyFilter();
    }
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