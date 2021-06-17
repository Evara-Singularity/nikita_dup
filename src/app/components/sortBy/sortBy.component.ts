import { ActivatedRoute } from "@angular/router";
import { CommonService } from "@app/utils/services/common.service";
import { Component, ViewEncapsulation, Output, ChangeDetectionStrategy, EventEmitter } from '@angular/core';

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

  constructor(public _commonService: CommonService, private _activatedRoute: ActivatedRoute) {};

  ngOnInit() {
    this.initializeSortBy();
  }
  
  initializeSortBy() {
    const queryParams = this._activatedRoute.snapshot.queryParams;

    if (queryParams.hasOwnProperty('orderBy') && queryParams.hasOwnProperty('orderWay') && queryParams['orderBy'] === 'price') {
      if (queryParams['orderWay'] === 'asc') {
        this._commonService.selectedFilterData['sortBy'] = 'lowPrice';
      } else {
        this._commonService.selectedFilterData['sortBy'] = 'highPrice';
      }
    } else {
      this._commonService.selectedFilterData['sortBy'] = 'popularity';
    }

  }
}

