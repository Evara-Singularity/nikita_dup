import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { RouterModule } from '@angular/router';
import {EGiftVoucherComponent} from "./e-gift-voucher.component";
import { EGiftVoucherRoutingModule } from './e-gift-voucher.routing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
    imports: [
        CommonModule,
        EGiftVoucherRoutingModule,
        RouterModule,
        FormsModule,
        ReactiveFormsModule
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
