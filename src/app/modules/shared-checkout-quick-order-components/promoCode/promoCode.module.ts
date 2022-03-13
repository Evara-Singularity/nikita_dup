import { FormsModule } from '@angular/forms';
import { CustomPromoCodeComponent } from './custom-promo-code/custom-promo-code.component';
import { PromoCodeListComponent } from './promo-code-list/promo-code-list.component';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';


@NgModule({
    imports: [
        CommonModule,
        FormsModule,
    ],
    exports: [
        CustomPromoCodeComponent,
        PromoCodeListComponent
    ],
    declarations: [
        PromoCodeListComponent,
        CustomPromoCodeComponent
    ],
})
export class PromoCodeModule {}