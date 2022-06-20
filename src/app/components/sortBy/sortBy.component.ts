import { CommonService } from "@app/utils/services/common.service";
import { Component, ViewEncapsulation, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'sort-by',
  templateUrl: 'sortBy.html',
  styleUrls: [
    './sortBy.scss'
  ],
  host:     {'[class.open]':'true'},
  encapsulation: ViewEncapsulation.None
})

export class SortByComponent {

  @Output('toggleFilter') toggleFilter: EventEmitter<any> = new EventEmitter<any>();
  constructor(public _commonService: CommonService) {};

  ngOnInit() {
  }

  togglePopup(data){
    this.toggleFilter.emit(data);
  }
  
}

