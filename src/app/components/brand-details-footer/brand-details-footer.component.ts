import { CommonModule } from '@angular/common';
import { Component, Input, NgModule, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { SeoTablesModule } from '@app/modules/seo-tables/seo-tables.module';
import { ReplacePipeModule } from '@app/utils/pipes/remove-html-from-string.pipe.';


@Component({
	selector: 'brand-details-footer',
	templateUrl: 'brand-details-footer.html',
	styleUrls: ['./brand-details-footer.scss']
})

export class BrandDetailsFooterComponent {
    @Input('footerData') footerData: Subject<any>;
	@Input('brandDetailsFooterData') brandDetailsFooterData;
	@Input() productStaticData;
	constructor() {
	}
}

@NgModule({
	imports: [
		CommonModule,
		ReplacePipeModule,
		SeoTablesModule
	],
	declarations: [
		BrandDetailsFooterComponent
	],
    exports:[BrandDetailsFooterComponent]
})
export class BrandFooterModule{}
