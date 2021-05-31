import {Routes, RouterModule} from '@angular/router';
import {OrderConfirmationComponent} from "./orderConfirmation.component";

const routes: Routes = [
    {
        path: '',
        component: OrderConfirmationComponent
    }
];

export const routing = RouterModule.forChild(routes);