import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PopularProductService } from './popularProduct.service';
import { routing as PopularRouting } from './popularProduct.routing';
import { PopularProductComponent } from './popularProduct.component';
import { CharacterremovePipeModule } from '@pipes/characterRemove.pipe';
import { ProductListModule } from '@modules/productList/productList.module';
import { ObserveVisibilityDirectiveModule } from '@app/utils/directives/observe-visibility.directive';

@NgModule({
    imports: [
        CommonModule, 
        RouterModule,
        CharacterremovePipeModule,
        ObserveVisibilityDirectiveModule,
        PopularRouting,
        ProductListModule,
    ],
    exports: [PopularProductComponent],
    declarations: [PopularProductComponent],
    providers: [PopularProductService],
})
export class PopularProductModule { }
