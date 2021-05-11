import {NgModule} from '@angular/core';
import {CommonModule} from "@angular/common";
import {NetBankingComponent} from "./netBanking.component";
import {NetBankingService} from "./netBanking.service";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {PayuFormModule} from "../payuForm/payuForm.module";
import { RazorPayFormModule } from '../razorPayForm/razorPayForm.module';
import { ObjectToArrayPipeModule } from '../../utils/pipes/object-to-array.pipe';
import { MathCeilPipeModule } from '../../utils/pipes/math-ceil';
import { LoaderModule } from '../loader/loader.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        ObjectToArrayPipeModule,
        PayuFormModule,
        RazorPayFormModule,
        MathCeilPipeModule,
        LoaderModule
    ],
    declarations: [
        NetBankingComponent,
    ],
    exports:[
        NetBankingComponent
    ],
    //entryComponents: [BestSellerComponent],
    providers: [
        NetBankingService,
    ]
})

export class NetBankingModule{}