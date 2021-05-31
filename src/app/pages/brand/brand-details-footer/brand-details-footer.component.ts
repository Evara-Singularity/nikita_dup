import { CommonModule } from '@angular/common';
import { Component, Input, NgModule } from '@angular/core';
import { CommonService } from '@app/utils/services/common.service';
import { KpToggleDirectiveModule } from '@app/utils/directives/kp-toggle.directive';
import { MathFloorPipeModule } from '@app/utils/pipes/math-floor';
import { ReplacePipeModule } from '@app/utils/pipes/remove-html-from-string.pipe.'

export interface BrandDetailsFooterData{
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
	showDesc: any;
	categoryNames: any;
	categoryLinkLists: any;
	productCategoryNames: any;
}

@Component({
	selector: 'brand-details-footer',
	templateUrl: 'brand-details-footer.html',
	styleUrls: ['./brand-details-footer.scss']
})

export class BrandDetailsFooterComponent {
	@Input('brandDetailsFooterData') brandDetailsFooterData: BrandDetailsFooterData;
	constructor(public _commonService: CommonService) {
		this.brandDetailsFooterData = {
			brandCatDesc: null,
			firstPageContent: true,
			brandShortDesc: null,
			brandContent: null,
			categoryLinkLists: null,
			productCategoryNames: null,
			categoryNames: null,
			iba: true,
			showDesc: null,
			productSearchResult: '',
			productSearchResultSEO: '',
			productCount: '',
			heading: '',
			brand: '',
			todayDate: true,
		};
	}
}

@NgModule({
	imports: [
		CommonModule,
		KpToggleDirectiveModule,
		MathFloorPipeModule,
		ReplacePipeModule
	],
	declarations: [
		BrandDetailsFooterComponent
	]
})
export class BrandModule{}
