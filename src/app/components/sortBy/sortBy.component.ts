import { CommonService } from "@app/utils/services/common.service";
import { Component, ViewEncapsulation, Input } from '@angular/core';

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
  @Input() showFilter;

  constructor(public _commonService: CommonService) {};

  toggleFilter() {
    this.showFilter = !this.showFilter;
  }

  ngOnInit() {
  }
}

