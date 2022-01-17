import { CommonModule } from "@angular/common";
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { ListAutocompleteModule } from '@app/components/list-autocomplete/list-autocomplete.component';
import { BottomMenuModule } from '@app/modules/bottomMenu/bottom-menu.module';
import { IndianCurrencyPipeModule } from '@app/utils/pipes/indian-currency.pipe';
import { TruncatePipeModule } from '@app/utils/pipes/truncate.pipe';
import { MathFloorPipeModule } from './../../utils/pipes/math-floor';
import { EGiftVoucherComponent } from "./e-gift-voucher.component";

const routes: Routes = [
    {
        path: '',
        component: EGiftVoucherComponent
    }
];

@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        FormsModule,
        ReactiveFormsModule,
        TruncatePipeModule,
        ListAutocompleteModule,
        BottomMenuModule,
        MathFloorPipeModule,
        IndianCurrencyPipeModule,
        RouterModule,
        RouterModule.forChild(routes)
    ],
    declarations: [EGiftVoucherComponent],
    exports: [EGiftVoucherComponent],

})
export class EGiftVoucherModule { }
