import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { RouterModule } from '@angular/router';
import {EGiftVoucherComponent} from "./e-gift-voucher.component";
import { EGiftVoucherRoutingModule } from './e-gift-voucher.routing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TruncatePipeModule } from '@app/utils/pipes/truncate.pipe';
import { ListAutocompleteModule } from '@app/components/list-autocomplete/list-autocomplete.component';

@NgModule({
    imports: [
        CommonModule,
        EGiftVoucherRoutingModule,
        RouterModule,
        FormsModule,
        ReactiveFormsModule,
        TruncatePipeModule,
        ListAutocompleteModule
    ],
    declarations: [
      EGiftVoucherComponent
    ],
    exports: [
      EGiftVoucherComponent
    ],
    providers: [
    ]
})
export class EGiftVoucherModule{}
