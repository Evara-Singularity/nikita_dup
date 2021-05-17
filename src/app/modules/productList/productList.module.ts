import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductListComponent } from './productList.component';
import { ProductListService } from './productList.service';
import { RatingPipeModule } from '@app/utils/pipes/rating.pipe';
import { CharacterremovePipeModule } from '@app/utils/pipes/characterRemove.pipe';
import { MathCeilPipeModule } from "@app/utils/pipes/math-ceil";
import { MathFloorPipeModule } from "@app/utils/pipes/math-floor";
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { ArrayFilterPipeModule } from "@app/utils/pipes/k-array-filter.pipe";
import { ShowAvailableOnRequestLastPipeModule } from "@app/utils/pipes/show-available-on-request-last.pipe";


@NgModule({
    imports: [
        CommonModule, 
        RouterModule, 
        CharacterremovePipeModule, 
        MathCeilPipeModule, 
        MathFloorPipeModule, 
        LazyLoadImageModule, 
        ShowAvailableOnRequestLastPipeModule, 
        ArrayFilterPipeModule, 
        RatingPipeModule,
    ],
    exports: [ProductListComponent],
    declarations: [ProductListComponent],
    providers: [ProductListService],
})
export class ProductListModule { }
export class CategoryModule extends ProductListModule { }