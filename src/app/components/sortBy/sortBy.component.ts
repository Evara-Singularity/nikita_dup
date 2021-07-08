import { ActivatedRoute } from "@angular/router";
import { CommonService } from "@app/utils/services/common.service";
import { Component, ViewEncapsulation, Output, ChangeDetectionStrategy, EventEmitter } from '@angular/core';
import { ProductListService } from "@app/utils/services/productList.service";

@Component({
  selector: 'sort-by',
  templateUrl: 'sortBy.html',
  styleUrls: [
    './sortBy.scss'
  ],
  encapsulation: ViewEncapsulation.None
})

export class SortByComponent {
  // Output event to toggle filter
  @Output('toggleFilter') toggleFilter: EventEmitter<any> = new EventEmitter<any>();

  constructor(public _commonService: CommonService, private _productListService: ProductListService) {};

  ngOnInit() {
    this._productListService.initializeSortBy()
  }
}

