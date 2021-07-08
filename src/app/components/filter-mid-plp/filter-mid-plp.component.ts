import { CommonModule } from '@angular/common';
import { Component, Input, NgModule, OnInit, Pipe, PipeTransform } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { GLOBAL_CONSTANT } from '@app/config/global.constant';
import { BucketsEntity } from '@app/utils/models/product.listing.search';
import { AddFilterSymbolPipeModule } from '@app/utils/pipes/addSymbol.pipe';
import { CommonService } from '@app/utils/services/common.service';
import { ProductListService } from '@app/utils/services/productList.service';

@Component({
  selector: 'filter-mid-plp',
  templateUrl: './filter-mid-plp.component.html',
  styleUrls: ['./filter-mid-plp.component.scss', '../homefooter-accordian/homefooter-accordian.component.scss']
})
export class FilterMidPlpComponent implements OnInit {
  @Input('filterData') filterData: Array<BucketsEntity>;
  @Input('position') position: number;
  
  public GLOBAL_CONSTANT = GLOBAL_CONSTANT;
  public inlineFilterData: BucketsEntity;
  
  constructor(private _router: Router, private _productListService: ProductListService, private _commonService: CommonService) { }

  ngOnInit(): void {
    this.genrateInlineFilterData();
  }

  genrateInlineFilterData() {
    this._productListService.inlineFilterData = [];
    
    const category = this.filterData.find(x => x.name === GLOBAL_CONSTANT.inlineFilter[0]);
    const price = this.filterData.find(x => x.name === GLOBAL_CONSTANT.inlineFilter[1]);
    const discount = this.filterData.find(x => x.name === GLOBAL_CONSTANT.inlineFilter[2]);
    
    if (category) {
      this._productListService.inlineFilterData.push(category);
    }
    if (price) {
      this._productListService.inlineFilterData.push(price);
    }
    if (discount) {
      this._productListService.inlineFilterData.push(discount);
    }

    this.inlineFilterData = this._productListService?.inlineFilterData[this.position / 5 - 1];
  }

  checkAndApplyFilter(key, item) {
    if (key === GLOBAL_CONSTANT.inlineFilter[0]) {
      this._router.navigate([item.categoryLink]);
      return;
    } else {
      this._commonService.genricApplyFilter(key, item);
    }
  }
}


@Pipe({
  name: 'removeSelected'
})
export class RemoveSelectedPipe implements PipeTransform{
  transform(val) {
    if (val && val.length > 0) {
      return val.filter( v => !v.selected);
    }
    return val;
  }
}

@NgModule({
  imports: [
      CommonModule,
      RouterModule,
      AddFilterSymbolPipeModule
  ],
  exports: [
    FilterMidPlpComponent
  ],
  declarations: [
    RemoveSelectedPipe,
    FilterMidPlpComponent
  ],
})

export class FilterMidPlpModule { }