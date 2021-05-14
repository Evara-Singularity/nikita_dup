import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {PaymentService} from './payment.service';
import { CreditDebitCardModule } from '../creditDebitCard/creditDebitCard.module';
import { NetBankingModule } from '../netBanking/netBanking.module';
import { WalletModule } from '../wallet/wallet.module';
import { NeftRtgsModule } from '../neftRtgs/neftRtgs.module';
import { EmiModule } from '../emi/emi.module';
import { CashOnDeliveryModule } from '../cashOnDelivery/cashOnDelivery.module';
import { RazorPayFormModule } from '../razorPayForm/razorPayForm.module';
import { SavedCardModule } from '../savedCard/savedCard.module';
import { LoaderModule } from '../loader/loader.module';
import { UpiModule } from '../upi/upi.module';
import { PaytmUpiModule } from '../paytmUpi/paytmUpi.module';
import { PopUpModule } from '../popUp/pop-up.module';
import { PaymentComponent } from './payment.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        CreditDebitCardModule,
        NetBankingModule,
        WalletModule,
        NeftRtgsModule,
        EmiModule,
        CashOnDeliveryModule,
        RazorPayFormModule,
        SavedCardModule,
        LoaderModule,
        UpiModule,
        PaytmUpiModule,
        PopUpModule
    ],
    declarations: [
        PaymentComponent
    ],
    exports: [
        PaymentComponent
    ],
    providers: [
        PaymentService
    ]
})

export class PaymentModule {}
