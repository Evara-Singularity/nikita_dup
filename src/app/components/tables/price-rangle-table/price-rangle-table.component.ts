import { Component, Input} from '@angular/core';
import { CommonService } from '@app/utils/services/common.service';

@Component({
  selector: 'app-price-range-table',
  templateUrl: './price-range-table.component.html',
  styleUrls: ['./price-range-table.component.scss']
})
export class PriceRangleTableComponent {
  @Input('priceRangeData') priceRangeData;
  @Input('heading') heading;

  todayDate: number;

  constructor(
    public _commonService: CommonService
  ) { 
    this.todayDate = Date.now();
  }
}
