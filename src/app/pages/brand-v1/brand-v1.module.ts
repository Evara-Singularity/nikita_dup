import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CmsModule } from '@app/modules/cms/cms.module';
import { BrandV1Component } from "./brand-v1.component";
import { BrandV1RoutingModule } from './brand-v1.routing';
import { SharedProductListingModule } from '@app/modules/shared-product-listing/shared-product-listing.module';
import { ReplacePipeModule } from '@app/utils/pipes/remove-html-from-string.pipe.';
import { BrandFooterModule } from '@app/components/brand-details-footer/brand-details-footer.component';

@NgModule({
    imports: [
        CmsModule,
        CommonModule,
        BrandFooterModule,
        ReplacePipeModule,
        BrandV1RoutingModule,
        SharedProductListingModule
    ],
    declarations: [
        BrandV1Component,
    ],
})

export class BrandV1Module {}