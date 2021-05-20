import { SiemaCarouselModule } from '../../modules/siemaCarousel/siemaCarousel.module';
import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { RouterModule } from '@angular/router';
import { routing } from "./bulkEnquiry.routing";
import { BulkEnquiryComponent } from './bulkEnquiry.component';
import { KpToggleDirectiveModule } from '../../utils/directives/kp-toggle.directive';
import { BulkEnquiryService } from './bulkEnquiry.service';


@NgModule({
    imports: [
        CommonModule,
        routing,
        RouterModule,
        SiemaCarouselModule,
        KpToggleDirectiveModule,
    ],
    declarations: [
      BulkEnquiryComponent
    ],
    exports: [
       BulkEnquiryComponent
    ],
    providers: [BulkEnquiryService]
})
export class BulkEnquiryModule {}
