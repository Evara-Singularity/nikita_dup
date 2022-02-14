import { CommonModule } from '@angular/common';
import { Component, Input, NgModule } from '@angular/core';
import { Subject } from 'rxjs';
import { SeoTablesModule } from '@app/modules/seo-tables/seo-tables.module';


@Component({
	selector: 'brand-details-footer',
	templateUrl: 'brand-details-footer.html',
	styleUrls: ['./brand-details-footer.scss']
})

export class BrandDetailsFooterComponent {
    @Input('footerData') footerData: Subject<any>;
	@Input('brandDetailsFooterData') brandDetailsFooterData;
	constructor() {
		this.brandDetailsFooterData = {
			brandCatDesc: null,
			firstPageContent: true,
			brandShortDesc: null,
			brandContent: null,
			categoryLinkLists: null,
			productCategoryNames: null,
			categoryNames: null,
			iba: true,
			showDesc: false,
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
		SeoTablesModule
	],
	declarations: [
		BrandDetailsFooterComponent
	],
    exports:[BrandDetailsFooterComponent]
})
export class BrandFooterModule{}
