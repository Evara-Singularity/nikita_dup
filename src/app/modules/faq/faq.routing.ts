/**
 * Created by kuldeep on 4/4/17.
 */

import { Routes, RouterModule } from '@angular/router';
import { FaqComponent } from "./faq.component";
import { CustomReturnComponent } from './custom-return.component';
import { OrderTrackingComponent } from './order-tracking.component';
import { PaymentOptionsComponent } from './payment-options.component';
import { RefundComponent } from './refund.component';

const routes: Routes = [
    {
        path: '',
        component: FaqComponent,
        children: [
            {
                path: '', component: OrderTrackingComponent
            },
            {
                path: 'order-tracking', component: OrderTrackingComponent
            },
            {
                path: 'return-policy', component: CustomReturnComponent
            },
            {
                path: 'refund', component: RefundComponent
            },
            {
                path: 'payment-options', component: PaymentOptionsComponent
            }
        ]
    }
];

export const routing = RouterModule.forChild(routes);