import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { routing as BrandStoreRouting } from './brand-store.routing';
import { BrandComponent } from './brand-store.component';
import { KpToggleDirectiveModule } from '@app/utils/directives/kp-toggle.directive';
import { CmsModule } from '@app/modules/cms/cms.module';

@NgModule({
	imports: [
		CommonModule, 
		CmsModule,
		BrandStoreRouting, 
		RouterModule, 
		KpToggleDirectiveModule],
	declarations: [BrandComponent],
	exports: [BrandComponent],
	providers: [],
})
export class BrandStoreModule {}
