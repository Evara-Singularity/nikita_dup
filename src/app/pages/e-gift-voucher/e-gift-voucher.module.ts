import { CommonModule } from "@angular/common";
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ListAutocompleteModule } from '@app/components/list-autocomplete/list-autocomplete.component';
import { BottomMenuModule } from '@app/modules/bottomMenu/bottom-menu.module';
import { IndianCurrencyPipeModule } from '@app/utils/pipes/indian-currency.pipe';
import { TruncatePipeModule } from '@app/utils/pipes/truncate.pipe';
import { MathFloorPipeModule } from './../../utils/pipes/math-floor';
import { EGiftVoucherComponent } from "./e-gift-voucher.component";
import { EGiftVoucherRoutingModule } from './e-gift-voucher.routing';

@NgModule({
    imports: [
        CommonModule,
        EGiftVoucherRoutingModule,
        RouterModule,
        FormsModule,
        ReactiveFormsModule,
        TruncatePipeModule,
        ListAutocompleteModule,
        BottomMenuModule,
        MathFloorPipeModule,
        IndianCurrencyPipeModule,
    ],
    declarations: [EGiftVoucherComponent],
    exports: [EGiftVoucherComponent],

})
export class EGiftVoucherModule { }
