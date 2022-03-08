import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PromoApplyComponent } from './promo-apply.component';
import { PromoApplyService } from './promo-apply.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
    ],
    exports: [
        PromoApplyComponent
    ],
    declarations: [
        PromoApplyComponent
    ],
    providers: [
        PromoApplyService
    ]
})
export class PromoApplyModule {

}
