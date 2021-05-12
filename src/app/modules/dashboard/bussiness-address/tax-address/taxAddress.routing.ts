import {Routes, RouterModule} from '@angular/router';
import {TaxAddressComponent} from "./taxAddress.component";

const routes: Routes = [
    {
        path: '',
        component: TaxAddressComponent
    }
];

export const routing = RouterModule.forChild(routes);