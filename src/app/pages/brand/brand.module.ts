import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CmsModule } from '@app/modules/cms/cms.module';
import { BrandComponent } from "./brand.component";
import { BrandRoutingModule } from './brand.routing';
import { SharedProductListingModule } from '@app/modules/shared-product-listing/shared-product-listing.module';
import { ReplacePipeModule } from '@app/utils/pipes/remove-html-from-string.pipe.';
import { BrandFooterModule } from '@app/components/brand-details-footer/brand-details-footer.component';

@NgModule({
    imports: [
        CmsModule,
        CommonModule,
        BrandFooterModule,
        ReplacePipeModule,
        BrandRoutingModule,
        SharedProductListingModule
    ],
    declarations: [
        BrandComponent,
    ],
})

export class BrandModule {}