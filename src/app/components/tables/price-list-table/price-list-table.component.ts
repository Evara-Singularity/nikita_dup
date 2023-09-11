import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService } from '@app/utils/services/common.service';

@Component({
	selector: 'app-price-list-table',
	templateUrl: './price-list-table.component.html',
	styleUrls: ['./price-list-table.component.scss']
})
export class PriceListTableComponent {
	@Input('priceListData') priceListData;
	@Input('heading') heading;
	todayDate: number;
	@Input() productStaticData = this._commonService.defaultLocaleValue;

	constructor(
		public _commonService: CommonService,
		private router: Router) {
		this.todayDate = Date.now();
	}

	goToProducturl(url) {
		this.router.navigateByUrl(url);
	}
}
