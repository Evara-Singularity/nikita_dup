import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService } from '@app/utils/services/common.service';

export interface PriceListData {
	brandCatDesc: any;
	brandShortDesc: any;
	brandContent: any;
	iba: boolean;
	firstPageContent: boolean;
	productSearchResult: any;
	productSearchResultSEO: any;
	heading: string;
	brand: string;
	productCount: any;
	todayDate: any;
	showDesc: boolean;
	categoryNames: any;
	categoryLinkLists: any;
	productCategoryNames: any;
}

@Component({
	selector: 'app-price-list-table',
	templateUrl: './price-list-table.component.html',
	styleUrls: ['./../../../scss/priceTables.scss']
})
export class PriceListTableComponent implements OnInit {
	@Input('priceListData') priceListData: PriceListData;
	todayDate: number;

	constructor(
		public _commonService: CommonService,
		private router: Router) {
			this.todayDate = Date.now();
		 }

	ngOnInit(): void {
	}

	goToProducturl(url) {
		this.router.navigateByUrl(url);
	}

}
