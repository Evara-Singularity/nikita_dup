import {Routes, RouterModule} from '@angular/router';
import {CheckoutComponent} from "./checkout.component";

const routes: Routes = [
    {
        path: '',
        component: CheckoutComponent,
    }
];

export const routing = RouterModule.forChild(routes);