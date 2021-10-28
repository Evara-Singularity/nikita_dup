import { NgModule } from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import { EGiftVoucherComponent } from "./e-gift-voucher.component";

const routes: Routes = [
    {
        path: '',
        component: EGiftVoucherComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class EGiftVoucherRoutingModule { }
