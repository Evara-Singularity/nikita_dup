import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { routing } from './orderConfirmation';
import { OrderConfirmationComponent } from './orderConfirmation.component';
import { OrderConfirmationService } from './orderConfirmation.service';
import { SafeUrlPipeModule } from '@app/utils/pipes/safe-url.pipe';

@NgModule({
    imports: [
        CommonModule,
        routing,
        SafeUrlPipeModule
    ],
    declarations: [
        OrderConfirmationComponent,
    ],
    providers: [
        OrderConfirmationService
    ]
})

export class OrderConfirmationModule {}