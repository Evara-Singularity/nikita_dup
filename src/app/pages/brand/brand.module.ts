import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CmsModule } from '@app/modules/cms/cms.module';
import { BrandComponent } from "./brand.component";
import { BrandRoutingModule } from './brand.routing';
import { SharedProductListingModule } from '@app/modules/shared-product-listing/shared-product-listing.module';
import { ReplacePipeModule } from '@app/utils/pipes/remove-html-from-string.pipe.';
import { BrandFooterModule } from '@app/components/brand-details-footer/brand-details-footer.component';
import { KpToggleDirectiveModule } from '@app/utils/directives/kp-toggle.directive';
import { WhatsAppToastModule } from '@app/components/whatsapp-toast/whatsapp-toast.component';

@NgModule({
    imports: [
        CmsModule,
        CommonModule,
        BrandFooterModule,
        ReplacePipeModule,
        BrandRoutingModule,
        WhatsAppToastModule,
        KpToggleDirectiveModule,
        SharedProductListingModule
    ],
    declarations: [
        BrandComponent,
    ],
})

export class BrandModule {}