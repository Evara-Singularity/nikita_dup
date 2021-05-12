import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { RouterModule } from '@angular/router';
import { routing } from "./faq.routing";
import { NgxPageScrollCoreModule } from 'ngx-page-scroll-core';
import { CustomReturnComponent } from './custom-return.component';
import { OrderTrackingComponent } from './order-tracking.component';
import { PaymentOptionsComponent } from './payment-options.component';
import { RefundComponent } from './refund.component';
import { FaqComponent } from './faq.component';
import { FormsModule} from  '@angular/forms';
import { KpToggleDirectiveModule } from '../../utils/directives/kp-toggle.directive';
import { FilterPipe, GetQuesPipe, SplitPipe } from './faq.pipe';


@NgModule({
    imports: [
        CommonModule,
        routing,
        RouterModule,
        NgxPageScrollCoreModule,
        FormsModule,
        KpToggleDirectiveModule
    ],
    declarations: [
        FaqComponent,
        RefundComponent,
        CustomReturnComponent,
        OrderTrackingComponent,
        PaymentOptionsComponent,
        FilterPipe,
        GetQuesPipe,
        SplitPipe
       ],
    providers: [
        FilterPipe,
        GetQuesPipe
    ]
})

export class FaqModule{}