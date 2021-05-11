import {NgModule} from '@angular/core';
import {CommonModule} from "@angular/common";
import {routing} from "./brand.routing";
import { MetaModule } from '@ngx-meta/core';
import {BrandComponent} from "./brand.component";
import {BrandService} from "./brand.service";
import {ObjectToArrayPipeModule} from "@app/utils/pipes/object-to-array.pipe";
import { NgxImageZoomModule } from 'ngx-image-zoom';
import { PaginationModule } from "@app/modules/pagination/pagination.module";
import { BreadCrumpModule } from '@app/modules/breadcrump/breadcrump.module';
import { ProductListModule } from '@app/modules/productList/productList.module';
// import { PageSizeModule } from "@app/modules/pageSize/pageSize.module";
import { LoaderModule } from '@app/modules/loader/loader.module';
import { MathFloorPipeModule } from "@app/utils/pipes/math-floor";
import { KpToggleDirectiveModule } from '@app/utils/directives/kp-toggle.directive';
import { ReplacePipeModule } from '@app/utils/pipes/remove-html-from-string.pipe.';
import { CmsModule } from '@app/modules/cms/cms.module';
import { ObserveVisibilityDirectiveModule } from '@app/utils/directives/observe-visibility.directive';
import { NgxPageScrollCoreModule } from 'ngx-page-scroll-core';

@NgModule({
    imports: [
        CommonModule,
        CmsModule,
        routing,
        NgxImageZoomModule,
        ObserveVisibilityDirectiveModule,
        // ImageZoomModule,
        NgxPageScrollCoreModule,
        ObjectToArrayPipeModule,
        BreadCrumpModule,
        ReplacePipeModule,
        ProductListModule,
        PaginationModule,
        // PageSizeModule,
        LoaderModule,
        KpToggleDirectiveModule,
        MetaModule.forRoot(),
        MathFloorPipeModule
    ],
    declarations: [
        BrandComponent,
    ],
    providers: [
        BrandService,
    ]
})

export class BrandModule{}