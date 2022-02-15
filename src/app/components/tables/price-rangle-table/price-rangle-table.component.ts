import { Component, Input} from '@angular/core';
import { CommonService } from '@app/utils/services/common.service';

@Component({
  selector: 'app-price-rangle-table',
  templateUrl: './price-rangle-table.component.html',
  styleUrls: ['./../../../scss/priceTables.scss']
})
export class PriceRangleTableComponent {
  @Input('priceRangeData') priceRangeData;
  todayDate: number;

  constructor(
    public _commonService: CommonService
  ) { 
    this.todayDate = Date.now();
  }
}
