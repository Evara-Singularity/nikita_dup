import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PaymentService } from './payment.service';
import { CreditDebitCardModule } from './creditDebitCard/creditDebitCard.module';
import { NetBankingModule } from './netBanking/netBanking.module';
import { WalletModule } from './wallet/wallet.module';
import { NeftRtgsModule } from './neftRtgs/neftRtgs.module';
import { EmiModule } from './emi/emi.module';
import { CashOnDeliveryModule } from './cashOnDelivery/cashOnDelivery.module';
import { RazorPayFormModule } from './payment-forms/razorPayForm/razorPayForm.module';
import { SavedCardModule } from './savedCard/savedCard.module';
import { UpiModule } from './upi/upi.module';
import { PaytmUpiModule } from './paytmUpi/paytmUpi.module';
import { PopUpModule } from '../popUp/pop-up.module';
import { PaymentComponent } from './payment.component';
import { GenericOffersModule } from '../ui/generic-offers/generic-offers.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        CreditDebitCardModule,
        NetBankingModule,
        GenericOffersModule,
        WalletModule,
        NeftRtgsModule,
        EmiModule,
        CashOnDeliveryModule,
        RazorPayFormModule,
        SavedCardModule,
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

export class PaymentModule { }
